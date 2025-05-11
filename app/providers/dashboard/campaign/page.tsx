"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoaderBolas from "@/components/ui/LoaderBolas";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useT } from '@/lib/useT';

// Defino interfaces para los estados
interface Provider {
  // Define aquí los campos relevantes
  nombre?: string;
  logo_url?: string;
  slug?: string;
  overlayPreference?: string;
  // ...otros campos
}
interface Campaign {
  _id?: string;
  nombre?: string;
  descripcion?: string;
  isActive?: boolean;
  requiredStories?: number;
  overlayType?: string;
  overlayUrl?: string;
  // ...otros campos
}
interface Form {
  nombre: string;
  descripcion: string;
  isActive: boolean;
  requiredStories: number;
  overlayType: string;
  overlayUrl: string;
}

export default function CampaignDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form>({ nombre: "", descripcion: "", isActive: false, requiredStories: 1, overlayType: "default", overlayUrl: "/overlays/overlay-white-default.png" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const t = useT();

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    async function fetchAndSyncProvider() {
      let currentProvider = null;
      if (typeof window !== "undefined") {
        const demoSession = localStorage.getItem("demoSession");
        if (demoSession) {
          const demoUser = JSON.parse(demoSession);
          if (demoUser && demoUser.provider && demoUser.provider.email) {
            // Refresca el provider desde la API
            const res = await fetch(`/api/provider/by-email?email=${encodeURIComponent(demoUser.provider.email)}`);
            if (!res.ok) {
              localStorage.removeItem("demoSession");
              router.replace("/providers/access");
              return;
            }
            currentProvider = await res.json();
            setProvider(currentProvider);
            localStorage.setItem("demoSession", JSON.stringify({ provider: currentProvider }));
          }
        }
      }
      if (!currentProvider && status === "authenticated" && session?.user?.email) {
        const res = await fetch(`/api/provider/by-email?email=${encodeURIComponent(session.user.email)}`);
        if (!res.ok) {
          if (typeof window !== "undefined") localStorage.removeItem("demoSession");
          router.replace("/providers/access");
          return;
        }
        currentProvider = await res.json();
        setProvider(currentProvider);
        if (typeof window !== "undefined") localStorage.setItem("demoSession", JSON.stringify({ provider: currentProvider }));
      }
      if (!currentProvider) {
        setProvider(null);
        setCampaign(null);
        setForm({ nombre: "", descripcion: "", isActive: false, requiredStories: 1, overlayType: "default", overlayUrl: "/overlays/overlay-white-default.png" });
        setLoading(false);
        return;
      }
      // Cargar campaña para el provider actualizado
      if (currentProvider.slug) {
        const res = await fetch(`/api/provider/${currentProvider.slug}/campaign`);
        if (!res.ok) {
          setCampaign(null);
          setForm({ nombre: "", descripcion: "", isActive: true, requiredStories: 1, overlayType: "default", overlayUrl: "/overlays/overlay-white-default.png" });
          setLoading(false);
          return;
        }
        const camp = await res.json();
        setCampaign(camp && !camp.error ? camp : null);
        setForm(camp && !camp.error
          ? {
              nombre: camp.nombre || "",
              descripcion: camp.descripcion || "",
              isActive: camp.isActive === undefined ? true : camp.isActive,
              requiredStories: camp.requiredStories ?? 1,
              overlayType: camp.overlayType || "default",
              overlayUrl: camp.overlayUrl || "/overlays/overlay-white-default.png",
            }
          : {
              nombre: "",
              descripcion: "",
              isActive: true,
              requiredStories: 1,
              overlayType: "default",
              overlayUrl: "/overlays/overlay-white-default.png",
            }
        );
        setLoading(false);
      }
    }
    fetchAndSyncProvider();
  }, [status, session, hydrated]);

  if (!hydrated) {
    return null;
  }

  // Cambio de nombre
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, nombre: event.target.value });
  };

  // Cambio de descripción
  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, descripcion: event.target.value });
  };

  // Cambio de stories
  const handleStoriesChange = (n: number) => {
    setForm({ ...form, requiredStories: n });
  };

  // Cambio de switch
  const handleSwitch = async (checked: boolean) => {
    if (!provider?.slug) return;
    // Si se va a desactivar, comprobar stories pendientes/tagged
    if (!checked && campaign?._id) {
      const count = await fetchPendingStories(campaign._id);
      if (count > 0) {
        setShowDialog(true);
        return;
      }
    }
    setForm({ ...form, isActive: checked });
    setSaving(true);
    let patchBody: any = { isActive: checked };
    // Si se activa, sincroniza overlay con overlayPreference
    if (checked && provider.overlayPreference) {
      patchBody.overlayType = 'default';
      patchBody.overlayUrl = provider.overlayPreference === 'dark-overlay'
        ? '/overlays/overlay-dark-default.png'
        : '/overlays/overlay-white-default.png';
    }
    const res = await fetch(`/api/provider/${provider.slug}/campaign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchBody),
    });
    if (res.ok) {
      const data = await res.json();
      setCampaign(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(t('campaign.error_update'));
      setTimeout(() => setError(null), 3000);
    }
    setSaving(false);
  };

  // Confirmar borrado de stories pendientes
  const handleConfirmDesactivar = async () => {
    setShowDialog(false);
    if (campaign) {
      await fetch(`/api/campaign/${campaign._id}/pending-stories`, { method: "DELETE" });
      const nextForm = { ...form, isActive: false };
      setForm(nextForm);
    }
  };

  // Nuevo handler para guardar solo nombre, descripción y número de stories
  const handleSave = async () => {
    if (!provider?.slug) return;
    setSaving(true);
    const method = campaign ? "PATCH" : "POST";
    const res = await fetch(`/api/provider/${provider.slug}/campaign`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.nombre,
        descripcion: form.descripcion,
        requiredStories: form.requiredStories,
        overlayType: form.overlayType,
        overlayUrl: form.overlayUrl,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      console.log("DEBUG respuesta PATCH:", data);
      setCampaign(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(t('campaign.error_save'));
      setTimeout(() => setError(null), 3000);
    }
    setSaving(false);
  };

  // Defino fetchPendingStories antes de su uso
  const fetchPendingStories = async (campaignId: string) => {
    const res = await fetch(`/api/campaign/${campaignId}/pending-stories`);
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count || 0;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e]"><LoaderBolas /></div>;
  }

  if (!provider) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] text-white text-lg">{t('campaign.error_load')}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333] flex flex-col items-center py-12 px-4 sm:px-8 transition-colors duration-500 relative overflow-hidden">
      <div className="w-full max-w-lg relative z-10 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/providers/dashboard')} className="p-2 rounded-full bg-violet-900/20 hover:bg-violet-900/40 text-violet-300">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <h1 className="text-2xl font-bold text-white">Campaña</h1>
        </div>
        {campaign && (
          <>
            {/* Caja de activar campaña */}
            <div className="bg-[#18122b] rounded-xl p-6 flex items-center justify-between border border-violet-950/60 shadow-lg">
              <label className="text-white/80 font-semibold">Activar campaña</label>
              <Switch checked={form.isActive} onCheckedChange={handleSwitch} disabled={saving || !form.nombre.trim()} />
            </div>
          </>
        )}
        {(campaign || showNewForm) && (
          <form className="bg-[#18122b] rounded-xl p-8 flex flex-col gap-6 border border-violet-950/60 shadow-lg">
            <div className="flex flex-col gap-2">
              <label className="text-white/80 font-semibold">Nombre de la campaña</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleNameChange}
                required
                className="bg-[#0a0618] text-white px-3 py-2 rounded-lg border border-violet-950/60 outline-none"
                disabled={saving}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white/80 font-semibold">Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleDescriptionChange}
                rows={3}
                className="bg-[#0a0618] text-white px-3 py-2 rounded-lg border border-violet-950/60 outline-none resize-none"
                disabled={saving}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white/80 font-semibold">Stories para recompensa</label>
              <div className="flex gap-2">
                {[1,2,5,10,20].map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`px-4 py-2 rounded-lg border ${form.requiredStories === n ? 'bg-blue-700 text-white border-blue-700' : 'bg-[#0a0618] text-white/50 border-violet-950/60'} transition`}
                    disabled={n !== 1}
                    tabIndex={n === 1 ? 0 : -1}
                    onClick={() => handleStoriesChange(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <span className="text-xs text-white/50">Por ahora solo 1 disponible</span>
            </div>
            <button
              type="button"
              className="mt-8 px-6 py-3 rounded-full border border-violet-900 text-white/90 bg-gradient-to-r from-[#18122b] to-[#0a0618] hover:bg-violet-900/30 transition text-base font-medium shadow-lg w-full"
              onClick={handleSave}
              disabled={saving || !form.nombre.trim()}
            >
              {saving ? 'Guardando cambios...' : 'Guardar cambios'}
            </button>
            {success && (
              <div className="mt-4 text-center text-blue-400 bg-blue-950/60 rounded-lg py-2 px-4 animate-fade-in-out">
                Se han guardado los cambios correctamente
              </div>
            )}
            {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
          </form>
        )}
        {!campaign && !showNewForm && (
          <div className="bg-blue-950/70 border border-blue-700 rounded-xl p-8 flex flex-col gap-4 items-center shadow-lg mb-8 animate-fade-in-out">
            <div className="flex items-center gap-2">
              <svg width="28" height="28" fill="none" stroke="#3a86ff" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#3a86ff" strokeWidth="2" fill="#3a86ff" opacity="0.15"/><path d="M12 8v4" stroke="#3a86ff" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1.2" fill="#3a86ff"/></svg>
              <span className="text-blue-300 text-lg font-semibold">{t('campaign.no_active')}</span>
            </div>
            <div className="text-blue-100 text-center text-base">{t('campaign.need_active')}</div>
            <button
              className="mt-2 px-6 py-3 rounded-full border border-blue-700 text-blue-100 bg-gradient-to-r from-blue-900 to-blue-800 hover:bg-blue-800/80 transition text-base font-medium shadow-lg"
              onClick={() => { setShowNewForm(true); setForm({ nombre: '', descripcion: '', isActive: true, requiredStories: 1, overlayType: "default", overlayUrl: "/overlays/overlay-white-default.png" }); }}
              disabled={saving}
            >
              {t('campaign.create')}
            </button>
          </div>
        )}
        {/* Dialogo de confirmación al desactivar */}
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('campaign.confirm_title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('campaign.confirm_desc')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('campaign.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDesactivar}>{t('campaign.confirm_action')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
} 