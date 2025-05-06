"use client";
import Steps from '@/components/ui/Steps';
import { useImageStore } from '@/hooks/useImageStore';
import Image from 'next/image';
import { useProviderStore } from '@/hooks/useProviderStore';
import ProviderHeader from '@/components/ui/ProviderHeader';
import { useRouter } from 'next/navigation';

export default function PreviewPage() {
  const provider = useProviderStore(state => state.provider);
  const steps = [
    { title: 'Sube tu foto', description: 'Saca o elige una foto' },
    { title: 'Ajusta tu imagen', description: 'Recorta y ajusta tu foto.' },
    { title: 'Comparte', description: <><div>Publica tu story en Instagram.</div>{provider?.instagram_handle && <div>Etiqueta a @{provider.instagram_handle}</div>}</> },
  ];

  const croppedImage = useImageStore(state => state.croppedImage);
  const router = useRouter();
  const slug = typeof window !== 'undefined' ? window.location.pathname.split('/')[2] : '';
  const colorCode = useImageStore(state => state.colorCode);

  // Redirigir si no hay imagen cropeada
  if (typeof window !== 'undefined' && !croppedImage) {
    router.replace(`/p/${slug}`);
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] flex flex-col items-center">
      <ProviderHeader logoUrl={provider?.logo_url} instagramHandle={provider?.instagram_handle} />
      <div className="flex flex-col items-center w-full max-w-xs gap-8 mx-auto">
        <div className="w-full flex flex-col items-center mt-8">
          <div className="flex flex-col items-center w-full" style={{ gap: '0.5rem' }}>
            <div className="relative w-full max-w-[240px] aspect-[9/16] rounded-xl overflow-hidden flex-shrink-0 mx-auto" style={{ height: '426.67px', width: '240px' }}>
              {croppedImage ? (
                <Image src={croppedImage} alt="Preview" fill />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40 text-2xl">No hay imagen</div>
              )}
            </div>
            <button
              className="w-full py-2 rounded-xl font-semibold text-lg bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-blue-500 text-white shadow-lg mt-4 mb-2"
              onClick={async () => {
                if (!croppedImage) return;
                // Crear story en backend
                if (slug && colorCode && colorCode.length === 4) {
                  await fetch('/api/story-submission', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ providerId: slug, colorCode }),
                  });
                }
                // Convertir dataURL a Blob
                function dataURLtoBlob(dataurl: string) {
                  const arr = dataurl.split(',');
                  const match = arr[0].match(/:(.*?);/);
                  const mime = match ? match[1] : 'image/png';
                  const bstr = atob(arr[1]);
                  const n = bstr.length;
                  const u8arr = new Uint8Array(n);
                  for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
                  return new Blob([u8arr], { type: mime });
                }
                const blob = dataURLtoBlob(croppedImage);
                const fileName = provider && provider.instagram_handle ? `story-${provider.instagram_handle}.png` : 'story-local.png';
                const file = new File([blob], fileName, { type: blob.type });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                  try {
                    await navigator.share({
                      files: [file]
                    });
                    return;
                  } catch {
                    // Si el usuario cancela o falla, sigue con la descarga
                  }
                }
                // Fallback: descarga automática
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => {
                  URL.revokeObjectURL(url);
                  alert('Imagen descargada! Compártela en Stories de IG');
                }, 200);
              }}
            >
              Compartir en Instagram
            </button>
          </div>
        </div>
        <Steps steps={steps} current={2} />
      </div>
      <div className="flex justify-center w-full mt-0 mb-[50px]">
        <button
          className="w-full max-w-xs mt-5 border border-white/40 text-white/80 rounded-xl px-6 py-2 hover:bg-white/10 transition"
          onClick={() => router.push(`/p/${slug}`)}
        >
          Subir otra foto
        </button>
      </div>
    </div>
  );
} 