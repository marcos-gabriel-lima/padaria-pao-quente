// PATCH/DELETE /api/admin/products/:id — editar ou excluir produto
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { products, CATEGORIES } from "@/db/schema";
import { getAdminFromCookies } from "@/lib/auth";
import { eq } from "drizzle-orm";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  category: z.enum(CATEGORIES).optional(),
  imageUrl: z
    .string()
    .url()
    .refine((u) => { try { return new URL(u).protocol === "https:"; } catch { return false; } }, { message: "Apenas URLs https são permitidas" })
    .or(z.literal(""))
    .optional(),
  availability: z.enum(["available", "unavailable", "unlimited"]).optional(),
  stock: z.number().int().nonnegative().optional(),
  featured: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminFromCookies())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const updated = await db.update(products).set(parsed.data).where(eq(products.id, Number(id))).returning();
  return NextResponse.json(updated[0]);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminFromCookies())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.delete(products).where(eq(products.id, Number(id)));
  return NextResponse.json({ ok: true });
}
