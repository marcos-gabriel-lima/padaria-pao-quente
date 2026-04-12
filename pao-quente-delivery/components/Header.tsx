"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Clock, MessageCircle } from "lucide-react";
import { statusLabel } from "@/lib/business-hours";
import { useCart } from "@/store/cart";

const WHATSAPP_LINK = "https://wa.me/5517997749740?text=" + encodeURIComponent("Olá! Gostaria de fazer um pedido.");

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
        {/* Logo + Nome */}
        <a href="#" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.svg" alt="Pão Quente" className="h-10 w-10 drop-shadow-md sm:h-12 sm:w-12" />
          <div>
            <h1 className="font-display text-lg leading-tight text-coffee-800 sm:text-2xl">Pão Quente</h1>
            <div className={`flex items-center gap-1 text-xs font-semibold ${status.open ? "text-green-700" : "text-red-700"}`}>
              <Clock className="h-3 w-3" />
              {status.label}
            </div>
          </div>
        </a>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-green-700 sm:px-4"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          <button
            onClick={open}
            className="relative inline-flex items-center gap-2 rounded-full bg-coffee-600 px-3 py-2 font-semibold text-white shadow-md transition hover:bg-coffee-700 sm:px-4 sm:py-2.5"
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
      </div>
    </header>
  );
}
