import { useState, useRef } from "react";

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

  // Expresión regular: solo letras, números, puntos y guiones bajos, sin @
  const instagramRegex = /^[a-zA-Z0-9._]+$/;

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
      }),
    });
    if (!res.ok) {
      setError("Error guardando los datos");
      setLoading(false);
      return;
    }
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-[#23243a]/80 rounded-2xl p-6 flex flex-col gap-5 shadow-xl mt-10">
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
          <input type="file" accept="image/png,image/jpeg" ref={fileInputRef} onChange={handleLogoChange} className="block w-full text-white" />
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