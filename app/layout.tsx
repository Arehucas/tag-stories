import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ambassador Rewards",
  description: "Premia a tus clientes por compartir tu local en Instagram Stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`dark bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] min-h-screen ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div id="desktop-blocker" className="hidden md:flex fixed inset-0 z-50 items-center justify-center bg-black/90 text-white text-center text-2xl font-bold">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-[#23243a] to-[#1a1a2e] border-4 border-gradient-to-r from-fuchsia-500 via-cyan-500 to-blue-500 animate-pulse shadow-2xl">
            🚫 Esta experiencia es solo para móvil.<br />
            <span className="text-lg font-normal block mt-4">Abre esta URL desde tu smartphone para continuar.</span>
          </div>
        </div>
        <div className="md:hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
