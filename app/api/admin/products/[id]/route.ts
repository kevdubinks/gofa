import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isSameOrigin } from "@/lib/originCheck";

const MAX_PRICE = 10_000_000;
const MAX_STOCK = 1_000_000;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origine invalide" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { name, size, price, stock, low_stock_threshold, photo } = body;

  if (
    typeof name !== "string" ||
    name.trim().length === 0 ||
    name.length > 200 ||
    typeof size !== "string" ||
    size.length > 100 ||
    !Number.isInteger(price) ||
    price < 0 ||
    price > MAX_PRICE ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    stock > MAX_STOCK ||
    !Number.isInteger(low_stock_threshold) ||
    low_stock_threshold < 0 ||
    low_stock_threshold > MAX_STOCK ||
    (photo !== null && (typeof photo !== "string" || photo.length > 500))
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
