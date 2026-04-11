export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-coffee-600 via-coffee-700 to-coffee-800 text-cream">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <h2 className="font-display text-3xl leading-tight sm:text-5xl">
          Pão quentinho, <br className="sm:hidden" />
          <span className="text-amber-300">direto do forno</span> até você
        </h2>
        <p className="mt-3 max-w-xl text-coffee-100 sm:text-lg">
          Peça pelo cardápio abaixo e finalize no WhatsApp em segundos. Entregamos em José Bonifácio e região.
        </p>
        <a
          href="#cardapio"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 font-bold text-coffee-900 shadow-lg transition hover:bg-amber-300"
        >
          Ver cardápio
        </a>
      </div>
    </section>
  );
}
