// Página principal da loja — monta header, hero, cardápio, footer e carrinho
import Header from "@/components/layout/Header";
import Hero from "@/components/layout/Hero";
import Menu from "@/components/store/Menu";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Menu />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
