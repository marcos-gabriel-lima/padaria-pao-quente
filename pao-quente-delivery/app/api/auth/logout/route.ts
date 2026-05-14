// POST /api/auth/logout — revoga o JWT e limpa o cookie admin
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { clearAdminCookie, ADMIN_COOKIE_NAME } from "@/lib/auth";
import { revokeToken } from "@/lib/jwtBlacklist";

export async function POST() {
  const c = await cookies();
  const token = c.get(ADMIN_COOKIE_NAME)?.value;

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
      const { payload } = await jwtVerify(token, secret);
      if (typeof payload.jti === "string" && typeof payload.exp === "number") {
        await revokeToken(payload.jti, payload.exp);
      }
    } catch {
      // Token already invalid — nothing to revoke
    }
  }

  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}
