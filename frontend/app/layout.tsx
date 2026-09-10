import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Divergence Router — Structured Event Contracts on Somnia DreamDEX",
  description:
    "1-Click Atomic Execution Engine for cross-asset decorrelation and calendar term-structure split trading.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#090c10] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
