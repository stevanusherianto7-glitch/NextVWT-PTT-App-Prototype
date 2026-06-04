import { useState, useRef, useEffect } from 'react';
import { usePTTStore } from '../store/usePTTStore';

interface PTTButtonProps {
  onPressStart: () => void;
  onPressEnd: () => void;
  isActive?: boolean;
}

const createStaticNoise = (
  ctx: AudioContext,
  masterGain: GainNode,
  duration: number,
  startTime: number
) => {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1; // white noise
  }
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 1200; // Warmer, more mid-focused radio speaker frequency
  bandpass.Q.value = 1.2;

  const staticGain = ctx.createGain();
  staticGain.gain.setValueAtTime(0.28, startTime); // Heavy, clear static presence
  staticGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

  noiseSource.connect(bandpass);
  bandpass.connect(staticGain);
  staticGain.connect(masterGain);

  noiseSource.start(startTime);
  noiseSource.stop(startTime + duration);
};

const playRadioSound = (
  type: 'press' | 'release',
  ctx: AudioContext,
  toneOnStartEnd: boolean,
  pttVolume: number
) => {
  if (!toneOnStartEnd) return;
  try {
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNode.gain.value = 0.35 * (pttVolume / 100); // Scale volume dynamically

    if (type === 'press') {
      // Authentic dual-tone metallic pre-chirp (vintage trunking tone)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const chirpGain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(950, ctx.currentTime);
      osc2.frequency.setValueAtTime(1400, ctx.currentTime);

      chirpGain.gain.setValueAtTime(0, ctx.currentTime);
      chirpGain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.015);
      chirpGain.gain.setValueAtTime(0.35, ctx.currentTime + 0.08);
      chirpGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc1.connect(chirpGain);
      osc2.connect(chirpGain);
      chirpGain.connect(gainNode);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.15);

      // Short microphone key click static hum
      createStaticNoise(ctx, gainNode, 0.07, ctx.currentTime);
    } else {
      // 1. Heavy squelch tail ("chhhkkk") on release
      const squelchDuration = 0.22;
      createStaticNoise(ctx, gainNode, squelchDuration, ctx.currentTime);

      // 2. High-pitch Motorola-style Roger Beep tail
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1380, ctx.currentTime + 0.15); // plays as squelch tail is ending

      const beepGain = ctx.createGain();
      beepGain.gain.setValueAtTime(0, ctx.currentTime + 0.15);
      beepGain.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 0.17); // sharp attack
      beepGain.gain.setValueAtTime(0.45, ctx.currentTime + 0.26); // sustain
      beepGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.33); // decay

      osc.connect(beepGain);
      beepGain.connect(gainNode);

      osc.start(ctx.currentTime + 0.15);
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (err) {
    console.warn('Audio playback failed', err);
  }
};

