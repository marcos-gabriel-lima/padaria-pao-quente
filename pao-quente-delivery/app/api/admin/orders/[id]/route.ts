// PATCH /api/admin/orders/:id — atualiza status do pedido
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminFromCookies } from "@/lib/auth";
import { getOrders, saveOrders } from "@/lib/blob-store";

const schema = z.object({
  status: z.enum(["aguardando_pagamento", "a_caminho", "entregue"]),
});

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminFromCookies())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

    const orders = await getOrders();
    const idx = orders.findIndex((o) => o.id === Number(id));
    if (idx === -1) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

    const updated = { ...orders[idx], status: parsed.data.status };
    const newList = [...orders];
    newList[idx] = updated;
    await saveOrders(newList);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/admin/orders error:", error);
    return NextResponse.json({ error: "Erro ao atualizar pedido" }, { status: 500 });
  }
}
