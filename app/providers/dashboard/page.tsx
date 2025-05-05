"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OnboardingProvider from "./onboarding";
import LoaderBolas from "@/components/ui/LoaderBolas";
import { Copy } from 'lucide-react';
import '@/lib/i18n';

interface Provider {
  nombre?: string;
  direccion?: string;
  ciudad?: string;
  instagram_handle?: string;
  logo_url?: string;
  email?: string;
  slug?: string;
}

export default function ProviderDashboard() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [demo, setDemo] = useState<{ user: { email: string; name: string } } | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(true);

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
      <button
        onClick={() => {
          if (demo) {
            localStorage.removeItem('demoSession');
            window.location.href = '/providers/access';
          } else {
            signOut({ callbackUrl: "/" });
          }
        }}
        className="text-white/70 hover:text-white underline text-base font-medium transition-colors"
      >
        Cerrar sesión
      </button>
    </div>
  );
} 