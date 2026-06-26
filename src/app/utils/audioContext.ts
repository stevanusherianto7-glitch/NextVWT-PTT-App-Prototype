export let globalAudioContext: AudioContext | null = null;

export const initGlobalAudioContext = () => {
  if (typeof window === 'undefined') return null;

  if (!globalAudioContext) {
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      globalAudioContext = new AudioContextClass();
    }
  }

  if (globalAudioContext && globalAudioContext.state === 'suspended') {
    globalAudioContext.resume().catch(console.warn);
  }

  return globalAudioContext;
};

export const __resetAudioContextForTest = () => {
  globalAudioContext = null;
};
