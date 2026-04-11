import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { inArray } from "drizzle-orm";

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

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const ids = data.items.map((i) => i.id);
  const dbProducts = await db.select().from(products).where(inArray(products.id, ids));
  if (dbProducts.length !== ids.length) {
    return NextResponse.json({ error: "Produto inexistente" }, { status: 400 });
  }
  const unavailable = dbProducts.find((p) => !p.available);
  if (unavailable) {
    return NextResponse.json({ error: `Produto indisponível: ${unavailable.name}` }, { status: 400 });
  }

  const itemsResolved = data.items.map((i) => {
    const p = dbProducts.find((pp) => pp.id === i.id)!;
    return { id: p.id, name: p.name, unitPrice: p.price, quantity: i.quantity };
  });
  const total = itemsResolved.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);

  const inserted = await db
    .insert(orders)
    .values({
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
      itemsJson: JSON.stringify(itemsResolved),
    })
    .returning();

  return NextResponse.json({ order: inserted[0], items: itemsResolved, total });
}
