export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-coffee-600 via-coffee-700 to-coffee-800 text-cream">
      {/* Decorative bread shapes */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-coffee-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-amber-400/10 blur-2xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-14 text-center sm:flex-row sm:py-20 sm:text-left">
        <div className="flex-1">
          <p className="mb-2 inline-block rounded-full bg-amber-400/20 px-4 py-1 text-sm font-semibold text-amber-300">
            Delivery em José Bonifácio e região
          </p>
          <h2 className="font-display text-3xl leading-tight sm:text-5xl">
            Pão quentinho, <br className="sm:hidden" />
            <span className="text-amber-300">direto do forno</span>
            <br />até a sua mesa
          </h2>
          <p className="mt-4 max-w-xl text-coffee-100 sm:text-lg">
            Escolha seus favoritos no cardápio, monte seu pedido e finalize pelo WhatsApp em segundos.
            Pães, salgados, doces e muito mais!
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="#cardapio"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 font-bold text-coffee-900 shadow-lg transition hover:bg-amber-300"
            >
              Ver cardápio
            </a>
            <a
              href="https://wa.me/5517997749740"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-cream/30 px-6 py-3 font-bold text-cream transition hover:bg-cream/10"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>

        {/* Decorative icon */}
        <div className="hidden shrink-0 sm:block">
          <div className="relative">
            {/* Glow pulse behind the bread */}
            <div className="absolute inset-0 animate-pulse rounded-full bg-amber-400/20 blur-2xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-bread.svg"
              alt=""
              className="relative h-48 w-48 animate-float drop-shadow-2xl lg:h-60 lg:w-60"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
