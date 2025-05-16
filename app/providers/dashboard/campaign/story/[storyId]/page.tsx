"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Clock, Tag, Check, X, MoreVertical, MoreHorizontal, Instagram, Calendar, Megaphone, Maximize2, CheckCircle } from "lucide-react";
import Image from "next/image";
import { FC } from "react";
import type { JSX } from "react";
import { useT } from '@/lib/useT';
import LoaderBolas from "@/components/ui/LoaderBolas";
import ProviderHeader from "@/components/ui/ProviderHeader";
import HeroGradient from "@/components/ui/HeroGradient";
import { CustomAlertDialog } from "@/components/ui/alert-dialog";
import { useTemplates } from '@/hooks/useTemplates';

// Tipos
export type StoryStatus = "pending" | "validated" | "redeemed" | "rejected";

const STATUS_INFO: Record<StoryStatus, { label: string; color: string; icon: JSX.Element }> = {
  pending: { label: "providerStories.status.pending", color: "bg-purple-600", icon: <Clock className="w-4 h-4 mr-1" /> },
  validated: { label: "providerStories.status.validated", color: "bg-blue-600", icon: <Tag className="w-4 h-4 mr-1" /> },
  redeemed: { label: "providerStories.status.redeemed", color: "bg-green-600", icon: <Check className="w-4 h-4 mr-1" /> },
  rejected: { label: "providerStories.status.rejected", color: "bg-red-800", icon: <X className="w-4 h-4 mr-1" /> },
};

// Colores de gradiente según estado
const GRADIENTS: Record<StoryStatus, [string, string]> = {
  pending: ["#a259ff", "#2d0036"], // violeta más oscuro
  validated: ["#2563eb", "#0a1a3c"], // azul intenso a azul muy oscuro
  redeemed: ["#22c55e", "#0a3c1a"], // verde intenso a verde muy oscuro
  rejected: ["#e11d48", "#3b0826"], // rojo saturado a burdeos oscuro
};

