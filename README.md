# BOFA — Boutique de jus 100% naturel

Site vitrine mobile pour **BOFA**, jus d'orange et nectar de mangue 100% naturels
fabriqués au Mali. Implémentation Next.js du proto `Boutique BOFA.dc.html`
(Claude Design) : héro animé façon pagne wax, catalogue produits, panier, et
commande directe via WhatsApp.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
```

## À remplacer avant mise en ligne

- `public/assets/wax.svg` est un motif générateur de substitution (couleurs
  BOFA) — à remplacer par la vraie photo de pagne wax.
- Les vignettes produits (`photo`) et le bloc `[ photo verger ]` sont des
  emplacements volontaires en attendant les vraies photos.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript. Pas de backend : le panier vit
en `useState`, la commande part sur WhatsApp (`wa.me`) avec le détail encodé.
