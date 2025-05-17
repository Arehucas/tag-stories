"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import LoaderBolas from "@/components/ui/LoaderBolas";
import common from '@/locales/es/common.json';
import Image from 'next/image';
import { useT } from '@/lib/useT';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CustomAlertDialog } from "@/components/ui/alert-dialog";
import useProviderData from '@/hooks/useProviderData';
import WithLoader from '@/components/ui/WithLoader';

interface Provider {
  slug?: string;
  nombre?: string;
  direccion?: string;
  ciudad?: string;
  instagram_handle?: string;
  logo_url?: string;
  email?: string;
  overlayPreference?: string;
  shortId?: string;
  [key: string]: unknown;
}

export default function BrandData() {
  const { provider, loading } = useProviderData();
  const router = useRouter();
  const [form, setForm] = useState<Provider>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useT();
  const [overlayPreference, setOverlayPreference] = useState<string>('light-overlay');
  const [campaignActive, setCampaignActive] = useState<boolean>(false);
  const [showOverlayBlockDialog, setShowOverlayBlockDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [overlayBlockDialogError, setOverlayBlockDialogError] = useState<string | null>(null);
  const [overlayBlockDialogLoading, setOverlayBlockDialogLoading] = useState(false);

  useEffect(() => {
    if (loading || !provider) return;
    setForm(provider);
    setLogoPreview(provider?.logo_url || null);
    if (typeof provider?.overlayPreference === 'string') {
      setOverlayPreference(provider.overlayPreference);
    } else {
      setOverlayPreference('light-overlay');
    }
    if (provider?.slug) {
      fetch(`/api/provider/${provider.slug}/campaign`).then(res => res.ok ? res.json() : null).then(camp => {
        setCampaignActive(!!(camp && camp.isActive));
      });
    }
  }, [loading, provider]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
          if (brightness > 130) light++;
          else dark++;
          total++;
        }
        const hasTransparency = transparent > total * 0.05; // 5% de píxeles transparentes
        const isLight = light > dark;
        // Reglas
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
      setLogoFile(e.target.files[0]);
      setLogoPreview(URL.createObjectURL(e.target.files[0]));
      setIsAnalyzing(true);
      const overlayPref = await analyzeLogoColorAndTransparency(e.target.files[0]);
      setOverlayPreference(overlayPref);
      setIsAnalyzing(false);
    }
  };

  const handleLogoButton = async () => {
    if (provider?.slug) {
      const res = await fetch(`/api/provider/${provider.slug}/campaign`);
      const camp = res.ok ? await res.json() : null;
      if (camp && camp.isActive) {
        setShowOverlayBlockDialog(true);
        return;
      }
    }
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleDialogConfirm = () => {
    setShowOverlayBlockDialog(false);
    setTimeout(() => {
      if (fileInputRef.current) fileInputRef.current.click();
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let logoUrl = provider?.logo_url;
    if (logoFile) {
      // Subir logo a /api/upload-logo igual que en onboarding
      const data = new FormData();
      data.append("file", logoFile);
      const resUpload = await fetch("/api/upload-logo", { method: "POST", body: data });
      const uploadData = await resUpload.json();
      if (uploadData && uploadData.url) {
        logoUrl = uploadData.url;
      }
    }
    // Construir el body igual que en onboarding
    const body = {
      nombre: form.nombre,
      direccion: form.direccion,
      ciudad: form.ciudad,
      instagram_handle: form.instagram_handle,
      logo_url: logoUrl,
      email: form.email,
      overlayPreference,
    };
    const res = await fetch("/api/provider/by-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setForm({ ...form, logo_url: logoUrl ?? provider?.logo_url, overlayPreference });
      setLogoPreview(logoUrl ?? provider?.logo_url ?? null);
      setLogoFile(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  return (
    <WithLoader loading={loading} fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e]">
        <LoaderBolas />
      </div>
    }>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333] flex flex-col items-center py-12 px-4 sm:px-8 transition-colors duration-500 relative overflow-hidden">
        <div className="w-full max-w-lg relative z-10">
          {/* Cabecera */}
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => router.push('/providers/dashboard')} className="p-2 rounded-full bg-violet-900/20 hover:bg-violet-900/40 text-violet-300 cursor-pointer">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <h1 className="text-2xl font-bold text-white">{t('dashboard.brand_data_title')}</h1>
          </div>
          <form className="bg-[#18122b] rounded-xl p-6 flex flex-col gap-6 border border-violet-950/60 shadow-lg" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="nombre" className="text-white/80 font-semibold">{common.onboarding.name}</label>
              <input id="nombre" name="nombre" value={form.nombre || ''} onChange={handleChange} required className="bg-[#0a0618] text-white px-3 py-2 rounded-lg border border-violet-950/60 outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="direccion" className="text-white/80 font-semibold">{common.onboarding.address}</label>
              <input id="direccion" name="direccion" value={form.direccion || ''} onChange={handleChange} required className="bg-[#0a0618] text-white px-3 py-2 rounded-lg border border-violet-950/60 outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="ciudad" className="text-white/80 font-semibold">{common.onboarding.city}</label>
              <input id="ciudad" name="ciudad" value={form.ciudad || ''} onChange={handleChange} required className="bg-[#0a0618] text-white px-3 py-2 rounded-lg border border-violet-950/60 outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="instagram_handle" className="text-white/80 font-semibold">{common.onboarding.instagram}</label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-[#23243a] text-white rounded-l-lg select-none">@</span>
                <input
                  id="instagram_handle"
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
              {logoPreview && (
                <div className="flex items-center gap-4">
                  <Image src={logoPreview.startsWith('http') && logoPreview.includes('cloudinary') ? logoPreview.replace('/upload/', '/upload/f_auto/') : logoPreview} alt="Logo preview" className="w-20 h-20 object-cover rounded-lg border-2 border-[#a259ff]" width={80} height={80} />
                  {logoFile && (
                    <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(provider?.logo_url ?? null); }} className="px-4 py-2 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-800 transition cursor-pointer">Cancelar</button>
                  )}
                  {!logoFile && (
                    <button type="button" onClick={handleLogoButton} className="px-4 py-2 rounded-lg bg-violet-700 text-white font-semibold hover:bg-violet-800 transition cursor-pointer">Cambiar logo</button>
                  )}
                </div>
              )}
              {!logoPreview && logoFile && (
                <div className="flex items-center gap-4">
                  <span className="text-white/80">{logoFile.name}</span>
                  <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(provider?.logo_url ?? null); }} className="px-4 py-2 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-800 transition cursor-pointer">Cancelar</button>
                </div>
              )}
              {!logoPreview && !logoFile && (
                <div style={{ width: 80, height: 80, background: '#2563eb', borderRadius: '50%' }} />
              )}
              <input type="file" accept="image/png,image/jpeg,image/webp" ref={fileInputRef} className="hidden" onChange={handleLogoChange} />
            </div>
            <button type="submit" className="w-full px-6 py-3 rounded-full border border-violet-900 text-white/90 bg-gradient-to-r from-[#18122b] to-[#0a0618] hover:bg-violet-900/30 transition text-base font-medium shadow-lg disabled:opacity-60 cursor-pointer" disabled={saving || isAnalyzing} aria-busy={saving || isAnalyzing}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {success && (
              <div className="mt-4 text-center text-blue-400 bg-blue-950/60 rounded-lg py-2 px-4 animate-fade-in-out">
                Se han guardado los cambios correctamente
              </div>
            )}
          </form>
        </div>
        <CustomAlertDialog
          open={showOverlayBlockDialog}
          onOpenChange={setShowOverlayBlockDialog}
          title="¿Seguro que quieres cambiar el logo?"
          description={<>
            Si cambias el logo, se actualizará en todas las campañas y stories asociadas a tu marca.
            {overlayBlockDialogError && <div className="text-red-500 text-sm mt-2">{overlayBlockDialogError}</div>}
          </>}
          actions={[
            {
              label: 'Sí, cambiar el logo',
              color: 'primary',
              disabled: overlayBlockDialogLoading,
              onClick: handleDialogConfirm
            },
            {
              label: 'Ir a campañas',
              color: 'secondary',
              disabled: overlayBlockDialogLoading,
              onClick: () => {
                setShowOverlayBlockDialog(false);
                router.push('/providers/dashboard/campaigns');
              }
            },
            {
              label: 'Cancelar',
              color: 'cancel',
              disabled: overlayBlockDialogLoading,
              onClick: () => setShowOverlayBlockDialog(false)
            }
          ]}
        />
      </div>
    </WithLoader>
  );
} 