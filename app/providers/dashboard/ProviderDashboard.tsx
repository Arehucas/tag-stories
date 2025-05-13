"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OnboardingProvider from "./onboarding";
import LoaderBolas from "@/components/ui/LoaderBolas";
import LoaderTable from "@/components/ui/LoaderTable";
import { Instagram, Clock, Copy, CheckCircle, ChevronRight } from "lucide-react";
import Image from 'next/image';
import Link from "next/link";
import { useT } from '@/lib/useT';
import ProviderDashboardStoryCard from '@/components/ui/ProviderDashboardStoryCard';

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
  campaignName?: string;
  campaignNombre?: string;
  campaignTitle?: string;
  [key: string]: unknown;
}

export default function ProviderDashboard() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const t = useT();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [demo, setDemo] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(true);
  const [stories, setStories] = useState<Story[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [hasIGToken, setHasIGToken] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [campaignActive, setCampaignActive] = useState<boolean | null>(null);
  const [campaignNames, setCampaignNames] = useState<Record<string, string>>({});

  useEffect(() => {
    setHydrated(true);
    if (typeof window !== "undefined") {
      const demoSession = localStorage.getItem("demoSession");
      if (demoSession) {
        const demoUser = JSON.parse(demoSession);
        setDemo(demoUser);
        fetch(`/api/provider/by-email?email=${encodeURIComponent(demoUser.provider.email)}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            setProvider(data || { email: demoUser.provider.email });
            setLoadingProvider(false);
          })
          .catch(() => setLoadingProvider(false));
        return;
      }
    }
    if (status === "unauthenticated") {
      router.push("/providers/access");
      setLoadingProvider(false);
      return;
    }
    if (status === "authenticated" && session?.user?.email) {
      const userEmail = session && session.user ? session.user.email : undefined;
      fetch(`/api/provider/by-email?email=${encodeURIComponent(userEmail || "")}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          setProvider(data || (userEmail ? { email: userEmail } : null));
          setLoadingProvider(false);
        })
        .catch(() => setLoadingProvider(false));
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

  useEffect(() => {
    // Comprobar campaña activa
    if (provider?.slug) {
      fetch(`/api/provider/${provider.slug}/campaign`)
        .then(res => res.ok ? res.json() : null)
        .then(camp => {
          if (!camp || camp.error || !camp.isActive) {
            setCampaignActive(false);
          } else {
            setCampaignActive(true);
          }
        });
    }
  }, [provider?.slug]);

  // Efecto para obtener nombres de campañas de las stories
  useEffect(() => {
    const fetchCampaignNames = async () => {
      const ids = Array.from(new Set(stories.map(s => s.campaignId?.toString()).filter(Boolean)));
      if (ids.length === 0) return;
      const res = await fetch(`/api/campaign-names?ids=${ids.join(",")}`);
      if (res.ok) {
        const data = await res.json();
        setCampaignNames(data);
      }
    };
    if (stories.length > 0) fetchCampaignNames();
  }, [stories]);

  // Centralizo la comprobación de si el provider está completo
  const providerCompleto = provider && provider.nombre && provider.direccion && provider.ciudad && provider.instagram_handle && provider.logo_url;

  // Filtrar stories validadas y pendientes
  const validatedStories = stories.filter(s => s.status === 'validated');
  const pendingStories = stories.filter(s => s.status === 'pending');

  // Mostrar loader si aún no hay provider válido (al menos email)
  if (!hydrated || loadingProvider || status === "loading" || !provider || !provider.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e]">
        <LoaderBolas />
      </div>
    );
  }

  // Solo mostrar Onboarding si la carga terminó y el provider tiene email pero no está completo
  if (provider.email && !providerCompleto) {
    return <OnboardingProvider provider={provider} />;
  }

  // --- NUEVA UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333] flex flex-col items-center px-4 sm:px-8 pb-12 transition-colors duration-500 relative overflow-hidden">
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
              <button
                className="flex items-center gap-3 px-8 py-4 rounded-xl text-white font-bold text-lg hover:bg-violet-900/10 transition mb-2"
                onClick={() => {
                  setMenuOpen(false);
                  router.push('/providers/dashboard/campaign');
                }}
              >
                <svg width="28" height="28" fill="none" stroke="#a259ff" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" stroke="#a259ff" strokeWidth="2" fill="#a259ff" opacity="0.2"/><path d="M8 12h8" stroke="#a259ff" strokeWidth="2" strokeLinecap="round"/></svg>
                <span>Campaña</span>
              </button>
              <button
                className="flex items-center gap-3 px-8 py-4 rounded-xl text-white font-bold text-lg hover:bg-violet-900/10 transition mb-2"
                onClick={() => {
                  setMenuOpen(false);
                  router.push('/providers/dashboard/stories');
                }}
              >
                <svg width="28" height="28" fill="none" stroke="#a259ff" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" stroke="#a259ff" strokeWidth="2" fill="#a259ff" opacity="0.2"/><path d="M8 12h8" stroke="#a259ff" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="3" stroke="#a259ff" strokeWidth="2" fill="#a259ff" opacity="0.4"/></svg>
                <span>Stories</span>
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
        {/* Navbar superior fijo */}
        <div className="w-full bg-transparent flex flex-col items-center justify-center" style={{paddingTop: 30, paddingBottom: 0}}>
          <Image
            src="/logos/logo-taun-texto-blanco.svg"
            alt="Taun.me logo"
            width={90}
            height={18}
            priority
            style={{ marginBottom: 10, display: 'block', opacity: 0.4 }}
          />
          <div style={{ width: '75%', height: 2, background: 'rgba(229,231,235,0.1)', borderRadius: 1, margin: '0 auto' }} />
        </div>
        {/* Saludo y subtítulo debajo del navbar */}
        <div className="flex items-center justify-between px-2 py-2 mt-10 mb-8 w-full">
          <div className="flex flex-col">
            <span className="text-white text-2xl font-bold leading-tight">{t('dashboard.hello').replace('{{name}}', provider?.nombre || provider?.email || t('dashboard.user_fallback'))}</span>
            <span className="text-white/80 text-sm font-semibold opacity-50">{t('dashboard.mention')} <span className="font-bold text-white">@{provider?.instagram_handle || t('dashboard.user_fallback')}</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-white cursor-pointer" onClick={() => setMenuOpen(true)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
        {/* Caja URL compartir */}
        <div className="w-full bg-[#18122b] rounded-xl p-5 mb-6 flex flex-col gap-2 border border-violet-950/60">
          <div className="flex items-center justify-between mb-1 w-full">
            <label className="text-white/80 text-sm font-semibold truncate">{t('dashboard.share_url_label')}</label>
            {copied && (
              <span className="text-xs font-semibold text-blue-400 animate-fade-in-out flex-shrink-0 ml-2 whitespace-nowrap">{t('dashboard.url_copied')}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={provider?.slug ? `${typeof window !== 'undefined' ? window.location.origin : 'https://taun.me'}/p/${provider.slug}` : ''}
              className="flex-1 bg-[#0a0618] text-white px-3 py-2 rounded-lg border border-violet-950/60 text-sm font-mono outline-none"
            />
            <button
              onClick={async () => {
                if (provider?.slug) {
                  const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://taun.me'}/p/${provider.slug}`;
                  await copiarAlPortapapeles(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
              }}
              className="p-2 rounded-lg text-white hover:scale-105 transition-transform"
              style={{ background: `linear-gradient(90deg, ${secondaryBlue} 0%, #00f2ea 100%)` }}
              title={t('dashboard.copy_url')}
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
        {/* Warning campaña desactivada */}
        {campaignActive === false && (
          <Link href="/providers/dashboard/campaign" className="block mb-6 p-5 rounded-xl bg-gradient-to-r from-fuchsia-800 via-violet-900 to-violet-950 border border-violet-700 text-violet-100 font-semibold flex items-center gap-3 cursor-pointer hover:bg-violet-900/80 transition shadow-lg animate-fade-in-out">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="13,3 25,23 1,23" fill="#fde68a" />
              <rect x="12" y="10" width="2" height="6" rx="1" fill="#222" />
              <circle cx="13" cy="19" r="1.2" fill="#222" />
            </svg>
            <span className="flex-1">No tienes campaña activa: las stories de tus usuarios serán ignoradas.</span>
            <svg width="22" height="22" fill="none" stroke="#a259ff" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        )}
        {/* Lista de stories validadas */}
        {validatedStories.length > 0 && (
          <div className="w-full mt-6">
            <h2 className="text-white text-lg font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-blue-600" /> Stories validadas
            </h2>
            <div className="flex flex-col gap-4">
              {validatedStories.map((story, i) => (
                <ProviderDashboardStoryCard
                  key={i}
                  story={story}
                  campaignName={story.campaignNombre || campaignNames[String(story.campaignId)] || t('providerStories.noCampaign')}
                  onClick={() => router.push(`/providers/dashboard/campaign/story/${story._id}`)}
                  origin="dashboard"
                />
              ))}
            </div>
          </div>
        )}
        {/* Lista de stories pendientes */}
        <div className="w-full mt-6">
          <h2 className="text-white text-lg font-semibold mb-2 flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-600" /> Stories pendientes
          </h2>
          <div className="flex flex-col gap-4">
            {loadingStories ? (
              <div className="flex justify-center py-8"><LoaderTable /></div>
            ) : (
              pendingStories.length === 0 ? (
                <div className="text-gray-400 text-center py-8">No hay stories pendientes</div>
              ) : (
                pendingStories.map((story, i) => (
                  <ProviderDashboardStoryCard
                    key={i}
                    story={story}
                    campaignName={story.campaignNombre || campaignNames[String(story.campaignId)] || t('providerStories.noCampaign')}
                    onClick={() => router.push(`/providers/dashboard/campaign/story/${story._id}`)}
                    origin="dashboard"
                  />
                ))
              )
            )}
          </div>
        </div>
        <div className="my-8 border-t border-violet-900/60" />
      </div>
    </div>
  );
}