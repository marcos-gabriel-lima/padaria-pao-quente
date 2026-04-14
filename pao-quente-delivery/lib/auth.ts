// Autenticação admin — JWT com cookie httpOnly (sign, verify, cookie helpers)
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "pq_admin";
const ALG = "HS256";

function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) throw new Error("JWT_SECRET not set");
  return new TextEncoder().encode(s);
}

export async function signAdminToken(username: string): Promise<string> {
  return new SignJWT({ sub: username, role: "admin" })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifyAdminToken(token: string): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "admin") return null;
    return { sub: String(payload.sub) };
  } catch {
    return null;
  }
}

export async function getAdminFromCookies(): Promise<{ sub: string } | null> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function setAdminCookie(token: string): Promise<void> {
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

export async function clearAdminCookie(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