export default function StoryDetailPage() {
  const t = useT();
  const router = useRouter();
  const params = useParams();
  const storyId = typeof params.storyId === 'string' ? params.storyId : Array.isArray(params.storyId) ? params.storyId[0] : '';

  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<any>(null);
  const { templates, loading: loadingTemplates } = useTemplates();

  // Fetch de datos
  useEffect(() => {
    if (!storyId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/story-submission/${storyId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(setStory)
      .catch(() => setError("Error al cargar la story"))
      .finally(() => setLoading(false));
  }, [storyId]);

  useEffect(() => {
    if (story?.providerId) {
      fetch(`/api/provider/${story.providerId}/campaign`).then(res => res.ok ? res.json() : null).then(camp => {
        setCampaign(camp && !camp.error ? camp : null);
      });
    }
  }, [story?.providerId]);

  // Lógica de cambio de estado
  const nextStatus: StoryStatus = story?.status === "pending"
    ? "validated"
    : story?.status === "validated"
    ? "redeemed"
    : story?.status;

  const updateStatus = async (status: StoryStatus) => {
    if (!storyId) return;
    setUpdating(true);
    setError(null);
    const res = await fetch(`/api/story-submission/${storyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      setError(t('providerStories.errorUpdate'));
      setUpdating(false);
      return;
    }
    setStory((prev: any) => ({ ...prev, status }));
    setUpdating(false);
    setSheetOpen(false);
  };

  // Usar el templateId de la story si existe, si no el de la campaña
  const templateId = story?.templateId || campaign?.templateId;
  const template = templates.find((t: any) => t._id === templateId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e]">
        <LoaderBolas text="Cargando datos de la story..." />
      </div>
    );
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] text-white text-lg">{error}</div>;
  }
  if (!story) {
    return <div className="text-center py-16 text-zinc-400">{t('providerStories.notFound')}</div>;
  }

  // Formato de fecha/hora
  const date = new Date(story.createdAt);
  const dateStr = date.toLocaleDateString("es-ES");
  const hourStr = date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  // Colores de gradiente según estado
  const [colorFrom, colorTo] = GRADIENTS[story.status as StoryStatus] || GRADIENTS.pending;

  // Definir campaignName aquí
  const campaignName = story.campaignName || story.campaignNombre || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333] flex flex-col items-center py-12 px-4 sm:px-8 transition-colors duration-500 relative overflow-hidden">
      {/* Hero gradient de fondo en el top */}
      <HeroGradient colorFrom={colorFrom} colorTo={colorTo} height={400} />
      <div className="w-full max-w-lg relative z-10">
        {/* Cabecera nueva */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const origin = sessionStorage.getItem('storyBackOrigin');
                  sessionStorage.removeItem('storyBackOrigin');
                  if (origin && origin.startsWith('campaign:')) {
                    const campaignId = origin.split(':')[1];
                    router.push(`/providers/dashboard/campaign?campaignId=${campaignId}&tab=stories`);
                    return;
                  }
                  if (origin === 'stories') {
                    router.push('/providers/dashboard/stories');
                    return;
                  }
                }
                router.push('/providers/dashboard');
              }}
              className="p-2 rounded-full bg-violet-900/20 hover:bg-violet-900/40 text-violet-300"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <h1 className="text-2xl font-bold text-white">Story</h1>
            <Badge className={`ml-3 text-white ${STATUS_INFO[story.status as StoryStatus].color} px-3 py-1 text-base font-semibold`}>
              {STATUS_INFO[story.status as StoryStatus].icon}{t(STATUS_INFO[story.status as StoryStatus].label)}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" aria-label={t('providerStories.forceState')} onClick={() => setSheetOpen(true)} className="cursor-pointer">
            <MoreHorizontal className="w-7 h-7 text-white/80" />
          </Button>
        </div>
        {/* Sheet lateral para forzar estado, look and feel mejorado */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="right" className="w-80 pt-8 px-6" style={{ background: '#18122b', border: 'none' }}>
            <h2 className="text-lg font-semibold mb-6 text-white">{t('providerStories.forceState')}</h2>
            <div className="flex flex-col gap-4 mb-8">
              {Object.entries(STATUS_INFO).map(([key, info]) => {
                const typedKey = key as StoryStatus;
                const isActive = story.status === typedKey;
                return (
                  <Button
                    key={typedKey}
                    variant={isActive ? "default" : "outline"}
                    className={`justify-start flex items-center gap-2 px-5 py-4 rounded-xl text-base font-semibold transition-all ${info.color} ${isActive ? 'text-white shadow-lg' : 'bg-zinc-900 text-white/80 border-zinc-700 hover:opacity-90'}`}
                    style={{ borderWidth: isActive ? 2 : 1, borderColor: isActive ? '#fff' : undefined }}
                    onClick={() => updateStatus(typedKey)}
                    disabled={updating}
                  >
                    {info.icon}
                    {t(info.label)}
                  </Button>
                );
              })}
            </div>
            {/* Botón contenido en el cuerpo del menú, con padding */}
            <div className="pt-2 pb-4 px-2">
              <Button
                variant="outline"
                style={{ border: '2px solid #e11d48', color: '#e11d48', background: 'transparent', fontWeight: 600, fontSize: '1.1rem', padding: '1rem 0', width: '100%', borderRadius: '0.75rem', margin: 0 }}
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleting}
              >
                Borrar story
              </Button>
            </div>
            <CustomAlertDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
              title="¿Estás seguro?"
              description={<>
                Esta acción no se puede deshacer y perderás la información de la story subida por el usuario.
                {deleteError && <div className="text-red-500 text-sm mt-2">{deleteError}</div>}
              </>}
              actions={[
                {
                  label: 'Borrar story',
                  color: 'danger',
                  disabled: deleting,
                  onClick: async () => {
                    setDeleting(true);
                    setDeleteError(null);
                    try {
                      const res = await fetch(`/api/story-submission/${storyId}`, { method: 'DELETE' });
                      if (!res.ok) throw new Error(await res.text());
                      setShowDeleteDialog(false);
                      setSheetOpen(false);
                      router.push('/providers/dashboard');
                    } catch (e) {
                      setDeleteError('Error al borrar la story');
                    } finally {
                      setDeleting(false);
                    }
                  }
                },
                {
                  label: 'Cancelar',
                  color: 'cancel',
                  disabled: deleting,
                  onClick: () => setShowDeleteDialog(false)
                }
              ]}
            />
          </SheetContent>
        </Sheet>
        {/* Preview con overlay, siempre 9/16, alterna entre 30% y 75% al hacer click */}
        <div className="flex justify-center items-center mx-auto mt-8 mb-6">
          <div
            className={`relative aspect-[9/16] overflow-hidden rounded-[20px] shadow-lg transition-all duration-300 ${expanded ? 'w-[75%] md:w-[75%] lg:w-[75%]' : 'w-[30%] md:w-[30%] lg:w-[30%]'}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setExpanded(e => !e)}
          >
            <Image src={story.imageUrl} alt="Story" fill className="object-cover rounded-[20px] transition-all duration-300" />
            {/* Overlay por encima de la imagen */}
            {template && (
              <Image src={template.overlayUrl} alt="Overlay" fill style={{objectFit: 'cover', zIndex: 1}} />
            )}
            {!expanded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <Maximize2 size={64} className="text-white opacity-30" />
              </div>
            )}
          </div>
        </div>
        {/* Info de la story, estilo visual igual que story en dashboard */}
        <div className="bg-gradient-to-br from-[#18122b] to-[#0a0618] rounded-xl p-6 mb-6 flex flex-col gap-2 border border-violet-950/60 shadow-lg">
          <div className="flex items-center gap-3 text-zinc-200 text-base">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold">{story.igUser || t('providerStories.noUserInfo')}</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-200 text-base">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span>{dateStr} · {hourStr}</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-200 text-base">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <span>{story.campaignName || story.campaignNombre || t('providerStories.noCampaign')}</span>
          </div>
        </div>
        {/* Acciones sticky/flotantes */}
        <div className="fixed bottom-0 left-0 w-full flex justify-center z-50 pointer-events-none">
          <div className="max-w-2xl w-full pointer-events-auto">
            {story.status !== "redeemed" && story.status !== "rejected" && (
              <Button
                className={`w-full h-[70px] text-2xl font-bold rounded-none flex items-center justify-center gap-2 ${STATUS_INFO[nextStatus].color} text-white`}
                style={{ margin: 0, padding: 0, borderRadius: 0 }}
                onClick={() => updateStatus(nextStatus)}
                disabled={updating}
              >
                {nextStatus === "validated" || nextStatus === "redeemed" ? (
                  <CheckCircle className="w-12 h-12" />
                ) : null}
                {nextStatus === "validated" ? t('providerStories.validate') : nextStatus === "redeemed" ? t('providerStories.redeem') : ""}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}