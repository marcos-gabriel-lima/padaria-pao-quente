// Estado global do carrinho — itens, quantidade, cliente e persistência em localStorage
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  quantity: number;
  maxStock: number | null; // null = unlimited
  notes?: string;
};

export type CustomerInfo = {
  customerName: string;
  customerPhone: string;
  street: string;
  number: string;
  neighborhood: string;
  complement?: string;
  reference?: string;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  customer: CustomerInfo | null;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (id: number) => void;
  updateQty: (id: number, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setCustomer: (c: CustomerInfo) => void;
  total: () => number;
  count: () => number;
  hasBeverage: () => boolean;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      customer: null,
      add: (item, quantity = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          if (existing) {
            let newQty = existing.quantity + quantity;
            if (existing.maxStock !== null && newQty > existing.maxStock) newQty = existing.maxStock;
            return {
              items: s.items.map((i) =>
                i.id === item.id ? { ...i, quantity: newQty } : i
              ),
            };
          }
          const max = item.maxStock;
          const clampedQty = max !== null && quantity > max ? max : quantity;
          return { items: [...s.items, { ...item, quantity: clampedQty }] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      updateQty: (id, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.id !== id)
              : s.items.map((i) => {
                  if (i.id !== id) return i;
                  const clamped = i.maxStock !== null && quantity > i.maxStock ? i.maxStock : quantity;
                  return { ...i, quantity: clamped };
                }),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      setCustomer: (c) => set({ customer: c }),
      total: () => get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
      count: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      hasBeverage: () => get().items.some((i) => i.category === "Bebidas"),
    }),
    { name: "pq-cart", partialize: (s) => ({ items: s.items, customer: s.customer }) }
  )
);
