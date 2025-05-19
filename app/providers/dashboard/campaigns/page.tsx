"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoaderBolas from "@/components/ui/LoaderBolas";
import Link from "next/link";
import { useT } from '@/lib/useT';
import EmptyState from '@/components/ui/EmptyState';
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CustomAlertDialog } from "@/components/ui/alert-dialog";
import WithLoader from '@/components/ui/WithLoader';
import useProviderData from '@/hooks/useProviderData';
import { Plus } from "lucide-react";

interface Campaign {
  _id: string;
  nombre: string;
  descripcion?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
}

function formatDate(date: string | Date) {
  if (!date) return '';
  const d = new Date(date);
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0') + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
}

export default function CampaignsListPage() {
  const { provider, loading } = useProviderData();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [error, setError] = useState<string | null>(null);
  const t = useT();
  const [showActiveConflictDialog, setShowActiveConflictDialog] = useState(false);
  const [pendingCampaignId, setPendingCampaignId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasOtherActive, setHasOtherActive] = useState(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  useEffect(() => {
    if (loading || !provider?.slug) return;
    setError(null);
    setLoadingCampaigns(true);
    fetch(`/api/provider/${provider.slug}/campaigns`)
      .then(res => res.ok ? res.json() : [])
      .then(camps => setCampaigns(camps))
      .catch(() => setCampaigns([]))
      .finally(() => setLoadingCampaigns(false));
  }, [loading, provider?.slug]);

  // Filtrar campañas eliminadas (softdelete)
  const filteredCampaigns = campaigns.filter(c => !c.deleted);
  // Ordenar campañas por updatedAt descendente
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => new Date(b.updatedAt || b.createdAt || '').getTime() - new Date(a.updatedAt || a.createdAt || '').getTime());
  const activeCampaign = sortedCampaigns.find(c => c.isActive);
  const inactiveCampaigns = sortedCampaigns.filter(c => !c.isActive);

  // Comprobar si hay otra campaña activa (distinta de la seleccionada)
  const checkOtherActive = async (campaignId: string) => {
    if (!provider?.slug) return false;
    const res = await fetch(`/api/provider/${provider.slug}/campaigns`);
    if (!res.ok) return false;
    const allCamps = await res.json();
    return allCamps.some((c: any) => c.isActive && String(c._id) !== String(campaignId));
  };

  // Actualizar estado activo de campaña
  const updateCampaignActiveState = async (campaignId: string, checked: boolean) => {
    setSaving(true);
    if (!provider?.slug) return;
    const camp = campaigns.find(c => c._id === campaignId);
    if (!camp) return;
    const res = await fetch(`/api/provider/${provider.slug}/campaign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId: camp._id,
        isActive: checked,
        nombre: camp.nombre,
        descripcion: camp.descripcion,
      }),
    });
    setSaving(false);
    if (res.ok) {
      // Refrescar campañas
      const campsRes = await fetch(`/api/provider/${provider.slug}/campaigns`);
      if (campsRes.ok) {
        const camps = await campsRes.json();
        setCampaigns(camps);
      }
    }
  };

  // Handler del switch
  const handleSwitch = async (campaignId: string, checked: boolean) => {
    if (checked) {
      const otherActive = await checkOtherActive(campaignId);
      if (otherActive) {
        setPendingCampaignId(campaignId);
        setShowActiveConflictDialog(true);
        return;
      }
    }
    await updateCampaignActiveState(campaignId, checked);
  };

  // Mostrar empty state solo cuando loading y loadingCampaigns son false y no hay campañas
  if (!loading && !loadingCampaigns && filteredCampaigns.length === 0) {
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
    <WithLoader loading={loading || loadingCampaigns} fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e]">
        <LoaderBolas />
      </div>
    }>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333] flex flex-col items-center py-12 px-4 sm:px-8 transition-colors duration-500 relative overflow-hidden">
        <div className="w-full max-w-lg relative z-10 flex flex-col">
          <div className="flex items-center gap-3 mb-8 justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/providers/dashboard')} className="p-2 rounded-full bg-violet-900/20 hover:bg-violet-900/40 text-violet-300 cursor-pointer">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <h1 className="text-2xl font-bold text-white">Campañas</h1>
            </div>
            <Button
              className="mt-0 p-0 w-12 h-12 rounded-full bg-blue-700 hover:bg-blue-800 text-white shadow-lg flex items-center justify-center text-2xl transition disabled:opacity-60"
              onClick={() => router.push('/providers/dashboard/campaign')}
              aria-label="Crear campaña"
              title="Crear campaña"
            >
              <Plus className="w-7 h-7" />
            </Button>
          </div>
          {activeCampaign && (
            <div className="mb-6">
              <div className="text-blue-400 font-semibold mb-4">Campaña activa</div>
              <Link
                href={`/providers/dashboard/campaign?campaignId=${activeCampaign._id}`}
                className="block p-5 rounded-xl border border-blue-700"
                style={{ background: '#0a06184d', color: '#c7d2fe' }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{activeCampaign.nombre}</span>
                  <span className="ml-2 px-3 py-1 rounded-full bg-blue-700 text-white text-xs font-semibold">Activa</span>
                </div>
                {activeCampaign.descripcion && <div className="text-sm mt-1 text-white/60">{activeCampaign.descripcion}</div>}
                <div className="text-xs mt-2 text-white/30">{formatDate(activeCampaign.updatedAt || activeCampaign.createdAt || '')}</div>
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
                      <span
                        onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                        onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
                        onTouchStart={e => { e.preventDefault(); e.stopPropagation(); }}
                      >
                        <Switch
                          checked={!!camp.isActive}
                          onCheckedChange={checked => handleSwitch(camp._id, checked)}
                          disabled={saving}
                        />
                      </span>
                    </div>
                    {camp.descripcion && <div className="text-sm mt-1 text-white/60">{camp.descripcion}</div>}
                    <div className="text-xs mt-2 text-white/30">{formatDate(camp.updatedAt || camp.createdAt || '')}</div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
        <CustomAlertDialog
          open={showActiveConflictDialog}
          onOpenChange={setShowActiveConflictDialog}
          title="Ya hay una campaña activa"
          description={"Solo puede haber una campaña activa a la vez. Si continúas, la otra campaña se desactivará y esta se activará."}
          actions={[
            {
              label: 'Continuar',
              color: 'primary',
              disabled: saving,
              onClick: async () => {
                setShowActiveConflictDialog(false);
                if (pendingCampaignId) {
                  await updateCampaignActiveState(pendingCampaignId, true);
                  setPendingCampaignId(null);
                }
              }
            },
            {
              label: 'Cancelar',
              color: 'cancel',
              disabled: saving,
              onClick: () => {
                setPendingCampaignId(null);
                setShowActiveConflictDialog(false);
              }
            }
          ]}
        />
      </div>
    </WithLoader>
  );
} 