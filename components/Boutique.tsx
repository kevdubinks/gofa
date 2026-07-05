"use client";

import Image from "next/image";
import { useState } from "react";

export type StoreProduct = {
  id: string;
  name: string;
  size: string;
  price: number;
  stock: number;
  photo: string | null;
};

const EMOJI_FALLBACK: Record<string, string> = {
  orange: "🍊",
  mangue: "🥭",
  douzaine: "📦",
};

const WHATSAPP_NUMBER = "22394211779";

function formatFcfa(amount: number) {
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}

export default function Boutique({ products }: { products: StoreProduct[] }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const productById = new Map(products.map((p) => [p.id, p]));

  const addToCart = (id: string) => {
    const product = productById.get(id);
    if (!product) return;
    setCart((prev) => {
      const current = prev[id] ?? 0;
      if (current >= product.stock) return prev;
      return { ...prev, [id]: current + 1 };
    });
  };

  const changeQty = (id: string, delta: number) => {
    setCart((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      return { ...prev, [id]: next };
    });
  };

  const itemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const total = products.reduce(
    (sum, product) => sum + product.price * (cart[product.id] ?? 0),
    0
  );

  const whatsappHref = (() => {
    const lines = products
      .filter((p) => (cart[p.id] ?? 0) > 0)
      .map((p) => `${cart[p.id]}x ${p.name} (${formatFcfa(p.price * cart[p.id])})`)
      .join(", ");
    const message = `Bonjour BOFA ! Je souhaite commander : ${lines}. Total : ${formatFcfa(
      total
    )}. I ni ce !`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  })();

  const handleOrderClick = () => {
    const items = products
      .filter((p) => (cart[p.id] ?? 0) > 0)
      .map((p) => ({ id: p.id, qty: cart[p.id] }));

    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    }).catch(() => {
      // Le message WhatsApp part de toute façon ; le décompte de stock n'est
      // qu'une approximation et ne doit pas bloquer la commande du client.
    });

    setOrderConfirmed(true);
    setCart({});
  };

  return (
    <div className="app">
      <section className="hero">
        <div className="heroContent">
          <div className="brandRow">
            <span className="brandBadge">BOFA</span>
            <span className="originPill">FABRIQUÉ AU MALI</span>
          </div>
          <h1 className="heroTitle">
            Frais. Naturel.
            <br />
            Malien.
          </h1>
          <p className="heroTagline">Le goût du naturel !</p>
        </div>
        <span className="floatingFruit" aria-hidden="true">
          🍊
        </span>
      </section>

      <div className="statsCard">
        <div className="statItem">
          <span className="statLabel">SANS</span>
          <span className="statSub">colorant</span>
        </div>
        <div className="statItem">
          <span className="statLabel">SANS</span>
          <span className="statSub">conservateur</span>
        </div>
        <div className="statItem">
          <span className="statLabel">RICHE</span>
          <span className="statSub">en vitamines</span>
        </div>
      </div>

      <div className="waxBand" aria-hidden="true" />
      <section className="section">
        <h2 className="sectionTitle">Notre histoire</h2>
        <p className="sectionSub">tissée main, comme le pagne</p>
        <p className="aboutText">
          BOFA, c&apos;est l&apos;histoire d&apos;un jus pressé comme à la
          maison : des fruits mûris au soleil du Mali, aucun additif, aucun
          raccourci. Juste le goût du fruit, tel qu&apos;il est — pour
          retrouver, à chaque gorgée, le naturel d&apos;ici.
        </p>
      </section>

      <section className="section">
        <h2 className="sectionTitle">Nos produits</h2>
        <p className="sectionSub">choisis avec amour</p>
        <div className="productList">
          {products.map((product) => {
            const qty = cart[product.id] ?? 0;
            const outOfStock = product.stock <= 0;
            const atMax = qty >= product.stock;
            return (
              <article className="productCard" key={product.id}>
                <div className={`productPhoto${product.photo ? " hasPhoto" : ""}`}>
                  {product.photo ? (
                    <Image
                      src={product.photo}
                      alt={product.name}
                      fill
                      sizes="64px"
                      className="productPhotoImg"
                    />
                  ) : (
                    <>
                      <span className="emoji" aria-hidden="true">
                        {EMOJI_FALLBACK[product.id] ?? "🧃"}
                      </span>
                      <span className="label">photo</span>
                    </>
                  )}
                </div>
                <div className="productInfo">
                  <div className="productName">{product.name}</div>
                  <div className="productSize">{product.size}</div>
                  <div className="productPrice">{formatFcfa(product.price)}</div>
                  {outOfStock && <div className="outOfStock">Rupture de stock</div>}
                </div>
                <button
                  type="button"
                  className="addBtn"
                  onClick={() => addToCart(product.id)}
                  disabled={outOfStock || atMax}
                  aria-label={`Ajouter ${product.name} au panier`}
                >
                  +
                  {qty > 0 && <span key={qty} className="qtyBadge">{qty}</span>}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="promoSection">
        <Image
          src="/assets/promo-mangue.jpg"
          alt="Affiche promotionnelle Nectar de Mangue BOFA"
          width={720}
          height={1080}
          sizes="(max-width: 480px) 100vw, 480px"
          className="promoImage"
        />
      </section>

      <section className="originSection">
        <div className="waxBand" aria-hidden="true" />
        <div className="originBody">
          <div className="orchardPhoto">[ photo verger ]</div>
          <p className="originText">
            Nos jus sont pressés à partir de fruits cueillis dans nos vergers
            au Mali, sans additifs ni conservateurs — juste le fruit, tel
            qu&apos;il est.
          </p>
        </div>
      </section>

      <div className="waxBand" aria-hidden="true" />
      <footer className="footer">
        <div className="footerBrand">BOFA</div>
        <p className="footerTagline">Le goût du naturel !</p>
        <p className="footerContact">
          📞 <strong>(+223) 94 21 17 79</strong> · 79 78 71 63
        </p>
        <p className="footerCopy">
          © 2026 BOFA — fabriqué avec fierté au Mali.
        </p>
      </footer>

      <div className="cartBar">
        <button
          type="button"
          className="cartBarCollapsed"
          onClick={() => setCartOpen((open) => !open)}
        >
          <span>
            🛒 Panier · {itemCount} article{itemCount > 1 ? "s" : ""}
          </span>
          <span>{formatFcfa(total)}</span>
        </button>
        <div className={`cartDrawer${cartOpen ? " open" : ""}`}>
          {orderConfirmed ? (
            <div className="orderConfirmed">
              <p className="orderConfirmedText">
                ✅ Merci ! Votre commande a été transmise. Nous la traitons
                dans les plus brefs délais.
              </p>
              <button
                type="button"
                className="orderNewBtn"
                onClick={() => setOrderConfirmed(false)}
              >
                Nouvelle commande
              </button>
            </div>
          ) : itemCount === 0 ? (
            <p className="emptyCart">Votre panier est vide pour l&apos;instant.</p>
          ) : (
            <>
              {products
                .filter((p) => (cart[p.id] ?? 0) > 0)
                .map((product) => (
                  <div className="cartLine" key={product.id}>
                    <span>{product.name}</span>
                    <div className="qtyControls">
                      <button
                        type="button"
                        onClick={() => changeQty(product.id, -1)}
                        aria-label={`Retirer un ${product.name}`}
                      >
                        −
                      </button>
                      <span>{cart[product.id]}</span>
                      <button
                        type="button"
                        onClick={() => changeQty(product.id, 1)}
                        aria-label={`Ajouter un ${product.name}`}
                      >
                        +
                      </button>
                    </div>
                    <span>{formatFcfa(product.price * cart[product.id])}</span>
                  </div>
                ))}
              <div className="cartTotal">
                <span>Total</span>
                <span>{formatFcfa(total)}</span>
              </div>
              <a
                className="whatsappBtn"
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleOrderClick}
              >
                Commander sur WhatsApp
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
