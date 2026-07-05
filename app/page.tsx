import { sql } from "@/lib/db";
import Boutique, { StoreProduct } from "@/components/Boutique";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = (await sql`
    SELECT id, name, size, price, stock, photo
    FROM products
    ORDER BY id
  `) as unknown as StoreProduct[];

  return <Boutique products={products} />;
}
