import { initGlobalAudioContext } from './audioContext';

/**
 * Shared radio sound engine.
 *
 * Centralizes the oscillator-based UI sounds (press/release/chirp) that were
 * previously duplicated across usePttTransmit, useRadioOrchestrator and
 * useReactionSounds. Keeping them in one place guarantees consistent tuning
 * and avoids silent drift between screens.
 *
 * All functions are no-throw: audio feedback must never crash the UI.
 */

type TonePreset = 'press' | 'release' | 'chirp-join' | 'chirp-leave';

interface ToneSpec {
  type: OscillatorType;
  startFreq: number;
  endFreq: number;
  duration: number;
  peakGain: number;
}

const TONE_SPECS: Record<TonePreset, ToneSpec> = {
  // Mechanical key-click on press — clean 1kHz like the analog transceiver.
  press: { type: 'sine', startFreq: 1000, endFreq: 1000, duration: 0.08, peakGain: 0.38 },
  // Roger beep on release — distinct 1.1kHz pitch.
  release: { type: 'sine', startFreq: 1100, endFreq: 1100, duration: 0.08, peakGain: 0.38 },
  // Chirp when a user joins — rising 750→1250Hz.
  'chirp-join': { type: 'sine', startFreq: 750, endFreq: 1250, duration: 0.14, peakGain: 0.08 },
  // Chirp when a user leaves — falling 950→450Hz.
  'chirp-leave': { type: 'sine', startFreq: 950, endFreq: 450, duration: 0.18, peakGain: 0.08 },
};

/**
 * Play a preset tone through the shared AudioContext.
 * @param preset  which tone to play
 * @param volume  0–100 master volume; clamped to 70% for hearing safety
 */
export function playRadioTone(preset: TonePreset, volume = 100): void {
  try {
    const ctx = initGlobalAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const spec = TONE_SPECS[preset];
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = spec.type;
    osc.frequency.setValueAtTime(spec.startFreq, t);
    if (spec.endFreq !== spec.startFreq) {
      osc.frequency.exponentialRampToValueAtTime(spec.endFreq, t + spec.duration);
    }

    // Clamp to 70% of hardware capacity.
    const master = Math.min(0.7, (volume / 100) * 0.7);
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(master * spec.peakGain, t + 0.003);
    env.gain.setValueAtTime(master * spec.peakGain, t + spec.duration - 0.01);
    env.gain.exponentialRampToValueAtTime(0.001, t + spec.duration);

    osc.connect(env);
    env.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + spec.duration + 0.01);
  } catch (err) {
    console.warn('[radioSound] failed to play tone:', err);
  }
}

/** Convenience wrappers mirroring the old function names. */
export const playPressSound = (volume = 100) => playRadioTone('press', volume);
export const playReleaseSound = (volume = 100) => playRadioTone('release', volume);
export const playChirpSound = (isJoin: boolean, volume = 100) =>
  playRadioTone(isJoin ? 'chirp-join' : 'chirp-leave', volume);
