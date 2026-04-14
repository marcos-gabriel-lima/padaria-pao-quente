// Schema do banco Postgres (Supabase) — tabelas products e orders, tipos e categorias
import { pgTable, serial, text, doublePrecision, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const availabilityEnum = pgEnum("availability", ["available", "unavailable", "unlimited"]);
export const paymentMethodEnum = pgEnum("payment_method", ["dinheiro", "cartao", "pix"]);
export const orderStatusEnum = pgEnum("order_status", ["aguardando_pagamento", "a_caminho", "entregue"]);

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  price: doublePrecision("price").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull().default(""),
  availability: availabilityEnum("availability").notNull().default("unlimited"),
  stock: integer("stock").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  street: text("street").notNull(),
  number: text("number").notNull(),
  neighborhood: text("neighborhood").notNull(),
  complement: text("complement").default(""),
  reference: text("reference").default(""),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  changeFor: doublePrecision("change_for"),
  total: doublePrecision("total").notNull(),
  status: orderStatusEnum("status").notNull().default("aguardando_pagamento"),
  itemsJson: text("items_json").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export const CATEGORIES = ["Pães", "Salgados", "Doces", "Bolos", "Bebidas"] as const;
export type Category = (typeof CATEGORIES)[number];
