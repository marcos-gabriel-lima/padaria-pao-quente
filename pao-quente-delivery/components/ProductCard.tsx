"use client";

import { Plus } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatBRL } from "@/lib/money";
import type { Product } from "@/db/schema";

export default function ProductCard({ p }: { p: Product }) {
  const add = useCart((s) => s.add);
  const open = useCart((s) => s.open);

  function handleAdd() {
    add(
      {
        id: p.id,
        name: p.name,
        price: p.price,
        imageUrl: p.imageUrl,
        category: p.category,
        maxStock: p.availability === "available" ? p.stock : null,
      },
      1
    );
    open();
  }

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-coffee-100">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imageUrl} alt={p.name} loading="lazy" className="h-full w-full object-cover transition hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center text-coffee-400">sem foto</div>
        )}
        {p.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-coffee-900 shadow">
            Oferta do dia
          </span>
        )}
        {p.availability === "unavailable" && (
          <div className="absolute inset-0 grid place-items-center bg-black/55 text-sm font-bold uppercase text-white">
            Indisponível
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg text-coffee-800">{p.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-coffee-600">{p.description}</p>
        {p.availability === "available" && p.stock > 0 && (
          <p className="mt-1 text-xs font-semibold text-amber-700">Restam {p.stock} unidade(s)</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-coffee-700">{formatBRL(p.price)}</span>
          <button
            onClick={handleAdd}
            disabled={p.availability === "unavailable"}
            className="inline-flex items-center gap-1 rounded-full bg-coffee-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-coffee-700 disabled:bg-coffee-300"
          >
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
