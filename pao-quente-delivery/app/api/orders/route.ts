// POST /api/orders — cria pedido, valida estoque e desconta quantidade
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCatalog, saveCatalog, getOrders, saveOrders, nextId } from "@/lib/blob-store";

const orderSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  street: z.string().min(2),
  number: z.string().min(1),
  neighborhood: z.string().min(2),
  complement: z.string().optional().default(""),
  reference: z.string().optional().default(""),
  paymentMethod: z.enum(["dinheiro", "cartao", "pix"]),
  changeFor: z.number().nullable().optional(),
  items: z
    .array(
      z.object({
        id: z.number().int().positive(),
        quantity: z.number().int().positive().max(50),
      })
    )
    .min(1),
});

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;

    const catalog = await getCatalog();

    // Valida disponibilidade e estoque
    for (const item of data.items) {
      const p = catalog.find((pp) => pp.id === item.id);
      if (!p) return NextResponse.json({ error: "Produto inexistente" }, { status: 400 });
      if (p.availability === "unavailable") {
        return NextResponse.json({ error: `Produto indisponível: ${p.name}` }, { status: 400 });
      }
      if (p.availability === "available" && p.stock < item.quantity) {
        return NextResponse.json(
          { error: `Estoque insuficiente para ${p.name}. Restam ${p.stock} unidade(s).` },
          { status: 400 }
        );
      }
    }

    const itemsResolved = data.items.map((i) => {
      const p = catalog.find((pp) => pp.id === i.id)!;
      return { id: p.id, name: p.name, unitPrice: p.price, quantity: i.quantity };
    });
    const total = itemsResolved.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);

    // Salva pedido
    const orders = await getOrders();
    const newOrder = {
      id: nextId(orders),
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      street: data.street,
      number: data.number,
      neighborhood: data.neighborhood,
      complement: data.complement,
      reference: data.reference,
      paymentMethod: data.paymentMethod,
      changeFor: data.changeFor ?? null,
      total,
      status: "aguardando_pagamento" as const,
      itemsJson: JSON.stringify(itemsResolved),
      createdAt: new Date().toISOString(),
    };
    await saveOrders([...orders, newOrder]);

    // Desconta estoque dos produtos com disponibilidade "available"
    let catalogChanged = false;
    const updatedCatalog = catalog.map((p) => {
      const item = data.items.find((i) => i.id === p.id);
      if (!item || p.availability !== "available") return p;
      catalogChanged = true;
      const newStock = p.stock - item.quantity;
      return {
        ...p,
        stock: newStock,
        availability: newStock <= 0 ? ("unavailable" as const) : p.availability,
      };
    });
    if (catalogChanged) await saveCatalog(updatedCatalog);

    return NextResponse.json({ order: newOrder, items: itemsResolved, total });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 });
  }
}
