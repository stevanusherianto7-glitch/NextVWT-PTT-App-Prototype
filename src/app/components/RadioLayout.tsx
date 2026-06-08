import { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { ToggleSwitch } from './ToggleSwitch';
import { LCDPanel } from './LCDPanel';
import { ControlButtons } from './ControlButtons';
import { PTTButton } from './PTTButton';
import { ProgressBar } from './ProgressBar';
import { usePTTStore } from '../store/usePTTStore';
import { UserListModal } from './UserListModal';
import { ChannelListModal } from './ChannelListModal';
import { STATIC_CHANNELS, getChannelUserCount } from '../utils/constants';
import { useAudioStreamer } from '../hooks/useAudioStreamer';
import { toast } from 'sonner';
import { BRAND } from '../utils/config';
import { SettingsPanelSkeleton, KaraokePlayerSkeleton } from './SkeletonLoaders';
import { FeedbackModal } from './FeedbackModal';

// [P2-2] Lazy-load komponen besar — hanya diunduh saat pertama kali dibuka
// SettingsPanel: ~76KB → split ke chunk terpisah, tidak menambah initial bundle
const SettingsPanel = lazy(() =>
  import('./SettingsPanel').then((m) => ({ default: m.SettingsPanel }))
);
// FloatingKaraokePlayer: ~21KB → split ke chunk terpisah
const FloatingKaraokePlayer = lazy(() =>
  import('./FloatingKaraokePlayer').then((m) => ({ default: m.FloatingKaraokePlayer }))
);

export function RadioLayout() {
  const {
    isPowerOn,
    isConnected,
    isTransmitting,
    isScanning,
    progress,
    channelNumber: channel,
    infoText,
    locationText,
    showPTT,
    showModulator,
    setPower: setIsPowerOn,
    setTransmitting: setIsTransmitting,
    setProgress,
    channelUp,
    channelDown,
    setChannelNumber,
    activeUsers,
    activeTransmitter,
    themeText,
    audioMode,
    fullDuplex,
    isKaraokePlayerOpen,
    setKaraokePlayerOpen: setIsKaraokePlayerOpen,
  } = usePTTStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChannelListOpen, setIsChannelListOpen] = useState(false);
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const [txStartTime, setTxStartTime] = useState<number>(0);

  const { startRecording, stopRecording, playAudioChunk, flushAudioQueue } = useAudioStreamer();
  const echoChunksRef = useRef<string[]>([]);

  const isReceiving =
    activeTransmitter && activeTransmitter.userId !== usePTTStore.getState().userId;
  const isFullDuplexActive = fullDuplex || audioMode === 'music';
  const isBusy = !isFullDuplexActive && !!isReceiving;

  const getThemeClass = (theme: string) => {
    const t = theme?.toLowerCase() || '';
    if (t === 'theme-classic' || t.includes('classic')) return 'theme-classic';
    if (t === 'theme-v1' || t.includes('v1')) return 'theme-v1';
    if (t === 'theme-v2' || t.includes('v2')) return 'theme-v2';
    if (t === 'theme-v3' || t.includes('v3')) return 'theme-v3';
    if (t === 'theme-v4' || t.includes('v4')) return 'theme-v4';
    if (t === 'theme-v5' || t.includes('v5')) return 'theme-v5';
    if (t === 'theme-v6' || t.includes('v6')) return 'theme-v6';
    if (t === 'theme-monokrom' || t.includes('monokrom') || t === 'mono') return 'theme-monokrom';
    return 'theme-classic';
  };

  // Reset progress when not transmitting and not receiving
  useEffect(() => {
    if (isTransmitting) return;

    const isReceiving =
      activeTransmitter && activeTransmitter.userId !== usePTTStore.getState().userId;
    if (!isReceiving) {
      setProgress(0);
    }
  }, [isTransmitting, activeTransmitter, setProgress]);

  // Manage audio recording when transmitting
  useEffect(() => {
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
          // Local loopback offline fallback
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
      setTxStartTime(Date.now());
    } else {
      stopRecording();

      // Playback recorded chunks on Channel 100 after PTT released (Parrot Echo Test)
      const currentChannel = usePTTStore.getState().channelNumber;
      if (currentChannel === 100 && echoChunksRef.current.length > 0) {
        const chunksToPlay = [...echoChunksRef.current];
        echoChunksRef.current = [];
        setTimeout(() => {
          chunksToPlay.forEach((chunk) => {
            playAudioChunk(chunk);
          });
        }, 350);
      }

      // Logic untuk memicu FeedbackModal jika pengguna baru selesai transmit
      if (txStartTime > 0) {
        const txDuration = Date.now() - txStartTime;
        const lastFeedback = usePTTStore.getState().lastFeedbackTime;
        const timeSinceLastFeedback = Date.now() - lastFeedback;
        const ONE_DAY = 24 * 60 * 60 * 1000;

        // Tampilkan modal jika durasi transmisi > 3 detik dan sudah lewat 1 hari sejak prompt terakhir
        if (txDuration > 3000 && timeSinceLastFeedback > ONE_DAY) {
          usePTTStore.getState().setShowFeedbackModal(true);
        }
        setTxStartTime(0);
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

  const resetWatchdogRef = useRef<(() => void) | null>(null);

  // Watchdog timer to automatically clear stale/silent transmitter
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

  const setOnVoiceChunkReceived = usePTTStore((state) => state.setOnVoiceChunkReceived);

  // Manage incoming audio chunks from other users
  useEffect(() => {
    setOnVoiceChunkReceived((base64) => {
      if (isPowerOn && channel !== 100) {
        playAudioChunk(base64);
        if (resetWatchdogRef.current) {
          resetWatchdogRef.current();
        }
      }
    });
    return () => {
      setOnVoiceChunkReceived(null);
    };
  }, [isPowerOn, channel, setOnVoiceChunkReceived, playAudioChunk]);

  // Stop recording and flush queue on power off
  useEffect(() => {
    if (!isPowerOn) {
      stopRecording();
      flushAudioQueue();
    }
  }, [isPowerOn, stopRecording, flushAudioQueue]);

  // Scanning effect
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        channelUp();
      }, 1500); // 1.5s delay to listen to channels and avoid connection flooding
      return () => clearInterval(interval);
    }
  }, [isScanning, channelUp]);

  // Auto-close settings, user list, and karaoke player if power is turned off
  useEffect(() => {
    if (!isPowerOn) {
      setIsSettingsOpen(false);
      setIsChannelListOpen(false);
      setIsUserListOpen(false);
      setIsKaraokePlayerOpen(false);
    }
  }, [isPowerOn, setIsKaraokePlayerOpen]);

  const handleSet = () => {
    if (isPowerOn) {
      setIsSettingsOpen(true);
    }
  };

  const activeChannelObj = STATIC_CHANNELS.find((ch) => ch.number === channel);

  const safeActiveUsers = activeUsers || [];

  const dynamicUserCount =
    isConnected && safeActiveUsers.length > 0
      ? safeActiveUsers.length
      : getChannelUserCount(channel);

  const dynamicUserList =
    isConnected && safeActiveUsers.length > 0 ? safeActiveUsers : activeChannelObj?.users || [];

  const displayUser = infoText ? infoText.toUpperCase() : 'USER';
  const displayLoc = locationText ? locationText.toUpperCase() : 'BANDUNG, JAWA BARAT';
  const channelNameStr = activeChannelObj ? activeChannelObj.name.toUpperCase() : 'STANDBY CHANNEL';
  const marqueeText = `CHANNEL ${channel} • ${channelNameStr} • ${displayUser} (${displayLoc}) • STANDBY • READY`;

  return (
    <div
      onClick={() => {
        if (isPowerOn && isUserListOpen) {
          setIsUserListOpen(false);
        }
      }}
      className={`w-full h-dvh sm:w-[360px] sm:h-[800px] bg-white sm:rounded-[40px] overflow-hidden relative sm:shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:border-[8px] sm:border-[#2a2d36] flex-shrink-0 flex flex-col ${getThemeClass(themeText)}`}
      style={{
        boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.1)',
      }}
    >
      {isSettingsOpen ? (
        // Suspense boundary: tampilkan skeleton saat SettingsPanel sedang dimuat
        // (hanya terjadi pada kali pertama Settings dibuka dalam sesi ini)
        <Suspense fallback={<SettingsPanelSkeleton />}>
          <SettingsPanel onClose={() => setIsSettingsOpen(false)} />
        </Suspense>
      ) : (
        <div
          className="size-full flex flex-col items-center overflow-hidden relative transition-all duration-300"
          style={{
            background: 'var(--device-bg)',
            boxShadow: 'var(--device-shadow)',
            border: 'var(--device-border)',
          }}
        >
          {/* Top Bar */}
          <div
            className="w-full h-[90px] flex items-center justify-between px-5 z-20 relative overflow-hidden"
            style={{
              background: 'var(--header-bg)',
              boxShadow:
                'var(--header-shadow), inset 0 -12px 20px -6px rgba(0, 0, 0, 0.45), inset 0 3px 6px rgba(255, 255, 255, 0.4)',
              borderBottom: 'var(--header-border)',
            }}
          >
            {/* Top Glossy Reflection */}
            <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/35 to-transparent pointer-events-none z-10" />
            <div
              onClick={() => {
                if (isPowerOn) {
                  setIsUserListOpen(!isUserListOpen);
                }
              }}
              className={`flex items-center gap-3 relative z-20 ${isPowerOn ? 'cursor-pointer hover:opacity-85 active:scale-98 transition-all' : ''}`}
            >
              {/* Logo Section */}
              <div className="relative flex items-center justify-center h-full">
                <div className="relative flex items-center justify-center">
                  {isTransmitting && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div
                        className="logo-transmitting-bg"
                        style={{ width: '75px', height: '75px' }}
                      >
                        <div className="extra-ripple"></div>
                      </div>
                    </div>
                  )}
                  <svg
                    viewBox="0 0 100 100"
                    className={`h-[55px] w-auto relative z-20 transition-all duration-300 ${isTransmitting ? 'logo-transmitting' : ''}`}
                    style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))' }}
                  >
                    <defs>
                      <radialGradient id="nextvwtSphere3D" cx="32%" cy="30%" r="68%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                        <stop offset="18%" stopColor="#ff6b6b" />
                        <stop offset="50%" stopColor="#cc0000" />
                        <stop offset="80%" stopColor="#800000" />
                        <stop offset="100%" stopColor="#3d0000" />
                      </radialGradient>
                    </defs>

                    <path
                      d="M 22 77 A 38 38 0 1 1 78 77"
                      stroke="#0a2e1a"
                      strokeWidth="6"
                      strokeLinecap="round"
                      fill="none"
                      transform="translate(1, 1.2)"
                      opacity="0.5"
                    />
                    <path
                      d="M 22 77 A 38 38 0 1 1 78 77"
                      stroke="#34D399"
                      strokeWidth="6"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 22 77 A 38 38 0 1 1 78 77"
                      stroke="#a7f3d0"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.65"
                      transform="translate(-0.6, -0.7)"
                    />

                    <path
                      d="M 29 71 A 28 28 0 1 1 71 71"
                      stroke="#064e3b"
                      strokeWidth="6"
                      strokeLinecap="round"
                      fill="none"
                      transform="translate(1, 1.2)"
                      opacity="0.5"
                    />
                    <path
                      d="M 29 71 A 28 28 0 1 1 71 71"
                      stroke="#10B981"
                      strokeWidth="6"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 29 71 A 28 28 0 1 1 71 71"
                      stroke="#6ee7b7"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.65"
                      transform="translate(-0.6, -0.7)"
                    />

                    <path
                      d="M 36 65 A 18 18 0 1 1 64 65"
                      stroke="#003a17"
                      strokeWidth="6"
                      strokeLinecap="round"
                      fill="none"
                      transform="translate(1, 1.2)"
                      opacity="0.5"
                    />
                    <path
                      d="M 36 65 A 18 18 0 1 1 64 65"
                      stroke="#00C853"
                      strokeWidth="6"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 36 65 A 18 18 0 1 1 64 65"
                      stroke="#69f0ae"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.65"
                      transform="translate(-0.6, -0.7)"
                    />

                    <circle
                      cx="50"
                      cy="50"
                      r="11"
                      fill="#1a0000"
                      transform="translate(1.2, 1.5)"
                      opacity="0.45"
                    />
                    <circle cx="50" cy="50" r="11" fill="url(#nextvwtSphere3D)" />
                    <circle
                      cx="50"
                      cy="50"
                      r="11"
                      fill="none"
                      stroke="#ff4444"
                      strokeWidth="0.8"
                      opacity="0.4"
                    />
                    <ellipse
                      cx="46.5"
                      cy="45.5"
                      rx="3.2"
                      ry="2.2"
                      fill="white"
                      opacity="0.7"
                      transform="rotate(-25, 46.5, 45.5)"
                    />
                  </svg>
                </div>
                <div
                  className={`flex flex-col justify-center relative z-20 transition-all duration-300 ${isTransmitting ? 'logo-transmitting' : ''} ml-2`}
                >
                  <span
                    className="text-[18px] font-bold leading-tight tracking-wide"
                    style={{
                      fontFamily: "'Outfit', 'Orbitron', system-ui, -apple-system, sans-serif",
                      color: 'var(--header-text-color)',
                    }}
                  >
                    {BRAND.name}
                  </span>
                  <div className="w-[120px] overflow-hidden whitespace-nowrap relative h-[16px] mt-0.5">
                    <div
                      className="absolute top-0 left-0 inline-block animate-marquee text-[10px] font-semibold tracking-wide"
                      style={{ color: 'var(--header-text-color)', opacity: 0.65 }}
                    >
                      {marqueeText}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ToggleSwitch isOn={isPowerOn} onToggle={() => setIsPowerOn(!isPowerOn)} />
            </div>
          </div>

          {/* Main Content */}
          <div
            onClick={() => {
              if (isPowerOn && isUserListOpen) {
                setIsUserListOpen(false);
              }
            }}
            className="flex-1 min-h-0 w-full max-w-[400px] flex flex-col items-center pt-[14px] px-[10px] pb-20 relative cursor-default"
          >
            {isUserListOpen ? (
              <UserListModal
                channel={channel}
                channelName={channelNameStr}
                users={dynamicUserList}
                onClose={() => setIsUserListOpen(false)}
              />
            ) : (
              /* Themed Faceplate Container */
              <div
                className="w-full flex flex-col items-center pt-6 pb-3 relative z-10 transition-all duration-300"
                style={{
                  borderRadius: '40px 40px 200px 200px / 40px 40px 90px 90px',
                  background: 'var(--panel-bg)',
                  boxShadow: 'var(--panel-shadow)',
                  border: 'var(--panel-border)',
                  backdropFilter: 'var(--panel-blur)',
                }}
              >
                {/* 3D Faceplate Outer Highlight and Shadow Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none z-20"
                  style={{
                    borderRadius: '40px 40px 200px 200px / 40px 40px 90px 90px',
                    boxShadow:
                      'inset 0 1.5px 2px rgba(255, 255, 255, 0.95), inset 0 3px 4px rgba(0, 0, 0, 0.4), inset 0 -3px 4px rgba(0, 0, 0, 0.4), inset 3px 0 4px rgba(0, 0, 0, 0.3), inset -3px 0 4px rgba(0, 0, 0, 0.3)',
                  }}
                />
                {/* LCD Panel */}
                <div className="transition-opacity duration-300 flex justify-center w-full">
                  <LCDPanel
                    channel={channel}
                    userCount={dynamicUserCount}
                    isOffline={!isConnected}
                    isPowerOn={isPowerOn}
                    onUserCountClick={() => setIsUserListOpen(true)}
                  />
                </div>

                {/* Progress Bar */}
                {showModulator && (
                  <div
                    className={`mt-2 flex justify-center transition-opacity duration-300 w-full ${isPowerOn ? 'opacity-100' : 'opacity-30'}`}
                  >
                    <ProgressBar progress={progress} />
                  </div>
                )}

                {/* Control Buttons */}
                <div
                  className={`mt-1 mb-0.5 flex justify-center transition-opacity duration-300 w-full ${isPowerOn ? '' : 'pointer-events-none'}`}
                >
                  <ControlButtons
                    onScan={() => setIsChannelListOpen(true)}
                    onSet={handleSet}
                    onUp={channelUp}
                    onDown={channelDown}
                    isScanning={isScanning}
                  />
                </div>
              </div>
            )}

            {/* PTT Button */}
            {showPTT && (
              <div
                className={`absolute left-0 right-0 w-full flex justify-center transition-opacity duration-300 opacity-100 ${isPowerOn ? '' : 'pointer-events-none'}`}
                style={{ bottom: 'calc(24px + env(safe-area-inset-bottom, 12px))' }}
              >
                <div onClick={(e) => e.stopPropagation()}>
                  <PTTButton
                    isActive={isTransmitting}
                    isBusy={isBusy}
                    onPressStart={() => isPowerOn && setIsTransmitting(true)}
                    onPressEnd={() => setIsTransmitting(false)}
                  />
                </div>
              </div>
            )}

            {/* Floating Karaoke Player — lazy-loaded, hanya mount saat mode music aktif */}
            {isPowerOn && audioMode === 'music' && isKaraokePlayerOpen && (
              <div onClick={(e) => e.stopPropagation()}>
                <Suspense fallback={<KaraokePlayerSkeleton />}>
                  <FloatingKaraokePlayer onClose={() => setIsKaraokePlayerOpen(false)} />
                </Suspense>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Channel List Modal Dialog */}
      {isChannelListOpen && (
        <ChannelListModal
          onClose={() => setIsChannelListOpen(false)}
          onSelectChannel={(num) => setChannelNumber(num)}
        />
      )}

      {/* In-App Feedback Modal */}
      <FeedbackModal />
    </div>
  );
}
