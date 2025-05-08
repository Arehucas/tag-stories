import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
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
}

interface Props {
  provider: Provider | null;
}

export const metadata = {
  title: common.metadata.onboarding.title,
  description: common.metadata.onboarding.description,
};

export default function OnboardingProvider({ provider }: Props) {
  const { data: session } = useSession();
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

  // Expresión regular: solo letras, números, puntos y guiones bajos, sin @
  const instagramRegex = /^[a-zA-Z0-9._]+$/;

  useEffect(() => {
    // Obtener email de sesión demo si existe
    if (typeof window !== "undefined") {
      const demoSession = localStorage.getItem("demoSession");
      if (demoSession) {
        const demoUser = JSON.parse(demoSession);
        if (demoUser.user.email) setEmail(demoUser.user.email);
        return;
      }
    }
    // Si no es demo, usar el email del provider prop
    if (provider && provider.email) {
      setEmail(provider.email);
      return;
    }
    // Si hay sesión de Google, usar ese email
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [provider, session]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre || !direccion || !ciudad || !instagram || !logo && !logoUrl) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (!instagramRegex.test(instagram)) {
      setError("El usuario de Instagram no debe contener @ ni caracteres especiales");
      return;
    }
    setLoading(true);
    let finalLogoUrl = logoUrl;
    if (logo) {
      // Subir a Cloudinary
      const formData = new FormData();
      formData.append("file", logo);
      const res = await fetch("/api/upload-logo", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.url) {
        setError("Error subiendo el logo");
        setLoading(false);
        return;
      }
      finalLogoUrl = data.url;
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
      }),
    });
    if (!res.ok) {
      setError("Error guardando los datos");
      setLoading(false);
      return;
    }
    // Quitar alert y redirigir directamente
    setLoading(true);
    window.location.href = "/providers/dashboard";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e]">
        <LoaderBolas />
        <span className="text-white text-base text-center mt-5" style={{ paddingTop: 18 }}>Guardando los datos de tu marca...</span>
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
        <form onSubmit={handleSubmit} className="w-full bg-[#18122b] rounded-2xl p-8 flex flex-col gap-6 shadow-2xl border border-violet-950/60">
          <h2 className="text-2xl font-bold text-white text-center mb-2 tracking-wide">{t('onboarding.title')}</h2>
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
            <button
              type="button"
              className="w-full border-2 border-violet-950/60 rounded-lg py-2 px-4 text-white bg-[#23243a] hover:border-fuchsia-500 transition-colors mb-2 font-medium"
              onClick={() => fileInputRef.current?.click()}
            >
              {logo ? logo.name : t('onboarding.select_file')}
            </button>
            <input
              type="file"
              accept="image/png,image/jpeg"
              ref={fileInputRef}
              onChange={handleLogoChange}
              className="hidden"
            />
            {logoUrl && !logo && (
              <Image src={logoUrl} alt="Logo actual" width={64} height={64} className="h-16 mt-2 rounded bg-white/10 object-contain" />
            )}
          </div>
          {error && <div className="text-red-400 text-sm text-center font-semibold bg-red-900/30 rounded-lg py-2 px-3 border border-red-700/30">{error}</div>}
          <button type="submit" className="w-full py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-[#3a86ff] to-[#00f2ea] text-white shadow-lg hover:scale-[1.03] transition-transform mt-2 border-none outline-none" disabled={loading}>
            {loading ? t('onboarding.saving') : t('onboarding.save_and_continue')}
          </button>
        </form>
      </div>
    </div>
  );
} 