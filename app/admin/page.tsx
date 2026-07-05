import { sql, ProductRow, OrderRow } from "@/lib/db";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const products = (await sql`
    SELECT id, name, size, price, stock, low_stock_threshold, photo
    FROM products
    ORDER BY id
  `) as unknown as ProductRow[];

  const orders = (await sql`
    SELECT id, created_at, items, total
    FROM orders
    ORDER BY created_at DESC
    LIMIT 30
  `) as unknown as OrderRow[];

  return <AdminDashboard initialProducts={products} orders={orders} />;
}
