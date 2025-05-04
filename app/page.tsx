"use client";
import { useRouter } from "next/navigation";
import { Megaphone, Gift, Users, Zap, ShieldCheck, TrendingUp } from "lucide-react";

export default function Landing() {
  const router = useRouter();

  return (
    <main className="w-full min-h-screen flex flex-col items-center">
      {/* HERO */}
      <section className="relative w-full flex flex-col items-center justify-center pt-10 pb-16 px-4" style={{ minHeight: 400 }}>
        {/* Fondo gradiente animado tipo morphing */}
        <div className="hero-gradient-bg">
          <div className="hero-gradient-bg-inner" />
        </div>
        <div className="mb-4 z-10">
          <Megaphone className="w-16 h-16 text-fuchsia-400 drop-shadow-lg" />
        </div>
        <h1 className="text-3xl font-extrabold text-white text-center leading-tight mb-3 drop-shadow-lg z-10">
          Haz que tus clientes<br />
          <span className="text-pink-400">promocionen tu local</span>
        </h1>
        <p className="text-white/80 text-lg text-center mb-8 max-w-xs z-10 leading-tight">
          Convierte cada visita en una oportunidad de marketing real. Recompensa a quienes comparten tu negocio en Instagram Stories.
        </p>
        <div
          className="btn-gradient-border w-full max-w-xs mb-2 z-10"
        >
          <span
            className="w-full block rounded-xl cursor-pointer shadow-lg hover:bg-neutral-800 transition-colors py-3"
            onClick={() => router.push("/providers/access")}
          >
            Regístrate gratis
          </span>
        </div>
        <span className="text-xs text-white/60 z-10">Sin tarjeta, sin compromiso</span>
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
          <Gift className="w-10 h-10 text-pink-500 mb-1 icon-shake icon-shake-delay-2" />
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
        <div className="flex flex-col gap-0 w-full max-w-md">
          <div className="step-card">
            <Zap className="w-8 h-8 text-fuchsia-400" />
            <div>
              <span className="text-white font-semibold">1. Regístrate y configura tu campaña</span>
              <p className="text-white/70 text-sm">En menos de 2 minutos tendrás tu local listo para recibir stories.</p>
            </div>
          </div>
          <div className="step-card">
            <ShieldCheck className="w-10 h-10 text-blue-400" />
            <div>
              <span className="text-white font-semibold">2. Valida stories fácilmente</span>
              <p className="text-white/70 text-sm">Nuestro sistema te ayuda a comprobar que las stories son reales y cumplen tus requisitos.</p>
            </div>
          </div>
          <div className="step-card">
            <Gift className="w-8 h-8 text-pink-400 icon-shake icon-shake-delay-2" />
            <div>
              <span className="text-white font-semibold">3. Premia a tus clientes</span>
              <p className="text-white/70 text-sm">Entrega recompensas y haz que quieran volver y recomendarte aún más.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="w-full bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-blue-500 py-10 pb-40 px-4 flex flex-col items-center">
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
