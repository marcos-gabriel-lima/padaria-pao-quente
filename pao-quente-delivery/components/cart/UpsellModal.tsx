// Modal de upsell — sugere bebidas quando o carrinho não tem nenhuma antes do checkout
"use client";

import { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatBRL } from "@/lib/money";
import type { Product } from "@/db/schema";

export default function UpsellModal({ onClose, onSkip }: { onClose: () => void; onSkip: () => void }) {
  const [beverages, setBeverages] = useState<Product[]>([]);
  const add = useCart((s) => s.add);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((all: Product[]) => setBeverages(all.filter((p) => p.category === "Bebidas" && p.availability !== "unavailable")));
  }, []);

  function handleAdd(p: Product) {
    add({ id: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl, category: p.category, maxStock: p.availability === "available" ? p.stock : null }, 1);
    onSkip();
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 px-4">
      <div className="card relative w-full max-w-md p-6">
        <button onClick={onClose} className="absolute right-3 top-3 rounded-full p-2 text-coffee-500 hover:bg-coffee-50">
          <X className="h-5 w-5" />
        </button>
        <div className="text-center">
          <div className="mb-2 text-4xl">🥤</div>
          <h3 className="font-display text-2xl text-coffee-800">Nesse calor cai bem uma coca gelada!</h3>
          <p className="mt-1 text-sm text-coffee-600">Que tal adicionar uma bebida pra acompanhar?</p>
        </div>

        <ul className="mt-5 space-y-2">
          {beverages.slice(0, 3).map((b) => (
            <li key={b.id} className="flex items-center gap-3 rounded-xl border border-coffee-100 bg-white p-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-coffee-100">
                {b.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.imageUrl} alt={b.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-coffee-800">{b.name}</p>
                <p className="text-sm text-coffee-600">{formatBRL(b.price)}</p>
              </div>
              <button onClick={() => handleAdd(b)} className="rounded-full bg-coffee-600 p-2 text-white shadow hover:bg-coffee-700">
                <Plus className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>

        <button onClick={onSkip} className="mt-5 w-full text-sm font-semibold text-coffee-600 underline-offset-2 hover:underline">
          Não, obrigado — continuar
        </button>
      </div>
    </div>
  );
}
