// POST /api/auth/login — autentica admin com usuário/senha e seta cookie JWT
import { NextResponse } from "next/server";
import { z } from "zod";
import { signAdminToken, setAdminCookie } from "@/lib/auth";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { username, password } = parsed.data;
  if (username !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASS) {
    return NextResponse.json({ error: "Usuário ou senha incorretos" }, { status: 401 });
  }

  const token = await signAdminToken(username);
  await setAdminCookie(token);
  return NextResponse.json({ ok: true });
}
