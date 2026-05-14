// Autenticação admin — JWT com cookie httpOnly (sign, verify, cookie helpers)
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { isRevoked } from "./jwtBlacklist";

// __Host- prefix enforces: Secure flag + Path=/ + no Domain attribute.
// This prevents cookie theft via subdomains and restricts the cookie to HTTPS only.
// Localhost is treated as a secure context by all modern browsers, so dev is unaffected.
const COOKIE_NAME = "__Host-pq_admin";
const ALG = "HS256";

function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  // Mínimo de 16 caracteres para garantir entropia suficiente no HMAC-SHA256.
  // Segredos curtos são vulneráveis a força bruta contra o token JWT.
  if (!s || s.length < 16) throw new Error("JWT_SECRET not set");
  return new TextEncoder().encode(s);
}

export async function signAdminToken(username: string): Promise<string> {
  return new SignJWT({ sub: username, role: "admin" })
    .setProtectedHeader({ alg: ALG })
    .setJti(randomUUID())
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifyAdminToken(token: string): Promise<{ sub: string; jti?: string; exp?: number } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "admin") return null;
    if (typeof payload.jti === "string" && await isRevoked(payload.jti)) return null;
    return {
      sub: String(payload.sub),
      jti: typeof payload.jti === "string" ? payload.jti : undefined,
      exp: typeof payload.exp === "number" ? payload.exp : undefined,
    };
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
    secure: true, // required by __Host- prefix; localhost counts as secure in all modern browsers
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

export async function clearAdminCookie(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
