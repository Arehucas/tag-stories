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
import type { Template } from '@/lib/template';

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
  const [template, setTemplate] = useState<Template | null>(null);

  const steps = [
    { title: t('upload_photo'), description: t('choose_or_take') },
    { title: t('adjust_image'), description: t('crop_and_adjust') },
    { title: t('share'), description: <><div>{t('publish_story')}</div><div>{t('tag_at').replace('{{handle}}', provider?.instagram_handle || '')}</div></> },
  ];

  const onCropComplete = useCallback((_: unknown, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Función para loguear en terminal vía endpoint temporal, sin alert para usuario
  async function logToServer(data: any) {
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (e) {
      // Silencioso
    }
  }

  const handleDone = async () => {
    if (!originalImage || !croppedAreaPixels || !slug) return;
    let currentProvider = provider;
    if (!currentProvider?.direccion) {
      try {
        const res = await fetch(`/api/provider/${slug}`);
        if (res.ok) {
          const fetchedProvider = await res.json();
          currentProvider = fetchedProvider;
          if (fetchedProvider) {
            setProvider(fetchedProvider);
            localStorage.setItem('taun_provider', JSON.stringify(fetchedProvider));
          }
        }
      } catch {}
    }
    const img = new window.Image();
    img.src = originalImage;
    await new Promise((res) => { img.onload = res; });
    // Dimensiones target
    const targetWidth = 1080;
    const targetHeight = 1920;
    // --- Crop ---
    let cropW = croppedAreaPixels.width;
    let cropH = croppedAreaPixels.height;
    const idealRatio = 9 / 16;
    if (Math.abs(cropW / cropH - idealRatio) > 0.01) {
      if (cropW / cropH > idealRatio) {
        cropW = cropH * idealRatio;
      } else {
        cropH = cropW / idealRatio;
      }
    }
    const cropX = croppedAreaPixels.x + (croppedAreaPixels.width - cropW) / 2;
    const cropY = croppedAreaPixels.y + (croppedAreaPixels.height - cropH) / 2;
    // Log de template y overlayUrl
    const overlayUrl = template?.overlayUrl ?? "/overlays/overlay-white-default.png";
    await logToServer({
      msg: 'DEBUG CROP',
      template,
      overlayUrl,
      slug,
      campaign,
      time: new Date().toISOString(),
    });
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
    // Overlay
    const overlayImg = new window.Image();
    overlayImg.src = overlayUrl;
    await new Promise((res) => { overlayImg.onload = res; });
    ctx.drawImage(overlayImg, 0, 0, targetWidth, targetHeight);
    // Logo
    if (template?.displayLogo !== false && currentProvider?.logo_url) {
      const logo = new window.Image();
      logo.crossOrigin = "anonymous";
      logo.src = currentProvider.logo_url;
      await new Promise((res) => { logo.onload = res; });
      const logoSize = template?.logoSize ?? 280;
      const marginBottom = template?.marginBottom ?? 50;
      const marginRight = template?.marginRight ?? 50;
      const logoWidth = logoSize;
      const logoHeight = logoSize;
      const logoX = targetWidth - logoWidth - marginRight;
      const logoY = targetHeight - logoHeight - marginBottom;
      ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
    }
    // Textos e icono IG
    if (template?.displayText !== false) {
      ctx.save();
      const paddingX = 36;
      const paddingY = 48;
      const logoSize = template?.logoSize ?? 280;
      const marginRight = template?.marginRight ?? 50;
      const logoWidth = (template?.displayLogo !== false && currentProvider?.logo_url) ? logoSize : 0;
      const logoMargin = (template?.displayLogo !== false && currentProvider?.logo_url) ? marginRight : 0;
      const boxLeft = paddingX;
      const boxRight = targetWidth - (logoWidth + logoMargin + paddingX);
      const boxWidth = boxRight - boxLeft;
      // IG
      const igFontSize = template?.igText?.size ?? 35;
      const igColor = template?.igText?.color ?? '#fff';
      const igOpacity = template?.igText?.opacity ?? 0.6;
      // Dirección
      const dirFontSize = template?.addressText?.size ?? 24;
      const dirColor = template?.addressText?.color ?? 'rgba(255,255,255,0.85)';
      const dirOpacity = template?.addressText?.opacity ?? 0.4;
      const separation = 16;
      let baseY = targetHeight - (template?.marginBottom ?? 50) - 3;
      // Dirección
      ctx.font = `400 ${dirFontSize}px 'Instrument Sans', 'Inter', 'Geist', 'Segoe UI', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      let dirY = baseY;
      if (currentProvider?.direccion) {
        ctx.globalAlpha = dirOpacity;
        ctx.fillStyle = dirColor;
        ctx.fillText(currentProvider.direccion, boxLeft + boxWidth / 2, dirY);
        ctx.globalAlpha = 1;
      }
      // Instagram
      ctx.font = `400 ${igFontSize}px 'Instrument Sans', 'Inter', 'Geist', 'Segoe UI', sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      let igY = dirY - separation - 2;
      if (currentProvider?.instagram_handle) {
        ctx.globalAlpha = igOpacity;
        ctx.fillStyle = igColor;
        const iconSize = 28;
        const iconPadding = 10;
        const igText = `${currentProvider.instagram_handle}`;
        const textWidth = ctx.measureText(igText).width;
        const totalWidth = iconSize + iconPadding + textWidth;
        const centerX = boxLeft + boxWidth / 2;
        const blockStartX = centerX - totalWidth / 2;
        const blockCenterY = igY - dirFontSize - igFontSize/2 + igFontSize/2;
        const iconX = blockStartX;
        const iconY = blockCenterY - iconSize/2;
        ctx.save();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = igColor;
        ctx.beginPath();
        const r = iconSize * 0.18;
        ctx.moveTo(iconX + r, iconY);
        ctx.lineTo(iconX + iconSize - r, iconY);
        ctx.quadraticCurveTo(iconX + iconSize, iconY, iconX + iconSize, iconY + r);
        ctx.lineTo(iconX + iconSize, iconY + iconSize - r);
        ctx.quadraticCurveTo(iconX + iconSize, iconY + iconSize, iconX + iconSize - r, iconY + iconSize);
        ctx.lineTo(iconX + r, iconY + iconSize);
        ctx.quadraticCurveTo(iconX, iconY + iconSize, iconX, iconY + iconSize - r);
        ctx.lineTo(iconX, iconY + r);
        ctx.quadraticCurveTo(iconX, iconY, iconX + r, iconY);
        ctx.moveTo(iconX + iconSize/2 + iconSize*0.22, iconY + iconSize/2);
        ctx.arc(iconX + iconSize/2, iconY + iconSize/2, iconSize*0.22, 0, 2 * Math.PI);
        ctx.moveTo(iconX + iconSize*0.77, iconY + iconSize*0.23);
        ctx.arc(iconX + iconSize*0.77, iconY + iconSize*0.23, iconSize*0.06, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
        ctx.fillText(igText, iconX + iconSize + iconPadding, blockCenterY);
        ctx.globalAlpha = 1;
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.restore();
    }
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
    // Obtener campaña y template activa
    fetch(`/api/provider/${slug}/campaign`).then(res => res.ok ? res.json() : null).then(async camp => {
      setCampaign(camp && !camp.error ? camp : null);
      if (camp && camp.templateId) {
        const templateRes = await fetch(`/api/templates/${camp.templateId}`);
        if (templateRes.ok) {
          const tpl = await templateRes.json();
          setTemplate(tpl);
        }
      }
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
          {/* Contenedor 3:4 centrado */}
          <div className="flex items-center justify-center w-full" style={{ aspectRatio: '3/4', maxWidth: 360, width: '100%' }}>
            {/* Cropper 9:16 centrado dentro del contenedor 3:4 */}
            <div className="flex items-center justify-center w-full h-full" style={{ position: 'relative' }}>
              <div style={{ aspectRatio: '9/16', width: '70%', maxHeight: '100%' }}>
                <Cropper
                  image={originalImage}
                  crop={crop}
                  zoom={zoom}
                  minZoom={minZoom}
                  aspect={9/16}
                  cropShape="rect"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  style={{ containerStyle: { borderRadius: '1rem', width: '100%', height: '100%' } }}
                />
              </div>
            </div>
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