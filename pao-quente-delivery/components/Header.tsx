"use client";

import { useEffect, useState } from "react";
import { Phone, MapPin, ShoppingBag, Clock } from "lucide-react";
import { statusLabel } from "@/lib/business-hours";
import { useCart } from "@/store/cart";

export default function Header() {
  const [status, setStatus] = useState(() => statusLabel());
  const count = useCart((s) => s.count());
  const open = useCart((s) => s.open);

  useEffect(() => {
    const id = setInterval(() => setStatus(statusLabel()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-coffee-100 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-coffee-600 text-cream shadow-md">
            <span className="font-display text-xl">PQ</span>
          </div>
          <div>
            <h1 className="font-display text-xl leading-tight text-coffee-800 sm:text-2xl">Padaria Pão Quente</h1>
            <p className="hidden text-xs text-coffee-600 sm:block">Tradição & sabor desde sempre</p>
          </div>
        </div>

        <div className="hidden flex-col items-end text-right text-xs text-coffee-700 md:flex">
          <div className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" />
            <a href="tel:+5517997749740" className="font-semibold">(17) 99774-9740</a>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>Vila Saudade, José Bonifácio - SP</span>
          </div>
          <div className={`mt-0.5 flex items-center gap-1 font-semibold ${status.open ? "text-green-700" : "text-red-700"}`}>
            <Clock className="h-3.5 w-3.5" />
            {status.label}
          </div>
        </div>

        <button
          onClick={open}
          className="relative inline-flex items-center gap-2 rounded-full bg-coffee-600 px-4 py-2.5 font-semibold text-white shadow-md transition hover:bg-coffee-700"
          aria-label="Abrir carrinho"
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="hidden sm:inline">Carrinho</span>
          {count > 0 && (
            <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-amber-400 px-1.5 text-xs font-bold text-coffee-900 shadow">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
