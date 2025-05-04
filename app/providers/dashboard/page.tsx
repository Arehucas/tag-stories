"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OnboardingProvider from "./onboarding";

export default function ProviderDashboard() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/providers/access");
    }
    if (status === "authenticated" && session?.user?.email) {
      fetch(`/api/provider/by-email?email=${encodeURIComponent(session.user.email)}`)
        .then(res => res.json())
        .then(data => setProvider(data))
        .finally(() => setLoading(false));
    }
  }, [status, session, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Cargando...</div>;
  }

  // Si falta algún campo obligatorio, mostrar onboarding
  if (!provider || !provider.nombre || !provider.direccion || !provider.ciudad || !provider.instagram_handle || !provider.logo_url) {
    return <OnboardingProvider provider={provider} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e]">
      <span className="text-white text-2xl font-bold mb-4">hola provider</span>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-white/70 hover:text-white underline text-base font-medium transition-colors"
      >
        Cerrar sesión
      </button>
    </div>
  );
} 