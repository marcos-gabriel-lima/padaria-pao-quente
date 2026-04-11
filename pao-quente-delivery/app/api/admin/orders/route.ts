import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getAdminFromCookies } from "@/lib/auth";
import { desc } from "drizzle-orm";

export async function GET() {
  if (!(await getAdminFromCookies())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const all = await db.select().from(orders).orderBy(desc(orders.id));
  return NextResponse.json(all);
}
