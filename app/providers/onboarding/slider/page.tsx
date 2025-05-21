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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333]">
      <OnboardingSlider onSkip={handleSkip} />
    </div>
  );
} 