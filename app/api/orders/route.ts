import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

type OrderRequestItem = {
  id: string;
  qty: number;
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const requested: OrderRequestItem[] = Array.isArray(body?.items) ? body.items : [];

  const cleaned = requested
    .filter((item) => typeof item.id === "string" && Number.isInteger(item.qty) && item.qty > 0)
    .map((item) => ({ id: item.id, qty: Math.min(item.qty, 999) }));

  if (cleaned.length === 0) {
    return NextResponse.json({ error: "Panier vide ou invalide" }, { status: 400 });
  }

  const ids = cleaned.map((item) => item.id);
  const products = await sql`
    SELECT id, name, price, stock FROM products WHERE id = ANY(${ids})
  `;

  const productById = new Map(products.map((p) => [p.id as string, p]));
  const items = cleaned
    .filter((item) => productById.has(item.id))
    .map((item) => {
      const product = productById.get(item.id)!;
      return {
        id: item.id,
        name: product.name as string,
        qty: item.qty,
        price: product.price as number,
      };
    });

  if (items.length === 0) {
    return NextResponse.json({ error: "Produits inconnus" }, { status: 400 });
  }

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const updateQueries = items.map(
    (item) =>
      sql`UPDATE products SET stock = GREATEST(stock - ${item.qty}, 0) WHERE id = ${item.id}`
  );
  const insertOrder =
    sql`INSERT INTO orders (items, total) VALUES (${JSON.stringify(items)}, ${total}) RETURNING id, created_at`;

  const results = await sql.transaction([...updateQueries, insertOrder]);
  const orderResult = results[results.length - 1] as { id: number; created_at: string }[];

  return NextResponse.json({
    success: true,
    orderId: orderResult[0]?.id,
    items,
    total,
  });
}
