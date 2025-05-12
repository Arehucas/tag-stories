"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useT } from '@/lib/useT';

export default function ProviderAccess() {
  const router = useRouter();
  const { status } = useSession();
  const t = useT();
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLocalhost(window.location.hostname === 'localhost');
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/providers/dashboard");
    }
  }, [status, router]);

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333] flex flex-col items-center">
      {/* Fondo animado tipo hero */}
      <div
        className="hero-gradient-bg"
        style={{
          top: 0,
          left: 0,
          right: 0,
          height: isLocalhost ? 400 : 335,
          maxHeight: isLocalhost ? 400 : 335,
          position: 'absolute',
          zIndex: 0,
        }}
      >
        <div className="hero-gradient-bg-inner" />
      </div>
      <section
        className="relative w-full flex flex-col items-center justify-start pt-12 pb-8 px-4 max-w-md mx-auto z-10"
        style={{
          height: isLocalhost ? 400 : 335,
          maxHeight: isLocalhost ? 400 : 335,
        }}
      >
        <h1 className="text-3xl font-extrabold text-white text-center leading-tight mb-3 drop-shadow-lg">
          {t('access.title')}
        </h1>
        <p className="text-white/80 text-lg text-center mb-8 max-w-xs">
          {t('access.description')}
        </p>
        {/* Botón de acceso: Google siempre visible, demo solo si es localhost */}
        <button
          className="btn-google-gradient w-full max-w-xs mb-4"
          onClick={() => signIn('google')}
        >
          <span>
            <svg width="24" height="24" viewBox="0 0 48 48" className="inline-block" style={{marginRight: 12}}>
              <g>
                <path fill="#4285F4" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7-11.3 7-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-18h-21v-7h12.6z"/>
                <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c2.7 0 5.2.9 7.2 2.5l6-6C34.5 5.1 29.5 3 24 3 15.1 3 7.4 8.7 6.3 14.7z"/>
                <path fill="#FBBC05" d="M24 45c5.5 0 10.5-1.8 14.4-4.9l-6.7-5.5C29.5 36.9 26.9 38 24 38c-5.6 0-10.3-3.7-12-8.7l-6.6 5.1C7.4 39.3 15.1 45 24 45z"/>
                <path fill="#EA4335" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.1 3-3.5 5.2-6.3 6.1l6.7 5.5C40.6 36.2 43.6 29.7 43.6 20.5z"/>
              </g>
            </svg>
            <span className="text-base font-medium">{t('access.googleButton')}</span>
          </span>
        </button>
        {isLocalhost && (
          <button
            className="btn-google-gradient w-full max-w-xs mb-4"
            onClick={async () => {
              // Guardar sesión demo con provider completo o solo email
              const email = "demo@demo.com";
              const res = await fetch(`/api/provider/by-email?email=${encodeURIComponent(email)}`);
              let provider;
              if (res.ok) {
                provider = await res.json();
              } else {
                provider = { email };
              }
              localStorage.setItem("demoSession", JSON.stringify({ provider }));
              window.location.href = "/providers/dashboard";
            }}
          >
            <span>
              <svg width="24" height="24" viewBox="0 0 48 48" className="inline-block" style={{marginRight: 12}}>
                <g>
                  <path fill="#4285F4" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7-11.3 7-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-18h-21v-7h12.6z"/>
                  <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c2.7 0 5.2.9 7.2 2.5l6-6C34.5 5.1 29.5 3 24 3 15.1 3 7.4 8.7 6.3 14.7z"/>
                  <path fill="#FBBC05" d="M24 45c5.5 0 10.5-1.8 14.4-4.9l-6.7-5.5C29.5 36.9 26.9 38 24 38c-5.6 0-10.3-3.7-12-8.7l-6.6 5.1C7.4 39.3 15.1 45 24 45z"/>
                  <path fill="#EA4335" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.1 3-3.5 5.2-6.3 6.1l6.7 5.5C40.6 36.2 43.6 29.7 43.6 20.5z"/>
                </g>
              </svg>
              <span className="text-base font-medium">{t('access.demoButton')}</span>
            </span>
          </button>
        )}
      </section>
      {/* Sección de los 3 pasos (igual que landing) */}
      <section className="w-full bg-[#18122b]/80 py-10 px-4 flex flex-col gap-8 items-center z-10">
        <h2 className="text-2xl font-bold text-white text-center mb-2">{t('access.howItWorksTitle')}</h2>
        <div className="flex flex-col gap-0 w-full max-w-md">
          <div className="step-card">
            <svg className="w-8 h-8 text-fuchsia-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <div>
              <span className="text-white font-semibold">{t('access.step1Title')}</span>
              <p className="text-white/70 text-sm">{t('access.step1Description')}</p>
            </div>
          </div>
          <div className="step-card">
            <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            <div>
              <span className="text-white font-semibold">{t('access.step2Title')}</span>
              <p className="text-white/70 text-sm">{t('access.step2Description')}</p>
            </div>
          </div>
          <div className="step-card">
            <svg className="w-8 h-8 text-pink-400 icon-shake icon-shake-delay-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="8" rx="2" /><path d="M16 8V6a4 4 0 0 0-8 0v2" /></svg>
            <div>
              <span className="text-white font-semibold">{t('access.step3Title')}</span>
              <p className="text-white/70 text-sm">{t('access.step3Description')}</p>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="w-full py-6 flex justify-center items-center bg-transparent z-10">
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 rounded-full border border-violet-900 text-white/90 bg-gradient-to-r from-[#18122b] to-[#0a0618] hover:bg-violet-900/30 transition text-base font-medium shadow-lg"
        >
          {t('access.backToHome')}
        </button>
      </footer>
    </div>
  );
} 