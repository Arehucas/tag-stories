"use client";
import { useState, useEffect } from "react";
import LoaderBolas from "@/components/ui/LoaderBolas";
import Steps from '@/components/ui/Steps';
import { useRouter } from 'next/navigation';
import { useImageStore } from '@/hooks/useImageStore';
import { useProviderStore } from '@/hooks/useProviderStore';
import { useT } from '@/lib/useT';
import Image from 'next/image';
import { set as idbSet, get as idbGet } from 'idb-keyval';

interface Props {
  params: Promise<{ slug: string }>;
}

interface Provider {
  nombre?: string;
  direccion?: string;
  ciudad?: string;
  instagram_handle?: string;
  logo_url?: string;
  email?: string;
}

interface Campaign {
  isActive?: boolean;
  // otros campos si es necesario
}

export default function PLanding({ params }: Props) {
  const [slug, setSlug] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = useT();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const steps = [
    { title: t('upload_photo'), description: t('choose_or_take') },
    { title: t('adjust_image'), description: t('crop_and_adjust') },
    { title: t('share'), description: <><div>{t('publish_story')}</div>{provider?.instagram_handle && <div>{t('tag_at').replace('{{handle}}', provider.instagram_handle)}</div>}</> },
  ];
  const setOriginalImage = useImageStore(state => state.setOriginalImage);
  const clearImage = useImageStore(state => state.clear);
  const clearProvider = useProviderStore(state => state.clear);

  // Carga slug y provider solo una vez
  useEffect(() => {
    // Limpiar info persistida de campaña y providerId para evitar inconsistencias
    localStorage.removeItem('taun_campaign_id');
    localStorage.removeItem('taun_provider_id');
    let isMounted = true;
    clearImage();
    clearProvider();
    params.then(({ slug }) => {
      if (!isMounted) return;
      setSlug(slug);
      fetch(`/api/provider/${slug}`)
        .then(async (res) => {
          if (!res.ok) throw new Error('No encontrado');
          return res.json();
        })
        .then((prov) => {
          setProvider(prov);
          useProviderStore.getState().setProvider(prov);
          localStorage.setItem('taun_provider', JSON.stringify(prov));
          // Buscar campaña activa
          fetch(`/api/provider/${slug}/campaign`).then(res => res.ok ? res.json() : null).then(camp => {
            setCampaign(camp && !camp.error ? camp : null);
          });
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    });
    return () => { isMounted = false; };
  }, [params, clearImage, clearProvider]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e]">
        <LoaderBolas />
      </div>
    );
  }
  if (error || !provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e]">
        <span className="text-red-400 text-lg text-center">{error || t('not_found')}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] px-2">
      <div className="flex flex-col items-center w-full max-w-xs gap-8 mx-auto pt-8">
        <div className="flex flex-col items-center w-full mt-0 mb-0">
          <div className="p-[2.5px] rounded-full bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-blue-500 animate-gradient-x">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
              {provider?.logo_url ? (
                <Image src={provider.logo_url} alt={provider?.nombre || "Logo"} width={80} height={80} className="object-cover w-full h-full" />
              ) : (
                <div style={{ width: 80, height: 80, background: '#2563eb', borderRadius: '50%' }} />
              )}
            </div>
          </div>
          <div className="text-white/80 text-base font-medium">@{provider?.instagram_handle}</div>
        </div>
        <div className="flex flex-col items-center w-full" style={{ gap: '0.5rem' }}>
          <h1 className="text-2xl font-bold text-white text-center drop-shadow-lg">{t('best_photo')}</h1>
        </div>
        <p className="text-base text-white/80 text-center mb-2">
          {t('tag_and_win_1')}
          <span className="font-bold text-white">{t('tag_and_win_handle').replace('{{handle}}', provider?.instagram_handle || '')}</span> {t('tag_and_win_2')}<br/>
          <span className="shine-text" style={{ fontSize: '1.25em' }}>
            {t('tag_and_win_reward')}
          </span>
        </p>
        {/* Mensaje sutil de campaña (debajo, encima del botón) */}
        {(!campaign || !campaign.isActive) && (
          <div className="w-full mb-2 px-3 py-2 rounded-lg bg-white/10 text-white/70 text-sm text-center">
            {t('public_stories.no_active_campaign').replace('{handle}', provider?.instagram_handle || '')}
          </div>
        )}
        <label className="w-full py-3 rounded-xl font-semibold text-lg bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-blue-500 text-white shadow-lg hover:scale-105 transition-transform text-center cursor-pointer">
          {t('public_stories.select_image')}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
            clearImage();
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (ev) => {
              const imgUrl = ev.target?.result as string;
              setOriginalImage(imgUrl);
              // Persistir provider en localStorage (puede quedarse, es pequeño)
              if (provider) {
                localStorage.setItem('taun_provider', JSON.stringify(provider));
              }
              await idbSet('taun_original_image', imgUrl);
              router.push(`/p/${slug}/crop`);
            };
            reader.readAsDataURL(file);
          }} />
        </label>
        <Steps steps={steps} current={0} />
      </div>
    </div>
  );
} 