import { usePTTStore } from '../store/usePTTStore';

let globalAudioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!globalAudioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
};

export const startStreamAnalyzer = (
  stream: MediaStream,
  onProgress: (progress: number) => void
): (() => void) => {
  const ctx = getAudioContext();
  if (!ctx) return () => {};

  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Float32Array(bufferLength);
  let animationFrameId: number;

  const update = () => {
    analyser.getFloatTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / bufferLength);

    // Sama seperti transmisi: skalakan RMS ke 0-100
    const scaledProgress = Math.min(100, Math.round(rms * 400));
    onProgress(scaledProgress);

    animationFrameId = requestAnimationFrame(update);
  };

  update();

  return () => {
    cancelAnimationFrame(animationFrameId);
    try {
      source.disconnect();
    } catch (e) {
      // ignore
    }
    onProgress(0);
  };
};
