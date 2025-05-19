"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoaderBolas from "@/components/ui/LoaderBolas";
import ProviderStoryCardList from "@/components/ui/ProviderStoryCardList";
import { useT } from '@/lib/useT';
import EmptyState from '@/components/ui/EmptyState';
import { Copy } from "lucide-react";
import useProviderData from '@/hooks/useProviderData';
import WithLoader from '@/components/ui/WithLoader';
import LoaderTable from '@/components/ui/LoaderTable';

interface Story {
  createdAt: string | Date;
  status: "pending" | "validated" | "redeemed" | "rejected";
  _id: string;
  id?: string;
  campaignId?: string;
}

const secondaryBlue = "#3a86ff";

const copiarAlPortapapeles = async (texto: string) => {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {}
  }
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

export default function StoriesPage() {
  const { provider, loading } = useProviderData();
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [error, setError] = useState<string | null>(null);
  const t = useT();
  const [copied, setCopied] = useState(false);
  const [campaignNames, setCampaignNames] = useState<Record<string, string>>({});
  const [shareUrl, setShareUrl] = useState('');
  const [loadingStories, setLoadingStories] = useState(false);

  useEffect(() => {
    if (provider?.slug && typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/p/${provider.slug}`);
    }
  }, [provider?.slug]);

  useEffect(() => {
    if (loading || !provider?.slug) return;
    setError(null);
    setLoadingStories(true);
    fetch(`/api/story-submission?providerId=${provider.slug}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setStories(Array.isArray(data) ? data : []))
      .catch(() => setStories([]))
      .finally(() => setLoadingStories(false));
  }, [loading, provider?.slug]);

  useEffect(() => {
    // Obtener nombres de campañas
    if (stories.length > 0) {
      const ids = Array.from(new Set(stories.map(s => s.campaignId?.toString()).filter(Boolean)));
      if (ids.length > 0) {
        fetch(`/api/campaign-names?ids=${ids.join(",")}`)
          .then(res => res.ok ? res.json() : {})
          .then(data => setCampaignNames(data));
      }
    }
  }, [stories]);

  // Mostrar empty state solo cuando loading y loadingStories son false y no hay stories
  if (!loading && !loadingStories && stories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333] flex flex-col items-center py-12 px-4 sm:px-8 transition-colors duration-500 relative overflow-hidden">
        <div className="w-full max-w-lg relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-8 w-full">
            <button onClick={() => router.push('/providers/dashboard')} className="p-2 rounded-full bg-violet-900/20 hover:bg-violet-900/40 text-violet-300 cursor-pointer">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <h1 className="text-2xl font-bold text-white">Stories</h1>
          </div>
          <EmptyState
            image="/assets/stories-empty-state.png"
            title="¡Aún no tienes stories!"
            description="Comparte tu link o genera un QR con él para que tus usuario suban stories y sean los verdaderos embajadores de tu marca."
          />
          {/* Caja de compartir link */}
          <div className="w-full bg-[#18122b] rounded-xl p-5 flex flex-col gap-2 border border-violet-950/60">
            <div className="flex items-center justify-between mb-1 w-full">
              <label className="text-white/80 text-sm font-semibold truncate">Tu URL para compartir</label>
              {copied && (
                <span className="text-xs font-semibold text-blue-400 animate-fade-in-out flex-shrink-0 ml-2 whitespace-nowrap">URL copiada!</span>
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
                  if (shareUrl) {
                    await navigator.clipboard.writeText(shareUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
                className="p-2 rounded-lg text-white hover:scale-105 transition-transform bg-blue-700 hover:bg-blue-800"
                title="Copiar URL"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <WithLoader loading={loading} fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e]">
        <LoaderBolas />
      </div>
    }>
      <WithLoader loading={loadingStories} fallback={
        <div className="flex justify-center py-12">
          <LoaderTable />
        </div>
      }>
        <div className="min-h-screen bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333] flex flex-col items-center py-12 px-4 sm:px-8 transition-colors duration-500 relative overflow-hidden">
          <div className="w-full max-w-lg relative z-10">
            {/* Cabecera */}
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => router.push('/providers/dashboard')} className="p-2 rounded-full bg-violet-900/20 hover:bg-violet-900/40 text-violet-300 cursor-pointer">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <h1 className="text-2xl font-bold text-white">{t('dashboard.stories_title') || 'Stories'}</h1>
            </div>
            <ProviderStoryCardList stories={stories.map(s => ({ ...s, id: s._id }))} campaignNames={campaignNames} />
          </div>
        </div>
      </WithLoader>
    </WithLoader>
  );
} 