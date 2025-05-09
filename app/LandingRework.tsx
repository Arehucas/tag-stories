"use client";
import Image from "next/image";
import { Gift, Users, Zap, ShieldCheck, TrendingUp, Star, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from './LandingRework.module.css';
import { useT } from '@/lib/useT';
import common from '@/locales/es/common.json';

const CLIENT_LOGOS = [
  "/logos/logo-taun-texto-blanco.svg",
  "/logos/logo-taun-texto-blanco.svg",
  "/logos/logo-taun-texto-blanco.svg",
  "/logos/logo-taun-texto-blanco.svg",
];

const FAQS = [
  {
    q: "¿Cómo funciona la validación de stories?",
    a: "Validamos automáticamente que los stories cumplan los requisitos de la campaña antes de otorgar recompensas.",
  },
  {
    q: "¿Qué tipo de recompensas puedo ofrecer?",
    a: "Puedes ofrecer descuentos, productos, puntos o cualquier incentivo personalizado para tus clientes.",
  },
  {
    q: "¿Puedo integrar mi cuenta de Instagram fácilmente?",
    a: "Sí, la integración es rápida y segura, solo necesitas unos clics para conectar tu cuenta.",
  },
  {
    q: "¿Puedo personalizar las condiciones de la campaña?",
    a: "Sí, puedes definir requisitos como hashtags, menciones o duración mínima de la story.",
  },
  {
    q: "¿Qué soporte ofrecen si tengo dudas?",
    a: "Nuestro equipo te ayuda por chat y email para que saques el máximo partido a la plataforma.",
  },
];

export default function LandingRework() {
  const router = useRouter();
  const t = useT();

  return (
    <main className={`w-full min-h-screen flex flex-col items-center bg-[#0a0618] px-0 pb-12 relative overflow-x-hidden ${styles.landingBody}`}>
      {/* ANIMACIÓN DE BACKGROUND HERO SOLO PARA LANDING */}
      <div className="hero-gradient-bg landing-hero-gradient-bg" style={{ top: 0, left: 0, right: 0, height: 420, position: 'absolute', zIndex: 0, overflow: 'visible' }}>
        <div className={`hero-gradient-bg-inner landing-hero-gradient-bg-inner ${styles['landing-hero-gradient-bg-inner']}`} />
      </div>

      {/* HERO */}
      <section className="w-full flex flex-col items-center justify-center pt-16 pb-14 px-4 relative" style={{ background: 'transparent', zIndex: 2 }}>
        <div className="w-full flex flex-col items-center gap-6 max-w-lg mx-auto text-center">
          <div className="w-full bg-transparent flex flex-col items-center justify-center" style={{paddingTop: 0, paddingBottom: 0}}>
            <Image
              src="/logos/logo-taun-texto-blanco.svg"
              alt="Taun.me logo"
              width={90}
              height={18}
              priority
              style={{ marginBottom: 20, display: 'block', opacity: 0.4 }}
            />
            <div style={{ width: '75%', height: 2, background: 'rgba(229,231,235,0.1)', borderRadius: 1, margin: '0 auto' }} />
          </div>
          <h1 className="text-4xl font-extrabold text-white text-center leading-tight mb-2">{t('landing_rework.hero_title')}</h1>
          <p className="text-white/80 text-lg text-center mb-4 max-w-md mx-auto">{t('landing_rework.hero_desc')}</p>
          <div className="w-full max-w-xs mb-2 mx-auto">
            <button
              onClick={() => router.push("/providers/access")}
              className={styles.landingBtn}
            >
              {t('landing_rework.cta_try')}
            </button>
          </div>
          <span className="text-xs text-white/60 mx-auto mt-[-8px]">{t('landing_rework.cta_note_card')}</span>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="w-full px-4 pb-14 flex flex-col items-center justify-center text-center">
        <div className="w-full flex flex-col md:flex-row gap-8 items-center justify-center">
          <div className="flex-1 rounded-xl bg-[#23243a] border border-violet-900 shadow-lg p-7 flex flex-col items-center gap-2 max-w-xs mx-auto">
            <TrendingUp className="w-10 h-10 text-blue-400 mb-1" />
            <h3 className="text-xl font-bold text-white text-center">Aumenta tu visibilidad</h3>
            <p className="text-white/70 text-center text-base">Tus clientes comparten stories y tu marca llega a nuevas audiencias de forma orgánica.</p>
          </div>
          <div className="flex-1 max-w-xs mx-auto mb-0 rounded-xl border-2 border-violet-500 bg-[#18122b] shadow p-7 flex flex-col items-center gap-2">
            <Gift className="w-10 h-10 text-pink-400 mb-1 icon-shake icon-shake-delay-2" />
            <h3 className="text-xl font-bold text-white text-center">Recompensas automáticas</h3>
            <p className="text-white/80 text-center text-base">Premia a tus clientes sin esfuerzo. El sistema valida y entrega recompensas automáticamente.</p>
          </div>
          <div className="flex-1 rounded-xl bg-[#23243a] border border-violet-900 shadow-lg p-7 flex flex-col items-center gap-2 max-w-xs mx-auto">
            <Users className="w-10 h-10 text-cyan-400 mb-1" />
            <h3 className="text-xl font-bold text-white text-center">Crecimiento orgánico</h3>
            <p className="text-white/70 text-center text-base">Gana seguidores reales y construye una comunidad fiel alrededor de tu marca.</p>
          </div>
        </div>
        <div className="w-full max-w-xs mt-8 mx-auto">
          <button
            onClick={() => router.push("/providers/access")}
            className={styles.landingBtn}
          >
            ¡Probarlo gratis!
          </button>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="w-full py-14 px-4 flex flex-col items-center justify-center bg-gradient-to-b from-[#6c3cff] via-[#432c7a] to-[#18122b] border-t border-violet-950/40 text-center">
        <h2 className="text-2xl font-bold text-white text-center mb-8 mx-auto">¿Cómo funciona?</h2>
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl justify-center mx-auto">
          <div className="flex-1 flex flex-col items-center gap-2 bg-[#432c7a]/60 rounded-xl border border-violet-400/30 p-6 max-w-xs mx-auto">
            <Zap className="w-8 h-8 text-fuchsia-400" />
            <span className="text-white font-semibold">Regístrate y configura tu campaña</span>
            <p className="text-white/80 text-sm text-center">Crea tu cuenta, conecta tu Instagram y define las condiciones de tu campaña.</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-2 bg-[#6c3cff]/30 rounded-xl border border-violet-400/30 p-6 max-w-xs mx-auto">
            <ShieldCheck className="w-10 h-10 text-blue-200" />
            <span className="text-white font-semibold">Validamos los stories</span>
            <p className="text-white/80 text-sm text-center">Nuestro sistema verifica automáticamente que los stories cumplan los requisitos.</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-2 bg-[#432c7a]/60 rounded-xl border border-violet-400/30 p-6 max-w-xs mx-auto">
            <Gift className="w-8 h-8 text-pink-300 icon-shake icon-shake-delay-2" />
            <span className="text-white font-semibold">Premiamos a tus clientes</span>
            <p className="text-white/80 text-sm text-center">Tus clientes reciben su recompensa sin que tengas que hacer nada.</p>
          </div>
        </div>
      </section>

      {/* LOGOS DE CLIENTES */}
      <section className="w-full py-8 px-4 flex flex-col items-center bg-gradient-to-b from-[#18122b] to-[#23243a] border-t border-violet-950/40 text-center">
        <h2 className="text-lg font-semibold text-white mb-4 text-center mx-auto">Confían en nosotros</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 p-4 md:gap-6 md:p-0 mx-auto w-full max-w-2xl">
          {CLIENT_LOGOS.map((logo, i) => (
            <Image key={i} src={logo} alt="Logo cliente" width={120} height={40} className="opacity-80 grayscale hover:grayscale-0 transition-all mx-auto" />
          ))}
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="w-full py-14 px-4 flex flex-col md:flex-row gap-8 items-center justify-center bg-[#18122b] border-t border-violet-950/40 text-center">
        {/* 5 estrellas */}
        <div className="flex-1 rounded-xl bg-[#23243a] border border-violet-900 shadow-lg p-7 flex flex-col items-center max-w-xs mx-auto">
          <div className="flex items-center justify-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400" fill="#facc15" stroke="#facc15" />
            ))}
          </div>
          <span className="font-semibold text-white text-lg mb-1">María López</span>
          <span className="text-white/80 text-base mb-1">MarcaX</span>
          <span className="text-white/60 text-sm mb-3">CMO</span>
          <p className="text-white text-base text-center mb-0">&quot;La plataforma nos ayudó a aumentar la visibilidad y automatizar las recompensas. ¡Súper recomendable!&quot;</p>
        </div>
        {/* 4.5 estrellas */}
        <div className="flex-1 rounded-xl bg-[#23243a] border border-violet-900 shadow-lg p-7 flex flex-col items-center max-w-xs mx-auto">
          <div className="flex items-center justify-center mb-2">
            {[...Array(4)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400" fill="#facc15" stroke="#facc15" />
            ))}
            <Star className="w-5 h-5 text-yellow-400 opacity-50" />
          </div>
          <span className="font-semibold text-white text-lg mb-1">Juan Pérez</span>
          <span className="text-white/80 text-base mb-1">EmpresaY</span>
          <span className="text-white/60 text-sm mb-3">Growth Manager</span>
          <p className="text-white text-base text-center mb-0">&quot;El proceso es simple y los resultados se ven en las métricas. Excelente soporte y experiencia.&quot;</p>
        </div>
      </section>

      {/* FAQS */}
      <section className="w-full py-14 px-4 flex flex-col items-center bg-gradient-to-b from-[#23243a] to-[#18122b] border-t border-violet-950/40 text-center">
        <h2 className="text-2xl font-bold text-white text-center mb-8 mx-auto">Preguntas frecuentes</h2>
        <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-[#18122b] rounded-lg border border-violet-950/60 shadow p-4 mx-auto text-left">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="w-5 h-5 text-fuchsia-500" />
                <span className="font-semibold text-white">{faq.q}</span>
              </div>
              <p className="text-white/80 text-base ml-7">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="w-full py-14 px-4 flex flex-col items-center bg-[#18122b] border-t border-violet-950/40 text-center">
        <div className="max-w-lg w-full flex flex-col items-center mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-3">¿Listo para empezar?</h2>
          <button
            onClick={() => router.push("/providers/access")}
            className={styles.landingBtn}
          >
            Crear cuenta gratis
          </button>
          <span className="text-xs text-white/60 mx-auto mt-3 block">Sin compromiso. Cancela cuando quieras.</span>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-8 px-4 flex flex-col items-center bg-gradient-to-b from-[#18122b] to-[#0a0618] border-t border-violet-950/40 text-center">
        <Image src="/logos/logo-taun-texto-blanco.svg" alt="Logo" width={100} height={30} className="mb-2 mx-auto" />
        <span className="text-white/60 text-xs text-center mx-auto">© {new Date().getFullYear()} Taun. Todos los derechos reservados.</span>
      </footer>
    </main>
  );
} 