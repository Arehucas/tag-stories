"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoaderBolas from "@/components/ui/LoaderBolas";
import common from '@/locales/es/common.json';
import Image from 'next/image';

interface Provider {
  slug?: string;
  nombre?: string;
  direccion?: string;
  ciudad?: string;
  instagram_handle?: string;
  logo_url?: string;
  email?: string;
  [key: string]: unknown;
}

export default function BrandData() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Provider>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "loading") return;

    // Modo demo
    if (typeof window !== "undefined") {
      const demoSession = localStorage.getItem("demoSession");
      if (demoSession) {
        const demoUser = JSON.parse(demoSession);
        if (demoUser?.provider?.email) {
          fetch(`/api/provider/by-email?email=${encodeURIComponent(demoUser.provider.email)}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (!data) {
                setError("No se encontró el provider para este usuario demo.");
              } else {
                setProvider(data);
                setForm(data);
                setLogoPreview(data?.logo_url || null);
              }
              setLoading(false);
            })
            .catch(() => {
              setError("Error al cargar los datos del provider demo.");
              setLoading(false);
            });
          return;
        }
      }
    }

    // Modo autenticado normal
    if (status !== "authenticated" || !session?.user?.email) {
      setError("No hay sesión activa o email de usuario.");
      setLoading(false);
      return;
    }
    fetch(`/api/provider/by-email?email=${encodeURIComponent(session.user.email)}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) {
          setError("No se encontró el provider para este usuario.");
        } else {
          setProvider(data);
          setForm(data);
          setLogoPreview(data?.logo_url || null);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar los datos del provider.");
        setLoading(false);
      });
  }, [status, session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
      setLogoPreview(null);
    }
  };

  const handleLogoButton = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let logoUrl = form.logo_url;
    if (logoFile) {
      // Subir logo a Cloudinary (simulación, reemplazar por lógica real)
      const data = new FormData();
      data.append("file", logoFile);
      data.append("upload_preset", "taunme");
      const res = await fetch("https://api.cloudinary.com/v1_1/taunme/image/upload", {
        method: "POST",
        body: data,
      });
      const file = await res.json();
      logoUrl = file.secure_url;
    }
    // Guardar provider
    const res = await fetch("/api/provider/by-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, logo_url: logoUrl, email: form.email }),
    });
    if (res.ok) {
      setProvider({ ...form, logo_url: logoUrl });
      setLogoPreview(logoUrl ?? null);
      setLogoFile(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e]"><LoaderBolas /></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] text-white text-lg">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333] flex flex-col items-center py-12 px-4 sm:px-8 transition-colors duration-500 relative overflow-hidden">
      <div className="w-full max-w-lg relative z-10">
        {/* Cabecera */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.push('/providers/dashboard')} className="p-2 rounded-full bg-violet-900/20 hover:bg-violet-900/40 text-violet-300">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <h1 className="text-2xl font-bold text-white">Datos de Marca</h1>
        </div>
        <form className="bg-[#18122b] rounded-xl p-8 flex flex-col gap-6 border border-violet-950/60 shadow-lg" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-white/80 font-semibold">{common.onboarding.name}</label>
            <input name="nombre" value={form.nombre || ''} onChange={handleChange} required className="bg-[#0a0618] text-white px-3 py-2 rounded-lg border border-violet-950/60 outline-none" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white/80 font-semibold">{common.onboarding.address}</label>
            <input name="direccion" value={form.direccion || ''} onChange={handleChange} required className="bg-[#0a0618] text-white px-3 py-2 rounded-lg border border-violet-950/60 outline-none" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white/80 font-semibold">{common.onboarding.city}</label>
            <input name="ciudad" value={form.ciudad || ''} onChange={handleChange} required className="bg-[#0a0618] text-white px-3 py-2 rounded-lg border border-violet-950/60 outline-none" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white/80 font-semibold">{common.onboarding.instagram}</label>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-[#23243a] text-white rounded-l-lg select-none">@</span>
              <input
                name="instagram_handle"
                value={(form.instagram_handle || '').replace(/^@+/, "")}
                onChange={e => setForm({ ...form, instagram_handle: e.target.value.replace(/^@+/, "") })}
                pattern="[a-zA-Z0-9._]+"
                required
                placeholder="usuario"
                autoComplete="off"
                className="w-full rounded-r-lg px-4 py-2 bg-[#0a0618] text-white border border-violet-950/60 focus:border-fuchsia-500 outline-none"
              />
            </div>
            <span className="text-xs text-white/50">{common.onboarding.instagram_note}</span>
          </div>
          {/* Logo */}
          <div className="flex flex-col gap-2">
            <label className="text-white/80 font-semibold">Logo</label>
            {logoPreview && !logoFile && (
              <div className="flex items-center gap-4">
                <Image src={logoPreview} alt="Logo actual" className="w-20 h-20 object-cover rounded-lg border border-violet-900 bg-white" width={80} height={80} />
                <button type="button" onClick={handleLogoButton} className="px-4 py-2 rounded-lg bg-violet-700 text-white font-semibold hover:bg-violet-800 transition">Cambiar logo</button>
              </div>
            )}
            {!logoPreview && logoFile && (
              <div className="flex items-center gap-4">
                <span className="text-white/80">{logoFile.name}</span>
                <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(provider?.logo_url ?? null); }} className="px-4 py-2 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-800 transition">Cancelar</button>
              </div>
            )}
            {!logoPreview && !logoFile && (
              <div style={{ width: 80, height: 80, background: '#2563eb', borderRadius: '50%' }} />
            )}
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleLogoChange} />
          </div>
          <button type="submit" className="w-full px-6 py-3 rounded-full border border-violet-900 text-white/90 bg-gradient-to-r from-[#18122b] to-[#0a0618] hover:bg-violet-900/30 transition text-base font-medium shadow-lg disabled:opacity-60" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          {success && (
            <div className="mt-4 text-center text-blue-400 bg-blue-950/60 rounded-lg py-2 px-4 animate-fade-in-out">
              Se han guardado los cambios correctamente
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 