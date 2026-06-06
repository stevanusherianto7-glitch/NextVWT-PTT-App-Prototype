import { useRef, useCallback, useEffect } from 'react';
import { usePTTStore } from '../store/usePTTStore';

// Helper: Convert ArrayBuffer to Base64 string (needed for offline fallback & backwards compatibility)
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Helper: Convert Base64 string to ArrayBuffer (needed for offline fallback & backwards compatibility)
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// WebRTC peer connection configuration (STUN server)
const RTC_CONFIG = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

// Helper: Modify SDP to prioritize high-quality Opus stereo music stream for Karaoke mode
const preferHighQualityOpus = (sdp: string): string => {
  return sdp.replace(
    /a=fmtp:(\d+) (.*)useinbandfec=1/g,
    'a=fmtp:$1 $2useinbandfec=1;stereo=1;sprop-stereo=1;maxaveragebitrate=128000'
  );
};

export function useAudioStreamer() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null); // Real mic stream
  const silentTrackRef = useRef<MediaStreamTrack | null>(null);
  const silentStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextPlaybackTimeRef = useRef<number>(0);
  const isRecordingRef = useRef<boolean>(false);
  const currentCleanupRef = useRef<(() => void) | null>(null);

  // WebRTC-specific refs
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const candidatesQueueRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  // VAD refs
  const vadAnalyserRef = useRef<AnalyserNode | null>(null);
  const vadIntervalRef = useRef<any>(null);
  const isVADSpeakingRef = useRef<boolean>(true);

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

  // Lazy init silent track
  const getSilentTrack = useCallback(() => {
    if (!silentTrackRef.current) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        const dest = ctx.createMediaStreamDestination();
        silentTrackRef.current = dest.stream.getAudioTracks()[0];
        silentStreamRef.current = dest.stream;
      } catch (err) {
        console.warn('Failed to create silent dummy track:', err);
      }
    }
    return { track: silentTrackRef.current, stream: silentStreamRef.current };
  }, []);

  // Play remote stream using programmatic Audio element
  const playRemoteStream = useCallback((peerUserId: string, stream: MediaStream) => {
    let audio = audioElementsRef.current.get(peerUserId);
    if (!audio) {
      audio = new Audio();
      audio.autoplay = true;
      audioElementsRef.current.set(peerUserId, audio);
    }
    audio.srcObject = stream;
    const store = usePTTStore.getState();
    audio.volume = store.pttVolume / 100;

    audio.play().catch((err) => {
      console.warn(`Failed to play remote WebRTC stream for ${peerUserId}:`, err);
    });
  }, []);

  // Cleanup peer resource
  const cleanupPeer = useCallback((peerUserId: string) => {
    const pc = peerConnectionsRef.current.get(peerUserId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(peerUserId);
    }

    const audio = audioElementsRef.current.get(peerUserId);
    if (audio) {
      audio.pause();
      audio.srcObject = null;
      audioElementsRef.current.delete(peerUserId);
    }

    candidatesQueueRef.current.delete(peerUserId);
  }, []);

  // Create Peer Connection and handle events
  const createPeerConnection = useCallback(
    (peerUserId: string) => {
      if (peerConnectionsRef.current.has(peerUserId)) {
        return peerConnectionsRef.current.get(peerUserId)!;
      }

      const pc = new RTCPeerConnection(RTC_CONFIG);
      peerConnectionsRef.current.set(peerUserId, pc);

      const store = usePTTStore.getState();
      const isTransmitting = store.isTransmitting;

      const silent = getSilentTrack();
      const localTrack =
        isTransmitting && streamRef.current
          ? streamRef.current.getAudioTracks()[0]
          : silent.track || null;
      const localStream =
        isTransmitting && streamRef.current ? streamRef.current : silent.stream || null;

      if (localTrack && localStream) {
        pc.addTrack(localTrack, localStream);
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          store.broadcastWebRTCSignaling({
            senderUserId: store.userId,
            targetUserId: peerUserId,
            type: 'candidate',
            data: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        if (remoteStream) {
          playRemoteStream(peerUserId, remoteStream);
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          cleanupPeer(peerUserId);
        }
      };

      return pc;
    },
    [getSilentTrack, playRemoteStream, cleanupPeer]
  );

  // Handle Signaling Messages
  const handleSignaling = useCallback(
    async (payload: any) => {
      const { senderUserId, targetUserId, type, data } = payload;
      const store = usePTTStore.getState();

      if (targetUserId !== store.userId || store.channelNumber === 100) return;

      try {
        if (type === 'offer') {
          const pc = createPeerConnection(senderUserId);
          await pc.setRemoteDescription(new RTCSessionDescription(data));

          const queue = candidatesQueueRef.current.get(senderUserId) || [];
          for (const candidate of queue) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
          candidatesQueueRef.current.delete(senderUserId);

          const answer = await pc.createAnswer();
          let sdp = answer.sdp;
          if (store.audioMode === 'music' && sdp) {
            sdp = preferHighQualityOpus(sdp);
          }
          const modifiedAnswer = { type: answer.type, sdp };
          await pc.setLocalDescription(modifiedAnswer);

          store.broadcastWebRTCSignaling({
            senderUserId: store.userId,
            targetUserId: senderUserId,
            type: 'answer',
            data: modifiedAnswer,
          });
        } else if (type === 'answer') {
          const pc = peerConnectionsRef.current.get(senderUserId);
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(data));

            const queue = candidatesQueueRef.current.get(senderUserId) || [];
            for (const candidate of queue) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            candidatesQueueRef.current.delete(senderUserId);
          }
        } else if (type === 'candidate') {
          const pc = peerConnectionsRef.current.get(senderUserId);
          if (pc && pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(data));
          } else {
            if (!candidatesQueueRef.current.has(senderUserId)) {
              candidatesQueueRef.current.set(senderUserId, []);
            }
            candidatesQueueRef.current.get(senderUserId)!.push(data);
          }
        }
      } catch (err) {
        console.warn('Error handling WebRTC signaling:', err);
      }
    },
    [createPeerConnection]
  );

  // Sync peer connections when activeUsers changes
  const activeUsers = usePTTStore((state) => state.activeUsers);
  const isConnected = usePTTStore((state) => state.isConnected);
  const isPowerOn = usePTTStore((state) => state.isPowerOn);
  const userId = usePTTStore((state) => state.userId);
  const channelNumber = usePTTStore((state) => state.channelNumber);

  useEffect(() => {
    if (!isPowerOn || !isConnected || channelNumber === 100) {
      const peers = Array.from(peerConnectionsRef.current.keys());
      peers.forEach(cleanupPeer);
      return;
    }

    const activeUserIds = new Set(activeUsers.map((u) => u.userId));

    // Clean up disconnected users
    for (const peerId of peerConnectionsRef.current.keys()) {
      if (!activeUserIds.has(peerId)) {
        cleanupPeer(peerId);
      }
    }

    // Connect to new users
    activeUsers.forEach((user) => {
      if (user.userId === userId) return;

      if (!peerConnectionsRef.current.has(user.userId)) {
        // Strict role definition based on UUID sorting to prevent duplicate offers
        if (userId < user.userId) {
          const pc = createPeerConnection(user.userId);
          pc.createOffer()
            .then(async (offer) => {
              let sdp = offer.sdp;
              const store = usePTTStore.getState();
              if (store.audioMode === 'music' && sdp) {
                sdp = preferHighQualityOpus(sdp);
              }
              const modifiedOffer = { type: offer.type, sdp };
              await pc.setLocalDescription(modifiedOffer);
              store.broadcastWebRTCSignaling({
                senderUserId: userId,
                targetUserId: user.userId,
                type: 'offer',
                data: modifiedOffer,
              });
            })
            .catch((err) => {
              console.warn(`Failed to initiate offer to ${user.userId}:`, err);
            });
        }
      }
    });
  }, [
    activeUsers,
    isConnected,
    isPowerOn,
    userId,
    channelNumber,
    createPeerConnection,
    cleanupPeer,
  ]);

  // Listen to WebRTC signaling events from Supabase Realtime channel
  const setOnWebRTCSignalingReceived = usePTTStore((state) => state.setOnWebRTCSignalingReceived);
  useEffect(() => {
    setOnWebRTCSignalingReceived(handleSignaling);
    return () => {
      setOnWebRTCSignalingReceived(null);
    };
  }, [setOnWebRTCSignalingReceived, handleSignaling]);

  // Update programmatic Audio volume when pttVolume changes
  const pttVolume = usePTTStore((state) => state.pttVolume);
  useEffect(() => {
    const vol = pttVolume / 100;
    audioElementsRef.current.forEach((audio) => {
      audio.volume = vol;
    });
  }, [pttVolume]);

  // VAD Loop implementation
  const startVAD = useCallback((stream: MediaStream, micTrack: MediaStreamTrack) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      vadAnalyserRef.current = analyser;
      isVADSpeakingRef.current = true;

      const bufferLength = analyser.fftSize;
      const dataArray = new Float32Array(bufferLength);

      let silenceStart = 0;
      const silenceTimeout = 1500; // 1.5 seconds of silence before gating
      const threshold = 0.01; // RMS silence threshold

      const checkVAD = () => {
        if (!isRecordingRef.current || !vadAnalyserRef.current) return;

        analyser.getFloatTimeDomainData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / bufferLength);

        if (rms < threshold) {
          if (silenceStart === 0) {
            silenceStart = Date.now();
          } else if (Date.now() - silenceStart > silenceTimeout) {
            if (isVADSpeakingRef.current) {
              isVADSpeakingRef.current = false;
              micTrack.enabled = false; // Mute sending to save mobile data
            }
          }
        } else {
          silenceStart = 0;
          if (!isVADSpeakingRef.current) {
            isVADSpeakingRef.current = true;
            micTrack.enabled = true; // Unmute sending
          }
        }
      };

      vadIntervalRef.current = setInterval(checkVAD, 100);
    } catch (err) {
      console.warn('VAD initialization failed:', err);
    }
  }, []);

  const stopVAD = useCallback(() => {
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }
    vadAnalyserRef.current = null;
  }, []);

  // Stop recording and release microphone
  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    stopVAD();

    if (currentCleanupRef.current) {
      currentCleanupRef.current();
      currentCleanupRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;

    // Fast PTT: Swap back to silent track
    const store = usePTTStore.getState();
    if (store.isConnected) {
      const silent = getSilentTrack();
      if (silent.track) {
        for (const pc of peerConnectionsRef.current.values()) {
          const senders = pc.getSenders();
          const sender = senders.find((s) => s.track?.kind === 'audio');
          if (sender) {
            sender.replaceTrack(silent.track).catch((err) => {
              console.warn('Failed to swap back to silent track:', err);
            });
          }
        }
      }
    }
  }, [getSilentTrack, stopVAD]);

  // Start recording microphone
  const startRecording = useCallback(
    async (onChunkAvailable: (base64Chunk: string) => void) => {
      if (isRecordingRef.current) return;
      isRecordingRef.current = true;

      try {
        const store = usePTTStore.getState();
        const isMusicMode = store.audioMode === 'music';

        // Dynamic mic constraints: disable voice filtering for high-fidelity singing/instruments in Music Mode
        const audioConstraints = isMusicMode
          ? {
              echoCancellation: false, // best with headphones for karaoke to avoid music ducking
              noiseSuppression: false, // critical: do not suppress music notes
              autoGainControl: false, // do not compress vocal dynamics
              channelCount: 2, // support stereo input
            }
          : {
              echoCancellation: store.builtInEcho,
              noiseSuppression: true,
              autoGainControl: true,
            };

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
        });

        if (!isRecordingRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        // Fast PTT: Swap to real mic track (with software Echo if active)
        const micTrack = stream.getAudioTracks()[0];
        let finalTrack = micTrack;

        if (isMusicMode && store.builtInEcho) {
          const ctx = getAudioContext();
          if (ctx) {
            const sourceNode = ctx.createMediaStreamSource(stream);
            const destNode = ctx.createMediaStreamDestination();

            // 1. Direct path (clean vocal)
            sourceNode.connect(destNode);

            // 2. Echo/Delay path (Feedback loop)
            const delayNode = ctx.createDelay(1.0);
            delayNode.delayTime.value = 0.25; // 250ms delay time
            const feedbackNode = ctx.createGain();
            feedbackNode.gain.value = store.echoFeedback / 100; // dynamic feedback volume from store

            sourceNode.connect(delayNode);
            delayNode.connect(feedbackNode);
            feedbackNode.connect(delayNode); // loop feedback
            feedbackNode.connect(destNode); // mix echo output into destination

            finalTrack = destNode.stream.getAudioTracks()[0];
          }
        }

        if (store.isConnected) {
          for (const pc of peerConnectionsRef.current.values()) {
            const senders = pc.getSenders();
            const sender = senders.find((s) => s.track?.kind === 'audio');
            if (sender) {
              await sender.replaceTrack(finalTrack);
            }
          }
          startVAD(stream, micTrack);
        }

        // Keep local chunking MediaRecorder for fallback loopback and E2E test asserts
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
        recordNextChunk();
        recordInterval = setInterval(recordNextChunk, 255);
      } catch (err) {
        console.error('Failed to access microphone:', err);
        isRecordingRef.current = false;
        stopRecording();
        throw err;
      }
    },
    [stopRecording, startVAD]
  );

  // Play an incoming Base64 voice chunk smoothly (used when WebRTC is not active)
  const playAudioChunk = useCallback(
    async (base64Chunk: string) => {
      const store = usePTTStore.getState();

      // Half-duplex constraint: Mute playback when we are actively transmitting
      if (store.isTransmitting && !store.fullDuplex) {
        return;
      }

      // Receiver-side deduplication: Mute/Ignore Base64 stream when we have an active WebRTC stream from the active transmitter
      const activeTx = store.activeTransmitter;
      if (store.isConnected && activeTx && peerConnectionsRef.current.has(activeTx.userId)) {
        return;
      }

      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const arrayBuffer = base64ToArrayBuffer(base64Chunk);
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        const now = ctx.currentTime;

        // Limit queue size to prevent latency accumulation (Option A: Reset to live)
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
    startRecording,
    stopRecording,
    playAudioChunk,
    flushAudioQueue,
  };
}
