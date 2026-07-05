import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  const products = await sql`
    SELECT id, name, size, price, stock, photo
    FROM products
    ORDER BY id
  `;
  return NextResponse.json({ products });
}
