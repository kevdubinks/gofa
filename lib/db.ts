import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const sql = neon(process.env.DATABASE_URL);

export type ProductRow = {
  id: string;
  name: string;
  size: string;
  price: number;
  stock: number;
  low_stock_threshold: number;
  photo: string | null;
};

export type OrderRow = {
  id: number;
  created_at: string;
  items: { id: string; name: string; qty: number; price: number }[];
  total: number;
};
