import { headers } from "next/headers";
import { sql } from "@/lib/db";
import Boutique, { StoreProduct } from "@/components/Boutique";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = (await sql`
    SELECT id, name, size, price, stock, photo
    FROM products
    ORDER BY id
  `) as unknown as StoreProduct[];

  const nonce = (await headers()).get("x-nonce") ?? "";

  return (
    <Boutique
      products={products}
      nonce={nonce}
      turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
    />
  );
}
