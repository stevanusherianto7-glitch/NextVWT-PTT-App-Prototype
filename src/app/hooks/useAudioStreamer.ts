import { useRef, useCallback } from 'react';
import { usePTTStore } from '../store/usePTTStore';

// Helper: Convert ArrayBuffer to Base64 string
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Helper: Convert Base64 string to ArrayBuffer
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export function useAudioStreamer() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextPlaybackTimeRef = useRef<number>(0);
  const isRecordingRef = useRef<boolean>(false);
  const currentCleanupRef = useRef<(() => void) | null>(null);

  // Initialize Audio Context lazily
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Stop recording and release microphone
  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    if (currentCleanupRef.current) {
      currentCleanupRef.current();
      currentCleanupRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }, []);

  // Start recording microphone
  const startRecording = useCallback(
    async (onChunkAvailable: (base64Chunk: string) => void) => {
      if (isRecordingRef.current) return;
      isRecordingRef.current = true;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (!isRecordingRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        let activeRecorder: MediaRecorder | null = null;
        let recordInterval: ReturnType<typeof setInterval> | null = null;

        const recordNextChunk = () => {
          if (!isRecordingRef.current || !streamRef.current) {
            cleanup();
            return;
          }

          try {
            const recorder = new MediaRecorder(streamRef.current);
            activeRecorder = recorder;
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = async (event) => {
              if (event.data && event.data.size > 0) {
                try {
                  const arrayBuffer = await event.data.arrayBuffer();
                  const base64 = arrayBufferToBase64(arrayBuffer);
                  onChunkAvailable(base64);
                } catch (err) {
                  console.error('Error processing audio chunk:', err);
                }
              }
            };

            recorder.start();

            // Stop and trigger data available event after 250ms
            setTimeout(() => {
              if (recorder.state !== 'inactive') {
                try {
                  recorder.stop();
                } catch {
                  // Ignore state errors on concurrent stop
                }
              }
            }, 250);
          } catch (err) {
            console.error('Failed to create or start MediaRecorder:', err);
          }
        };

        const cleanup = () => {
          if (recordInterval) {
            clearInterval(recordInterval);
            recordInterval = null;
          }
          if (activeRecorder && activeRecorder.state !== 'inactive') {
            try {
              activeRecorder.stop();
            } catch {
              void 0;
            }
          }
        };

        currentCleanupRef.current = cleanup;

        // Start first chunk immediately
        recordNextChunk();

        // Run cycle every 255ms (250ms record + 5ms buffer)
        recordInterval = setInterval(recordNextChunk, 255);
      } catch (err) {
        console.error('Failed to access microphone:', err);
        isRecordingRef.current = false;
        stopRecording();
        throw err;
      }
    },
    [stopRecording]
  );

  // Play an incoming Base64 voice chunk smoothly using scheduling
  const playAudioChunk = useCallback(
    async (base64Chunk: string) => {
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const arrayBuffer = base64ToArrayBuffer(base64Chunk);
        // decodeAudioData consumes the arrayBuffer, so we don't need to manually release it.
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        const now = ctx.currentTime;
        // If nextPlaybackTime is in the past, schedule it with a tiny 50ms delay buffer to prevent stuttering
        if (nextPlaybackTimeRef.current < now) {
          nextPlaybackTimeRef.current = now + 0.05;
        }

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;

        // Apply volume control based on PTT volume settings
        const gainNode = ctx.createGain();
        const pttVolume = usePTTStore.getState().pttVolume;
        gainNode.gain.value = pttVolume / 100;

        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        source.start(nextPlaybackTimeRef.current);
        nextPlaybackTimeRef.current += audioBuffer.duration;
      } catch (err) {
        // Suppress decoding errors since silent chunks or headers without codec data can sometimes fail gracefully
        console.warn('Failed to decode or play audio chunk:', err);
      }
    },
    [getAudioContext]
  );

  // Reset/flush the audio playback queue timing
  const flushAudioQueue = useCallback(() => {
    nextPlaybackTimeRef.current = 0;
  }, []);

  return {
    startRecording,
    stopRecording,
    playAudioChunk,
    flushAudioQueue,
  };
}
