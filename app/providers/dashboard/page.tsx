"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProviderDashboard() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/providers/access");
    }
  }, [status, router]);

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