import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const DLN_ICON =
  "/WhatsApp_Image_2026-07-16_at_3.23.02_PM-removebg-preview.png";

export const metadata: Metadata = {
  title: "DLN Forwarding",
  description: "Cotizador DLN Forwarding · Plataforma interna",
  icons: {
    icon: [
      { url: DLN_ICON, type: "image/png", sizes: "any" },
    ],
    shortcut: [{ url: DLN_ICON, type: "image/png" }],
    apple: [{ url: DLN_ICON }],
  },
  openGraph: {
    title: "DLN Forwarding · Plataforma",
    description: "Cotizador y control documental DLN Forwarding",
    siteName: "DLN Forwarding",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DLN Forwarding · Plataforma",
    description: "Cotizador y control documental DLN Forwarding",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
