"use client";

import { useEffect, useState } from "react";
import { type Order } from "@/db/schema";
import { formatBRL } from "@/lib/money";
import { ChevronDown } from "lucide-react";

const STATUS_LABELS = {
  aguardando_pagamento: "Aguardando Pagamento",
  a_caminho: "A Caminho",
  entregue: "Entregue",
} as const;

const STATUS_COLORS = {
  aguardando_pagamento: "bg-amber-100 text-amber-800",
  a_caminho: "bg-blue-100 text-blue-800",
  entregue: "bg-green-100 text-green-800",
} as const;

const PAYMENT_LABELS = { dinheiro: "Dinheiro", cartao: "Cartão", pix: "PIX" } as const;

type OrderItem = { id: number; name: string; unitPrice: number; quantity: number };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"todos" | keyof typeof STATUS_LABELS>("todos");
  const [expanded, setExpanded] = useState<number | null>(null);

  async function load() {
    const res = await fetch("/api/admin/orders");
    setOrders(await res.json());
  }
  useEffect(() => {
    load();
    const id = setInterval(load, 15_000);
    return () => clearInterval(id);
  }, []);

  async function updateStatus(id: number, status: keyof typeof STATUS_LABELS) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  const filtered = filter === "todos" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl text-coffee-800">Pedidos</h2>
        <div className="flex gap-2">
          <FilterBtn active={filter === "todos"} onClick={() => setFilter("todos")}>
            Todos ({orders.length})
          </FilterBtn>
          {(Object.keys(STATUS_LABELS) as (keyof typeof STATUS_LABELS)[]).map((s) => (
            <FilterBtn key={s} active={filter === s} onClick={() => setFilter(s)}>
              {STATUS_LABELS[s]} ({orders.filter((o) => o.status === s).length})
            </FilterBtn>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-coffee-200 py-16 text-center text-coffee-500">
          Nenhum pedido por aqui.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((o) => {
            const items: OrderItem[] = JSON.parse(o.itemsJson);
            const isOpen = expanded === o.id;
            return (
              <li key={o.id} className="rounded-2xl bg-white p-4 shadow ring-1 ring-coffee-100">
                <button onClick={() => setExpanded(isOpen ? null : o.id)} className="flex w-full items-start justify-between gap-4 text-left">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-lg text-coffee-800">#{o.id}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLORS[o.status]}`}>
                        {STATUS_LABELS[o.status]}
                      </span>
                      <span className="text-xs text-coffee-500">{new Date(o.createdAt).toLocaleString("pt-BR")}</span>
                    </div>
                    <p className="mt-1 font-semibold text-coffee-800">{o.customerName}</p>
                    <p className="text-sm text-coffee-600">
                      {o.street}, {o.number} — {o.neighborhood}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-bold text-coffee-800">{formatBRL(o.total)}</p>
                    <p className="text-xs text-coffee-500">{PAYMENT_LABELS[o.paymentMethod]}</p>
                    <ChevronDown className={`ml-auto mt-1 h-4 w-4 text-coffee-400 transition ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-4 space-y-4 border-t border-coffee-100 pt-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase text-coffee-500">Telefone</p>
                        <p className="text-coffee-800">{o.customerPhone}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-coffee-500">Pagamento</p>
                        <p className="text-coffee-800">
                          {PAYMENT_LABELS[o.paymentMethod]}
                          {o.paymentMethod === "dinheiro" && o.changeFor ? ` (troco para ${formatBRL(o.changeFor)})` : ""}
                        </p>
                      </div>
                      {o.complement && (
                        <div>
                          <p className="text-xs font-semibold uppercase text-coffee-500">Complemento</p>
                          <p className="text-coffee-800">{o.complement}</p>
                        </div>
                      )}
                      {o.reference && (
                        <div>
                          <p className="text-xs font-semibold uppercase text-coffee-500">Referência</p>
                          <p className="text-coffee-800">{o.reference}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase text-coffee-500">Itens</p>
                      <ul className="space-y-1 text-sm">
                        {items.map((it) => (
                          <li key={it.id} className="flex justify-between text-coffee-800">
                            <span>
                              {it.quantity}× {it.name}
                            </span>
                            <span className="font-semibold">{formatBRL(it.unitPrice * it.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase text-coffee-500">Atualizar status</p>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(STATUS_LABELS) as (keyof typeof STATUS_LABELS)[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(o.id, s)}
                            disabled={o.status === s}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                              o.status === s
                                ? "bg-coffee-600 text-white"
                                : "bg-coffee-50 text-coffee-700 hover:bg-coffee-100"
                            }`}
                          >
                            {STATUS_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={active ? "chip-active" : "chip"}>
      {children}
    </button>
  );
}
