// Layout do painel administrativo — header com navegação e botão de logout
import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-coffee-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-coffee-600 text-cream">
              <span className="font-display">PQ</span>
            </div>
            <div>
              <p className="font-display text-lg text-coffee-800">Painel Administrativo</p>
              <p className="text-xs text-coffee-500">Padaria Pão Quente</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/admin/orders" className="rounded-full px-4 py-2 text-sm font-semibold text-coffee-700 hover:bg-coffee-50">
              Pedidos
            </Link>
            <Link href="/admin/products" className="rounded-full px-4 py-2 text-sm font-semibold text-coffee-700 hover:bg-coffee-50">
              Produtos
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
