"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function ProviderAccess() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/providers/dashboard");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] px-4">
      <h1 className="text-3xl font-bold text-white mb-4">Acceso para Providers</h1>
      <p className="text-white/80 text-lg mb-8 text-center max-w-md">
        Inicia sesión con Google para acceder a tu panel de gestión de recompensas y validar stories de tus clientes.
      </p>
      <button
        onClick={() => signIn("google")}
        className="px-6 py-3 rounded-xl font-semibold text-lg bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-blue-500 text-white shadow-lg hover:scale-105 transition-transform"
      >
        Iniciar sesión con Google
      </button>
    </div>
  );
} 