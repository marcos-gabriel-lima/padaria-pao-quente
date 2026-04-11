import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { products, CATEGORIES } from "@/db/schema";
import { getAdminFromCookies } from "@/lib/auth";
import { desc } from "drizzle-orm";

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().default(""),
  price: z.number().nonnegative(),
  category: z.enum(CATEGORIES),
  imageUrl: z
    .string()
    .url()
    .refine((u) => { try { return new URL(u).protocol === "https:"; } catch { return false; } }, { message: "Apenas URLs https são permitidas" })
    .or(z.literal("")),
  availability: z.enum(["available", "unavailable", "unlimited"]).default("unlimited"),
  stock: z.number().int().nonnegative().default(0),
  featured: z.boolean().default(false),
});

export async function GET() {
  if (!(await getAdminFromCookies())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const all = await db.select().from(products).orderBy(desc(products.id));
  return NextResponse.json(all);
}

export async function POST(req: Request) {
  if (!(await getAdminFromCookies())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const inserted = await db.insert(products).values(parsed.data).returning();
  return NextResponse.json(inserted[0]);
}
