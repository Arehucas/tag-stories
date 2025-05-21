"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import OnboardingSlider from '@/components/ui/OnboardingSlider';

export default function OnboardingSliderPage() {
  const router = useRouter();
  const handleSkip = useCallback(() => {
    router.replace('/providers/onboarding');
  }, [router]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Fondo animado tipo hero-gradient-bg */}
      <div className="hero-gradient-bg" style={{ top: 0, left: 0, right: 0, height: '40vh', position: 'absolute', zIndex: 0 }}>
        <div className="hero-gradient-bg-inner" />
      </div>
      <div className="w-full flex items-center justify-center relative z-10">
        <OnboardingSlider onSkip={handleSkip} />
      </div>
    </div>
  );
} 