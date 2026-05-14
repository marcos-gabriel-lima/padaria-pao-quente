// Middleware de proteção — redireciona para login se admin não autenticado
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "__Host-pq_admin";

async function isValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return false;
  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin");

  if (isAdminPage || isAdminApi) {
    const token = req.cookies.get(COOKIE)?.value;
    if (!(await isValid(token))) {
      // APIs retornam 401 JSON — redirecionar para /login quebraria fetch() no cliente.
      // Páginas recebem redirect — o browser precisa ir para a tela de login.
      if (isAdminApi) {
        return new NextResponse(JSON.stringify({ error: "unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
