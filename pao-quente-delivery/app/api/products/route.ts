// GET /api/products — lista pública de produtos (cardápio)
import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/blob-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getCatalog();
    const sorted = [...products].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.category.localeCompare(b.category, "pt-BR");
    });
    return NextResponse.json(sorted);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}
