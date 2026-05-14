// GET/POST /api/admin/products — CRUD de produtos (admin autenticado)
import { NextResponse } from "next/server";
import { z } from "zod";
import { CATEGORIES } from "@/db/schema";
import { getAdminFromCookies } from "@/lib/auth";
import { getCatalog, saveCatalog, nextId } from "@/lib/blob-store";
import { logger } from "@/lib/logger";

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().default(""),
  price: z.number().nonnegative(),
  category: z.enum(CATEGORIES),
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
    ),
  availability: z.enum(["available", "unavailable", "unlimited"]).default("unlimited"),
  stock: z.number().int().nonnegative().default(0),
  featured: z.boolean().default(false),
});

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getAdminFromCookies())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const products = await getCatalog();
    return NextResponse.json([...products].sort((a, b) => b.id - a.id));
  } catch (error) {
    logger.error("GET /api/admin/products", { error: String(error) });
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await getAdminFromCookies())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

    const products = await getCatalog();
    const newProduct = {
      ...parsed.data,
      id: nextId(products),
      createdAt: new Date().toISOString(),
    };
    await saveCatalog([...products, newProduct]);
    return NextResponse.json(newProduct);
  } catch (error) {
    logger.error("POST /api/admin/products", { error: String(error) });
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}
