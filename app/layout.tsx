import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import common from '@/locales/es/common.json';
import { NextIntlClientProvider } from 'next-intl';
import { usePathname } from 'next/navigation';

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
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  return (
    <html lang="es">
      <body
        className={`dark bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] min-h-screen ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Solo bloquear desktop si no es /privacy */}
        {!(typeof window !== 'undefined' ? window.location.pathname : '').startsWith('/privacy') && (
          <div id="desktop-blocker" className="hidden md:flex fixed inset-0 z-50 items-center justify-center bg-black/90 text-white text-center text-2xl font-bold">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#23243a] to-[#1a1a2e] border-4 border-gradient-to-r from-fuchsia-500 via-cyan-500 to-blue-500 animate-pulse shadow-2xl">
              🚫 Esta experiencia es solo para móvil.<br />
              <span className="text-lg font-normal block mt-4">Abre esta URL desde tu smartphone para continuar.</span>
            </div>
          </div>
        )}
        <div className="md:hidden">
          <NextIntlClientProvider locale="es">
            {children}
          </NextIntlClientProvider>
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
