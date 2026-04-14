// Montagem da mensagem de pedido e link do WhatsApp
import { formatBRL } from "./money";

export type CheckoutPayload = {
  orderId: number;
  customerName: string;
  customerPhone: string;
  street: string;
  number: string;
  neighborhood: string;
  complement?: string;
  reference?: string;
  paymentMethod: "dinheiro" | "cartao" | "pix";
  changeFor?: number | null;
  items: { name: string; quantity: number; unitPrice: number }[];
  total: number;
};

const PAYMENT_LABEL: Record<CheckoutPayload["paymentMethod"], string> = {
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  pix: "PIX",
};

export function buildOrderMessage(p: CheckoutPayload): string {
  const lines: string[] = [];
  lines.push(`*Pedido #${p.orderId} — Padaria Pão Quente*`);
  lines.push("");
  lines.push(`*Cliente:* ${p.customerName}`);
  lines.push(`*Telefone:* ${p.customerPhone}`);
  lines.push("");
  lines.push("*Endereço de entrega:*");
  lines.push(`${p.street}, ${p.number}`);
  lines.push(`${p.neighborhood}`);
  if (p.complement) lines.push(`Complemento: ${p.complement}`);
  if (p.reference) lines.push(`Referência: ${p.reference}`);
  lines.push("");
  lines.push("*Itens:*");
  for (const it of p.items) {
    lines.push(`• ${it.quantity}x ${it.name} — ${formatBRL(it.unitPrice * it.quantity)}`);
  }
  lines.push("");
  lines.push(`*Total:* ${formatBRL(p.total)}`);
  lines.push(`*Pagamento:* ${PAYMENT_LABEL[p.paymentMethod]}`);
  if (p.paymentMethod === "dinheiro" && p.changeFor) {
    lines.push(`Troco para: ${formatBRL(p.changeFor)}`);
  }
  return lines.join("\n");
}

export function whatsappLink(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, "");
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
