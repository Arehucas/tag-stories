"use client";

import React, { useState } from "react";
import { Instagram, Clock, Copy } from "lucide-react";

const mockProviderEmail = "provider@email.com";
const secondaryBlue = "#3a86ff";

function EmojiMood() {
  const moods = [
    { emoji: "😌", label: "Calm" },
    { emoji: "🥱", label: "Tired" },
    { emoji: "😢", label: "Sad" },
    { emoji: "😊", label: "Happy" },
  ];
  return (
    <div className="flex gap-4 mt-4 mb-6">
      {moods.map((m) => (
        <div key={m.label} className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-700 to-indigo-900 flex items-center justify-center text-2xl shadow-lg mb-1">
            {m.emoji}
          </div>
          <span className="text-xs text-gray-300">{m.label}</span>
        </div>
      ))}
    </div>
  );
}

function CourseItem({ title, time }: { title: string; time: string }) {
  return (
    <div className="flex items-center justify-between bg-gradient-to-br from-[#18122b] to-[#0a0618] rounded-xl p-5 mb-4 shadow-md border border-violet-950/60">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-violet-900 flex items-center justify-center text-white text-lg shadow">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-5.197-2.598A1 1 0 008 9.382v5.236a1 1 0 001.555.832l5.197-2.598a1 1 0 000-1.784z" /></svg>
        </div>
        <div>
          <div className="text-white font-semibold text-base">{title}</div>
          <div className="text-xs text-gray-400">Course · {time}</div>
        </div>
      </div>
      <button className="text-violet-400 hover:text-violet-200 transition">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-br from-violet-900/90 to-indigo-950/90 rounded-2xl p-7 shadow-xl mb-10">
      {title && <div className="text-white text-lg font-bold mb-2">{title}</div>}
      {children}
    </div>
  );
}

function Separator() {
  return <div className="my-8 border-t border-violet-900/60" />;
}

function ShareUrlBox() {
  const [copied, setCopied] = useState(false);
  const url = "https://taun.me/p/demo-provider";
  return (
    <div className="w-full bg-[#18122b] rounded-xl p-5 mb-6 flex flex-col gap-2 border border-violet-950/60">
      <label className="text-white/80 text-sm font-semibold mb-1">Tu URL para compartir</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={url}
          className="flex-1 bg-[#0a0618] text-white px-3 py-2 rounded-lg border border-violet-950/60 text-sm font-mono outline-none"
        />
        <button
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="p-2 rounded-lg text-white hover:scale-105 transition-transform"
          style={{ background: `linear-gradient(90deg, ${secondaryBlue} 0%, #00f2ea 100%)` }}
          title="Copiar URL"
        >
          <Copy className="w-5 h-5" />
        </button>
      </div>
      {copied && (
        <div className="text-green-400 text-xs mt-1 animate-pulse">URL copiada a tu portapapeles</div>
      )}
    </div>
  );
}

function IGValidationBox() {
  const [hasIGToken, setHasIGToken] = useState(false);
  return (
    <div className="w-full bg-gradient-to-br from-[#23243a] to-[#18122b] rounded-xl p-6 mb-8 flex flex-col gap-3 shadow-lg border border-violet-950/60">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-tr from-fuchsia-700 to-blue-700 rounded-full p-2">
          <Instagram size={28} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="text-lg font-bold text-white">Validación automática</div>
          <div className="text-sm text-gray-400">Validamos que el usuario suba la story y que cumpla con los requisitos</div>
        </div>
        <label className="inline-flex items-center cursor-pointer select-none group" style={{ minWidth: 56, minHeight: 32 }}>
          <input
            type="checkbox"
            className="sr-only peer"
            checked={hasIGToken}
            onChange={() => setHasIGToken(!hasIGToken)}
          />
          <span
            className={`relative flex items-center w-14 h-8 rounded-full transition-colors duration-200 ${hasIGToken ? '' : 'bg-gray-700'}`}
            style={{ minWidth: 56, minHeight: 32, background: hasIGToken ? secondaryBlue : undefined }}
          >
            <span className={`absolute left-2 top-1/2 transform -translate-y-1/2 transition-opacity duration-200 ${hasIGToken ? 'opacity-100' : 'opacity-0'}`}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M5 10.5L9 14.5L15 7.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span className={`absolute right-2 top-1/2 transform -translate-y-1/2 transition-opacity duration-200 ${!hasIGToken ? 'opacity-100' : 'opacity-0'}`}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M6 6L14 14M14 6L6 14" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
            </span>
            <span className={`absolute left-0 top-0 h-8 w-8 bg-white rounded-full shadow transition-transform duration-200 border border-gray-200 ${hasIGToken ? 'translate-x-6' : 'translate-x-0'}`}
              style={{ minWidth: 32, minHeight: 32 }}
            />
          </span>
        </label>
      </div>
    </div>
  );
}

