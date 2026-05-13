// Tipos e constantes do catálogo — sem dependência de banco de dados

export const CATEGORIES = ["Pães", "Salgados", "Doces", "Bolos", "Bebidas"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Availability = "available" | "unavailable" | "unlimited";
export type PaymentMethod = "dinheiro" | "cartao" | "pix";
export type OrderStatus = "aguardando_pagamento" | "a_caminho" | "entregue";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  availability: Availability;
  stock: number;
  featured: boolean;
  createdAt: string;
}

export type NewProduct = Omit<Product, "id" | "createdAt">;

export interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  street: string;
  number: string;
  neighborhood: string;
  complement: string;
  reference: string;
  paymentMethod: PaymentMethod;
  changeFor: number | null;
  total: number;
  status: OrderStatus;
  itemsJson: string;
  createdAt: string;
}
