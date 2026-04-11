import { db } from "./index";
import { products } from "./schema";

const seed = [
  {
    name: "Pão Francês",
    description: "Tradicional, crocante por fora e macio por dentro. Unidade.",
    price: 0.85,
    category: "Pães",
    imageUrl: "https://images.unsplash.com/photo-1568471173242-461f0a730452?w=600",
    featured: true,
  },
  {
    name: "Pão de Queijo",
    description: "Quentinho, feito com queijo minas. Unidade.",
    price: 3.5,
    category: "Pães",
    imageUrl: "https://images.unsplash.com/photo-1620921568790-c1cf8984624c?w=600",
    featured: true,
  },
  {
    name: "Pão Doce Recheado",
    description: "Massa fofinha com recheio de creme.",
    price: 6.0,
    category: "Pães",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600",
  },
  {
    name: "Coxinha de Frango",
    description: "Recheio cremoso de frango desfiado. Unidade.",
    price: 7.5,
    category: "Salgados",
    imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600",
    featured: true,
  },
  {
    name: "Esfiha de Carne",
    description: "Aberta, recheio temperado na hora.",
    price: 6.0,
    category: "Salgados",
    imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600",
  },
  {
    name: "Empada de Palmito",
    description: "Massa amanteigada, recheio cremoso.",
    price: 7.0,
    category: "Salgados",
    imageUrl: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=600",
  },
  {
    name: "Brigadeiro Gourmet",
    description: "Chocolate belga, granulado fino. Unidade.",
    price: 4.5,
    category: "Doces",
    imageUrl: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600",
  },
  {
    name: "Sonho de Creme",
    description: "Massa fofinha recheada com creme de baunilha.",
    price: 6.5,
    category: "Doces",
    imageUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600",
  },
  {
    name: "Bolo de Chocolate",
    description: "Fatia generosa, recheio e cobertura de brigadeiro.",
    price: 12.0,
    category: "Bolos",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600",
    featured: true,
  },
  {
    name: "Bolo de Cenoura",
    description: "Tradicional, com cobertura de chocolate.",
    price: 10.0,
    category: "Bolos",
    imageUrl: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600",
  },
  {
    name: "Coca-Cola Lata 350ml",
    description: "Geladinha.",
    price: 6.0,
    category: "Bebidas",
    imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600",
  },
  {
    name: "Suco de Laranja Natural 500ml",
    description: "Feito na hora, sem açúcar.",
    price: 9.0,
    category: "Bebidas",
    imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600",
  },
  {
    name: "Café Expresso",
    description: "Grãos selecionados, encorpado.",
    price: 4.5,
    category: "Bebidas",
    imageUrl: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600",
  },
];

async function main() {
  console.log("Seeding...");
  await db.delete(products);
  for (const p of seed) {
    await db.insert(products).values(p);
  }
  console.log(`Inserted ${seed.length} products.`);
}

main();
