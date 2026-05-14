// POST /api/orders — cria pedido, valida estoque e desconta quantidade de forma atômica
import { NextResponse } from "next/server";
import { z } from "zod";
import type { Order } from "@/db/schema";
import { mutateCatalog, mutateOrders, nextId } from "@/lib/blob-store";
import { checkRateLimit } from "@/lib/rateLimit";
import { getTrustedIp } from "@/lib/ip";
import { logger } from "@/lib/logger";

const orderSchema = z.object({
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(8).max(20),
  street: z.string().min(2).max(200),
  number: z.string().min(1).max(20),
  neighborhood: z.string().min(2).max(100),
  complement: z.string().max(200).optional().default(""),
  reference: z.string().max(200).optional().default(""),
  paymentMethod: z.enum(["dinheiro", "cartao", "pix"]),
  changeFor: z.number().min(0).nullable().optional(),
  items: z
    .array(
      z.object({
        id: z.number().int().positive(),
        quantity: z.number().int().positive().max(50),
      }),
    )
    .min(1),
});

// Marks errors that should return 400 instead of 500
class OrderValidationError extends Error {}

type ResolvedItem = { id: number; name: string; unitPrice: number; quantity: number };

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = getTrustedIp(req);
  if (!checkRateLimit(ip, 10, 60_000)) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em instantes." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const data = parsed.data;

    // Computed inside the mutation so they always reflect the committed catalog state.
    // On retry (version conflict), fn() runs again with fresh data — values are recomputed.
    let itemsResolved: ResolvedItem[] = [];
    let total = 0;

    // Step 1: atomically validate stock + decrement.
    // If fn() throws an OrderValidationError, atomicUpdate propagates it immediately
    // without retrying — correct behaviour for business-logic failures.
    await mutateCatalog((catalog) => {
      for (const item of data.items) {
        const p = catalog.find((pp) => pp.id === item.id);
        if (!p) throw new OrderValidationError(`Produto inexistente (id ${item.id})`);
        if (p.availability === "unavailable")
          throw new OrderValidationError(`Produto indisponível: ${p.name}`);
        if (p.availability === "available" && p.stock < item.quantity)
          throw new OrderValidationError(
            `Estoque insuficiente para ${p.name}. Restam ${p.stock} unidade(s).`,
          );
      }

      itemsResolved = data.items.map((i) => {
        const p = catalog.find((pp) => pp.id === i.id)!;
        return { id: p.id, name: p.name, unitPrice: p.price, quantity: i.quantity };
      });
      total = itemsResolved.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);

      return catalog.map((p) => {
        const item = data.items.find((i) => i.id === p.id);
        if (!item || p.availability !== "available") return p;
        const newStock = p.stock - item.quantity;
        return {
          ...p,
          stock: newStock,
          availability: newStock <= 0 ? ("unavailable" as const) : p.availability,
        };
      });
    });

    // Step 2: atomically save the order.
    let newOrder!: Order;
    await mutateOrders((orders) => {
      newOrder = {
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
      return [...orders, newOrder];
    });

    return NextResponse.json({ order: newOrder, items: itemsResolved, total });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logger.error("POST /api/orders", { error: String(error) });
    return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 });
  }
}
