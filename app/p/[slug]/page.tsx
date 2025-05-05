"use client";
import { useState, useEffect } from "react";
import LoaderBolas from "@/components/ui/LoaderBolas";
import Steps from '@/components/ui/Steps';
import { useRouter } from 'next/navigation';
import { useImageStore } from '@/hooks/useImageStore';
import { useProviderStore } from '@/hooks/useProviderStore';
import { useT } from '@/lib/useT';

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

export default function PLanding(props: Props) {
  const [slug, setSlug] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = useT();
  const steps = [
    { title: t('upload_photo'), description: t('choose_or_take') },
    { title: t('adjust_image'), description: t('crop_and_adjust') },
    { title: t('share'), description: <><div>{t('publish_story')}</div><div>{t('tag_at')}</div></> },
  ];
  const setOriginalImage = useImageStore(state => state.setOriginalImage);
  const clearImage = useImageStore(state => state.clear);
  const clearProvider = useProviderStore(state => state.clear);

  // Carga slug y provider
  useEffect(() => {
    clearImage();
    clearProvider();
    props.params.then(({ slug }) => {
      setSlug(slug);
      fetch(`/api/provider/${slug}`)
        .then(async (res) => {
          if (!res.ok) throw new Error(t('not_found'));
          return res.json();
        })
        .then((prov) => {
          setProvider(prov);
          useProviderStore.getState().setProvider(prov);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    });
  }, [props.params]);

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
              <img src={provider?.logo_url || "/default-logo.png"} alt={provider?.nombre || "Logo"} width={80} height={80} className="object-cover w-full h-full" />
            </div>
          </div>
          <div className="text-white/80 text-base font-medium">@{provider?.instagram_handle}</div>
        </div>
        <div className="flex flex-col items-center w-full" style={{ gap: '0.5rem' }}>
          <h1 className="text-2xl font-bold text-white text-center drop-shadow-lg">{t('best_photo')}</h1>
        </div>
        <p className="text-base text-white/80 text-center mb-2">
          {t('tag_and_win').replace('{{handle}}', provider?.instagram_handle || '')}
        </p>
        <label className="w-full py-3 rounded-xl font-semibold text-lg bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-blue-500 text-white shadow-lg hover:scale-105 transition-transform text-center cursor-pointer">
          Selecciona una imagen
          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
            clearImage();
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
              const imgUrl = ev.target?.result as string;
              setOriginalImage(imgUrl);
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