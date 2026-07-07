// src/app/layout.tsx
import type { Metadata } from "next";
import { Archivo_Black, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "La Despensa | Víveres a domicilio en Venezuela",
  description:
    "Harina, arroz, enlatados y todo lo de tu despensa, con precios en Bs y USD, entregado en tu zona.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body
        className={`${archivoBlack.variable} ${publicSans.variable} ${plexMono.variable} font-[family-name:var(--font-body)] antialiased`}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
