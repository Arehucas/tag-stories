import React, { ReactNode } from "react";
import { Check } from 'lucide-react';

interface Step {
  title: string;
  description?: string | ReactNode;
}

interface StepsProps {
  steps: Step[];
  current: number; // 0-indexed
}

export default function Steps({ steps, current }: StepsProps) {
  // Separa pasos completados y el resto
  const completed = steps.map((s, i) => ({ ...s, i })).filter(s => s.i < current);
  const rest = steps.map((s, i) => ({ ...s, i })).filter(s => s.i >= current);
  const ordered = [...rest, ...completed];

  return (
    <div className="flex flex-col gap-4 w-full max-w-xs mx-auto mb-6">
      {ordered.map((step, idx) => (
        <div
          key={step.i}
          className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 ${
            step.i === current
              ? "border-fuchsia-500 bg-white/5 shadow-lg scale-105"
              : "border-white/10 bg-white/2 opacity-70"
          }`}
        >
          {step.i < current ? (
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500">
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
          ) : (
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-lg transition-all duration-300 ${
                step.i === current
                  ? "bg-gradient-to-br from-fuchsia-500 to-cyan-500 text-white"
                  : "bg-white/10 text-white/50"
              }`}
            >
              {step.i + 1}
            </div>
          )}
          <div className="flex-1">
            <div className="font-semibold text-white text-base mb-1">{step.title}</div>
            {step.i === current && step.description && (
              <div className="text-white/70 text-sm leading-tight">{step.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 