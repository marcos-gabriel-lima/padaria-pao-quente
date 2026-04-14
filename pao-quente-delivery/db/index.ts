// Conexão com Supabase Postgres via postgres-js + drizzle ORM
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// prepare: false é recomendado quando usando o Supabase pooler (Transaction mode)
const client = postgres(connectionString, { prepare: false, ssl: "require" });

export const db = drizzle(client, { schema });
