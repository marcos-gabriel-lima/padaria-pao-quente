import { put } from "@vercel/blob";
import type { Product, Order } from "@/db/schema";

const CATALOG_KEY = "pq/catalog.json";
const ORDERS_KEY = "pq/orders.json";
const MAX_RETRIES = 3;

function getStoreId(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN ?? "";
  return token.split("_")[3]?.toLowerCase() ?? "";
}

// Public URL — use for non-sensitive data (product catalog).
export function getBlobBaseUrl(): string {
  return `https://${getStoreId()}.public.blob.vercel-storage.com`;
}

// Private URL — use for data containing PII (orders, rate limits).
// Requires Authorization header when reading.
export function getPrivateBlobUrl(key: string): string {
  return `https://${getStoreId()}.blob.vercel-storage.com/${key}`;
}

// ─── Internals ─────────────────────────────────────────────────────────────

interface Versioned<T> {
  ver: number;
  data: T;
}

async function readVersioned<T>(key: string, fallback: T, isPrivate: boolean): Promise<Versioned<T>> {
  const url = isPrivate ? getPrivateBlobUrl(key) : `${getBlobBaseUrl()}/${key}`;
  const headers: HeadersInit = isPrivate
    ? { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN ?? ""}` }
    : {};
  try {
    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) return { ver: 0, data: fallback };
    const raw = await res.json();
    // Support legacy plain-array format written before versioning was added
    if (Array.isArray(raw)) return { ver: 0, data: raw as T };
    return { ver: raw.ver ?? 0, data: (raw.data ?? fallback) as T };
  } catch {
    return { ver: 0, data: fallback };
  }
}

async function blobPut(key: string, payload: unknown, isPrivate: boolean): Promise<void> {
  await put(key, JSON.stringify(payload), {
    access: isPrivate ? "private" : "public",
    addRandomSuffix: false,
    contentType: "application/json",
    allowOverwrite: true,
  } as unknown as Parameters<typeof put>[2]);
}

// Compare-and-swap: writes only if the stored version matches expectedVer.
async function writeIfVersion<T>(key: string, data: T, expectedVer: number, isPrivate: boolean): Promise<boolean> {
  const current = await readVersioned<T>(key, [] as unknown as T, isPrivate);
  if (current.ver !== expectedVer) return false;
  await blobPut(key, { ver: expectedVer + 1, data }, isPrivate);
  return true;
}

// Read-mutate-write with optimistic retry.
// If fn() throws, the error propagates immediately (no retry).
async function atomicUpdate<T>(key: string, fallback: T, fn: (current: T) => T, isPrivate: boolean): Promise<T> {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const { data, ver } = await readVersioned<T>(key, fallback, isPrivate);
    const updated = fn(data);
    if (await writeIfVersion(key, updated, ver, isPrivate)) return updated;
    if (i < MAX_RETRIES - 1) await new Promise((r) => setTimeout(r, 100 * (i + 1)));
  }
  throw new Error(`[blob] conflito ao salvar ${key} após ${MAX_RETRIES} tentativas`);
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function getCatalog(): Promise<Product[]> {
  const { data } = await readVersioned<Product[]>(CATALOG_KEY, [], false);
  return data;
}

// Orders are stored as private blobs — contain customer PII (name, phone, address).
export async function getOrders(): Promise<Order[]> {
  const { data } = await readVersioned<Order[]>(ORDERS_KEY, [], true);
  return data;
}

export async function saveCatalog(products: Product[]): Promise<void> {
  await atomicUpdate<Product[]>(CATALOG_KEY, [], () => products, false);
}

export async function saveOrders(orders: Order[]): Promise<void> {
  await atomicUpdate<Order[]>(ORDERS_KEY, [], () => orders, true);
}

export function mutateCatalog(fn: (current: Product[]) => Product[]): Promise<Product[]> {
  return atomicUpdate(CATALOG_KEY, [], fn, false);
}

export function mutateOrders(fn: (current: Order[]) => Order[]): Promise<Order[]> {
  return atomicUpdate(ORDERS_KEY, [], fn, true);
}

export function nextId(items: { id: number }[]): number {
  return items.length === 0 ? 1 : Math.max(...items.map((i) => i.id)) + 1;
}
