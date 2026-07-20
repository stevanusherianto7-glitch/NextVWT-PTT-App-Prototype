import { useState, useEffect, useRef } from 'react';
import { usePTTStore } from '../store/usePTTStore';
import { initGlobalAudioContext } from '../utils/audioContext';
import { playPressSound, playReleaseSound } from '../utils/radioSound';

interface UsePttTransmitProps {
  onPressStart: () => void;
  onPressEnd: () => void;
  isActive: boolean;
  isBusy: boolean;
}

export function usePttTransmit({
  onPressStart,
  onPressEnd,
  isActive,
  isBusy,
}: UsePttTransmitProps) {
  const [isDepressed, setIsDepressed] = useState(false);

  const isPowerOn = usePTTStore((state) => state.isPowerOn);
  const togglePtt = usePTTStore((state) => state.togglePtt);
  const toneOnStartEnd = usePTTStore((state) => state.toneOnStartEnd);
  const pttVolume = usePTTStore((state) => state.pttVolume);
  const vibrateOnStart = usePTTStore((state) => state.vibrateOnStart);

  // Sync callbacks to mutable refs to prevent stale closures in event listeners
  const onPressStartRef = useRef(onPressStart);
  const onPressEndRef = useRef(onPressEnd);

  onPressStartRef.current = onPressStart;
  onPressEndRef.current = onPressEnd;

  const initAudio = () => {
    return initGlobalAudioContext();
  };

  const triggerHaptic = (duration: number) => {
    if (!vibrateOnStart) return;
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(duration);
      } catch {
        // Safe fallback
      }
    }
  };

  const playSound = (type: 'press' | 'release', ctx: AudioContext | null) => {
    if (!toneOnStartEnd) return;
    if (ctx) {
      if (type === 'press') playPressSound(pttVolume);
      else playReleaseSound(pttVolume);
    }
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (isBusy) return;
    if (e.type === 'touchstart') {
      e.preventDefault();
    }
    setIsDepressed(true);
    triggerHaptic(15);
    const ctx = initAudio();

    if (!togglePtt && isPowerOn) {
      onPressStartRef.current();
      playSound('press', ctx);
    }
  };

  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (isBusy) return;
    if (e.type === 'touchend') {
      e.preventDefault();
    }

    const ctx = initAudio();
    if (isDepressed && isPowerOn) {
      if (togglePtt) {
        const nextState = !isActive;
        if (nextState) {
          onPressStartRef.current();
          playSound('press', ctx);
        } else {
          onPressEndRef.current();
          playSound('release', ctx);
        }
      } else {
        onPressEndRef.current();
        playSound('release', ctx);
      }
      triggerHaptic(10);
    }
    setIsDepressed(false);
  };

  const handleMouseLeave = () => {
    if (isBusy) return;
    const ctx = initAudio();
    if (isDepressed && isPowerOn) {
      if (!togglePtt) {
        onPressEndRef.current();
        playSound('release', ctx);
      }
      triggerHaptic(5);
    }
    setIsDepressed(false);
  };

  // Keyboard Spacebar event listener.
  // triggerHaptic is stabilized (no external deps) so it is safe to omit from
  // the dependency array; isDepressed is intentionally excluded to avoid
  // re-binding the global listener on every press/release cycle.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (e.repeat) return;
        e.preventDefault();
        if (!isPowerOn || isBusy) return;
        setIsDepressed(true);
        triggerHaptic(15);
        const ctx = initAudio();

        if (!togglePtt) {
          onPressStartRef.current();
          playSound('press', ctx);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isPowerOn || isBusy) return;

        const ctx = initAudio();
        if (isDepressed) {
          if (togglePtt) {
            const nextState = !isActive;
            if (nextState) {
              onPressStartRef.current();
              playSound('press', ctx);
            } else {
              onPressEndRef.current();
              playSound('release', ctx);
            }
          } else {
            onPressEndRef.current();
            playSound('release', ctx);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPowerOn, isBusy, isActive, togglePtt, toneOnStartEnd, pttVolume, vibrateOnStart]);

  return {
    isDepressed,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave,
  };
}
