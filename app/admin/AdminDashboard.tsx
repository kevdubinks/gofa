"use client";

import { useState } from "react";
import type { ProductRow, OrderRow } from "@/lib/db";

function formatFcfa(amount: number) {
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}

function ProductEditor({ product }: { product: ProductRow }) {
  const [form, setForm] = useState({
    name: product.name,
    size: product.size,
    price: product.price,
    stock: product.stock,
    low_stock_threshold: product.low_stock_threshold,
    photo: product.photo ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const isLow = form.stock <= form.low_stock_threshold;

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          size: form.size,
          price: Number(form.price),
          stock: Number(form.stock),
          low_stock_threshold: Number(form.low_stock_threshold),
          photo: form.photo || null,
        }),
      });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className={isLow ? "adminRowLow" : ""}>
      <td>
        <input
          className="adminInput"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </td>
      <td>
        <input
          className="adminInput adminInputSmall"
          value={form.size}
          onChange={(e) => setForm({ ...form, size: e.target.value })}
        />
      </td>
      <td>
        <input
          type="number"
          className="adminInput adminInputSmall"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        />
      </td>
      <td>
        <input
          type="number"
          className="adminInput adminInputSmall"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
        />
        {isLow && <span className="adminLowBadge">Stock faible</span>}
      </td>
      <td>
        <input
          type="number"
          className="adminInput adminInputSmall"
          value={form.low_stock_threshold}
          onChange={(e) =>
            setForm({ ...form, low_stock_threshold: Number(e.target.value) })
          }
        />
      </td>
      <td>
        <input
          className="adminInput"
          value={form.photo}
          placeholder="/assets/…"
          onChange={(e) => setForm({ ...form, photo: e.target.value })}
        />
      </td>
      <td>
        <button type="button" className="adminSaveBtn" onClick={save} disabled={saving}>
          {saving ? "…" : "Enregistrer"}
        </button>
        {savedAt && !saving && <span className="adminSavedNote">Enregistré ✓</span>}
      </td>
    </tr>
  );
}

export default function AdminDashboard({
  initialProducts,
  orders,
}: {
  initialProducts: ProductRow[];
  orders: OrderRow[];
}) {
  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <div className="adminPage">
      <div className="adminHeader">
        <h1 className="adminTitle">Admin BOFA</h1>
        <button type="button" className="adminLogoutBtn" onClick={logout}>
          Déconnexion
        </button>
      </div>

      <section className="adminSection">
        <h2 className="adminSectionTitle">Produits &amp; stock</h2>
        <div className="adminTableWrap">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Format</th>
                <th>Prix (FCFA)</th>
                <th>Stock</th>
                <th>Seuil alerte</th>
                <th>Photo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {initialProducts.map((product) => (
                <ProductEditor key={product.id} product={product} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="adminSection">
        <h2 className="adminSectionTitle">Commandes récentes</h2>
        {orders.length === 0 ? (
          <p className="adminEmpty">Aucune commande pour l&apos;instant.</p>
        ) : (
          <div className="adminTableWrap">
            <table className="adminTable">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Articles</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      {new Date(order.created_at).toLocaleString("fr-FR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td>
                      {order.items
                        .map((item) => `${item.qty}× ${item.name}`)
                        .join(", ")}
                    </td>
                    <td>{formatFcfa(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
