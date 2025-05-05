import React from "react";

export default function LoaderBolas({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="loader-wrapper-bolas">
        <div className="ball-bolas" />
        <div className="ball-bolas" />
        <div className="ball-bolas" />
      </div>
      <svg width="0" height="0">
        <defs>
          <filter id="pink-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -10" result="filter" />
            <feComposite in="SourceGraphic" in2="filter" operator="atop" />
          </filter>
        </defs>
      </svg>
      <span className="text-white text-base text-center mt-5" style={{ paddingTop: 18 }}>{text}</span>
    </div>
  );
} 