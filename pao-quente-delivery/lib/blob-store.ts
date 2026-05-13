// Leitura e escrita de dados no Vercel Blob (substitui o banco de dados)
import { put, list } from "@vercel/blob";
import type { Product, Order } from "@/db/schema";

const CATALOG_KEY = "pq/catalog.json";
const ORDERS_KEY = "pq/orders.json";

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const { blobs } = await list({ prefix: key });
    const found = blobs.find((b) => b.pathname === key);
    if (!found) return fallback;
    const res = await fetch(found.url, { cache: "no-store" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, data: unknown): Promise<void> {
  await put(key, JSON.stringify(data), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
    allowOverwrite: true,
  } as Parameters<typeof put>[2]);
}

export async function getCatalog(): Promise<Product[]> {
  return readJson<Product[]>(CATALOG_KEY, []);
}

export async function saveCatalog(products: Product[]): Promise<void> {
  await writeJson(CATALOG_KEY, products);
}

export async function getOrders(): Promise<Order[]> {
  return readJson<Order[]>(ORDERS_KEY, []);
}

export async function saveOrders(orders: Order[]): Promise<void> {
  await writeJson(ORDERS_KEY, orders);
}

export function nextId(items: { id: number }[]): number {
  return items.length === 0 ? 1 : Math.max(...items.map((i) => i.id)) + 1;
}
