import React, { useState } from 'react';
import { usePTTStore } from '../store/usePTTStore';
import { CheckCircle, ChevronRight } from 'lucide-react';

const steps = [
  {
    target: 'layar-lcd',
    title: 'Layar LCD & Saluran',
    content: 'Di sini Anda dapat melihat nomor saluran Anda dan siapa saja yang sedang aktif. Putar knop atau tekan layar untuk mengganti saluran.',
  },
  {
    target: 'tombol-ptt',
    title: 'Tombol PTT',
    content: 'Tekan dan tahan tombol besar ini untuk berbicara. Lepaskan saat selesai (Ganti). Anda juga bisa menggunakan tombol Spasi di keyboard!',
  },
  {
    target: 'tombol-pengaturan',
    title: 'Pengaturan & Profil',
    content: 'Sesuaikan nama panggilan (Call Sign), foto profil, dan preferensi audio Anda di menu ini.',
  },
];

export const OnboardingTour: React.FC = () => {
  const { hasCompletedOnboarding, setHasCompletedOnboarding } = usePTTStore();
  const [currentStep, setCurrentStep] = useState(0);

  if (hasCompletedOnboarding) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setHasCompletedOnboarding(true);
    }
  };

  const handleSkip = () => {
    setHasCompletedOnboarding(true);
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300 font-sans">
      <div className="absolute top-10 right-10">
        <button
          onClick={handleSkip}
          className="text-white/50 hover:text-white text-sm font-medium transition-colors"
        >
          Lewati Panduan
        </button>
      </div>

      <div className="max-w-sm w-full bg-[#2a2d36] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/20 blur-3xl rounded-full pointer-events-none"></div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold tracking-wider text-green-400 uppercase">
            Panduan {currentStep + 1} dari {steps.length}
          </span>
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentStep ? 'bg-green-400' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-8">
          {step.content}
        </p>

        <button
          onClick={handleNext}
          className="w-full py-3 px-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
        >
          {currentStep === steps.length - 1 ? (
            <>
              Mulai Gunakan <CheckCircle className="w-5 h-5" />
            </>
          ) : (
            <>
              Lanjut <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
