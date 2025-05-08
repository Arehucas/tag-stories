"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OnboardingProvider from "./onboarding";
import LoaderBolas from "@/components/ui/LoaderBolas";
import LoaderTable from "@/components/ui/LoaderTable";
import { Instagram, Clock, Copy } from "lucide-react";

const secondaryBlue = "#3a86ff";

// Añadir función utilitaria para copiar texto al portapapeles de forma robusta
const copiarAlPortapapeles = async (texto: string) => {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      // Fallback si falla el clipboard moderno
    }
  }
  // Fallback clásico
  try {
    const input = document.createElement('input');
    input.value = texto;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    return true;
  } catch {
    return false;
  }
};

// Definición local de la interfaz Provider para tipado correcto
interface Provider {
  slug?: string;
  nombre?: string;
  direccion?: string;
  ciudad?: string;
  instagram_handle?: string;
  logo_url?: string;
  email?: string;
  [key: string]: unknown;
}

// Definición local de la interfaz Story para tipado correcto
interface Story {
  createdAt: string | Date;
  [key: string]: unknown;
}

export default function ProviderDashboard() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [demo, setDemo] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(true);
  const [stories, setStories] = useState<Story[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [hasIGToken, setHasIGToken] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setHydrated(true);
    if (typeof window !== "undefined") {
      const demoSession = localStorage.getItem("demoSession");
      if (demoSession) {
        const demoUser = JSON.parse(demoSession);
        setDemo(demoUser);
        fetch(`/api/provider/by-email?email=${encodeURIComponent(demoUser.user.email)}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            setProvider(data);
            setLoadingProvider(false);
          });
        return;
      }
    }
    if (status === "unauthenticated") {
      router.push("/providers/access");
      setLoadingProvider(false);
      return;
    }
    if (status === "authenticated" && session?.user?.email) {
      fetch(`/api/provider/by-email?email=${encodeURIComponent(session.user.email)}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          setProvider(data);
          setLoadingProvider(false);
        });
    } else {
      setLoadingProvider(false);
    }
  }, [status, session, router]);

  useEffect(() => {
    if (provider?.slug) {
      setLoadingStories(true);
      fetch(`/api/story-submission?providerId=${encodeURIComponent(provider.slug)}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          setStories(data);
          setLoadingStories(false);
        })
        .catch(() => setLoadingStories(false));
    }
  }, [provider?.slug]);

  useEffect(() => {
    fetch('/api/ig-connect/status')
      .then(res => res.json())
      .then(data => setHasIGToken(!!data.hasIGToken));
  }, []);

  if (!hydrated || loadingProvider || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e]">
        <LoaderBolas />
      </div>
    );
  }

  // Solo mostrar Onboarding si loadingProvider es false y falta información del provider
  if (!loadingProvider && (
    !provider ||
    (provider && (
      !provider.nombre ||
      !provider.direccion ||
      !provider.ciudad ||
      !provider.instagram_handle ||
      !provider.logo_url
    ))
  )) {
    return <OnboardingProvider provider={provider} />;
  }

  // --- NUEVA UI ---
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
            <div className="flex flex-col gap-6 relative" style={{ paddingTop: 100 }}>
              {/* Nueva opción de menú: Datos de marca */}
              <button
                className="flex items-center gap-3 px-8 py-4 rounded-xl text-white font-bold text-lg hover:bg-violet-900/10 transition mb-2"
                onClick={() => {
                  setMenuOpen(false);
                  router.push('/providers/dashboard/brand-data');
                }}
              >
                <svg width="28" height="28" fill="none" stroke="#a259ff" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#a259ff" strokeWidth="2" fill="#a259ff" opacity="0.2"/><path d="M8 12h8M12 8v8" stroke="#a259ff" strokeWidth="2" strokeLinecap="round"/></svg>
                <span>Datos de marca</span>
              </button>
              <div className="border-b border-violet-950/70 w-full mb-2" />
              {/* Aquí puedes añadir más opciones de menú si lo deseas */}
            </div>
            <div className="p-6">
              <button
                className="w-full px-6 py-3 rounded-full border border-violet-900 text-white/90 bg-gradient-to-r from-[#18122b] to-[#0a0618] hover:bg-violet-900/30 transition text-base font-medium shadow-lg"
                onClick={() => {
                  if (demo) {
                    localStorage.removeItem('demoSession');
                    window.location.href = '/providers/access';
                  } else {
                    signOut({ callbackUrl: "/" });
                  }
                }}
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
        <div className="text-white text-2xl font-bold">Hola, {provider?.nombre || provider?.email || 'Provider'}</div>
        {/* Subtexto IG handler */}
        <div className="text-white/80 text-sm font-semibold mb-4 opacity-50">
          Tus usuarios mencionarán a: <span className="font-bold text-white">@{provider?.instagram_handle || 'usuario'}</span>
        </div>
        {/* Caja URL compartir */}
        <div className="w-full bg-[#18122b] rounded-xl p-5 mb-6 flex flex-col gap-2 border border-violet-950/60">
          <div className="flex items-center justify-between mb-1 w-full">
            <label className="text-white/80 text-sm font-semibold truncate">Tu URL para compartir</label>
            {copied && (
              <span className="text-xs font-semibold text-blue-400 animate-fade-in-out flex-shrink-0 ml-2 whitespace-nowrap">URL Copiada!!</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={provider?.slug ? `https://taun.me/p/${provider.slug}` : ''}
              className="flex-1 bg-[#0a0618] text-white px-3 py-2 rounded-lg border border-violet-950/60 text-sm font-mono outline-none"
            />
            <button
              onClick={async () => {
                if (provider?.slug) {
                  await copiarAlPortapapeles(`https://taun.me/p/${provider.slug}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
              }}
              className="p-2 rounded-lg text-white hover:scale-105 transition-transform"
              style={{ background: `linear-gradient(90deg, ${secondaryBlue} 0%, #00f2ea 100%)` }}
              title="Copiar URL"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>
        <style jsx>{`
          @keyframes fade-in-out {
            0% { opacity: 0; transform: translateY(-8px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-8px); }
          }
          .animate-fade-in-out {
            animation: fade-in-out 2s cubic-bezier(0.4,0,0.2,1);
          }
        `}</style>
        {/* Validación IG */}
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
                onChange={async () => {
                  if (hasIGToken) {
                    await fetch('/api/ig-connect/unlink', { method: 'POST' });
                    setHasIGToken(false);
                  } else {
                    router.push('/ig-connect');
                  }
                }}
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
                ></span>
              </span>
            </label>
          </div>
        </div>
        {/* Lista de stories */}
        <div className="w-full mt-6">
          <h2 className="text-white text-lg font-semibold mb-2">Stories pendientes</h2>
          <div className="flex flex-col gap-4">
            {loadingStories ? (
              <div className="flex justify-center py-8"><LoaderTable /></div>
            ) : (
              stories.length === 0 ? (
                <div className="text-gray-400 text-center py-8">No hay stories pendientes</div>
              ) : (
                stories.map((story, i) => {
                  const date = new Date(story.createdAt);
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
                })
              )
            )}
          </div>
        </div>
        <div className="my-8 border-t border-violet-900/60" />
      </div>
    </div>
  );
}