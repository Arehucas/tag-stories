"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoaderBolas from "@/components/ui/LoaderBolas";
import Link from "next/link";
import { useT } from '@/lib/useT';
import EmptyState from '@/components/ui/EmptyState';

interface Campaign {
  _id: string;
  nombre: string;
  descripcion?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
}

export default function CampaignsListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const t = useT();

  useEffect(() => {
    if (status === "loading") return;
    async function fetchProviderAndCampaigns() {
      let currentProvider = null;
      if (typeof window !== "undefined") {
        const demoSession = localStorage.getItem("demoSession");
        if (demoSession) {
          const demoUser = JSON.parse(demoSession);
          if (demoUser && demoUser.provider && demoUser.provider.email) {
            const res = await fetch(`/api/provider/by-email?email=${encodeURIComponent(demoUser.provider.email)}`);
            if (!res.ok) {
              localStorage.removeItem("demoSession");
              router.replace("/providers/access");
              return;
            }
            currentProvider = await res.json();
            setProvider(currentProvider);
            localStorage.setItem("demoSession", JSON.stringify({ provider: currentProvider }));
          }
        }
      }
      if (!currentProvider && status === "authenticated" && session?.user?.email) {
        const res = await fetch(`/api/provider/by-email?email=${encodeURIComponent(session.user.email)}`);
        if (!res.ok) {
          if (typeof window !== "undefined") localStorage.removeItem("demoSession");
          router.replace("/providers/access");
          return;
        }
        currentProvider = await res.json();
        setProvider(currentProvider);
        if (typeof window !== "undefined") localStorage.setItem("demoSession", JSON.stringify({ provider: currentProvider }));
      }
      if (!currentProvider) {
        setProvider(null);
        setCampaigns([]);
        setLoading(false);
        return;
      }
      // Cargar campañas
      const res = await fetch(`/api/provider/${currentProvider.slug}/campaigns`);
      if (!res.ok) {
        setCampaigns([]);
        setLoading(false);
        return;
      }
      const camps = await res.json();
      setCampaigns(camps);
      setLoading(false);
    }
    fetchProviderAndCampaigns();
  }, [status, session]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e]"><LoaderBolas /></div>;
  }

  if (!provider) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] text-white text-lg">{t('campaign.error_load')}</div>;
  }

  // Filtrar campañas eliminadas (softdelete)
  const filteredCampaigns = campaigns.filter(c => !c.deleted);
  // Ordenar campañas por updatedAt descendente
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => new Date(b.updatedAt || b.createdAt || '').getTime() - new Date(a.updatedAt || a.createdAt || '').getTime());
  const activeCampaign = sortedCampaigns.find(c => c.isActive);
  const inactiveCampaigns = sortedCampaigns.filter(c => !c.isActive);

  // Mostrar empty state si no hay campañas visibles
  if (filteredCampaigns.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333] flex flex-col items-center py-12 px-4 sm:px-8 transition-colors duration-500 relative overflow-hidden">
        <div className="w-full max-w-lg relative z-10 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => router.push('/providers/dashboard')} className="p-2 rounded-full bg-violet-900/20 hover:bg-violet-900/40 text-violet-300 cursor-pointer">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <h1 className="text-2xl font-bold text-white">Campañas</h1>
          </div>
          <EmptyState
            image="/assets/campaigns-empty-state.png"
            title="Tu primera campaña"
            description="Sin campaña activa, no podrás ver ni validar las stories de tus usuarios, aunque tu link seguirá funcionando con normalidad."
            ctaText="Crear una campaña"
            onCtaClick={() => router.push('/providers/dashboard/campaign')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333] flex flex-col items-center py-12 px-4 sm:px-8 transition-colors duration-500 relative overflow-hidden">
      <div className="w-full max-w-lg relative z-10 flex flex-col">
        <div className="flex items-center gap-3 mb-8 justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/providers/dashboard')} className="p-2 rounded-full bg-violet-900/20 hover:bg-violet-900/40 text-violet-300 cursor-pointer">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <h1 className="text-2xl font-bold text-white">Campañas</h1>
          </div>
          <button
            className="px-5 py-2 rounded-full border border-blue-700 text-blue-100 bg-gradient-to-r from-blue-900 to-blue-800 hover:bg-blue-800/80 transition text-base font-medium shadow-lg"
            onClick={() => router.push('/providers/dashboard/campaign')}
          >
            Crear campaña
          </button>
        </div>
        {activeCampaign && (
          <div className="mb-6">
            <div className="text-blue-400 font-semibold mb-4">Campaña activa</div>
            <Link
              href={`/providers/dashboard/campaign?campaignId=${activeCampaign._id}`}
              className="block p-5 rounded-xl border border-blue-700 bg-blue-950/40 text-blue-200 shadow-lg hover:bg-violet-900/30 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">{activeCampaign.nombre}</span>
                <span className="ml-2 px-3 py-1 rounded-full bg-blue-700 text-white text-xs font-semibold">Activa</span>
              </div>
              {activeCampaign.descripcion && <div className="text-sm mt-1 text-white/60">{activeCampaign.descripcion}</div>}
              <div className="text-xs mt-2 text-white/30">{new Date(activeCampaign.updatedAt || activeCampaign.createdAt || '').toLocaleString('es-ES')}</div>
            </Link>
          </div>
        )}
        {inactiveCampaigns.length > 0 && (
          <>
            <div className="mb-4 text-white/80 font-semibold">Otras campañas</div>
            <div className="flex flex-col gap-4">
              {inactiveCampaigns.map((camp) => (
                <Link
                  key={camp._id}
                  href={`/providers/dashboard/campaign?campaignId=${camp._id}`}
                  className="block p-5 rounded-xl border border-violet-950 bg-[#18122b] text-white/80 shadow-lg hover:bg-violet-900/30 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">{camp.nombre}</span>
                  </div>
                  {camp.descripcion && <div className="text-sm mt-1 text-white/60">{camp.descripcion}</div>}
                  <div className="text-xs mt-2 text-white/30">{new Date(camp.updatedAt || camp.createdAt || '').toLocaleString('es-ES')}</div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 