"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoaderBolas from "@/components/ui/LoaderBolas";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";

// Defino interfaces para los estados
interface Provider {
  // Define aquí los campos relevantes
  nombre?: string;
  logo_url?: string;
  slug?: string;
  // ...otros campos
}
interface Campaign {
  _id?: string;
  nombre?: string;
  descripcion?: string;
  isActive?: boolean;
  requiredStories?: number;
  // ...otros campos
}
interface Form {
  nombre: string;
  descripcion: string;
  isActive: boolean;
  requiredStories: number;
}

export default function CampaignDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form>({ nombre: "", descripcion: "", isActive: false, requiredStories: 1 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (typeof window !== "undefined") {
      const demoSession = localStorage.getItem("demoSession");
      if (demoSession) {
        const demoUser = JSON.parse(demoSession);
        if (demoUser && demoUser.provider && demoUser.provider.slug) {
          setProvider(demoUser.provider);
          // Cargar campaña para el provider demo
          fetch(`/api/provider/${demoUser.provider.slug}/campaign`)
            .then(async res => {
              if (!res.ok) {
                setCampaign(null);
                setForm({ nombre: "", descripcion: "", isActive: false, requiredStories: 1 });
                setLoading(false);
                return;
              }
              const camp = await res.json();
              setCampaign(camp && !camp.error ? camp : null);
              console.log("DEBUG campaña recibida:", camp);
              setForm(camp && !camp.error
                ? {
                    nombre: camp.nombre || "",
                    descripcion: camp.descripcion || "",
                    isActive: camp.isActive,
                    requiredStories: camp.requiredStories ?? 1,
                  }
                : {
                    nombre: "",
                    descripcion: "",
                    isActive: false,
                    requiredStories: 1,
                  }
              );
              setLoading(false);
            })
            .catch(() => {
              setCampaign(null);
              setForm({ nombre: "", descripcion: "", isActive: false, requiredStories: 1 });
              setLoading(false);
            });
        } else {
          setProvider(null);
          setCampaign(null);
          setForm({ nombre: "", descripcion: "", isActive: false, requiredStories: 1 });
          setLoading(false);
        }
        return;
      }
    }
    if (status !== "authenticated" || !session?.user?.email) {
      setLoading(false);
      return;
    }
    fetch(`/api/provider/by-email?email=${encodeURIComponent(session.user.email)}`)
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then(data => {
        setProvider(data);
        if (data?.slug) {
          fetch(`/api/provider/${data.slug}/campaign`)
            .then(async res => {
              if (!res.ok) {
                setLoading(false);
                setCampaign(null);
                setForm({ nombre: "", descripcion: "", isActive: false, requiredStories: 1 });
                return;
              }
              const camp = await res.json();
              setCampaign(camp && !camp.error ? camp : null);
              console.log("DEBUG campaña recibida:", camp);
              setForm(camp && !camp.error
                ? {
                    nombre: camp.nombre || "",
                    descripcion: camp.descripcion || "",
                    isActive: camp.isActive,
                    requiredStories: camp.requiredStories ?? 1,
                  }
                : {
                    nombre: "",
                    descripcion: "",
                    isActive: false,
                    requiredStories: 1,
                  }
              );
              setLoading(false);
            })
            .catch((e) => {
              setLoading(false);
              setCampaign(null);
              setForm({ nombre: "", descripcion: "", isActive: false, requiredStories: 1 });
            });
        } else {
          setLoading(false);
        }
      })
      .catch((e) => {
        setProvider(null);
        setCampaign(null);
        setForm({ nombre: "", descripcion: "", isActive: false, requiredStories: 1 });
        setLoading(false);
      });
  }, [status, session, hydrated]);

  if (!hydrated) {
    return null;
  }

  // Cambio de nombre
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, nombre: e.target.value });
  };

  // Cambio de descripción
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, descripcion: e.target.value });
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
    const res = await fetch(`/api/provider/${provider.slug}/campaign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: checked }),
    });
    if (res.ok) {
      const data = await res.json();
      setCampaign(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError("Error al actualizar el estado de la campaña");
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
      }),
    });
    if (res.ok) {
      const data = await res.json();
      console.log("DEBUG respuesta PATCH:", data);
      setCampaign(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError("Error al guardar la campaña");
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
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] text-white text-lg">No se pudo cargar el provider. Revisa que el email esté bien y que el provider tenga slug.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333] flex flex-col items-center py-12 px-4 sm:px-8 transition-colors duration-500 relative overflow-hidden">
      <div className="w-full max-w-lg relative z-10 flex flex-col gap-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.push('/providers/dashboard')} className="p-2 rounded-full bg-violet-900/20 hover:bg-violet-900/40 text-violet-300">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <h1 className="text-2xl font-bold text-white">Campaña</h1>
        </div>
        {/* Caja de activar campaña */}
        <div className="bg-[#18122b] rounded-xl p-6 flex items-center justify-between border border-violet-950/60 shadow-lg">
          <label className="text-white/80 font-semibold">Activar campaña</label>
          <Switch checked={form.isActive} onCheckedChange={handleSwitch} disabled={saving || !form.nombre.trim()} />
        </div>
        {/* Caja principal de datos de campaña */}
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
        {/* Dialogo de confirmación al desactivar */}
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Si desactivas una campaña en curso con stories pendientes de canjear, las stories se borrarán y no se podrán recuperar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDesactivar}>Sí, borrar y desactivar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {!campaign && (
          <div className="bg-blue-950/70 border border-blue-700 rounded-xl p-8 flex flex-col gap-4 items-center shadow-lg mb-8 animate-fade-in-out">
            <div className="flex items-center gap-2">
              <svg width="28" height="28" fill="none" stroke="#3a86ff" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#3a86ff" strokeWidth="2" fill="#3a86ff" opacity="0.15"/><path d="M12 8v4" stroke="#3a86ff" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1.2" fill="#3a86ff"/></svg>
              <span className="text-blue-300 text-lg font-semibold">No hay campañas activas</span>
            </div>
            <div className="text-blue-100 text-center text-base">Crea una campaña para que tus usuarios puedan subir stories y recibir recompensas.</div>
            <button
              className="mt-2 px-6 py-3 rounded-full border border-blue-700 text-blue-100 bg-gradient-to-r from-blue-900 to-blue-800 hover:bg-blue-800/80 transition text-base font-medium shadow-lg"
              onClick={() => handleSave()}
              disabled={saving}
            >
              Crear campaña
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 