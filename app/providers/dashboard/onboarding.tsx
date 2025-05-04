import { useState, useRef, useEffect } from "react";

interface Props {
  provider: any;
}

export default function OnboardingProvider({ provider }: Props) {
  const [nombre, setNombre] = useState(provider?.nombre || "");
  const [direccion, setDireccion] = useState(provider?.direccion || "");
  const [ciudad, setCiudad] = useState(provider?.ciudad || "");
  const [instagram, setInstagram] = useState(provider?.instagram_handle || "");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState(provider?.logo_url || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState(provider?.email || "");

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
    }
  }, [provider]);

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] relative">
        <div className="loader-wrapper">
          <div className="ball" />
          <div className="ball" />
          <div className="ball" />
        </div>
        <svg width="0" height="0">
          <defs>
            <filter id="pink-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -10" result="filter" />
              <feComposite in="SourceGraphic" in2="filter" operator="atop" />
            </filter>
          </defs>
        </svg>
        <span className="text-white text-base text-center mt-8">Estamos configurando todo a tu gusto...</span>
        <style jsx>{`
          .loader-wrapper {
            position: relative;
            width: 120px;
            height: 120px;
            filter: url('#pink-glow');
          }
          .ball {
            width: 60px;
            height: 60px;
            position: absolute;
            top: 30px;
            left: 30px;
          }
          .ball:before {
            background: #f472b6;
            border-radius: 100%;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            content: '';
            display: block;
          }
          .ball:nth-child(1) {
            animation: x-axis-lateral 2s infinite alternate ease-in-out;
          }
          .ball:nth-child(1):before {
            animation: y-axis-lateral 1s infinite 0.1s alternate ease-in-out;
          }
          .ball:nth-child(2) {
            animation: x-axis 2s infinite alternate ease-in-out;
          }
          .ball:nth-child(2):before {
            animation: y-axis 1s infinite .5s alternate ease-in-out;
          }
          .ball:nth-child(3) {
            animation: x-axis-lateral 2s infinite alternate ease;
            left: 90px;
            top: 90px;
          }
          .ball:nth-child(3):before {
            animation: y-axis-lateral 1s infinite .4s alternate ease-in-out;
          }
          @keyframes x-axis {
            0% { transform: translate(-96px, 0); }
            100% { transform: translate(96px, 0); }
          }
          @keyframes y-axis {
            0% { transform: translateY(42px); }
            100% { transform: translateY(-66px) scale(.8); background: #f9a8d4;}
          }
          @keyframes x-axis-lateral {
            0% { transform: translate(-36px, 0); }
            100% { transform: translate(36px, 0); }
          }
          @keyframes y-axis-lateral {
            0% { transform: translateY(12px); }
            100% { transform: translateY(-60px); background: #f9a8d4;}
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] pt-10 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-[#23243a]/80 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
        <h2 className="text-2xl font-bold text-white text-center mb-2">Completa tu perfil de local</h2>
        <div>
          <label className="block text-white/80 mb-1">Nombre del local o establecimiento *</label>
          <input type="text" className="w-full rounded-lg px-4 py-2 bg-neutral-900 text-white border border-white/10 focus:border-fuchsia-500 outline-none" value={nombre} onChange={e => setNombre(e.target.value)} required />
        </div>
        <div>
          <label className="block text-white/80 mb-1">Dirección *</label>
          <input type="text" className="w-full rounded-lg px-4 py-2 bg-neutral-900 text-white border border-white/10 focus:border-fuchsia-500 outline-none" value={direccion} onChange={e => setDireccion(e.target.value)} required />
        </div>
        <div>
          <label className="block text-white/80 mb-1">Ciudad *</label>
          <input type="text" className="w-full rounded-lg px-4 py-2 bg-neutral-900 text-white border border-white/10 focus:border-fuchsia-500 outline-none" value={ciudad} onChange={e => setCiudad(e.target.value)} required />
        </div>
        <div>
          <label className="block text-white/80 mb-1">Cuenta de Instagram *</label>
          <div className="flex items-center">
            <span className="px-3 py-2 bg-neutral-800 text-white rounded-l-lg select-none">@</span>
            <input
              type="text"
              className="w-full rounded-r-lg px-4 py-2 bg-neutral-900 text-white border border-white/10 focus:border-fuchsia-500 outline-none"
              value={instagram.replace(/^@+/, "")}
              onChange={e => setInstagram(e.target.value.replace(/^@+/, ""))}
              pattern="[a-zA-Z0-9._]+"
              required
              placeholder="usuario"
              autoComplete="off"
            />
          </div>
          <span className="text-xs text-white/50">No incluyas el @, solo el usuario.</span>
        </div>
        <div>
          <label className="block text-white/80 mb-1">Logo del local *</label>
          <div className="text-xs text-white/60 mb-2">Recomendado PNG con fondo transparente.</div>
          <button
            type="button"
            className="w-full border-2 border-white/30 rounded-lg py-2 px-4 text-white bg-transparent hover:border-fuchsia-500 transition-colors mb-2"
            onClick={() => fileInputRef.current?.click()}
          >
            {logo ? logo.name : "Seleccionar archivo"}
          </button>
          <input
            type="file"
            accept="image/png,image/jpeg"
            ref={fileInputRef}
            onChange={handleLogoChange}
            className="hidden"
          />
          {logoUrl && !logo && (
            <img src={logoUrl} alt="Logo actual" className="h-16 mt-2 rounded bg-white/10 object-contain" />
          )}
        </div>
        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
        <button type="submit" className="btn-gradient-border w-full py-3 rounded-xl font-bold text-lg bg-neutral-900 text-white shadow-lg hover:bg-neutral-800 transition-colors mt-2" disabled={loading}>
          {loading ? "Guardando..." : "Guardar y continuar"}
        </button>
      </form>
    </div>
  );
} 