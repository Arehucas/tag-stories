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
        {/* Botón de acceso: solo demo en localhost, solo Google en prod */}
        {isLocalhost ? (
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
              <svg width="28" height="28" viewBox="0 0 48 48" className="inline-block">
                <g>
                  <circle cx="24" cy="24" r="20" fill="#3a86ff" />
                  <text x="24" y="30" textAnchor="middle" fontSize="18" fill="#fff" fontFamily="Arial">D</text>
                </g>
              </svg>
              <span className="text-base font-medium">{t('access.demoButton')}</span>
            </span>
          </button>
        ) : (
          <button
            className="btn-google-gradient w-full max-w-xs mb-4"
            onClick={() => signIn('google')}
          >
            <span>
              <svg width="28" height="28" viewBox="0 0 48 48" className="inline-block">
                <g>
                  <path fill="#4285F4" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-4.1 5.5-7.3 5.5-4.4 0-8-3.6-8-8s3.6-8 8-8c2 0 3.8.7 5.2 1.9l6.2-6.2C34.5 9.5 29.6 7.5 24 7.5 14.6 7.5 7 15.1 7 24.5S14.6 41.5 24 41.5c9.4 0 17-7.6 17-17 0-1.1-.1-2.1-.4-3z"/>
                  <path fill="#34A853" d="M6.3 14.1l6.6 4.8C14.5 16.1 18.9 13 24 13c2 0 3.8.7 5.2 1.9l6.2-6.2C34.5 9.5 29.6 7.5 24 7.5c-6.6 0-12.2 3.8-15.2 9.1z"/>
                  <path fill="#FBBC05" d="M24 41.5c5.6 0 10.5-1.9 14.3-5.2l-6.6-5.4c-2 1.4-4.5 2.1-7.7 2.1-5.9 0-10.8-4-12.6-9.4l-6.5 5c3 5.3 8.6 8.9 15.1 8.9z"/>
                  <path fill="#EA4335" d="M43.6 20.5H42V20H24v8h11.3c-0.5 1.5-1.5 2.8-2.7 3.8l6.6 5.4c1.9-1.8 3.3-4.3 3.7-7.2z"/>
                </g>
              </svg>
              <span className="text-base font-medium">{t('access.googleButton')}</span>
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