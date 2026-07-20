import { useEffect, useRef } from 'react';
import { usePTTStore } from '../store/usePTTStore';
import { useAudioStreamer } from './useAudioStreamer';
import { base64ToArrayBuffer, arrayBufferToBase64 } from './useAudioPlayback';
import { toast } from 'sonner';
import { playChirpSound } from '../utils/radioSound';
import { USE_SFU, BRAND } from '../utils/config';
import { createLiveKitTransport, type LiveKitAudioTransport } from '../services/livekitAudioTransport';
import { fetchLiveKitToken } from '../services/livekitToken';

interface UseRadioAudioEngineArgs {
  isPowerOn: boolean;
  isTransmitting: boolean;
  isScanning: boolean;
  channel: number;
  activeTransmitter: ReturnType<typeof usePTTStore.getState>['activeTransmitter'];
  status: string;
  setProgress: (v: number) => void;
}

/**
 * Owns the audio transmit/receive lifecycle, the stale-transmitter watchdog,
 * the channel scan loop, the power/connection resets, and the simulated AI
 * operator reply on channel 99.
 *
 * Extracted from the former 741-line useRadioOrchestrator to keep each hook
 * focused on a single responsibility.
 */
export function useRadioAudioEngine({
  isPowerOn,
  isTransmitting,
  isScanning,
  channel,
  activeTransmitter,
  status,
  setProgress,
}: UseRadioAudioEngineArgs) {
  const { startRecording, stopRecording, playAudioChunk, flushAudioQueue } = useAudioStreamer();

  const setIsTransmitting = usePTTStore((state) => state.setTransmitting);
  const setOnVoiceChunkReceived = usePTTStore((state) => state.setOnVoiceChunkReceived);

  const txStartTimeRef = useRef<number>(0);
  const echoChunksRef = useRef<string[]>([]);

  // ── SFU (LiveKit) transport refs (hanya dipakai bila USE_SFU) ────────────────
  const transportRef = useRef<LiveKitAudioTransport | null>(null);
  const localMicStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioElsRef = useRef<HTMLAudioElement[]>([]);

  // Auto-chirp when the local user list changes (join/leave).
  const prevUserIdsRef = useRef<string[]>([]);
  const isFirstRender = useRef(true);
  useEffect(() => {
    isFirstRender.current = true;
  }, [channel]);

  // ── SFU (LiveKit) lifecycle: connect saat power on + USE_SFU ────────────────
  // Reconnect tiap ganti channel. Mesh (Supabase) tetap fallback bila !USE_SFU.
  useEffect(() => {
    if (!USE_SFU || !isPowerOn) return;

    let cancelled = false;
    const roomName = `ptt-room-${channel}`;

    async function setup() {
      try {
        const transport = createLiveKitTransport(BRAND.livekitUrl);
        if (!transport) return;

        const { token } = await fetchLiveKitToken(channel);
        if (cancelled) return;

        // Ambil mic track lokal → di-publish ke SFU (LiveKit kelola transmisi)
        const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localMicStreamRef.current = localStream;
        const track = localStream.getAudioTracks()[0];
        if (!track) throw new Error('Tidak ada audio track dari mikrofon');

        transport.onRemoteAudio((_userId, stream) => {
          const el = new Audio();
          el.srcObject = stream;
          el.autoplay = true;
          void el.play().catch(() => undefined);
          remoteAudioElsRef.current.push(el);
        });

        // Task 12: presence dari LiveKit participants (real count, tanpa +125)
        transport.onPresence((users) => {
          usePTTStore.setState({
            activeUsers: users.map((u) => ({
              userId: u.userId,
              displayName: u.displayName,
              callSign: u.callSign,
              location: u.location,
              isNewUser: false,
            })),
          });
        });

        await transport.connect(roomName, token);
        await transport.publishMic(track);
        transport.emitInitialPresence();
        transport.setMicEnabled(false); // PTT: mic mati sampai TX
        transportRef.current = transport;
      } catch (err) {
        console.error('[SFU] gagal connect ke LiveKit:', err);
        toast.error('Gagal menghubungkan ke server audio (SFU). Menggunakan mode fallback.');
        // Mesh tetap jalan via useAudioStreamer sebagai fallback
      }
    }

    void setup();

    return () => {
      cancelled = true;
      transportRef.current?.disconnect();
      transportRef.current = null;
      localMicStreamRef.current?.getTracks().forEach((t) => t.stop());
      localMicStreamRef.current = null;
      remoteAudioElsRef.current.forEach((el) => {
        el.pause();
        el.srcObject = null;
      });
      remoteAudioElsRef.current = [];
    };
  }, [isPowerOn, channel]);

  // ── SFU transmit (PTT on/off) ─────────────────────────────────────────────────
  useEffect(() => {
    if (!USE_SFU) return;
    // Channel 100 = echo lokal (AD-4), tidak publish ke SFU
    const enabled = isTransmitting && isPowerOn && channel !== 100;
    transportRef.current?.setMicEnabled(enabled);
  }, [isTransmitting, isPowerOn, channel]);

  // Reset progress when there is no transmit/receive activity.
  useEffect(() => {
    if (!isPowerOn) {
      setProgress(0);
      return;
    }
    const isReceiving =
      !!activeTransmitter && activeTransmitter.userId !== usePTTStore.getState().userId;

    if (!isTransmitting && !isReceiving) {
      setProgress(0);
    }
  }, [isPowerOn, isTransmitting, activeTransmitter, setProgress]);

  // Transmit lifecycle — start/stop recording and route the audio chunks.
  useEffect(() => {
    // SFU mode (non-echo channel): LiveKit mengelola mic via transportRef.
    // Transmit on/off ditangani di effect "SFU transmit" di atas.
    if (USE_SFU && channel !== 100) return;

    if (isTransmitting && isPowerOn) {
      flushAudioQueue();
      startRecording((base64Chunk) => {
        const isConn = usePTTStore.getState().isConnected;
        const currentChannel = usePTTStore.getState().channelNumber;
        if (currentChannel === 100) {
          echoChunksRef.current.push(base64Chunk);
        } else if (isConn) {
          usePTTStore.getState().broadcastVoiceChunk(base64Chunk);
        } else {
          playAudioChunk(base64Chunk);
        }
      }).catch((err) => {
        console.error('Failed to start audio recording:', err);
        const errMsg = err instanceof Error ? err.name : String(err);
        if (errMsg === 'NotAllowedError' || errMsg === 'PermissionDeniedError') {
          toast.error('Akses mikrofon ditolak. Silakan aktifkan izin mikrofon Anda.');
        } else if (errMsg === 'NotFoundError' || errMsg === 'DevicesNotFoundError') {
          toast.error('Perangkat mikrofon tidak ditemukan. Hubungkan mikrofon terlebih dahulu.');
        } else {
          toast.error(
            'Gagal mengakses mikrofon: ' + (err instanceof Error ? err.message : String(err))
          );
        }
        setIsTransmitting(false);
      });
      txStartTimeRef.current = Date.now();
    } else {
      const currentChannel = usePTTStore.getState().channelNumber;
      if (currentChannel === 100) {
        stopRecording(async () => {
          if (echoChunksRef.current.length > 0) {
            try {
              const chunksToPlay = [...echoChunksRef.current];
              echoChunksRef.current = [];

              const buffers = chunksToPlay.map(base64ToArrayBuffer);
              const combinedBlob = new Blob(buffers, { type: 'audio/webm' });
              const arrayBuffer = await combinedBlob.arrayBuffer();
              const base64String = arrayBufferToBase64(arrayBuffer);

              await playAudioChunk(base64String);
            } catch (err) {
              console.error('Failed to play back parrot echo chunks:', err);
            }
          }
        });
      } else {
        stopRecording();
      }

      if (txStartTimeRef.current > 0) {
        const txDuration = Date.now() - txStartTimeRef.current;
        const lastFeedback = usePTTStore.getState().lastFeedbackTime;
        const timeSinceLastFeedback = Date.now() - lastFeedback;
        const ONE_DAY = 24 * 60 * 60 * 1000;

        if (txDuration > 3000 && timeSinceLastFeedback > ONE_DAY) {
          usePTTStore.getState().setShowFeedbackModal(true);
        }
        txStartTimeRef.current = 0;
      }
    }
    return () => {
      stopRecording();
    };
  }, [
    isTransmitting,
    isPowerOn,
    channel,
    startRecording,
    stopRecording,
    playAudioChunk,
    flushAudioQueue,
    setIsTransmitting,
  ]);

  // Stale-transmitter watchdog (auto-clear after 1.5s silence).
  const resetWatchdogRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    let watchdogTimer: ReturnType<typeof setTimeout> | null = null;

    const resetWatchdog = () => {
      if (watchdogTimer) clearTimeout(watchdogTimer);
      watchdogTimer = setTimeout(() => {
        const state = usePTTStore.getState();
        if (state.activeTransmitter && state.activeTransmitter.userId !== state.userId) {
          usePTTStore.setState({ activeTransmitter: null, progress: 0 });
        }
      }, 1500);
    };

    resetWatchdogRef.current = resetWatchdog;

    if (activeTransmitter && activeTransmitter.userId !== usePTTStore.getState().userId) {
      resetWatchdog();
    }

    return () => {
      if (watchdogTimer) {
        clearTimeout(watchdogTimer);
      }
      resetWatchdogRef.current = null;
    };
  }, [activeTransmitter]);

  // Play inbound voice chunks (mesh path). Saat USE_SFU, remote audio
  // diputar via LiveKit onRemoteAudio (audio elements) — jangan double-play.
  useEffect(() => {
    if (USE_SFU) return;

    setOnVoiceChunkReceived((base64) => {
      if (isPowerOn && channel !== 100 && status !== 'muted') {
        playAudioChunk(base64);
        if (resetWatchdogRef.current) {
          resetWatchdogRef.current();
        }
      }
    });
    return () => {
      setOnVoiceChunkReceived(null);
    };
  }, [isPowerOn, channel, status, setOnVoiceChunkReceived, playAudioChunk]);

  // Stop audio when power is cut.
  useEffect(() => {
    if (!isPowerOn) {
      stopRecording();
      flushAudioQueue();
    }
  }, [isPowerOn, stopRecording, flushAudioQueue]);

  // Channel scan loop.
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        usePTTStore.getState().channelUp();
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  // Stop transmit when local status forbids it.
  useEffect(() => {
    if (
      isTransmitting &&
      (status === 'muted' ||
        status === 'ptt_blocked' ||
        status === 'suspended' ||
        status === 'banned')
    ) {
      setIsTransmitting(false);
      toast.error(
        status === 'muted'
          ? 'Transmisi dihentikan: Anda dibungkam (muted) di channel ini.'
          : status === 'ptt_blocked'
            ? 'Transmisi dihentikan: Hak PTT Anda diblokir.'
            : 'Transmisi dihentikan: Status Anda dibatasi.'
      );
    }
  }, [status, isTransmitting, setIsTransmitting]);

  // Online/offline connection handling.
  useEffect(() => {
    const handleOnline = () => {
      toast.success('Koneksi internet terhubung kembali. Menghubungkan radio...');
      const store = usePTTStore.getState();
      store.setConnected(true);
      if (store.isPowerOn) {
        store.subscribeToChannel(store.channelNumber);
      }
    };

    const handleOffline = () => {
      toast.error('Koneksi internet terputus. Radio offline.');
      const store = usePTTStore.getState();
      store.setConnected(false);
      usePTTStore.setState({
        activeUsers: [],
        activeTransmitter: null,
        progress: 0,
        isTransmitting: false,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Simulated AI operator reply on channel 99 after a transmission ends.
  const wasTransmittingRef = useRef(false);
  useEffect(() => {
    const wasTransmitting = wasTransmittingRef.current;
    wasTransmittingRef.current = isTransmitting;

    if (wasTransmitting && !isTransmitting && channel === 99 && isPowerOn) {
      const aiResponseTimer = setTimeout(() => {
        playChirpSound(true);

        const responses = [
          'Ganti. Laporan cuaca Posko SAR Satu terpantau aman dan kondusif. Gunung Cereme berawan tebal, angin barat dua belas knot. Tetap waspada. Ganti.',
          'Ganti. Saldo koin Anda saat ini masih mencukupi untuk transmisi jangka panjang. Tetap monitor frekuensi untuk info selanjutnya. Ganti.',
          'Ganti. Kami mendeteksi sebanyak tiga stasiun aktif di sekitar koordinat Anda. Silakan lanjutkan komunikasi patroli Anda. Ganti.',
          'Ganti. Panggilan darurat NOC global standby. Harap laporkan jika ada kendala modulasi atau gangguan frekuensi di lapangan. Ganti.',
          'Ganti. Selamat siang rekan-rekan. AI Operator NextVWT siap membantu pemantauan dan koordinasi Off-Grid Anda. Monitor standby. Ganti.',
        ];
        const randomText = responses[Math.floor(Math.random() * responses.length)];

        usePTTStore.setState({
          activeTransmitter: {
            userId: 'sim_ai_operator',
            displayName: 'AI Operator',
            callSign: 'AI-OPS',
            role: 'operator',
          },
        });

        const speechStart = Date.now();
        const progInterval = setInterval(() => {
          const elapsed = (Date.now() - speechStart) / 1000;
          const wordRhythm = Math.max(0, Math.sin(elapsed * 7.5));
          const syllable = Math.abs(Math.sin(elapsed * 14));
          const breathingGap = elapsed % 3.5 < 0.2 ? 0.05 : 1;
          const speechEnvelope = (wordRhythm * 0.5 + syllable * 0.5) * breathingGap;
          const naturalProgress = Math.max(5, speechEnvelope * 85 + (Math.random() * 8 - 4));
          setProgress(Math.min(100, naturalProgress));
        }, 80);

        const finishSpeech = () => {
          clearInterval(progInterval);
          setProgress(0);
          usePTTStore.setState({ activeTransmitter: null });
          playChirpSound(false);
        };

        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(randomText);
          utterance.lang = 'id-ID';
          utterance.rate = 0.95;
          utterance.pitch = 1.0;
          utterance.onend = finishSpeech;
          utterance.onerror = finishSpeech;
          window.speechSynthesis.speak(utterance);
        } else {
          setTimeout(finishSpeech, 4000);
        }
      }, 1200);

      return () => clearTimeout(aiResponseTimer);
    }
  }, [isTransmitting, channel, isPowerOn, setProgress]);

  // Join/leave chirp detection.
  const handleUserListChange = (ids: string[]) => {
    if (isFirstRender.current) {
      prevUserIdsRef.current = ids;
      isFirstRender.current = false;
      return;
    }
    const prev = prevUserIdsRef.current;
    const joined = ids.filter((id) => !prev.includes(id));
    const left = prev.filter((id) => !ids.includes(id));
    if (joined.length > 0) playChirpSound(true);
    else if (left.length > 0) playChirpSound(false);
    prevUserIdsRef.current = ids;
  };

  return { handleUserListChange };
}
