"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoaderBolas from "@/components/ui/LoaderBolas";
import ProviderStoryCardList from "@/components/ui/ProviderStoryCardList";
import { useT } from '@/lib/useT';

interface Story {
  createdAt: string | Date;
  status: "pending" | "validated" | "redeemed" | "rejected";
  _id: string;
  id?: string;
  campaignId?: string;
}

export default function StoriesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [campaignNames, setCampaignNames] = useState<Record<string, string>>({});
  const t = useT();

  useEffect(() => {
    if (status === "loading") return;
    if (typeof window !== "undefined") {
      const demoSession = localStorage.getItem("demoSession");
      if (demoSession) {
        const demoUser = JSON.parse(demoSession);
        if (demoUser?.provider?.slug) {
          setProviderId(demoUser.provider.slug);
          fetch(`/api/story-submission?providerId=${demoUser.provider.slug}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (!data || data.error) {
                setError("No se encontraron stories para este usuario demo.");
              } else {
                setStories(data);
              }
              setLoading(false);
            })
            .catch(() => {
              setError("Error al cargar las stories del provider demo.");
              setLoading(false);
            });
          return;
        }
      }
    }
    if (status !== "authenticated" || !session?.user?.email) {
      setError("No hay sesión activa o email de usuario.");
      setLoading(false);
      return;
    }
    fetch(`/api/provider/by-email?email=${encodeURIComponent(session.user.email)}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data || !data.slug) {
          setError("No se encontró el provider para este usuario.");
          setLoading(false);
        } else {
          setProviderId(data.slug);
          fetch(`/api/story-submission?providerId=${data.slug}`)
            .then(res => res.ok ? res.json() : null)
            .then(storiesData => {
              if (!storiesData || storiesData.error) {
                setError("No se encontraron stories para este usuario.");
              } else {
                setStories(storiesData);
              }
              setLoading(false);
            })
            .catch(() => {
              setError("Error al cargar las stories del provider.");
              setLoading(false);
            });
        }
      })
      .catch(() => {
        setError("Error al cargar los datos del provider.");
        setLoading(false);
      });
  }, [status, session]);

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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e]"><LoaderBolas /></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] text-white text-lg">{error}</div>;
  }

  // Ordenar de más nueva a más vieja
  const sortedStories = [...stories].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  // Adaptar stories para ProviderStoryCardList
  const cardStories = sortedStories.map(s => ({ ...s, id: s._id }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333] flex flex-col items-center py-12 px-4 sm:px-8 transition-colors duration-500 relative overflow-hidden">
      <div className="w-full max-w-lg relative z-10">
        {/* Cabecera */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.push('/providers/dashboard')} className="p-2 rounded-full bg-violet-900/20 hover:bg-violet-900/40 text-violet-300">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <h1 className="text-2xl font-bold text-white">{t('dashboard.stories_title') || 'Stories'}</h1>
        </div>
        <ProviderStoryCardList stories={cardStories} campaignNames={campaignNames} />
      </div>
    </div>
  );
} 