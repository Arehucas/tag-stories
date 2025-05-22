import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

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

export function useProviderData() {
  const { data: session, status } = useSession();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    setError(null);
    // Modo demo
    if (typeof window !== "undefined") {
      const demoSession = localStorage.getItem("demoSession");
      if (demoSession) {
        const demoUser = JSON.parse(demoSession);
        if (demoUser?.provider?.email) {
          setLoading(true);
          fetch(`/api/provider/by-email?email=${encodeURIComponent(demoUser.provider.email)}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (!data) {
                setError("No se encontró el provider para este usuario demo.");
                setProvider(null);
              } else {
                setProvider(data);
              }
              setLoading(false);
            })
            .catch(() => {
              setError("Error al cargar los datos del provider demo.");
              setProvider(null);
              setLoading(false);
            });
          return;
        }
      }
    }
    // Modo autenticado normal
    if (status !== "authenticated") {
      setError("No hay sesión activa o email de usuario.");
      setProvider(null);
      setLoading(false);
      return;
    }
    // Esperar a que el email esté realmente disponible
    const email = session?.user?.email;
    if (!email) {
      setLoading(true);
      return;
    }
    setLoading(true);
    fetch(`/api/provider/by-email?email=${encodeURIComponent(email)}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) {
          setError("No se encontró el provider para este usuario.");
          setProvider(null);
        } else {
          setProvider(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar los datos del provider.");
        setProvider(null);
        setLoading(false);
      });
  }, [status, session?.user?.email]);

  return { provider, loading, error };
}

export default useProviderData; 