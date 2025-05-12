"use client";
import { useState, useCallback, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import Steps from '@/components/ui/Steps';
import { useImageStore } from '@/hooks/useImageStore';
import { useProviderStore } from '@/hooks/useProviderStore';
import ProviderHeader from '@/components/ui/ProviderHeader';
import { useT } from '@/lib/useT';
import { get as idbGet } from 'idb-keyval';
import { set as idbSet } from 'idb-keyval';

export default function CropPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const originalImage = useImageStore(state => state.originalImage);
  const setOriginalImage = useImageStore(state => state.setOriginalImage);
  const setCroppedImage = useImageStore(state => state.setCroppedImage);
  // Calcula el zoom mínimo para cubrir el área 9:16
  const [minZoom, setMinZoom] = useState(1);
  // Obtén el provider del store global
  const provider = useProviderStore(state => state.provider);
  const setProvider = useProviderStore(state => state.setProvider);
  const t = useT();
  const [campaign, setCampaign] = useState<any>(null);
  const [overlayUrl, setOverlayUrl] = useState<string>("/overlays/overlay-white-default.png");

  const steps = [
    { title: t('upload_photo'), description: t('choose_or_take') },
    { title: t('adjust_image'), description: t('crop_and_adjust') },
    { title: t('share'), description: <><div>{t('publish_story')}</div><div>{t('tag_at').replace('{{handle}}', provider?.instagram_handle || '')}</div></> },
  ];

  const onCropComplete = useCallback((_: unknown, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    if (!originalImage || !croppedAreaPixels || !slug) return;
    const img = new window.Image();
    img.src = originalImage;
    await new Promise((res) => { img.onload = res; });
    // Calcula dimensiones para 9:16
    const targetWidth = 900;
    const targetHeight = 1600;
    // --- DEBUG: log croppedAreaPixels ---
    console.log('croppedAreaPixels', croppedAreaPixels, 'ratio:', croppedAreaPixels.width / croppedAreaPixels.height);
    // --- AJUSTE: forzar crop a 9:16 ---
    let cropW = croppedAreaPixels.width;
    let cropH = croppedAreaPixels.height;
    const idealRatio = 9 / 16;
    if (Math.abs(cropW / cropH - idealRatio) > 0.01) {
      // Ajustar el crop para que sea exactamente 9:16, centrado en el área seleccionada
      if (cropW / cropH > idealRatio) {
        // recortar ancho
        cropW = cropH * idealRatio;
      } else {
        // recortar alto
        cropH = cropW / idealRatio;
      }
    }
    // Centrar el crop si se ajustó
    const cropX = croppedAreaPixels.x + (croppedAreaPixels.width - cropW) / 2;
    const cropY = croppedAreaPixels.y + (croppedAreaPixels.height - cropH) / 2;
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropW,
      cropH,
      0,
      0,
      targetWidth,
      targetHeight
    );
    // 2. Pintar overlay PNG
    const overlayImg = new window.Image();
    overlayImg.src = overlayUrl;
    await new Promise((res) => { overlayImg.onload = res; });
    ctx.drawImage(overlayImg, 0, 0, targetWidth, targetHeight);
    // 3. Pintar logo del provider en la esquina inferior derecha
    if (provider?.logo_url) {
      const logo = new window.Image();
      logo.crossOrigin = "anonymous";
      logo.src = provider.logo_url;
      await new Promise((res) => { logo.onload = res; });
      // Tamaño y posición
      const logoMaxWidth = 280;
      const logoMinWidth = 140;
      const logoWidth = Math.max(Math.min(targetWidth * 0.25, logoMaxWidth), logoMinWidth);
      const logoHeight = logoWidth; // Mantener aspect ratio cuadrado
      const logoX = targetWidth - logoWidth - 50;
      const logoY = targetHeight - logoHeight - 50;
      // Pintar solo el logo, sin fondo
      ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
    }
    // 4. Pintar dos cajas de texto separadas, sin fondo, centradas y con paddings independientes
    ctx.save();
    const paddingX = 36;
    const paddingY = 48;
    const logoMaxWidth = 280;
    const logoMinWidth = 140;
    const logoWidth = provider?.logo_url ? Math.max(Math.min(targetWidth * 0.25, logoMaxWidth), logoMinWidth) : 0;
    const logoMargin = provider?.logo_url ? 50 : 0;
    const boxLeft = paddingX;
    const boxRight = targetWidth - (logoWidth + logoMargin + paddingX);
    const boxWidth = boxRight - boxLeft;
    // Instagram handle (caja superior)
    const igFontSize = 36;
    const igPaddingBottom = 8;
    let igY = targetHeight - paddingY - igPaddingBottom;
    ctx.font = `400 ${igFontSize}px 'Instrument Sans', 'Inter', 'Geist', 'Segoe UI', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.shadowColor = 'rgba(0,0,0,0.32)';
    ctx.shadowBlur = 8;
    if (provider?.instagram_handle) {
      ctx.fillStyle = '#fff';
      ctx.fillText(`@${provider.instagram_handle}`, boxLeft + boxWidth / 2, igY);
    }
    // Dirección (caja inferior)
    const dirFontSize = 24;
    const dirPaddingTop = 6;
    let dirY = igY + dirPaddingTop;
    ctx.font = `400 ${dirFontSize}px 'Instrument Sans', 'Inter', 'Geist', 'Segoe UI', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(0,0,0,0.22)';
    ctx.shadowBlur = 6;
    if (provider?.direccion) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText(provider.direccion, boxLeft + boxWidth / 2, dirY);
    }
    ctx.restore();
    const croppedDataUrl = canvas.toDataURL('image/png');
    setCroppedImage(croppedDataUrl);
    await idbSet('taun_cropped_image', croppedDataUrl);
    router.push(`/p/${slug}/preview`);
  };

  useEffect(() => {
    if (originalImage && !croppedAreaPixels) {
      const img = new window.Image();
      img.src = originalImage;
      img.onload = () => {
        setCroppedAreaPixels({ x: 0, y: 0, width: img.width, height: img.height });
      };
    }
  }, [originalImage, croppedAreaPixels]);

  useEffect(() => {
    if (!originalImage) return;
    const img = new window.Image();
    img.src = originalImage;
    img.onload = () => {
      const imgW = img.width;
      const imgH = img.height;
      const aspect = 9 / 16;
      const zoomW = imgW / (imgH * aspect);
      const zoomH = imgH / (imgW / aspect);
      const minZ = Math.max(1, Math.max(zoomW, zoomH));
      setMinZoom(minZ);
      setZoom(minZ);
    };
  }, [originalImage]);

  // Recuperar imagen original de IndexedDB si no está en memoria
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!originalImage) {
      idbGet('taun_original_image').then(img => {
        if (img) setOriginalImage(img);
      });
    }
    const prov = localStorage.getItem('taun_provider');
    if (prov) setProvider(JSON.parse(prov));
  }, [originalImage, setOriginalImage, setProvider]);

  useEffect(() => {
    if (!originalImage) {
      router.replace(`/p/${slug}`);
    }
  }, [originalImage, router, slug]);

  useEffect(() => {
    // Obtener campaña y overlayUrl
    fetch(`/api/provider/${slug}/campaign`).then(res => res.ok ? res.json() : null).then(camp => {
      setCampaign(camp && !camp.error ? camp : null);
      setOverlayUrl((camp && camp.overlayUrl) || "/overlays/overlay-white-default.png");
    });
  }, [slug]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e]">
      <ProviderHeader logoUrl={provider?.logo_url} instagramHandle={provider?.instagram_handle} />
      <div className="flex flex-col items-center w-full max-w-xs gap-8 mx-auto pt-0">
        {!originalImage ? (
          <div className="text-white/70 text-center mt-16">{t('no_image_selected')}</div>
        ) : (
        <div className="w-full flex flex-col items-center mt-8">
          <div className="relative w-full max-w-[360px] aspect-[9/16] bg-black rounded-xl overflow-hidden flex-shrink-0 mx-auto" style={{ maxHeight: '60vh' }}>
            <Cropper
              image={originalImage}
              crop={crop}
              zoom={zoom}
              minZoom={minZoom}
              aspect={9/16}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape="rect"
              showGrid={false}
              style={{ containerStyle: { borderRadius: '1rem', maxHeight: '60vh' } }}
            />
          </div>
          <input
            type="range"
            min={minZoom}
            max={3}
            step={0.01}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="w-32 mt-4"
          />
          <button
            className="w-full py-2 rounded-xl font-semibold text-lg bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-blue-500 text-white shadow-lg mt-4 mb-2"
            onClick={handleDone}
          >
            {t('done')}
          </button>
        </div>
        )}
        <Steps steps={steps} current={1} />
      </div>
      <div className="flex justify-center w-full mt-0 mb-[50px]">
        <button
          className="w-full max-w-xs mt-5 border border-white/40 text-white/80 rounded-xl px-6 py-2 hover:bg-white/10 transition"
          onClick={() => router.push(`/p/${slug}`)}
        >
          {t('upload_another')}
        </button>
      </div>
    </div>
  );
} 