"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { CATEGORIES, type Product } from "@/db/schema";
import { Search } from "lucide-react";

export default function Menu() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [category, setCategory] = useState<string>("Todos");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  const featured = useMemo(() => products?.filter((p) => p.featured && p.availability !== "unavailable") ?? [], [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      if (category !== "Todos" && p.category !== category) return false;
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [products, category, query]);

  if (!products) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="text-coffee-600">Carregando cardápio…</div>
      </section>
    );
  }

  return (
    <section id="cardapio" className="mx-auto max-w-6xl px-4 py-10">
      {featured.length > 0 && (
        <>
          <h2 className="font-display text-2xl text-coffee-800 sm:text-3xl">⭐ Ofertas do dia</h2>
          <p className="mb-4 text-sm text-coffee-600">Os queridinhos da casa, fresquinhos para você.</p>
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </>
      )}

      <h2 className="font-display text-2xl text-coffee-800 sm:text-3xl">Cardápio completo</h2>

      <div className="mt-4 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-coffee-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produto..."
            className="input pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("Todos")}
            className={category === "Todos" ? "chip-active" : "chip"}
          >
            Todos
          </button>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={category === c ? "chip-active" : "chip"}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-coffee-200 py-12 text-center text-coffee-500">
          Nenhum produto encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </section>
  );
}
