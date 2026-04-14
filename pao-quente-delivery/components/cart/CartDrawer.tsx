// Drawer lateral do carrinho — lista itens, controla quantidade e navega para checkout
"use client";

import { useState } from "react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatBRL } from "@/lib/money";
import UpsellModal from "./UpsellModal";
import CheckoutForm from "./CheckoutForm";

type View = "cart" | "checkout";

export default function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const items = useCart((s) => s.items);
  const updateQty = useCart((s) => s.updateQty);
  const remove = useCart((s) => s.remove);
  const total = useCart((s) => s.total());
  const hasBev = useCart((s) => s.hasBeverage());

  const [view, setView] = useState<View>("cart");
  const [showUpsell, setShowUpsell] = useState(false);

  function handleProceed() {
    if (items.length === 0) return;
    // Sugere bebida se o carrinho não tem nenhuma
    if (!hasBev) {
      setShowUpsell(true);
      return;
    }
    setView("checkout");
  }

  function skipUpsell() {
    setShowUpsell(false);
    setView("checkout");
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={close}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-coffee-100 px-5 py-4">
          <h3 className="font-display text-xl text-coffee-800">
            {view === "cart" ? "Seu pedido" : "Finalizar pedido"}
          </h3>
          <button
            onClick={() => {
              close();
              setTimeout(() => setView("cart"), 300);
            }}
            className="rounded-full p-2 text-coffee-600 hover:bg-coffee-100"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {view === "cart" ? (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="grid h-full place-items-center text-center text-coffee-500">
                  <div>
                    <p className="text-lg">Seu carrinho está vazio</p>
                    <p className="mt-1 text-sm">Adicione algo gostoso pra começar 🥐</p>
                  </div>
                </div>
              ) : (
                <ul className="space-y-3">
                  {items.map((i) => (
                    <li key={i.id} className="flex gap-3 rounded-2xl bg-white p-3 shadow ring-1 ring-coffee-100">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-coffee-100">
                        {i.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={i.imageUrl} alt={i.name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-coffee-800">{i.name}</h4>
                          <button onClick={() => remove(i.id)} className="text-coffee-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="text-sm text-coffee-600">{formatBRL(i.price)}</span>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="inline-flex items-center gap-1 rounded-full border border-coffee-200 bg-white">
                            <button
                              onClick={() => updateQty(i.id, i.quantity - 1)}
                              className="grid h-8 w-8 place-items-center text-coffee-700 hover:bg-coffee-50"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-6 text-center font-semibold">{i.quantity}</span>
                            <button
                              onClick={() => updateQty(i.id, i.quantity + 1)}
                              className="grid h-8 w-8 place-items-center text-coffee-700 hover:bg-coffee-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <span className="font-bold text-coffee-800">{formatBRL(i.price * i.quantity)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <footer className="border-t border-coffee-100 bg-white px-5 py-4">
              <div className="mb-3 flex items-center justify-between text-lg">
                <span className="font-semibold text-coffee-700">Total</span>
                <span className="font-display text-2xl font-bold text-coffee-800">{formatBRL(total)}</span>
              </div>
              <button onClick={handleProceed} disabled={items.length === 0} className="btn-primary w-full">
                Ir para o checkout
              </button>
            </footer>
          </>
        ) : (
          <CheckoutForm onBack={() => setView("cart")} />
        )}
      </aside>

      {showUpsell && <UpsellModal onClose={() => setShowUpsell(false)} onSkip={skipUpsell} />}
    </>
  );
}
