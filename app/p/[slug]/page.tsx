"use client";
import Image from "next/image";
import { useRef, useState, useEffect, useCallback, use } from "react";
import Cropper from 'react-easy-crop';
import LoaderBolas from "@/components/ui/LoaderBolas";
import { DownloadCloud, Share, Tag } from 'lucide-react';
import Steps from '@/components/ui/Steps';
import { useRouter } from 'next/navigation';
import { useImageStore } from '@/hooks/useImageStore';
import { useProviderStore } from '@/hooks/useProviderStore';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [cropping, setCropping] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const router = useRouter();
  const steps = [
    { title: 'Sube tu foto', description: 'Saca o elige una foto' },
    { title: 'Ajusta tu imagen', description: 'Recorta y ajusta tu foto.' },
    { title: 'Comparte', description: <><div>Publica tu story en Instagram.</div><div>Etiqueta a @{provider?.instagram_handle}</div></> },
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
          if (!res.ok) throw new Error("No se encontró el local");
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

  // Cuando el usuario selecciona una imagen
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  // Cuando el usuario termina de recortar
  const onCropComplete = useCallback((_: unknown, croppedPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    if (!imageUrl || !croppedAreaPixels || !slug) return;
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );
      // Cover genérica: gradiente en la parte inferior (lo más abajo)
      const grad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - canvas.height * 0.25);
      grad.addColorStop(0, "rgba(58,134,255,0.95)");
      grad.addColorStop(1, "rgba(247,37,133,0.7)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, canvas.height - canvas.height * 0.25, canvas.width, canvas.height * 0.25);
      // Logo en la esquina inferior derecha (encima del gradiente)
      if (provider?.logo_url) {
        const logo = new window.Image();
        logo.crossOrigin = "anonymous";
        logo.src = provider.logo_url;
        let logoLoaded = false;
        await Promise.race([
          new Promise((res) => {
            logo.onload = () => { logoLoaded = true; res(null); };
            logo.onerror = () => { logoLoaded = false; res(null); };
          }),
          new Promise((res) => setTimeout(res, 1000))
        ]);
        try {
          const logoSize = canvas.width * 0.18;
          if (logoLoaded) {
            ctx.drawImage(logo, canvas.width - logoSize - 24, canvas.height - logoSize - 24, logoSize, logoSize);
          }
        } catch {}
      }
      // Generar 4 colores únicos (código de color)
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
      const squareSize = 12;
      const margin = 10;
      for (let i = 0; i < 4; i++) {
        const c = code[i];
        const x = margin + i * squareSize;
        const y = canvas.height - squareSize - margin;
        ctx.fillStyle = `rgb(${c.r},${c.g},${c.b})`;
        ctx.fillRect(x, y, squareSize, squareSize);
      }
      // Guardar en backend
      const body = { slug, colorCode: code };
      console.log('Enviando a story-submission:', body);
      try {
        await fetch('/api/story-submission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } catch {}
      setPreview(canvas.toDataURL("image/png"));
      setCropping(false);
    };
  }, [imageUrl, croppedAreaPixels, provider, slug]);

  // Compartir en Instagram (share nativo)
  const handleShare = async () => {
    if (!preview) return;
    const response = await fetch(preview);
    const blob = await response.blob();
    const file = new File([blob], `story-${provider?.nombre || "local"}.png`, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
      await navigator.share({
        files: [file],
        title: `Comparte tu experiencia en ${provider?.nombre}`,
        text: `Menciona a ${provider?.instagram_handle} en tu story para tu recompensa!`,
      });
    } else {
      // Fallback: descarga la imagen y muestra instrucción
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `story-${provider?.nombre || "local"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert("Imagen descargada, compártela con stories de Instagram");
    }
  };

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
        <span className="text-red-400 text-lg text-center">{error || "No se encontró el local"}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] px-2">
      <div className="flex flex-col items-center w-full max-w-xs gap-8 mx-auto pt-8">
        <div className="flex flex-col items-center w-full mt-0 mb-0">
          <div className="p-[2.5px] rounded-full bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-blue-500 animate-gradient-x">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
              <Image src={provider?.logo_url || "/default-logo.png"} alt={provider?.nombre || "Logo"} width={80} height={80} className="object-cover w-full h-full" />
            </div>
          </div>
          <div className="text-white/80 text-base font-medium">@{provider?.instagram_handle}</div>
        </div>
        <div className="flex flex-col items-center w-full" style={{ gap: '0.5rem' }}>
          <h1 className="text-2xl font-bold text-white text-center drop-shadow-lg">¡Sube tu mejor foto!</h1>
        </div>
        <p className="text-base text-white/80 text-center mb-2">
          Etiqueta en una story de Instagram a <b>@{provider?.instagram_handle || ""}</b> y podrás conseguir <span className="text-pink-400 font-bold">magníficas recompensas</span>
        </p>
        <label className="w-full py-3 rounded-xl font-semibold text-lg bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-blue-500 text-white shadow-lg hover:scale-105 transition-transform text-center cursor-pointer">
          Selecciona una imagen
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
        <Steps steps={steps} current={0} />
      </div>
    </div>
  );
} 