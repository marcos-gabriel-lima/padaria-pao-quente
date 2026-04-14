// Formulário de checkout — dados do cliente, endereço, pagamento e envio via WhatsApp
"use client";

import { useState } from "react";
import { ArrowLeft, Banknote, CreditCard, QrCode, CheckCircle2 } from "lucide-react";
import { useCart, type CustomerInfo } from "@/store/cart";
import { formatBRL } from "@/lib/money";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";
import { WHATSAPP_NUMBER } from "@/lib/constants";

type Payment = "dinheiro" | "cartao" | "pix";

export default function CheckoutForm({ onBack }: { onBack: () => void }) {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const customer = useCart((s) => s.customer);
  const setCustomer = useCart((s) => s.setCustomer);
  const clear = useCart((s) => s.clear);
  const close = useCart((s) => s.close);

  const [form, setForm] = useState<CustomerInfo>({
    customerName: customer?.customerName ?? "",
    customerPhone: customer?.customerPhone ?? "",
    street: customer?.street ?? "",
    number: customer?.number ?? "",
    neighborhood: customer?.neighborhood ?? "",
    complement: customer?.complement ?? "",
    reference: customer?.reference ?? "",
  });
  const [payment, setPayment] = useState<Payment>("pix");
  const [changeFor, setChangeFor] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ orderId: number; link: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof CustomerInfo>(k: K, v: CustomerInfo[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.customerName || !form.customerPhone || !form.street || !form.number || !form.neighborhood) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod: payment,
          changeFor: payment === "dinheiro" && changeFor ? Number(changeFor) : null,
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Erro ao criar pedido");
      }
      const data = await res.json();
      setCustomer(form);
      const msg = buildOrderMessage({
        orderId: data.order.id,
        ...form,
        paymentMethod: payment,
        changeFor: payment === "dinheiro" && changeFor ? Number(changeFor) : null,
        items: data.items,
        total: data.total,
      });
      const link = whatsappLink(WHATSAPP_NUMBER, msg);
      window.open(link, "_blank");
      setDone({ orderId: data.order.id, link });
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <CheckCircle2 className="mb-3 h-16 w-16 text-green-600" />
        <h3 className="font-display text-2xl text-coffee-800">Pedido enviado!</h3>
        <p className="mt-2 text-coffee-600">
          Pedido <strong>#{done.orderId}</strong> registrado. Já abrimos o WhatsApp pra você confirmar com a padaria.
        </p>
        <a href={done.link} target="_blank" className="btn-primary mt-6 w-full">
          Reabrir conversa no WhatsApp
        </a>
        <button onClick={close} className="mt-3 text-sm font-semibold text-coffee-600 hover:underline">
          Fechar
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold text-coffee-600">
          <ArrowLeft className="h-4 w-4" /> voltar ao carrinho
        </button>

        <div>
          <label className="label">Nome completo *</label>
          <input className="input" value={form.customerName} onChange={(e) => update("customerName", e.target.value)} />
        </div>
        <div>
          <label className="label">Telefone *</label>
          <input
            className="input"
            placeholder="(17) 99999-9999"
            value={form.customerPhone}
            onChange={(e) => update("customerPhone", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="label">Rua *</label>
            <input className="input" value={form.street} onChange={(e) => update("street", e.target.value)} />
          </div>
          <div>
            <label className="label">Número *</label>
            <input className="input" value={form.number} onChange={(e) => update("number", e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Bairro *</label>
          <input className="input" value={form.neighborhood} onChange={(e) => update("neighborhood", e.target.value)} />
        </div>
        <div>
          <label className="label">Complemento</label>
          <input className="input" value={form.complement} onChange={(e) => update("complement", e.target.value)} />
        </div>
        <div>
          <label className="label">Ponto de referência</label>
          <input className="input" value={form.reference} onChange={(e) => update("reference", e.target.value)} />
        </div>

        {/* Seleção de forma de pagamento */}
        <div>
          <label className="label">Forma de pagamento</label>
          <div className="grid grid-cols-3 gap-2">
            <PayBtn active={payment === "pix"} onClick={() => setPayment("pix")} icon={<QrCode className="h-5 w-5" />} label="PIX" />
            <PayBtn active={payment === "cartao"} onClick={() => setPayment("cartao")} icon={<CreditCard className="h-5 w-5" />} label="Cartão" />
            <PayBtn active={payment === "dinheiro"} onClick={() => setPayment("dinheiro")} icon={<Banknote className="h-5 w-5" />} label="Dinheiro" />
          </div>
        </div>

        {payment === "dinheiro" && (
          <div>
            <label className="label">Precisa de troco para quanto?</label>
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ex.: 50,00"
              value={changeFor}
              onChange={(e) => setChangeFor(e.target.value)}
            />
          </div>
        )}

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </div>

      <footer className="border-t border-coffee-100 bg-white px-5 py-4">
        <div className="mb-3 flex items-center justify-between text-lg">
          <span className="font-semibold text-coffee-700">Total</span>
          <span className="font-display text-2xl font-bold text-coffee-800">{formatBRL(total)}</span>
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Enviando..." : "Realizar pedido"}
        </button>
      </footer>
    </form>
  );
}

function PayBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition ${
        active ? "border-coffee-600 bg-coffee-50 text-coffee-800" : "border-coffee-100 bg-white text-coffee-600 hover:border-coffee-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
