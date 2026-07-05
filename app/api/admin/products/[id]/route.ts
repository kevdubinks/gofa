import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { name, size, price, stock, low_stock_threshold, photo } = body;

  if (
    typeof name !== "string" ||
    typeof size !== "string" ||
    !Number.isInteger(price) ||
    !Number.isInteger(stock) ||
    !Number.isInteger(low_stock_threshold) ||
    (photo !== null && typeof photo !== "string")
  ) {
    return NextResponse.json({ error: "Champs invalides" }, { status: 400 });
  }

  const rows = await sql`
    UPDATE products
    SET name = ${name}, size = ${size}, price = ${price}, stock = ${stock},
        low_stock_threshold = ${low_stock_threshold}, photo = ${photo}
    WHERE id = ${id}
    RETURNING id, name, size, price, stock, low_stock_threshold, photo
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  return NextResponse.json({ product: rows[0] });
}
