"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OnboardingProvider from "./onboarding";
import LoaderBolas from "@/components/ui/LoaderBolas";
import { Copy, Instagram } from 'lucide-react';
import ProviderStoryCardList from '@/components/ui/ProviderStoryCardList';

interface Provider {
  nombre?: string;
  direccion?: string;
  ciudad?: string;
  instagram_handle?: string;
  logo_url?: string;
  email?: string;
  slug?: string;
}

interface Story {
  createdAt: string | Date;
  status: "pending" | "validated" | "redeemed";
  colorCode: { r: number; g: number; b: number }[];
}

export default function ProviderDashboard() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [demo, setDemo] = useState<{ user: { email: string; name: string } } | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(true);
  const [stories, setStories] = useState<Story[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [hasIGToken, setHasIGToken] = useState(false);

  useEffect(() => {
    setHydrated(true);
    if (typeof window !== "undefined") {
      const demoSession = localStorage.getItem("demoSession");
      if (demoSession) {
        const demoUser = JSON.parse(demoSession);
        setDemo(demoUser);
        fetch(`/api/provider/by-email?email=${encodeURIComponent(demoUser.user.email)}`)
          .then(res => {
            if (!res.ok) return null;
            return res.json();
          })
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
        .then(res => {
          if (!res.ok) return null;
          return res.json();
        })
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

  if (!hydrated || loadingProvider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e]">
        <LoaderBolas />
      </div>
    );
  }

  // Si falta algún campo obligatorio, mostrar onboarding
  if (!provider || !provider.nombre || !provider.direccion || !provider.ciudad || !provider.instagram_handle || !provider.logo_url) {
    return <OnboardingProvider provider={provider} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] pt-10 px-4">
      {/* Sección validación automática IG */}
      <div className="w-full max-w-md bg-white rounded-xl p-5 mb-8 flex flex-col gap-3 shadow-lg border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-fuchsia-500 to-blue-500 rounded-full p-2">
            <Instagram size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold text-gray-900">Validación automática de stories</div>
            <div className="text-sm text-gray-600">Activa la validación automática de stories mediante tu cuenta de Instagram.</div>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={hasIGToken}
              onChange={async () => {
                if (hasIGToken) {
                  // Desvincular IG
                  await fetch('/api/ig-connect/unlink', { method: 'POST' });
                  setHasIGToken(false);
                } else {
                  router.push('/ig-connect');
                }
              }}
            />
            <div className={`w-11 h-6 rounded-full transition-all ${
              hasIGToken
                ? 'bg-gradient-to-r from-fuchsia-500 to-blue-500'
                : 'bg-gray-200'
            }`}></div>
          </label>
        </div>
        {!hasIGToken && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
            <Instagram size={16} className="text-fuchsia-500" />
            <span>Para activar la validación automática, primero debes vincular tu cuenta de Instagram.</span>
          </div>
        )}
      </div>
      <span className="text-white text-2xl font-bold mb-4">hola provider</span>
      {/* URL para compartir */}
      <div className="w-full max-w-md bg-[#23243a] rounded-xl p-4 mb-6 flex flex-col gap-2 border border-white/10">
        <label className="text-white/80 text-sm font-semibold mb-1">Tu URL para compartir</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={provider?.slug ? `https://taun.me/p/${provider.slug}` : ''}
            className="flex-1 bg-[#181824] text-white px-3 py-2 rounded-lg border border-white/10 text-sm font-mono outline-none"
          />
          <button
            onClick={() => {
              if (provider?.slug) {
                navigator.clipboard.writeText(`https://taun.me/p/${provider.slug}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }}
            className="p-2 rounded-lg bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-blue-500 text-white hover:scale-105 transition-transform"
            title="Copiar URL"
          >
            <Copy size={18} />
          </button>
        </div>
        {copied && (
          <div className="text-green-400 text-xs mt-1 animate-pulse">URL copiada a tu portapapeles, pégala donde quieras promocionarla</div>
        )}
      </div>
      {/* Lista de stories pending */}
      <div className="w-full max-w-md mt-6">
        <h2 className="text-white text-lg font-semibold mb-2">Stories pendientes</h2>
        {loadingStories ? (
          <div className="flex justify-center py-8"><LoaderBolas /></div>
        ) : (
          <ProviderStoryCardList stories={stories} />
        )}
      </div>
      {/* Botón cerrar sesión separado */}
      <div style={{ height: '100px' }} />
      <button
        onClick={() => {
          if (demo) {
            localStorage.removeItem('demoSession');
            window.location.href = '/providers/access';
          } else {
            signOut({ callbackUrl: "/" });
          }
        }}
        className="px-6 py-2 rounded-full border border-white/30 text-white/90 bg-transparent hover:bg-white/10 transition text-base font-medium mt-0"
      >
        Cerrar sesión
      </button>
    </div>
  );
} 