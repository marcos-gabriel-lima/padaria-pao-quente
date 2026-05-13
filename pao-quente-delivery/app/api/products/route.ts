// GET /api/products — lista pública de produtos (cardápio)
import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const all = await db.select().from(products).orderBy(desc(products.featured), products.category);
    return NextResponse.json(all);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}
