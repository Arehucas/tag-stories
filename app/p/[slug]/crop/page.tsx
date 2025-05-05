"use client";
import { useState, useCallback, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import Steps from '@/components/ui/Steps';
import { useImageStore } from '@/hooks/useImageStore';
import { useProviderStore } from '@/hooks/useProviderStore';
import ProviderHeader from '@/components/ui/ProviderHeader';
import { useT } from '@/lib/useT';

export default function CropPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const originalImage = useImageStore(state => state.originalImage);
  const setCroppedImage = useImageStore(state => state.setCroppedImage);
  // Calcula el zoom mínimo para cubrir el área 9:16
  const [minZoom, setMinZoom] = useState(1);
  // Obtén el provider del store global
  const provider = useProviderStore(state => state.provider);
  const [colorCode, setColorCode] = useState<{ r: number; g: number; b: number }[]>([]);
  const t = useT();

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
    // Overlay: gradiente en la parte inferior
    const grad = ctx.createLinearGradient(0, targetHeight, 0, targetHeight - targetHeight * 0.25);
    grad.addColorStop(0, "rgba(58,134,255,0.95)");
    grad.addColorStop(1, "rgba(247,37,133,0.7)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, targetHeight - targetHeight * 0.25, targetWidth, targetHeight * 0.25);
    // Logo del provider en la esquina inferior derecha
    if (provider?.logo_url) {
      const logo = new window.Image();
      logo.crossOrigin = "anonymous";
      logo.src = provider.logo_url;
      await new Promise((res) => { logo.onload = res; });
      const logoSize = 90;
      const logoX = targetWidth - logoSize - 36;
      const logoY = targetHeight - logoSize - 36;
      // Fondo circular blanco semitransparente
      ctx.save();
      ctx.beginPath();
      ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, 2 * Math.PI);
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
      ctx.restore();
    }
    // Colores únicos
    const squareSize = 36;
    const margin = 30;
    for (let i = 0; i < 4; i++) {
      const c = colorCode[i] || { r: 0, g: 0, b: 0 };
      const x = margin + i * squareSize;
      const y = targetHeight - squareSize - margin;
      ctx.fillStyle = `rgb(${c.r},${c.g},${c.b})`;
      ctx.fillRect(x, y, squareSize, squareSize);
    }
    const croppedDataUrl = canvas.toDataURL('image/png');
    setCroppedImage(croppedDataUrl);
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

  useEffect(() => {
    // Solo en cliente
    function randomColor() {
      return {
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256),
      };
    }
    const code: { r: number; g: number; b: number }[] = [];
    while (code.length < 4) {
      const c = randomColor();
      if (!code.some(col => col.r === c.r && col.g === c.g && col.b === c.b)) code.push(c);
    }
    setColorCode(code);
  }, []);

  useEffect(() => {
    if (!originalImage) {
      router.replace(`/p/${slug}`);
    }
  }, [originalImage, router, slug]);

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