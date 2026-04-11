import { MapPin, Phone, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-10 bg-coffee-800 text-cream">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
        <div>
          <h3 className="font-display text-2xl">Pão Quente</h3>
          <p className="mt-2 text-sm text-coffee-200">Tradição e sabor — direto do forno até você.</p>
        </div>
        <div className="text-sm">
          <h4 className="mb-2 flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4" /> Endereço</h4>
          <p className="text-coffee-200">R. Sebastião Rodrigues de Oliveira, 413<br />Vila Saudade — José Bonifácio - SP<br />CEP 15200-000</p>
        </div>
        <div className="text-sm">
          <h4 className="mb-2 flex items-center gap-2 font-semibold"><Clock className="h-4 w-4" /> Horário</h4>
          <p className="text-coffee-200">Segunda a sábado: 05h às 19h<br />Domingo: 05h às 12h</p>
          <h4 className="mb-1 mt-3 flex items-center gap-2 font-semibold"><Phone className="h-4 w-4" /> Contato</h4>
          <a href="tel:+5517997749740" className="text-coffee-200 hover:text-cream">(17) 99774-9740</a>
        </div>
      </div>
      <div className="border-t border-coffee-700 py-4 text-center text-xs text-coffee-300">
        © {new Date().getFullYear()} Padaria Pão Quente — Todos os direitos reservados.
      </div>
    </footer>
  );
}
