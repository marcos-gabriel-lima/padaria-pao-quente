// PATCH /api/admin/orders/:id — atualiza status do pedido
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getAdminFromCookies } from "@/lib/auth";
import { eq } from "drizzle-orm";

const schema = z.object({
  status: z.enum(["aguardando_pagamento", "a_caminho", "entregue"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminFromCookies())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const updated = await db
    .update(orders)
    .set({ status: parsed.data.status })
    .where(eq(orders.id, Number(id)))
    .returning();
  return NextResponse.json(updated[0]);
}
