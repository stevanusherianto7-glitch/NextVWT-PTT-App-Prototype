import { useRef, useCallback, useEffect } from 'react';
import { usePTTStore, type WebRTCSignalingPayload } from '../store/usePTTStore';
import { useWebRTC } from './useWebRTC';
import { useVAD } from './useVAD';
import { useAudioPlayback, arrayBufferToBase64 } from './useAudioPlayback';

export function useAudioStreamer() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null); // Real mic stream
  const silentTrackRef = useRef<MediaStreamTrack | null>(null);
  const silentStreamRef = useRef<MediaStream | null>(null);
  const isRecordingRef = useRef<boolean>(false);
  const currentCleanupRef = useRef<(() => void) | null>(null);

  // Lazy init silent track
  const getSilentTrack = useCallback(() => {
    if (!silentTrackRef.current) {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const dest = ctx.createMediaStreamDestination();
          silentTrackRef.current = dest.stream.getAudioTracks()[0];
          silentStreamRef.current = dest.stream;
        }
      } catch (err) {
        console.warn('Failed to create silent dummy track:', err);
      }
    }
    return { track: silentTrackRef.current, stream: silentStreamRef.current };
  }, []);

  // Use sub-hooks
  const {
    peerConnectionsRef,
    audioElementsRef,
    createPeerConnection,
    cleanupPeer,
    cleanupAllPeers,
    handleSignaling,
  } = useWebRTC(getSilentTrack, streamRef);

  const { startVAD, stopVAD } = useVAD();

  const {
    getAudioContext,
    playAudioChunk: playAudioChunkBase64,
    flushAudioQueue,
  } = useAudioPlayback();

  // Helper check if a peer ID is actively connected in WebRTC map
  const hasActivePeer = useCallback(
    (peerUserId: string): boolean => {
      return peerConnectionsRef.current.has(peerUserId);
    },
    [peerConnectionsRef]
  );

  // Sync peer connections when activeUsers changes
  const activeUsers = usePTTStore((state) => state.activeUsers);
  const isConnected = usePTTStore((state) => state.isConnected);
  const isPowerOn = usePTTStore((state) => state.isPowerOn);
  const userId = usePTTStore((state) => state.userId);
  const channelNumber = usePTTStore((state) => state.channelNumber);

  useEffect(() => {
    if (!isPowerOn || !isConnected || channelNumber === 100) {
      cleanupAllPeers();
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
                // Priority high quality stereo sdp manipulation
                sdp = sdp.replace(
                  /a=fmtp:(\d+) (.*)useinbandfec=1/g,
                  'a=fmtp:$1 $2useinbandfec=1;stereo=1;sprop-stereo=1;maxaveragebitrate=128000'
                );
              }
              const modifiedOffer = { type: offer.type, sdp } as RTCSessionDescriptionInit;
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
    cleanupAllPeers,
    peerConnectionsRef,
  ]);

  // Listen to WebRTC signaling events from Supabase Realtime channel
  const setOnWebRTCSignalingReceived = usePTTStore((state) => state.setOnWebRTCSignalingReceived);
  useEffect(() => {
    setOnWebRTCSignalingReceived(handleSignaling as (payload: WebRTCSignalingPayload) => void);
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
  }, [pttVolume, audioElementsRef]);

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
  }, [getSilentTrack, stopVAD, peerConnectionsRef, streamRef]);

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
        }
        startVAD(stream, micTrack);

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
    [stopRecording, startVAD, getAudioContext, peerConnectionsRef, streamRef]
  );

  const playAudioChunk = useCallback(
    (base64Chunk: string) => {
      return playAudioChunkBase64(base64Chunk, hasActivePeer);
    },
    [playAudioChunkBase64, hasActivePeer]
  );

  return {
    startRecording,
    stopRecording,
    playAudioChunk,
    flushAudioQueue,
  };
}
