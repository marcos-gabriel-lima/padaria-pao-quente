import { put } from "@vercel/blob";

const BLACKLIST_KEY = "pq/jwt-blacklist.json";
type Blacklist = Record<string, number>; // jti → exp (Unix seconds)

let memCache: { data: Blacklist; at: number } | null = null;
const CACHE_TTL = 30_000;

function getPrivateUrl(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN ?? "";
  const storeId = token.split("_")[3]?.toLowerCase() ?? "";
  return `https://${storeId}.blob.vercel-storage.com/${BLACKLIST_KEY}`;
}

async function readBlacklist(): Promise<Blacklist> {
  if (memCache && Date.now() - memCache.at < CACHE_TTL) return memCache.data;
  try {
    const res = await fetch(getPrivateUrl(), {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN ?? ""}` },
      cache: "no-store",
    });
    const data: Blacklist = res.ok ? await res.json() : {};
    memCache = { data, at: Date.now() };
    return data;
  } catch {
    return memCache?.data ?? {};
  }
}

async function writeBlacklist(bl: Blacklist): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const pruned = Object.fromEntries(Object.entries(bl).filter(([, exp]) => exp > now));
  await put(BLACKLIST_KEY, JSON.stringify(pruned), {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
    allowOverwrite: true,
  } as unknown as Parameters<typeof put>[2]);
  memCache = { data: pruned, at: Date.now() };
}

export async function revokeToken(jti: string, exp: number): Promise<void> {
  const bl = await readBlacklist();
  bl[jti] = exp;
  await writeBlacklist(bl);
}

export async function isRevoked(jti: string): Promise<boolean> {
  const bl = await readBlacklist();
  const exp = bl[jti];
  if (exp === undefined) return false;
  return Math.floor(Date.now() / 1000) <= exp;
}
