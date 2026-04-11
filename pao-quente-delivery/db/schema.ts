import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  price: real("price").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull().default(""),
  available: integer("available", { mode: "boolean" }).notNull().default(true),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  street: text("street").notNull(),
  number: text("number").notNull(),
  neighborhood: text("neighborhood").notNull(),
  complement: text("complement").default(""),
  reference: text("reference").default(""),
  paymentMethod: text("payment_method", { enum: ["dinheiro", "cartao", "pix"] }).notNull(),
  changeFor: real("change_for"),
  total: real("total").notNull(),
  status: text("status", {
    enum: ["aguardando_pagamento", "a_caminho", "entregue"],
  })
    .notNull()
    .default("aguardando_pagamento"),
  itemsJson: text("items_json").notNull(),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export const CATEGORIES = ["Pães", "Salgados", "Doces", "Bolos", "Bebidas"] as const;
export type Category = (typeof CATEGORIES)[number];
