// PATCH/DELETE /api/admin/products/:id — editar ou excluir produto
import { NextResponse } from "next/server";
import { z } from "zod";
import { del } from "@vercel/blob";
import { CATEGORIES } from "@/db/schema";
import { getAdminFromCookies } from "@/lib/auth";
import { getCatalog, saveCatalog } from "@/lib/blob-store";
import { logger } from "@/lib/logger";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  category: z.enum(CATEGORIES).optional(),
  imageUrl: z
    .string()
    .max(512)
    .refine(
      (u) => {
        if (u === "") return true;
        try {
          const url = new URL(u);
          return url.protocol === "https:" && url.hostname.endsWith(".blob.vercel-storage.com");
        } catch { return false; }
      },
      { message: "Apenas URLs do storage da Vercel são permitidas" }
    )
    .optional(),
  availability: z.enum(["available", "unavailable", "unlimited"]).optional(),
  stock: z.number().int().nonnegative().optional(),
  featured: z.boolean().optional(),
});

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminFromCookies())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

    const products = await getCatalog();
    const idx = products.findIndex((p) => p.id === Number(id));
    if (idx === -1) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

    const updated = { ...products[idx], ...parsed.data };
    const newList = [...products];
    newList[idx] = updated;
    await saveCatalog(newList);
    return NextResponse.json(updated);
  } catch (error) {
    logger.error("PATCH /api/admin/products/:id", { error: String(error) });
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminFromCookies())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const products = await getCatalog();
    const target = products.find((p) => p.id === Number(id));
    await saveCatalog(products.filter((p) => p.id !== Number(id)));
    if (target?.imageUrl?.includes(".blob.vercel-storage.com")) {
      try { await del(target.imageUrl); } catch { /* não bloqueia se a imagem já foi removida */ }
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("DELETE /api/admin/products/:id", { error: String(error) });
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 });
  }
}
