import React from "react";

interface HeroGradientProps {
  colorFrom: string;
  colorTo: string;
  height?: number | string;
  className?: string;
}

export default function HeroGradient({ colorFrom, colorTo, height = 400, className = "" }: HeroGradientProps) {
  return (
    <div
      className={`w-full left-0 right-0 absolute z-0 ${className}`}
      style={{
        top: 0,
        height: typeof height === "number" ? `${height}px` : height,
        background: `linear-gradient(180deg, ${colorFrom} 0%, ${colorTo} 100%)`,
      }}
    />
  );
} 