import React from "react";

export default function LoaderBolas({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333] relative">
      <div className="loader-wrapper-bolas-blue">
        <div className="ball-bolas-blue" />
        <div className="ball-bolas-blue" />
        <div className="ball-bolas-blue" />
      </div>
      <svg width="0" height="0">
        <defs>
          <filter id="blue-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="0.22 0 0 0 0  0 0.53 1 0 0  0 0.53 1 0 0  0 0 0 28 -10" result="filter" />
            <feComposite in="SourceGraphic" in2="filter" operator="atop" />
          </filter>
        </defs>
      </svg>
      <span className="text-white text-base text-center mt-5" style={{ paddingTop: 18 }}>{text}</span>
      <style jsx>{`
        .loader-wrapper-bolas-blue {
          position: relative;
          width: 60px;
          height: 60px;
          filter: url('#blue-glow');
        }
        .ball-bolas-blue {
          width: 30px;
          height: 30px;
          position: absolute;
          top: 15px;
          left: 15px;
          background: #3a86ff;
          border-radius: 100%;
        }
        .ball-bolas-blue:nth-child(1) {
          animation: x-axis-lateral 2s infinite alternate ease-in-out;
        }
        .ball-bolas-blue:nth-child(2) {
          animation: x-axis 2s infinite alternate ease-in-out;
        }
        .ball-bolas-blue:nth-child(3) {
          animation: x-axis-lateral 2s infinite alternate ease;
          left: 45px;
          top: 45px;
        }
        @keyframes x-axis {
          0% { transform: translate(-48px, 0); }
          100% { transform: translate(48px, 0); }
        }
        @keyframes x-axis-lateral {
          0% { transform: translate(-18px, 0); }
          100% { transform: translate(18px, 0); }
        }
      `}</style>
    </div>
  );
} 