import type { Metadata } from "next";
import { Baloo_2, Work_Sans, Caveat } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BOFA — Jus d'Orange 100% naturel, fabriqué au Mali",
  description:
    "BOFA : jus d'orange et nectar de mangue 100% naturels, fabriqués au Mali. Le goût du naturel ! Commande directe via WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${baloo.variable} ${workSans.variable} ${caveat.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
