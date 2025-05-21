import Image from 'next/image';
import { useT } from '@/lib/useT';
import { Carousel, CarouselContent, CarouselItem } from './carousel';
import { Button } from './button';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingSliderProps {
  onSkip: () => void;
}

const SLIDES = [
  {
    image: '/logos/logo-provider-default.jpg',
    titleKey: 'onboardingSlider.steps.0.title',
    descKey: 'onboardingSlider.steps.0.description',
  },
  {
    image: '/logos/logo-provider-default.jpg',
    titleKey: 'onboardingSlider.steps.1.title',
    descKey: 'onboardingSlider.steps.1.description',
  },
  {
    image: '/logos/logo-provider-default.jpg',
    titleKey: 'onboardingSlider.steps.2.title',
    descKey: 'onboardingSlider.steps.2.description',
  },
];

export function OnboardingSlider({ onSkip }: OnboardingSliderProps) {
  const t = useT();
  const [current, setCurrent] = useState(0);
  const emblaApiRef = useRef<any>(null);

  const handleNext = () => {
    if (emblaApiRef.current) {
      emblaApiRef.current.scrollNext();
    }
  };

  useEffect(() => {
    // Esto es solo para forzar un re-render si necesitas hacks de layout, pero aquí no es necesario
  }, [current]);

  return (
    <div className="w-full max-w-xs mx-auto flex flex-col items-center gap-6">
      <Carousel
        className="w-full"
        opts={{ loop: false, duration: 20 }}
        setApi={api => {
          emblaApiRef.current = api;
          api?.on('select', () => setCurrent(api.selectedScrollSnap()));
        }}
      >
        <CarouselContent>
          {SLIDES.map((slide, idx) => (
            <CarouselItem key={idx} className="flex flex-col items-center">
              <div className="w-70 h-70 rounded-xl overflow-hidden bg-zinc-900 flex items-center justify-center mb-8">
                <Image src={slide.image} alt="Onboarding" width={280} height={280} className="object-cover w-full h-full" />
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-2">{t(slide.titleKey)}</h3>
              <p className="text-sm text-zinc-300 text-center">{t(slide.descKey)}</p>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="flex gap-2 mt-2">
        {SLIDES.map((_, idx) => (
          <span
            key={idx}
            className={`w-2 h-2 rounded-full transition-all ${current === idx ? 'bg-fuchsia-400 scale-125' : 'bg-zinc-600'}`}
            aria-label={current === idx ? t('onboardingSlider.currentStep') : undefined}
          />
        ))}
      </div>
      <div className="relative w-full h-[56px] mt-6">
        <motion.button
          type="button"
          onClick={e => {
            e.stopPropagation();
            if (current < SLIDES.length - 1) {
              if (emblaApiRef.current) {
                emblaApiRef.current.scrollNext();
              }
            } else {
              onSkip();
            }
          }}
          className={
            current === SLIDES.length - 1
              ? "px-6 py-3 rounded-full border border-blue-700 text-blue-100 bg-gradient-to-r from-blue-900 to-blue-800 hover:bg-blue-800/80 transition text-base font-medium shadow-lg z-10 w-full"
              : "absolute right-0 top-0 text-white/70 hover:text-white font-normal text-base text-center cursor-pointer bg-transparent border-none outline-none min-w-[90px] px-0 py-0 w-[90px]"
          }
          initial={false}
          animate={
            current === SLIDES.length - 1
              ? { left: 0, right: 0, width: '100%', position: 'absolute', marginLeft: 'auto', marginRight: 'auto' }
              : { right: 0, left: 'auto', width: 90, position: 'absolute', marginLeft: 0, marginRight: 0 }
          }
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          style={{ top: 0, minWidth: 0 }}
        >
          {current === SLIDES.length - 1 ? 'Empezar' : 'Siguiente'}
        </motion.button>
      </div>
    </div>
  );
}

export default OnboardingSlider; 