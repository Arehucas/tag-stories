"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import OnboardingProvider from "./onboarding";
import LoaderBolas from "@/components/ui/LoaderBolas";
import LoaderTable from "@/components/ui/LoaderTable";
import { Instagram, Clock, Copy, CheckCircle, ChevronRight, Building2, Megaphone, GalleryHorizontal } from "lucide-react";
import Image from 'next/image';
import Link from "next/link";
import { useT } from '@/lib/useT';
import ProviderDashboardStoryCard from '@/components/ui/ProviderDashboardStoryCard';
import WithLoader from '@/components/ui/WithLoader';
import useProviderData from '@/hooks/useProviderData';
import Sidebar from '@/components/ui/sidebar';

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

// NUEVO COMPONENTE: ProviderDashboardGate
function ProviderDashboardGate() {
  const t = useT();
  const { provider, loading } = useProviderData();
  // Estado local para saber si ya se decidió a qué vista ir
  const [evaluando, setEvaluando] = useState(true);
  const [irAOnboarding, setIrAOnboarding] = useState(false);
  // Mensaje random fijo para el loader
  const mensajes = [
    "Afilando bits y ajustando pixeles...",
    "Convenciendo a los servidores de que cooperen...",
    "Tu momento de gloria está a milisegundos...",
    "Reuniendo datos, café y buena vibra...",
    "Esto no es magia... pero casi...",
    "Leyendo las letras pequeñas del universo...",
    "Enviando palomas mensajeras digitales...",
    "Haciendo scroll en el código fuente del destino...",
    "Recargando el karma de los botones...",
    "Poniéndonos guapos para ti...",
  ];
  const [mensajeLoader] = useState(() => mensajes[Math.floor(Math.random() * mensajes.length)]);

  // Centralizo la comprobación de si el provider está completo
  const providerCompleto = provider && provider.nombre && provider.direccion && provider.ciudad && provider.instagram_handle && provider.logo_url;

  useEffect(() => {
    // Solo decido cuando loading es false
    if (!loading) {
      if (provider?.email && !providerCompleto) {
        setIrAOnboarding(true);
      } else {
        setIrAOnboarding(false);
      }
      setEvaluando(false);
    }
  }, [loading, providerCompleto, provider]);

  if (evaluando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e]">
        <LoaderBolas text={mensajeLoader} />
      </div>
    );
  }

  if (irAOnboarding && provider) {
    return <OnboardingProvider provider={provider} />;
  }

  // Renderizo el dashboard real
  return <ProviderDashboardContent provider={provider} />;
}

// Extraigo el contenido real del dashboard a un componente aparte
function ProviderDashboardContent({ provider }: { provider: any }) {
  const router = useRouter();
  const t = useT();
  const [copied, setCopied] = useState(false);
  const [stories, setStories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [hasIGToken, setHasIGToken] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [campaignActive, setCampaignActive] = useState<boolean | null>(null);
  const [loadingCampaignActive, setLoadingCampaignActive] = useState(true);
  const [campaignNames, setCampaignNames] = useState<Record<string, string>>({});
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (provider?.slug && typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/p/${provider.slug}`);
    }
  }, [provider?.slug]);

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
    // Comprobar campaña activa solo cuando provider está completamente cargado
    if (provider?.slug) {
      setLoadingCampaignActive(true);
      fetch(`/api/provider/${provider.slug}/campaign`)
        .then(res => res.ok ? res.json() : null)
        .then(camp => {
          if (!camp || camp.error || !camp.isActive) {
            setCampaignActive(false);
          } else {
            setCampaignActive(true);
          }
          setLoadingCampaignActive(false);
        });
    }
  }, [provider?.slug]);

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

  // Renderizo el dashboard real (igual que antes)
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333] flex flex-col items-center px-4 sm:px-8 pb-12 transition-colors duration-500 relative overflow-hidden">
      {/* Animación de fondo tipo hero-gradient-bg */}
      <div className="hero-gradient-bg" style={{ top: 0, left: 0, right: 0, height: 400, position: 'absolute', zIndex: 0 }}>
        <div className="hero-gradient-bg-inner" />
      </div>
      {/* Menú lateral (drawer) alineado a la derecha */}
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
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
              value={shareUrl}
              className="flex-1 bg-[#0a0618] text-white px-3 py-2 rounded-lg border border-violet-950/60 text-sm font-mono outline-none"
            />
            <button
              onClick={async () => {
                await copiarAlPortapapeles(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 rounded-lg text-xs font-bold transition"
            >
              Copiar
            </button>
          </div>
        </div>
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
        {!loadingCampaignActive && campaignActive === false ? (
          <div
            className="block mb-6 p-5 rounded-xl bg-gradient-to-r from-fuchsia-800 via-violet-900 to-violet-950 border border-violet-700 text-violet-100 font-semibold flex items-center gap-3 cursor-pointer hover:bg-violet-900/80 transition shadow-lg animate-fade-in-out"
            onClick={async () => {
              if (!provider?.slug) return;
              const res = await fetch(`/api/provider/${provider.slug}/campaigns`);
              if (!res.ok) return;
              const campaigns = await res.json();
              const visibles = Array.isArray(campaigns) ? campaigns.filter((c: any) => !c.deleted) : [];
              if (visibles.length === 0) {
                router.push('/providers/dashboard/campaign');
              } else {
                router.push('/providers/dashboard/campaigns');
              }
            }}
          >
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="13,3 25,23 1,23" fill="#fde68a" />
              <rect x="12" y="10" width="2" height="6" rx="1" fill="#222" />
              <circle cx="13" cy="19" r="1.2" fill="#222" />
            </svg>
            <span className="flex-1">No tienes campaña activa: las stories de tus usuarios serán ignoradas.</span>
            <svg width="22" height="22" fill="none" stroke="#a259ff" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        ) : null}
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
                  campaignName={story.campaignName || story.campaignNombre || campaignNames[String(story.campaignId)] || t('providerStories.noCampaign')}
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
                    campaignName={story.campaignName || story.campaignNombre || campaignNames[String(story.campaignId)] || t('providerStories.noCampaign')}
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

// Reemplazo el export default para usar el gate
export default function ProviderDashboard() {
  return <ProviderDashboardGate />;
}