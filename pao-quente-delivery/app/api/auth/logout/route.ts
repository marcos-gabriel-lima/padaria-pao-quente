// POST /api/auth/logout — limpa cookie de autenticação admin
import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/auth";

export async function POST() {
  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}
