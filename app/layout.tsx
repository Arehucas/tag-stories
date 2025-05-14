import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import common from '@/locales/es/common.json';
import { NextIntlClientProvider } from 'next-intl';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: common.metadata.root.title,
  description: common.metadata.root.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333] min-h-screen antialiased">
        <div className="w-full min-h-screen flex flex-col items-center">
          <div className="w-full max-w-[1024px] min-h-screen flex flex-col flex-1 mx-auto">
            <NextIntlClientProvider locale="es">
              {children}
            </NextIntlClientProvider>
          </div>
        </div>
        {/* Filtro SVG global para LoaderBolas */}
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <filter id="pink-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -10" result="filter" />
              <feComposite in="SourceGraphic" in2="filter" operator="atop" />
            </filter>
          </defs>
        </svg>
      </body>
    </html>
  );
}
