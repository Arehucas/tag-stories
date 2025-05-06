"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useT } from '@/lib/useT';

export default function ProviderAccess() {
  const router = useRouter();
  const { status } = useSession();
  const t = useT();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/providers/dashboard");
    }
  }, [status, router]);

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] flex flex-col items-center">
      {/* Fondo animado tipo hero */}
      <div className="login-hero-bg">
        <div className="login-hero-bg-inner" />
      </div>
      <section className="relative w-full flex flex-col items-center justify-start pt-12 pb-8 px-4 max-w-md mx-auto">
        <h1 className="text-3xl font-extrabold text-white text-center leading-tight mb-3 drop-shadow-lg z-10">
          {t('access.title')}
        </h1>
        <p className="text-white/80 text-lg text-center mb-8 max-w-xs z-10 leading-tight">
          {t('access.description')}
        </p>
        <button
          onClick={() => signIn("google")}
          className="btn-google-gradient w-full max-w-xs mb-4 z-10"
        >
          <span>
            <svg width="28" height="28" viewBox="0 0 48 48" className="inline-block">
              <g>
                <path fill="#4285F4" d="M24 9.5c3.54 0 6.04 1.53 7.43 2.81l5.48-5.48C33.64 3.54 29.36 1.5 24 1.5 14.98 1.5 7.06 7.98 4.22 16.26l6.77 5.26C12.5 15.02 17.77 9.5 24 9.5z"/>
                <path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.43-4.74H24v9.04h12.4c-.54 2.9-2.18 5.36-4.64 7.04l7.18 5.6C43.94 37.02 46.1 31.22 46.1 24.5z"/>
                <path fill="#FBBC05" d="M10.99 28.24A14.48 14.48 0 0 1 9.5 24c0-1.48.25-2.92.7-4.24l-6.77-5.26A23.94 23.94 0 0 0 0 24c0 3.77.9 7.34 2.5 10.5l8.49-6.26z"/>
                <path fill="#EA4335" d="M24 46.5c6.48 0 11.92-2.14 15.9-5.84l-7.18-5.6c-2 1.4-4.54 2.24-8.72 2.24-6.23 0-11.5-5.52-12.99-12.74l-8.49 6.26C7.06 40.02 14.98 46.5 24 46.5z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </g>
            </svg>
            <span className="text-base font-medium">{t('access.googleButton')}</span>
          </span>
        </button>
        {process.env.NODE_ENV === "development" && (
          <button
            className="btn-google-gradient w-full max-w-xs mb-4 z-10"
            onClick={async () => {
              // Guardar sesión demo
              const email = "demo@demo.com";
              localStorage.setItem("demoSession", JSON.stringify({ user: { email, name: "Demo User" } }));
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
        )}
      </section>
      {/* Sección de los 3 pasos (igual que landing) */}
      <section className="w-full bg-[#23243a] py-10 px-4 flex flex-col gap-8 items-center">
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
      <footer className="w-full py-6 flex justify-center items-center bg-transparent">
        <button onClick={() => router.push("/")} className="text-white/70 hover:text-white underline text-base font-medium transition-colors">
          {t('access.backToHome')}
        </button>
      </footer>
    </div>
  );
} 