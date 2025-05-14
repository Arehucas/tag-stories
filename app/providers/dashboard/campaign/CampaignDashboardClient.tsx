"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import LoaderBolas from "@/components/ui/LoaderBolas";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useT } from '@/lib/useT';
import { useTemplates } from '@/hooks/useTemplates';
import { SelectedTemplateSection } from '@/components/SelectedTemplateSection';
import ProviderStoryCardList from '@/components/ui/ProviderStoryCardList';
import ProviderDashboardTabs from '@/components/ui/ProviderDashboardTabs';
import LoaderTable from '@/components/ui/LoaderTable';

// Defino interfaces para los estados
interface Provider {
  nombre?: string;
  logo_url?: string;
  slug?: string;
  overlayPreference?: string;
}
interface Campaign {
  _id?: string;
  nombre?: string;
  descripcion?: string;
  isActive?: boolean;
  requiredStories?: number;
  overlayType?: string;
  overlayUrl?: string;
  templateId?: string;
}
interface Form {
  nombre: string;
  descripcion: string;
  isActive: boolean;
  requiredStories: number;
  overlayType: string;
  overlayUrl: string;
}

export default function CampaignDashboardClient() {
  // --- INICIO LÓGICA Y RETURN DE CampaignDashboard ---
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");
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
  const { templates } = useTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showActiveConflictDialog, setShowActiveConflictDialog] = useState(false);
  const [pendingSwitchChecked, setPendingSwitchChecked] = useState<boolean | null>(null);
  const [hasOtherActive, setHasOtherActive] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('estado');
  const [stories, setStories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState(false);

  useEffect(() => {
    // Leer tab de la query
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'stories') setActiveTab('stories');
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    async function fetchAndSyncProviderAndCampaign() {
      let currentProvider = null;
      if (typeof window !== "undefined") {
        const demoSession = localStorage.getItem("demoSession");
        if (demoSession) {
          const demoUser = JSON.parse(demoSession);
          if (demoUser && demoUser.provider && demoUser.provider.email) {
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
      // Cargar campaña concreta si hay campaignId
      if (campaignId) {
        const res = await fetch(`/api/provider/${currentProvider.slug}/campaigns`);
        if (!res.ok) {
          setCampaign(null);
          setForm({ nombre: "", descripcion: "", isActive: true, requiredStories: 1, overlayType: "default", overlayUrl: "/overlays/overlay-white-default.png" });
          setLoading(false);
          return;
        }
        const allCamps = await res.json();
        const camp = allCamps.find((c: any) => String(c._id) === String(campaignId));
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
        setSelectedTemplateId(camp && camp.templateId ? camp.templateId : null);
        setLoading(false);
      } else {
        setCampaign(null);
        setForm({ nombre: "", descripcion: "", isActive: true, requiredStories: 1, overlayType: "default", overlayUrl: "/overlays/overlay-white-default.png" });
        setLoading(false);
      }
    }
    fetchAndSyncProviderAndCampaign();
  }, [status, session, hydrated, campaignId]);

  // Comprobar si hay otra campaña activa (distinta de la actual)
  useEffect(() => {
    async function checkOtherActive() {
      if (!provider?.slug || !campaign?._id) return;
      const res = await fetch(`/api/provider/${provider.slug}/campaigns`);
      if (!res.ok) return;
      const allCamps = await res.json();
      const otherActive = allCamps.find((c: any) => c.isActive && String(c._id) !== String(campaign._id));
      setHasOtherActive(!!otherActive);
    }
    if (campaign && campaign._id) checkOtherActive();
  }, [provider?.slug, campaign]);

  useEffect(() => {
    if (activeTab !== 'stories' || !campaign?._id || !provider?.slug) return;
    setLoadingStories(true);
    fetch(`/api/story-submission?providerId=${provider.slug}&campaignId=${campaign._id}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setStories(Array.isArray(data) ? data : []))
      .finally(() => setLoadingStories(false));
  }, [activeTab, campaign?._id, provider?.slug]);

  if (!hydrated) {
    return null;
  }

  // Handlers necesarios para el formulario de creación
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, nombre: event.target.value });
  };
  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, descripcion: event.target.value });
  };
  const handleStoriesChange = (n: number) => {
    setForm({ ...form, requiredStories: n });
  };
  const handleSave = async () => {
    if (!provider?.slug) return;
    setSaving(true);
    const method = campaign ? "PATCH" : "POST";
    const res = await fetch(`/api/provider/${provider.slug}/campaign`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(campaign ? { campaignId: campaign._id } : {}),
        nombre: form.nombre,
        descripcion: form.descripcion,
        requiredStories: form.requiredStories,
        overlayType: form.overlayType,
        overlayUrl: form.overlayUrl,
        templateId: selectedTemplateId,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setCampaign(data);
      setForm({
        nombre: data.nombre || '',
        descripcion: data.descripcion || '',
        isActive: data.isActive === undefined ? true : data.isActive,
        requiredStories: data.requiredStories ?? 1,
        overlayType: data.overlayType || 'default',
        overlayUrl: data.overlayUrl || '/overlays/overlay-white-default.png',
      });
      setSelectedTemplateId(data.templateId || null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      // Redirigir al detalle de la campaña recién creada
      if (!campaign && data && data._id) {
        window.location.href = `/providers/dashboard/campaign?campaignId=${data._id}`;
        return;
      }
    } else {
      setError('Error al crear la campaña');
      setTimeout(() => setError(null), 3000);
    }
    setSaving(false);
  };

  // Si no hay campaignId, mostrar directamente el formulario de creación
  if (!campaignId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333] flex flex-col items-center py-12 px-4 sm:px-8 transition-colors duration-500 relative overflow-hidden">
        <div className="w-full max-w-lg relative z-10 flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/providers/dashboard/campaigns')} className="p-2 rounded-full bg-violet-900/20 hover:bg-violet-900/40 text-violet-300 cursor-pointer">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <h1 className="text-2xl font-bold text-white">Campaña</h1>
          </div>
          {/* ...resto del formulario de creación... */}
        </div>
      </div>
    );
  }

  // Si hay campaignId, renderizo el bloque superior, tabs y contenido de cada tab
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333] flex flex-col items-center py-12 px-4 sm:px-8 transition-colors duration-500 relative overflow-hidden">
      <div className="w-full max-w-lg relative z-10 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/providers/dashboard/campaigns')} className="p-2 rounded-full bg-violet-900/20 hover:bg-violet-900/40 text-violet-300 cursor-pointer">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <h1 className="text-2xl font-bold text-white">Campaña</h1>
        </div>
        <ProviderDashboardTabs
          tabs={[
            { key: 'estado', label: 'Estado campaña' },
            { key: 'stories', label: 'Stories' }
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        {/* Contenido de la tab activa */}
        {activeTab === 'estado' && (
          <form className="bg-[#18122b] rounded-xl p-8 flex flex-col gap-6 border border-violet-950/60 shadow-lg" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            {campaign && (
              <div className="bg-[#0a0618] rounded-lg border border-violet-950/60 px-4 py-4 flex items-center justify-between">
                <span className="text-white/80 font-semibold">Campaña activa</span>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={() => {}}
                  disabled={saving}
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-white/80 font-semibold">Nombre de campaña</label>
              <input
                className="bg-[#0a0618] rounded-lg border border-violet-950/60 px-4 py-2 text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-700"
                value={form.nombre}
                onChange={handleNameChange}
                disabled={saving}
                required
                maxLength={60}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white/80 font-semibold">Descripción</label>
              <textarea
                className="bg-[#0a0618] rounded-lg border border-violet-950/60 px-4 py-2 text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-700 min-h-[60px]"
                value={form.descripcion}
                onChange={handleDescriptionChange}
                disabled={saving}
                maxLength={200}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white/80 font-semibold">Stories requeridas</label>
              <div className="flex gap-2 mt-1">
                {[1,2,5,10].map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold border transition-all duration-150
                      ${form.requiredStories === n ? 'bg-blue-800 border-blue-400 text-white shadow-lg' : 'bg-[#0a0618] border-violet-950/60 text-white/70'}
                      ${n !== 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={true}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <span className="text-xs text-zinc-400 mt-1">En esta beta solo puedes elegir 1</span>
              <span className="text-xs text-zinc-400 mt-1">Número de stories que debe subir el usuario para completar la campaña.</span>
            </div>
            {/* Selector de template y overlay */}
            <SelectedTemplateSection
              templates={templates}
              selectedTemplateId={selectedTemplateId || ''}
              overlayPreference={provider?.overlayPreference === 'dark-overlay' ? 'dark-overlay' : 'light-overlay'}
              onSelectTemplate={setSelectedTemplateId}
            />
            <button
              type="submit"
              className="mt-4 px-6 py-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-lg shadow-lg transition disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {success && <div className="text-green-400 font-semibold mt-2">Guardado correctamente</div>}
            {error && <div className="text-red-400 font-semibold mt-2">{error}</div>}
          </form>
        )}
        {activeTab === 'stories' && campaign && (
          loadingStories ? (
            <div className="flex justify-center items-center py-12"><LoaderTable /></div>
          ) : (
            <ProviderStoryCardList stories={stories} campaignId={campaign._id} />
          )
        )}
      </div>
    </div>
  );
  // --- FIN LÓGICA Y RETURN DE CampaignDashboard ---
} 