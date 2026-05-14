// POST /api/auth/login — autentica admin com usuário/senha e seta cookie JWT
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { signAdminToken, setAdminCookie } from "@/lib/auth";
import { checkRateLimitPersisted } from "@/lib/rateLimit";
import { getTrustedIp } from "@/lib/ip";
import { logger } from "@/lib/logger";

const schema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(128),
});

export async function POST(req: Request) {
  const ip = getTrustedIp(req);

  if (!(await checkRateLimitPersisted(ip, 5, 5 * 60 * 1000))) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos." },
      { status: 429, headers: { "Retry-After": "300" } },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { username, password } = parsed.data;
  const storedUser = process.env.ADMIN_USER ?? "";
  const storedPass = process.env.ADMIN_PASS ?? "";

  const validUser = username === storedUser;
  // Supports bcrypt hashes (ADMIN_PASS starting with $2b$) and plaintext for
  // backward compatibility. To upgrade: set ADMIN_PASS to the output of:
  //   node -e "require('bcryptjs').hash('sua_senha', 12).then(h => console.log(h))"
  const validPass = storedPass.startsWith("$2")
    ? await bcrypt.compare(password, storedPass)
    : password === storedPass;

  if (!validUser || !validPass) {
    logger.warn("login_failed", { ip });
    return NextResponse.json({ error: "Usuário ou senha incorretos" }, { status: 401 });
  }

  const token = await signAdminToken(username);
  await setAdminCookie(token);
  logger.info("login_success", { user: username });
  return NextResponse.json({ ok: true });
}
