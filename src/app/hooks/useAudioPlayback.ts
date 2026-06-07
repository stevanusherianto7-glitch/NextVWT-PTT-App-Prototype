import { useRef, useCallback } from 'react';
import { usePTTStore } from '../store/usePTTStore';

// Helper: Convert Base64 string to ArrayBuffer
export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Helper: Convert ArrayBuffer to Base64 string
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

export function useAudioPlayback() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextPlaybackTimeRef = useRef<number>(0);

  // Initialize Audio Context lazily
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Play an incoming Base64 voice chunk smoothly (used when WebRTC is not active)
  const playAudioChunk = useCallback(
    async (base64Chunk: string, hasActivePeer: (userId: string) => boolean) => {
      const store = usePTTStore.getState();

      // Half-duplex constraint: Mute playback when we are actively transmitting
      if (store.isTransmitting && !store.fullDuplex) {
        return;
      }

      // Receiver-side deduplication: Mute/Ignore Base64 stream when we have an active WebRTC stream from the active transmitter
      const activeTx = store.activeTransmitter;
      if (store.isConnected && activeTx && hasActivePeer(activeTx.userId)) {
        return;
      }

      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const arrayBuffer = base64ToArrayBuffer(base64Chunk);
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        const now = ctx.currentTime;

        // Limit queue size to prevent latency accumulation
        const maxQueueVal = parseInt(store.maxQueue, 10) || 99999;
        const queueSize = Math.max(
          0,
          Math.round((nextPlaybackTimeRef.current - now) / audioBuffer.duration)
        );
        if (queueSize >= maxQueueVal) {
          console.warn(
            `[AudioStreamer] Audio queue size (${queueSize}) exceeded limit (${maxQueueVal}). Resetting to live.`
          );
          nextPlaybackTimeRef.current = now + 0.05;
        } else if (nextPlaybackTimeRef.current < now) {
          nextPlaybackTimeRef.current = now + 0.05;
        }

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;

        const gainNode = ctx.createGain();
        gainNode.gain.value = store.pttVolume / 100;

        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        source.start(nextPlaybackTimeRef.current);
        nextPlaybackTimeRef.current += audioBuffer.duration;
      } catch (err) {
        console.warn('Failed to decode or play audio chunk:', err);
      }
    },
    [getAudioContext]
  );

  const flushAudioQueue = useCallback(() => {
    nextPlaybackTimeRef.current = 0;
  }, []);

  return {
    getAudioContext,
    playAudioChunk,
    flushAudioQueue,
  };
}
