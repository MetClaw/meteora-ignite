import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MetEcoX — Meteora Ecosystem Testing",
  description:
    "Join MetEcoX. 10 testers. Early access to Meteora ecosystem products. USDC + Liquidity NFTs.",
  openGraph: {
    title: "MetEcoX — Meteora Ecosystem Testing",
    description:
      "10 testers. Early access to Meteora ecosystem products. Give feedback directly to founders.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MetEcoX — Meteora Ecosystem Testing",
    description:
      "10 testers. Early access to Meteora ecosystem products. Give feedback directly to founders.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
