import { MapPin, Phone, Clock, MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "5517997749740";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Gostaria de fazer um pedido.")}`;

export default function Footer() {
  return (
    <footer className="mt-10 bg-coffee-800 text-cream">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Top section: logo + CTA */}
        <div className="mb-8 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.svg" alt="Pão Quente" className="h-14 w-14" />
          <div>
            <h3 className="font-display text-3xl">Pão Quente</h3>
            <p className="mt-1 text-sm text-coffee-200">
              Tradição e sabor desde cedo — direto do forno pra sua casa.
            </p>
          </div>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-green-700 sm:ml-auto"
          >
            <MessageCircle className="h-5 w-5" />
            Peça pelo WhatsApp
          </a>
        </div>

        {/* Info grid */}
        <div className="grid gap-6 border-t border-coffee-700 pt-8 sm:grid-cols-3">
          <div className="text-sm">
            <h4 className="mb-2 flex items-center gap-2 font-semibold">
              <MapPin className="h-4 w-4 text-amber-400" /> Endereço
            </h4>
            <p className="text-coffee-200">
              R. Sebastião Rodrigues de Oliveira, 413
              <br />
              Vila Saudade — José Bonifácio - SP
              <br />
              CEP 15200-000
            </p>
          </div>

          <div className="text-sm">
            <h4 className="mb-2 flex items-center gap-2 font-semibold">
              <Clock className="h-4 w-4 text-amber-400" /> Horário
            </h4>
            <p className="text-coffee-200">
              Segunda a sábado: 05h às 19h
              <br />
              Domingo: 05h às 12h
            </p>
          </div>

          <div className="text-sm">
            <h4 className="mb-2 flex items-center gap-2 font-semibold">
              <Phone className="h-4 w-4 text-amber-400" /> Contato
            </h4>
            <a href="tel:+5517997749740" className="text-coffee-200 transition hover:text-cream">
              (17) 99774-9740
            </a>
            <div className="mt-2">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-green-400 transition hover:text-green-300"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-coffee-700 py-4 text-center text-xs text-coffee-400">
        © {new Date().getFullYear()} Padaria Pão Quente — Todos os direitos reservados.
      </div>
    </footer>
  );
}