export function PTTButton({ onPressStart, onPressEnd, isActive = false }: PTTButtonProps) {
  const [isDepressed, setIsDepressed] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Settings and states from Zustand store
  const isPowerOn = usePTTStore((state) => state.isPowerOn);
  const togglePtt = usePTTStore((state) => state.togglePtt);
  const toneOnStartEnd = usePTTStore((state) => state.toneOnStartEnd);
  const pttVolume = usePTTStore((state) => state.pttVolume);
  const vibrateOnStart = usePTTStore((state) => state.vibrateOnStart);
  const pttSize = usePTTStore((state) => state.pttSize);
  const pttBottom = usePTTStore((state) => state.pttBottom);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
  };

  const triggerHaptic = (duration: number) => {
    if (!vibrateOnStart) return;
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(duration);
      } catch (e) {
        // Safe fallback for restricted vibration contexts
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.type === 'touchstart') {
      e.preventDefault();
    }
    setIsDepressed(true);
    triggerHaptic(15);
    initAudio();

    if (!togglePtt && isPowerOn) {
      onPressStart();
      if (audioCtxRef.current)
        playRadioSound('press', audioCtxRef.current, toneOnStartEnd, pttVolume);
    }
  };

  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.type === 'touchend') {
      e.preventDefault();
    }

    if (isDepressed && isPowerOn) {
      if (togglePtt) {
        const nextState = !isActive;
        if (nextState) {
          onPressStart();
          if (audioCtxRef.current)
            playRadioSound('press', audioCtxRef.current, toneOnStartEnd, pttVolume);
        } else {
          onPressEnd();
          if (audioCtxRef.current)
            playRadioSound('release', audioCtxRef.current, toneOnStartEnd, pttVolume);
        }
      } else {
        onPressEnd();
        if (audioCtxRef.current)
          playRadioSound('release', audioCtxRef.current, toneOnStartEnd, pttVolume);
      }
      triggerHaptic(10);
    }
    setIsDepressed(false);
  };

  const handleMouseLeave = () => {
    if (isDepressed && isPowerOn) {
      if (!togglePtt) {
        onPressEnd();
        if (audioCtxRef.current)
          playRadioSound('release', audioCtxRef.current, toneOnStartEnd, pttVolume);
      }
      triggerHaptic(5);
    }
    setIsDepressed(false);
  };

  // Keyboard Spacebar event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (e.repeat) return;
        e.preventDefault(); // Prevent page scroll
        if (!isPowerOn) return;
        setIsDepressed(true);
        triggerHaptic(15);
        initAudio();

        if (!togglePtt) {
          onPressStart();
          if (audioCtxRef.current)
            playRadioSound('press', audioCtxRef.current, toneOnStartEnd, pttVolume);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent page scroll
        if (!isPowerOn) return;

        if (isDepressed) {
          if (togglePtt) {
            const nextState = !isActive;
            if (nextState) {
              onPressStart();
              if (audioCtxRef.current)
                playRadioSound('press', audioCtxRef.current, toneOnStartEnd, pttVolume);
            } else {
              onPressEnd();
              if (audioCtxRef.current)
                playRadioSound('release', audioCtxRef.current, toneOnStartEnd, pttVolume);
            }
          } else {
            onPressEnd();
            if (audioCtxRef.current)
              playRadioSound('release', audioCtxRef.current, toneOnStartEnd, pttVolume);
          }
          triggerHaptic(10);
        }
        setIsDepressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    isPowerOn,
    isActive,
    isDepressed,
    togglePtt,
    toneOnStartEnd,
    pttVolume,
    vibrateOnStart,
    onPressStart,
    onPressEnd,
  ]);

  // Calculate dynamic scale factor and vertical offset
  const scaleFactor = 0.75 + (pttSize / 100) * 0.5; // at 30: 0.9, at 100: 1.25
  const yOffset = (50 - pttBottom) * 1.2; // vertical position adjustment

  return (
    <div
      className="relative flex items-center justify-center p-1"
      style={{
        width: '338px',
        height: '108px',
        borderRadius: '54px',
        background: 'transparent',
        boxShadow: isDepressed
          ? 'inset 0 5px 10px rgba(0,0,0,0.3)'
          : 'inset 0 3px 6px rgba(0,0,0,0.18)',
        transform: `translateY(${yOffset}px) scale(${scaleFactor})`,
        transition: 'transform 0.12s ease-out, box-shadow 0.06s ease-in-out',
      }}
    >
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onTouchCancel={handleMouseLeave}
        className="relative w-[326px] h-[96px] flex items-center justify-center overflow-hidden focus:outline-none"
        style={{
          borderRadius: '48px',
          background: !isPowerOn
            ? 'linear-gradient(to bottom, #a3a3a3 0%, #737373 100%)' // Gray when power is off
            : isActive
              ? 'linear-gradient(to bottom, #d62828 0%, #a01010 100%)' // Red when active
              : 'linear-gradient(to bottom, #2cdb66 0%, #19ba42 100%)', // Brighter base to look more convex
          boxShadow: isDepressed
            ? 'inset 0 8px 12px rgba(0,0,0,0.85), inset 0 -2px 3px rgba(0,0,0,0.2)'
            : isActive
              ? 'inset 0 3px 6px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.3)'
              : 'inset 0 3px 6px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.15), 0 4px 6px rgba(0,0,0,0.25)',
          transform: isDepressed ? 'translateY(4px)' : 'translateY(0)',
          border: !isPowerOn
            ? '1px solid #666666'
            : isActive
              ? '1px solid #730e0e'
              : '1px solid #149c35',
          transition: 'transform 0.06s ease-in-out, box-shadow 0.06s ease-in-out',
        }}
      >
        <span
          className="relative z-10"
          style={{
            color: '#ffffff',
            fontSize: '44px',
            fontWeight: 800,
            letterSpacing: '3px',
            textShadow: isActive
              ? '0 0 12px rgba(255, 255, 255, 0.6)'
              : '1px 1px 2px rgba(0,0,0,0.3)',
          }}
        >
          PTT
        </span>

        {/* Top inner glass highlight (convex effect) */}
        <div
          className="absolute top-0.5 left-2 right-2 h-[34px] rounded-[34px] pointer-events-none transition-opacity duration-300"
          style={{
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.0) 100%)',
            opacity: isActive && !isDepressed ? 0.6 : isDepressed ? 0.2 : 1,
          }}
        />
      </button>
    </div>
  );
}