function StoriesListMock() {
  // Fechas de ejemplo
  const stories = [
    new Date(2025, 11, 23, 14, 47),
    new Date(2025, 10, 12, 9, 30),
    new Date(2025, 8, 5, 18, 5),
  ];
  return (
    <div className="w-full mt-6">
      <h2 className="text-white text-lg font-semibold mb-2">Stories pendientes</h2>
      <div className="flex flex-col gap-4">
        {stories.map((date, i) => {
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = String(date.getFullYear()).slice(-2);
          const hour = String(date.getHours()).padStart(2, '0');
          const min = String(date.getMinutes()).padStart(2, '0');
          return (
            <div key={i} className="bg-gradient-to-br from-[#18122b] to-[#0a0618] rounded-xl p-5 flex items-center gap-4 border border-violet-950/60">
              <div className="w-10 h-10 rounded-full bg-violet-900 flex items-center justify-center text-white text-lg shadow">
                <Clock className="w-6 h-6 text-violet-300" />
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold flex items-center gap-2">
                  {`${day}/${month}/${year}`}
                  <span className="font-normal text-white/50">· {hour}:{min}h</span>
                </div>
                <div className="text-xs text-gray-400">Pendiente de validación</div>
              </div>
              <button className="text-sm font-bold transition" style={{ color: secondaryBlue }}>Ver</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333] flex flex-col items-center py-12 px-4 sm:px-8 transition-colors duration-500 relative overflow-hidden">
      {/* Animación de fondo tipo hero-gradient-bg */}
      <div className="hero-gradient-bg" style={{ top: 0, left: 0, right: 0, height: 400, position: 'absolute', zIndex: 0 }}>
        <div className="hero-gradient-bg-inner" />
      </div>
      {/* Menú lateral (drawer) alineado a la derecha */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          {/* Fondo oscuro para cerrar */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setMenuOpen(false)} />
          {/* Drawer */}
          <aside className="relative z-50 w-72 max-w-full h-full bg-gradient-to-br from-[#18122b] to-[#0a0618] shadow-2xl flex flex-col justify-between animate-slide-in-right">
            <div className="flex flex-col gap-6 relative">
              {/* Aquí puedes añadir más opciones de menú si lo deseas */}
            </div>
            <div className="p-6">
              <button
                className="w-full px-6 py-3 rounded-full border border-violet-900 text-white/90 bg-gradient-to-r from-[#18122b] to-[#0a0618] hover:bg-violet-900/30 transition text-base font-medium shadow-lg"
              >
                Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      )}
      <div className="w-full max-w-lg relative z-10">
        {/* Navbar */}
        <nav className="flex items-center justify-between px-2 py-2 mb-8">
          <div className="text-white font-bold text-xl tracking-wide select-none">Taun.me</div>
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-white" onClick={() => setMenuOpen(true)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </nav>
        {/* Saludo */}
        <div className="text-white text-2xl font-bold mb-4">Hola, Provider</div>
        {/* Caja URL compartir */}
        <ShareUrlBox />
        {/* Validación IG */}
        <IGValidationBox />
        {/* Lista de stories mock */}
        <StoriesListMock />
        <Separator />
      </div>
    </div>
  );
}

// Animación slide-in desde la derecha
if (typeof window !== "undefined") {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes slide-in-right {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in-right {
      animation: slide-in-right 0.35s cubic-bezier(0.4,0,0.2,1) both;
    }
  `;
  if (!document.head.querySelector('style[data-slide-in-right]')) {
    style.setAttribute('data-slide-in-right', 'true');
    document.head.appendChild(style);
  }
} 