import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MetIgnite -- Launch on Meteora",
  description:
    "AI-powered launch assistant for Meteora. Configure pools, review tokenomics, plan growth, and ship your token launch with confidence.",
  openGraph: {
    title: "MetIgnite -- Launch on Meteora",
    description:
      "AI-powered launch assistant for Meteora. Configure pools, review tokenomics, plan growth.",
    siteName: "MetIgnite",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-met-base-deep text-met-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
