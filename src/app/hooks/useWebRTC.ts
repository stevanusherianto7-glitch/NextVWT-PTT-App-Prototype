import { useRef, useCallback, useEffect } from 'react';
import { usePTTStore, type WebRTCSignalingPayload } from '../store/usePTTStore';
import { getSecureConfig } from '../utils/secureConfig';
import { BRAND } from '../utils/config';

let ephemeralTurnCreds: { username: string; credential: string; expiresAt: number } | null = null;

// P3-5: Fetch ephemeral TURN credentials dari backend (via secureConfig)
export const fetchTurnCredentials = async () => {
  if (ephemeralTurnCreds && Date.now() < ephemeralTurnCreds.expiresAt) {
    return ephemeralTurnCreds;
  }
  try {
    const config = await getSecureConfig();
    ephemeralTurnCreds = {
      username: config.turnUsername,
      credential: config.turnCredential,
      expiresAt: Date.now() + 5 * 60 * 1000, // Valid 5 menit
    };
    return ephemeralTurnCreds;
  } catch (err) {
    console.warn('[WebRTC] Failed to fetch TURN credentials', err);
    return null;
  }
};

const getIceServers = (): RTCIceServer[] => {
  const servers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  if (ephemeralTurnCreds) {
    servers.push({
      urls: 'turn:turn.nextvwt.com:3478',
      username: ephemeralTurnCreds.username,
      credential: ephemeralTurnCreds.credential,
    });
  }

  return servers;
};

// Helper to modify SDP to prioritize high-quality Opus stereo music stream for Karaoke mode
const preferHighQualityOpus = (sdp: string): string => {
  return sdp.replace(
    /a=fmtp:(\d+) (.*)useinbandfec=1/g,
    'a=fmtp:$1 $2useinbandfec=1;stereo=1;sprop-stereo=1;maxaveragebitrate=128000'
  );
};

export function useWebRTC(
  getSilentTrack: () => { track: MediaStreamTrack | null; stream: MediaStream | null },
  streamRef: React.MutableRefObject<MediaStream | null>
) {
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const candidatesQueueRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

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
  // Ambil ephemeral TURN credentials secara asinkron saat hook di-mount
  useEffect(() => {
    fetchTurnCredentials().catch(console.error);
  }, []);

  const createPeerConnection = useCallback(
    (peerUserId: string) => {
      const existingPc = peerConnectionsRef.current.get(peerUserId);
      if (existingPc) {
        return existingPc;
      }

      const rtcConfig: RTCConfiguration = {
        iceServers: getIceServers(),
        iceTransportPolicy: 'all',
      };
      const pc = new RTCPeerConnection(rtcConfig);
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
            data: event.candidate.toJSON(),
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
    [getSilentTrack, playRemoteStream, cleanupPeer, streamRef]
  );

  // Handle Signaling Messages
  const handleSignaling = useCallback(
    async (payload: WebRTCSignalingPayload) => {
      const { senderUserId, targetUserId, type, data } = payload;
      const store = usePTTStore.getState();

      if (targetUserId !== store.userId || BRAND.isolatedChannels.includes(store.channelNumber))
        return;

      try {
        if (type === 'offer') {
          const pc = createPeerConnection(senderUserId);
          await pc.setRemoteDescription(
            new RTCSessionDescription(data as RTCSessionDescriptionInit)
          );

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
          const modifiedAnswer = { type: answer.type, sdp } as RTCSessionDescriptionInit;
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
            await pc.setRemoteDescription(
              new RTCSessionDescription(data as RTCSessionDescriptionInit)
            );

            const queue = candidatesQueueRef.current.get(senderUserId) || [];
            for (const candidate of queue) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            candidatesQueueRef.current.delete(senderUserId);
          }
        } else if (type === 'candidate') {
          const pc = peerConnectionsRef.current.get(senderUserId);
          if (pc && pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(data as RTCIceCandidateInit));
          } else {
            let queue = candidatesQueueRef.current.get(senderUserId);
            if (!queue) {
              queue = [];
              candidatesQueueRef.current.set(senderUserId, queue);
            }
            queue.push(data as RTCIceCandidateInit);
          }
        }
      } catch (err) {
        console.warn('Error handling WebRTC signaling:', err);
      }
    },
    [createPeerConnection]
  );

  const cleanupAllPeers = useCallback(() => {
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    audioElementsRef.current.forEach((audio) => {
      audio.pause();
      audio.srcObject = null;
    });
    audioElementsRef.current.clear();
    candidatesQueueRef.current.clear();
  }, []);

  return {
    peerConnectionsRef,
    audioElementsRef,
    candidatesQueueRef,
    createPeerConnection,
    cleanupPeer,
    cleanupAllPeers,
    handleSignaling,
  };
}
