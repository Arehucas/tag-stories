import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useT } from '@/lib/useT';
import common from '@/locales/es/common.json';
import LoaderBolas from "@/components/ui/LoaderBolas";

interface Provider {
  nombre?: string;
  direccion?: string;
  ciudad?: string;
  instagram_handle?: string;
  logo_url?: string;
  email?: string;
  overlayPreference?: 'dark-overlay' | 'light-overlay';
}

interface Props {
  provider: Provider | null;
}

export const metadata = {
  title: common.metadata.onboarding.title,
  description: common.metadata.onboarding.description,
};

export default function OnboardingProvider({ provider }: Props) {
  const [nombre, setNombre] = useState(provider?.nombre || "");
  const [direccion, setDireccion] = useState(provider?.direccion || "");
  const [ciudad, setCiudad] = useState(provider?.ciudad || "");
  const [instagram, setInstagram] = useState(provider?.instagram_handle || "");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoUrl] = useState(provider?.logo_url || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState(provider?.email || "");
  const t = useT();
  const [logoPreview, setLogoPreview] = useState<string | null>(logoUrl || null);
  const [debugInfo, setDebugInfo] = useState<{ name: string; size: number; type: string } | null>(null);
  const [uploadResponse, setUploadResponse] = useState<any>(null);
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const [overlayPreference, setOverlayPreference] = useState<'dark-overlay' | 'light-overlay'>('light-overlay');

  // Expresión regular: solo letras, números, puntos y guiones bajos, sin @
  const instagramRegex = /^[a-zA-Z0-9._]+$/;

  useEffect(() => {
    // Obtener email de sesión demo si existe
    if (typeof window !== "undefined") {
      const demoSession = localStorage.getItem("demoSession");
      if (demoSession) {
        const demoUser = JSON.parse(demoSession);
        // Soportar ambos formatos: { provider: { email } } y { user: { email } }
        if (demoUser.user && demoUser.user.email) {
          setEmail(demoUser.user.email);
          return;
        }
        if (demoUser.provider && demoUser.provider.email) {
          setEmail(demoUser.provider.email);
          return;
        }
        if (demoUser.email) {
          setEmail(demoUser.email);
          return;
        }
      }
    }
    // Si no es demo, usar el email del provider prop
    if (provider && provider.email) {
      setEmail(provider.email);
      return;
    }
  }, [provider]);

  async function analyzeLogoColorAndTransparency(fileOrUrl: File | string): Promise<'dark-overlay' | 'light-overlay'> {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('light-overlay');
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let light = 0, dark = 0, transparent = 0, total = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
          if (a < 128) { transparent++; continue; }
          const brightness = 0.299*r + 0.587*g + 0.114*b;
          if (brightness > 180) light++;
          else dark++;
          total++;
        }
        const hasTransparency = transparent > total * 0.05;
        const isLight = light > dark;
        if (hasTransparency) {
          resolve(isLight ? 'dark-overlay' : 'light-overlay');
        } else {
          resolve(isLight ? 'light-overlay' : 'dark-overlay');
        }
      };
      if (typeof fileOrUrl === 'string') img.src = fileOrUrl;
      else img.src = URL.createObjectURL(fileOrUrl);
    });
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0]);
      setLogoPreview(URL.createObjectURL(e.target.files[0]));
      setDebugInfo({
        name: e.target.files[0].name,
        size: Math.round(e.target.files[0].size / 1024),
        type: e.target.files[0].type,
      });
      const pref = await analyzeLogoColorAndTransparency(e.target.files[0]);
      setOverlayPreference(pref);
    }
  };

  const handleLogoButton = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre || !direccion || !ciudad || !instagram) {
      setError(t('onboarding.error_required_fields'));
      return;
    }
    if (!instagramRegex.test(instagram)) {
      setError(t('onboarding.error_invalid_instagram'));
      return;
    }
    setLoading(true);
    let finalLogoUrl = logoUrl;
    let finalOverlayPreference = overlayPreference;
    if (logo) {
      // Subir a Cloudinary
      const formData = new FormData();
      formData.append("file", logo);
      const res = await fetch("/api/upload-logo", { method: "POST", body: formData });
      const data = await res.json();
      if (isLocalhost) setUploadResponse(data);
      if (!data.url) {
        setError(t('onboarding.error_upload_logo'));
        setLoading(false);
        return;
      }
      finalLogoUrl = data.url;
      finalOverlayPreference = await analyzeLogoColorAndTransparency(data.url);
    } else if (!logoPreview) {
      finalLogoUrl = '/logos/logo-provider-default.jpg';
      finalOverlayPreference = 'dark-overlay';
    }
    // Guardar provider
    const res = await fetch("/api/provider/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        direccion,
        ciudad,
        instagram_handle: instagram,
        logo_url: finalLogoUrl,
        email,
        overlayPreference: finalOverlayPreference,
      }),
    });
    if (!res.ok) {
      setError(t('onboarding.error_save'));
      setLoading(false);
      return;
    }
    setLoading(true);
    window.location.href = "/providers/dashboard";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e]">
        <LoaderBolas text={t('onboarding.saving')} />
      </div>
    );
  }

  // Nuevo look and feel
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333] flex flex-col items-center py-12 px-4 sm:px-8 transition-colors duration-500 relative overflow-hidden">
      {/* Animación de fondo tipo hero-gradient-bg */}
      <div className="hero-gradient-bg" style={{ top: 0, left: 0, right: 0, height: 400, position: 'absolute', zIndex: 0 }}>
        <div className="hero-gradient-bg-inner" />
      </div>
      <div className="w-full max-w-lg relative z-10">
        <form onSubmit={handleSubmit} className="w-full bg-[#18122b] rounded-2xl p-6 flex flex-col gap-6 shadow-2xl border border-violet-950/60">
          <div className="flex flex-col items-center mb-4" style={{ gap: 0 }}>
            <h2 className="text-2xl font-bold text-white text-center tracking-wide">{t('onboarding.title')}</h2>
            {email && (
              <div className="text-center text-sm text-white/50">{email}</div>
            )}
          </div>
          <div>
            <label className="block text-white/80 mb-1 font-semibold">{t('onboarding.name')}</label>
            <input type="text" className="w-full rounded-lg px-4 py-2 bg-[#0a0618] text-white border border-violet-950/60 focus:border-fuchsia-500 outline-none" value={nombre} onChange={e => setNombre(e.target.value)} required />
          </div>
          <div>
            <label className="block text-white/80 mb-1 font-semibold">{t('onboarding.address')}</label>
            <input type="text" className="w-full rounded-lg px-4 py-2 bg-[#0a0618] text-white border border-violet-950/60 focus:border-fuchsia-500 outline-none" value={direccion} onChange={e => setDireccion(e.target.value)} required />
          </div>
          <div>
            <label className="block text-white/80 mb-1 font-semibold">{t('onboarding.city')}</label>
            <input type="text" className="w-full rounded-lg px-4 py-2 bg-[#0a0618] text-white border border-violet-950/60 focus:border-fuchsia-500 outline-none" value={ciudad} onChange={e => setCiudad(e.target.value)} required />
          </div>
          <div>
            <label className="block text-white/80 mb-1 font-semibold">{t('onboarding.instagram')}</label>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-[#23243a] text-white rounded-l-lg select-none">@</span>
              <input
                type="text"
                className="w-full rounded-r-lg px-4 py-2 bg-[#0a0618] text-white border border-violet-950/60 focus:border-fuchsia-500 outline-none"
                value={instagram.replace(/^@+/, "")}
                onChange={e => setInstagram(e.target.value.replace(/^@+/, ""))}
                pattern="[a-zA-Z0-9._]+"
                required
                placeholder="usuario"
                autoComplete="off"
              />
            </div>
            <span className="text-xs text-white/50">{t('onboarding.instagram_note')}</span>
          </div>
          <div>
            <label className="block text-white/80 mb-1 font-semibold">{t('onboarding.logo')}</label>
            <div className="text-xs text-white/60 mb-2">{t('onboarding.logo_note')}</div>
            {isLocalhost && debugInfo && (
              <div className="mb-2 p-2 bg-black/60 text-xs text-white rounded-lg">
                <div><b>Archivo:</b> {debugInfo.name}</div>
                <div><b>Tamaño:</b> {debugInfo.size} KB</div>
                <div><b>Tipo:</b> {debugInfo.type}</div>
              </div>
            )}
            {isLocalhost && uploadResponse && (
              <div className="mb-2 p-2 bg-red-900/60 text-xs text-white rounded-lg">
                <div><b>Respuesta backend:</b> {JSON.stringify(uploadResponse)}</div>
              </div>
            )}
            {logoPreview ? (
              <div className="flex items-center gap-4 mb-2">
                <Image src={logoPreview.startsWith('http') && logoPreview.includes('cloudinary') ? logoPreview.replace('/upload/', '/upload/f_auto/') : logoPreview} alt="Logo preview" className="w-20 h-20 object-cover rounded-lg border-2 border-[#a259ff]" width={80} height={80} />
                <button type="button" onClick={handleLogoButton} className="px-4 py-2 rounded-lg bg-[#3a86ff] text-white font-semibold hover:bg-blue-700 transition cursor-pointer">{t('onboarding.change_logo')}</button>
              </div>
            ) : (
              <div className="flex items-center gap-4 mb-2">
                <Image src="/logos/logo-provider-default.jpg" alt="Logo default" className="w-20 h-20 object-cover rounded-lg border-2 border-[#23243a]" width={80} height={80} />
                <button type="button" onClick={handleLogoButton} className="px-4 py-2 rounded-lg bg-[#3a86ff] text-white font-semibold hover:bg-blue-700 transition cursor-pointer">{t('onboarding.select_logo')}</button>
              </div>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              ref={fileInputRef}
              onChange={handleLogoChange}
              className="hidden"
            />
          </div>
          {error && <div className="text-red-400 text-sm text-center font-semibold bg-red-900/30 rounded-lg py-2 px-3 border border-red-700/30">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-[#3a86ff] to-[#00f2ea] text-white shadow-lg hover:scale-[1.03] transition-transform mt-2 border-none outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              loading ||
              !nombre ||
              !direccion ||
              !ciudad ||
              !instagram
            }
          >
            {loading ? t('onboarding.saving') : t('onboarding.save_and_continue')}
          </button>
        </form>
      </div>
    </div>
  );
} 