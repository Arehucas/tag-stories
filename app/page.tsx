"use client";
import { useRouter } from "next/navigation";
import { Megaphone, Gift, Users, Zap, ShieldCheck, TrendingUp } from "lucide-react";

export default function Landing() {
  const router = useRouter();

  return (
    <main className="w-full min-h-screen flex flex-col items-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e]">
      {/* HERO */}
      <section className="relative w-full flex flex-col items-center justify-center pt-10 pb-8 px-4 bg-gradient-to-b from-[#23243a] to-[#1a1a2e]" style={{ minHeight: 400 }}>
        {/* Olas decorativas animadas en el borde inferior, fondo blanco temporal para debug */}
        <div className="absolute left-0 right-0 bottom-0 h-[120px] w-full -z-10 bg-white">
          <svg className="w-[200%] h-full animate-wave-x" viewBox="0 0 750 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60 Q 75 120 150 60 T 300 60 T 450 60 T 600 60 T 750 60 V120 H0Z" fill="#a21caf" fillOpacity="0.18"/>
            <path d="M0 80 Q 75 40 150 80 T 300 80 T 450 80 T 600 80 T 750 80 V120 H0Z" fill="#38bdf8" fillOpacity="0.12"/>
            <path d="M0 100 Q 75 140 150 100 T 300 100 T 450 100 T 600 100 T 750 100 V120 H0Z" fill="#f472b6" fillOpacity="0.15"/>
          </svg>
        </div>
        <div className="mb-4">
          <Megaphone className="w-16 h-16 text-fuchsia-400 drop-shadow-lg" />
        </div>
        <h1 className="text-3xl font-extrabold text-white text-center leading-tight mb-3 drop-shadow-lg">
          Haz que tus clientes<br />
          <span className="text-pink-400">promocionen tu local</span>
        </h1>
        <p className="text-white/80 text-lg text-center mb-5 max-w-xs">
          Convierte cada visita en una oportunidad de marketing real. Recompensa a quienes comparten tu negocio en Instagram Stories.
        </p>
        <button
          onClick={() => router.push("/providers/access")}
          className="w-full max-w-xs py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-blue-500 text-white shadow-lg hover:scale-105 transition-transform mb-2"
        >
          Regístrate gratis
        </button>
        <span className="text-xs text-white/60">Sin tarjeta, sin compromiso</span>
      </section>

      {/* SECCIÓN CLARA: Beneficios */}
      <section className="w-full bg-white py-10 px-4 flex flex-col gap-8 items-center">
        <div className="flex flex-col items-center gap-2 max-w-xs">
          <TrendingUp className="w-10 h-10 text-blue-500 mb-1" />
          <h2 className="text-xl font-bold text-[#23243a] text-center">Aumenta tu visibilidad</h2>
          <p className="text-[#23243a]/80 text-center text-base">
            Cada story es una recomendación auténtica de tu local a cientos de potenciales clientes.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 max-w-xs">
          <Gift className="w-10 h-10 text-pink-500 mb-1" />
          <h2 className="text-xl font-bold text-[#23243a] text-center">Automatiza tus recompensas</h2>
          <p className="text-[#23243a]/80 text-center text-base">
            Fideliza a tus clientes premiando su promoción, sin esfuerzo y sin complicaciones técnicas.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 max-w-xs">
          <Users className="w-10 h-10 text-cyan-500 mb-1" />
          <h2 className="text-xl font-bold text-[#23243a] text-center">Crecimiento orgánico</h2>
          <p className="text-[#23243a]/80 text-center text-base">
            Transforma a tus clientes en embajadores y haz crecer tu comunidad de forma natural.
          </p>
        </div>
      </section>

      {/* SECCIÓN OSCURA: Cómo funciona */}
      <section className="w-full bg-[#23243a] py-10 px-4 flex flex-col gap-8 items-center">
        <h2 className="text-2xl font-bold text-white text-center mb-2">¿Cómo funciona?</h2>
        <div className="flex flex-col gap-6 w-full max-w-md">
          <div className="flex items-center gap-4">
            <Zap className="w-8 h-8 text-fuchsia-400" />
            <div>
              <span className="text-white font-semibold">1. Regístrate y configura tu campaña</span>
              <p className="text-white/70 text-sm">En menos de 2 minutos tendrás tu local listo para recibir stories.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
            <div>
              <span className="text-white font-semibold">2. Valida stories fácilmente</span>
              <p className="text-white/70 text-sm">Nuestro sistema te ayuda a comprobar que las stories son reales y cumplen tus requisitos.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Gift className="w-8 h-8 text-pink-400" />
            <div>
              <span className="text-white font-semibold">3. Premia a tus clientes</span>
              <p className="text-white/70 text-sm">Entrega recompensas y haz que quieran volver y recomendarte aún más.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="w-full bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-blue-500 py-10 px-4 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-white text-center mb-3">¿Listo para empezar?</h2>
        <button
          onClick={() => router.push("/providers/access")}
          className="w-full max-w-xs py-3 rounded-xl font-bold text-lg bg-white text-[#23243a] shadow-lg hover:scale-105 transition-transform mb-2"
        >
          Regístrate gratis ahora
        </button>
        <span className="text-xs text-white/90">Únete a la revolución del boca a boca digital</span>
      </section>
    </main>
  );
}
