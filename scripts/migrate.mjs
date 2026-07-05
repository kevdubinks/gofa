import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id text PRIMARY KEY,
      name text NOT NULL,
      size text NOT NULL,
      price integer NOT NULL,
      stock integer NOT NULL DEFAULT 0,
      low_stock_threshold integer NOT NULL DEFAULT 10,
      photo text
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id serial PRIMARY KEY,
      created_at timestamptz NOT NULL DEFAULT now(),
      items jsonb NOT NULL,
      total integer NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS rate_limit_events (
      id bigserial PRIMARY KEY,
      bucket text NOT NULL,
      client_key text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS rate_limit_events_lookup
    ON rate_limit_events (bucket, client_key, created_at)
  `;

  const seed = [
    { id: "orange", name: "Jus d'Orange", size: "33 cl", price: 800, stock: 50, low_stock_threshold: 10, photo: null },
    { id: "mangue", name: "Nectar de Mangue", size: "33 cl", price: 800, stock: 50, low_stock_threshold: 10, photo: "/assets/mangue.jpg" },
    { id: "douzaine", name: "La Douzaine", size: "12 × 33 cl", price: 9000, stock: 20, low_stock_threshold: 5, photo: null },
  ];

  for (const p of seed) {
    await sql`
      INSERT INTO products (id, name, size, price, stock, low_stock_threshold, photo)
      VALUES (${p.id}, ${p.name}, ${p.size}, ${p.price}, ${p.stock}, ${p.low_stock_threshold}, ${p.photo})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  const rows = await sql`SELECT id, name, stock FROM products ORDER BY id`;
  console.log("Products in DB:", rows);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
