// GET /api/admin/orders — lista todos os pedidos (admin)
import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/auth";
import { getOrders } from "@/lib/blob-store";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getAdminFromCookies())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const orders = await getOrders();
    return NextResponse.json([...orders].sort((a, b) => b.id - a.id));
  } catch (error) {
    logger.error("GET /api/admin/orders", { error: String(error) });
    return NextResponse.json({ error: "Erro ao buscar pedidos" }, { status: 500 });
  }
}
