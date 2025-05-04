"use client";
import Image from "next/image";
import { useRef, useState, useEffect, useCallback } from "react";
import Cropper from 'react-easy-crop';

interface Props {
  params: Promise<{ providerId: string }>;
}

export default function AmbassadorLanding(props: Props) {
  const [providerId, setProviderId] = useState<string | null>(null);
  const [provider, setProvider] = useState<{
    nombre: string;
    logo: string;
    instagram: string;
    instrucciones: string;
  } | null>(null);
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

  // Carga providerId y provider
  useEffect(() => {
    (async () => {
      const { providerId } = await props.params;
      setProviderId(providerId);
      fetch(`/api/provider/${providerId}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("No se encontró el local");
          return res.json();
        })
        .then(setProvider)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    })();
  }, [props.params]);

  // Cuando el usuario selecciona una imagen
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setImageUrl(URL.createObjectURL(file));
    setCropping(true);
  };

  // Cuando el usuario termina de recortar
  const onCropComplete = useCallback((_: unknown, croppedPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    if (!imageUrl || !croppedAreaPixels || !providerId) return;
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
      const logo = new window.Image();
      logo.src = provider?.logo || "";
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
      try {
        await fetch('/api/story-submission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ providerId, colorCode: code }),
        });
      } catch {}
      setPreview(canvas.toDataURL("image/png"));
      setCropping(false);
    };
  }, [imageUrl, croppedAreaPixels, provider, providerId]);

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
        text: `Menciona a ${provider?.instagram} en tu story para tu recompensa!`,
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
        <span className="text-white/80 text-lg animate-pulse">Cargando local...</span>
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
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] px-2 overflow-hidden">
      <div className="flex flex-col items-center w-full max-w-xs overflow-hidden gap-6">
        {!selectedFile && (
          <>
            <div className="w-24 h-24 rounded-full overflow-hidden gradient-border p-1 bg-[#23243a]">
              <Image src={provider.logo} alt={provider.nombre} width={96} height={96} className="rounded-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-white text-center drop-shadow-lg mb-2">¡Sube tu mejor foto!</h1>
            <p className="text-base text-white/80 text-center mb-2">
              Etiqueta en una story de Instagram a <b>@{provider.instagram}</b> y podrás conseguir <span className="text-pink-400 font-bold">magníficas recompensas</span>
            </p>
            <label className="w-full py-3 rounded-xl font-semibold text-lg bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-blue-500 text-white shadow-lg hover:scale-105 transition-transform text-center cursor-pointer">
              Selecciona una imagen
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </>
        )}
        {selectedFile && cropping && imageUrl && (
          <>
            <div className="text-white text-lg font-semibold text-center py-2 mb-2">Ajusta la imagen para tu story</div>
            <div className="relative w-full aspect-[9/16] bg-black rounded-xl overflow-hidden flex-shrink-0" style={{ maxHeight: '50vh' }}>
              <Cropper
                image={imageUrl}
                crop={crop}
                zoom={zoom}
                aspect={9/16}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="rect"
                showGrid={false}
                style={{ containerStyle: { borderRadius: '1rem', maxHeight: '50vh' } }}
              />
            </div>
            <div className="flex gap-2 justify-center mt-2">
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="w-32"
              />
            </div>
            <button
              className="w-full py-2 rounded-xl font-semibold text-lg bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-blue-500 text-white shadow-lg mt-4 mb-2"
              onClick={showCroppedImage}
            >
              Listo!
            </button>
            <div
              className="w-full text-center text-white/70 py-2 cursor-pointer"
              onClick={() => { setSelectedFile(null); setImageUrl(null); setCropping(false); }}
            >
              Seleccionar otra imagen
            </div>
          </>
        )}
        {selectedFile && preview && !cropping && (
          <>
            <canvas ref={canvasRef} className="hidden" />
            <div className="relative w-full aspect-[9/16] max-w-[180px] mx-auto flex-shrink-0" style={{ maxHeight: '50vh' }}>
              <Image src={preview} alt="Preview" fill className="rounded-xl object-cover border-4 border-gradient-to-r from-fuchsia-500 via-cyan-500 to-blue-500" />
            </div>
            <button onClick={handleShare} className="w-full py-2 rounded-xl font-semibold text-lg bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-blue-500 text-white shadow-lg mt-1">Compartir en Instagram</button>
            <div className="w-full flex flex-col items-center gap-3 mt-2 bg-white/5 border border-white/10 rounded-xl px-4 py-4 mx-auto" style={{ maxWidth: 260, width: '100%' }}>
              <div className="flex items-center gap-3 w-full">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 via-cyan-500 to-blue-500 text-white font-bold text-lg shadow">1</span>
                <span className="text-white/90 text-base font-medium">Descarga la imagen</span>
              </div>
              <div className="flex items-center gap-3 w-full">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 via-cyan-500 to-blue-500 text-white font-bold text-lg shadow">2</span>
                <span className="text-white/90 text-base font-medium">Compártela en stories</span>
              </div>
              <div className="flex items-center gap-3 w-full">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 via-cyan-500 to-blue-500 text-white font-bold text-lg shadow">3</span>
                <span className="text-white/90 text-base font-medium">🏷️ @{provider.instagram}</span>
              </div>
            </div>
            <div
              className="w-full text-center text-white/70 py-1 cursor-pointer"
              onClick={() => { setSelectedFile(null); setPreview(null); setImageUrl(null); }}
            >
              Seleccionar otra imagen
            </div>
          </>
        )}
      </div>
    </div>
  );
} 