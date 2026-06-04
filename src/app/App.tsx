import { useEffect, useState } from 'react';
import { ToggleSwitch } from './components/ToggleSwitch';
import { LCDPanel } from './components/LCDPanel';
import { ProgressBar } from './components/ProgressBar';
import { ControlButtons } from './components/ControlButtons';
import { PTTButton } from './components/PTTButton';
import { usePTTStore } from './store/usePTTStore';
import { SettingsPanel } from './components/SettingsPanel';
import { Toaster } from './components/ui/sonner';

interface ChannelItem {
  number: number;
  name: string;
  type: 'green' | 'red' | 'gray';
  users: string[];
}

const STATIC_CHANNELS: ChannelItem[] = [
  { number: 0, name: 'CH-DARURAT / SAR INFO', type: 'red', users: [] },
  {
    number: 1,
    name: 'KOPDAR NASIONAL UTAMA',
    type: 'green',
    users: ['antoni_99', 'budi_salatiga', 'rudi_bandung'],
  },
  { number: 2, name: 'LINTAS SUMATERA DX', type: 'green', users: ['medan_dx', 'palembang_line'] },
  { number: 3, name: 'LINTAS JAWA DX LINE', type: 'green', users: [] },
  { number: 4, name: 'LINTAS BALI & NTT DX', type: 'green', users: [] },
  {
    number: 5,
    name: 'KOMUNITAS MOTOR INDO',
    type: 'green',
    users: ['touring_rider', 'ninja_club'],
  },
  {
    number: 6,
    name: 'PATROLI KEAMANAN WARGA',
    type: 'red',
    users: ['pak_rudi_rt', 'siskamling_1'],
  },
  { number: 7, name: 'INFO MUDIK & LALIN', type: 'red', users: ['lalin_update'] },
  { number: 8, name: 'CH-KEDALUWARSA', type: 'gray', users: [] },
  { number: 9, name: 'STANDBY CHANNEL 09', type: 'gray', users: [] },
  { number: 10, name: 'STANDBY CHANNEL 10', type: 'gray', users: [] },
  {
    number: 11,
    name: 'PAGUYUBAN JABODETABEK',
    type: 'green',
    users: ['anto_bekasi', 'doni_depok'],
  },
  { number: 12, name: 'DX SULAWESI & MALUKU', type: 'green', users: ['makassar_boy'] },
  { number: 13, name: 'RELAWAN KEMANUSIAAN', type: 'red', users: ['sar_team_1'] },
  { number: 14, name: 'STANDBY CHANNEL 14', type: 'gray', users: [] },
  { number: 15, name: 'STANDBY CHANNEL 15', type: 'gray', users: [] },
  { number: 16, name: 'STANDBY CHANNEL 16', type: 'gray', users: [] },
  { number: 17, name: 'STANDBY CHANNEL 17', type: 'gray', users: [] },
  { number: 18, name: 'STANDBY CHANNEL 18', type: 'gray', users: [] },
  { number: 19, name: 'STANDBY CHANNEL 19', type: 'gray', users: [] },
  { number: 20, name: 'PECINTA ALAM INDO', type: 'green', users: ['mount_hiker'] },
  { number: 21, name: 'STANDBY CHANNEL 21', type: 'gray', users: [] },
  { number: 22, name: 'STANDBY CHANNEL 22', type: 'gray', users: [] },
  { number: 23, name: 'STANDBY CHANNEL 23', type: 'gray', users: [] },
  { number: 24, name: 'STANDBY CHANNEL 24', type: 'gray', users: [] },
  { number: 25, name: 'STANDBY CHANNEL 25', type: 'gray', users: [] },
  { number: 26, name: 'STANDBY CHANNEL 26', type: 'gray', users: [] },
  { number: 27, name: 'STANDBY CHANNEL 27', type: 'gray', users: [] },
  { number: 28, name: 'STANDBY CHANNEL 28', type: 'gray', users: [] },
  { number: 29, name: 'STANDBY CHANNEL 29', type: 'gray', users: [] },
  { number: 30, name: 'BANTUAN TEKNIS ADMIN', type: 'red', users: ['support_admin'] },
];

export default function App() {
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
    initializeSession,
    setPower: setIsPowerOn,
    setConnected: setIsConnected,
    setTransmitting: setIsTransmitting,
    setProgress,
    channelUp,
    channelDown,
    toggleScan,
    setChannelNumber,
  } = usePTTStore();

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Simulate progress when transmitting
  useEffect(() => {
    if (isTransmitting) {
      setProgress(50); // Start at mid
      const interval = setInterval(() => {
        // Random fluctuation between 30% and 100% to simulate voice modulation
        setProgress(Math.floor(Math.random() * 70) + 30);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setProgress(0); // Go to 0 when not transmitting
    }
  }, [isTransmitting]);

  // Scanning effect
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        channelUp();
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isScanning, channelUp]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChannelListOpen, setIsChannelListOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-close settings if power is turned off
  useEffect(() => {
    if (!isPowerOn) {
      setIsSettingsOpen(false);
      setIsChannelListOpen(false);
    }
  }, [isPowerOn]);

  const handleSet = () => {
    if (isPowerOn) {
      setIsSettingsOpen(true);
    }
  };

  const displayUser = infoText ? infoText.toUpperCase() : 'USER';
  const displayLoc = locationText ? locationText.toUpperCase() : 'BANDUNG, JAWA BARAT';
  const marqueeText = `CHANNEL ${channel} • ${displayUser} (${displayLoc}) • STANDBY • READY`;

  const filteredChannels = STATIC_CHANNELS.filter(
    (ch) =>
      ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.number.toString().includes(searchQuery)
  );

  return (
    <div className="min-h-screen w-full bg-[#1a1c23] flex items-center justify-center sm:p-4 select-none overflow-auto">
      {/* Mobile Device Wrapper - Responsive to fit Android/iOS viewports and mock device on Desktop */}
      <div
        className="w-full h-full min-h-screen sm:min-h-0 sm:w-[412px] sm:h-[892px] bg-white sm:rounded-[40px] overflow-hidden relative sm:shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:border-[8px] sm:border-[#2a2d36] flex-shrink-0 flex flex-col"
        style={{
          boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.1)',
        }}
      >
        {isSettingsOpen ? (
          <SettingsPanel onClose={() => setIsSettingsOpen(false)} />
        ) : (
          <div
            className="size-full flex flex-col items-center bg-gradient-to-b from-[#f5f6f8] to-[#9eb1ca] overflow-hidden relative"
            style={{
              boxShadow:
                'inset 0 8px 15px rgba(0,0,0,0.04), inset 0 -25px 50px rgba(0,0,0,0.25), inset 20px 0 40px rgba(0,0,0,0.1), inset -20px 0 40px rgba(0,0,0,0.1)',
            }}
          >
            <style>{`
            @keyframes signalRadiate {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        .logo-transmitting {
          animation: signalRadiate 1.5s ease-in-out infinite;
        }
        .logo-transmitting-bg {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-transmitting-bg::before,
        .logo-transmitting-bg::after,
        .logo-transmitting-bg .extra-ripple {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          width: 75px;
          height: 75px;
          border-radius: 50%;
          border: 3px solid rgba(0, 255, 102, 0);
          box-shadow: 0 0 0 rgba(0, 255, 102, 0);
          animation: radialSignal 1.5s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
        }
        .logo-transmitting-bg::after {
          animation-delay: 0.5s;
        }
        .logo-transmitting-bg .extra-ripple {
          animation-delay: 1.0s;
        }
        @keyframes radialSignal {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            border-color: rgba(0, 255, 102, 1);
            border-width: 4px;
            box-shadow: 0 0 12px rgba(0, 255, 102, 0.8), inset 0 0 8px rgba(0, 255, 102, 0.6);
          }
          100% {
            transform: translate(-50%, -50%) scale(2.5);
            border-color: rgba(0, 255, 102, 0);
            border-width: 1px;
            box-shadow: 0 0 20px rgba(0, 255, 102, 0), inset 0 0 20px rgba(0, 255, 102, 0);
          }
        }
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 8s linear infinite;
        }
      `}</style>
            {/* Top Bar */}
            <div
              className="w-full h-[90px] flex items-center justify-between px-5 z-20 relative"
              style={{
                background:
                  'linear-gradient(to bottom, #ffffff 0%, #f0f3f6 40%, #dee4ea 85%, #cbd4de 100%)',
                boxShadow:
                  '0 6px 12px -6px rgba(0,0,0,0.2), 0 2px 4px -2px rgba(0,0,0,0.1), inset 0 -6px 8px -4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,1)',
                borderBottom: '1px solid #a4b0be',
              }}
            >
              <div className="flex items-center gap-3 relative z-20">
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
                      style={{
                        transform: 'translateZ(1px)',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
                      }}
                    >
                      {/* Central Red Circle */}
                      <circle cx="50" cy="50" r="10" fill="#EF4444" />

                      {/* Concentric Green Signal Arcs - Fading Outwards */}
                      <path
                        d="M 37.3 62.7 A 18 18 0 1 1 62.7 62.7"
                        stroke="#10B981"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <path
                        d="M 30.2 69.8 A 28 28 0 1 1 69.8 69.8"
                        stroke="#34D399"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <path
                        d="M 23.1 76.9 A 38 38 0 1 1 76.9 76.9"
                        stroke="#A7F3D0"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  </div>
                  <div
                    className={`flex flex-col justify-center relative z-20 transition-all duration-300 ${isTransmitting ? 'logo-transmitting' : ''} ml-2`}
                  >
                    <span
                      className="text-[14px] text-black font-bold leading-tight tracking-wide"
                      style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                      }}
                    >
                      NextVWT
                    </span>
                    <div className="w-[120px] overflow-hidden whitespace-nowrap relative h-[16px] mt-0.5">
                      <div className="absolute inline-block animate-marquee text-[10px] text-gray-500 font-medium tracking-wide">
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
            <div className="flex-1 w-full max-w-[400px] flex flex-col items-center pt-8 pb-20 px-4 relative">
              {/* White Faceplate Container */}
              <div
                className="w-full bg-[#f0f3f6] flex flex-col items-center pt-6 pb-10 relative z-10"
                style={{
                  borderRadius: '40px 40px 200px 200px / 40px 40px 90px 90px',
                  boxShadow:
                    '0 15px 35px rgba(0,0,0,0.15), 0 5px 15px rgba(0,0,0,0.1), inset 0 6px 10px rgba(255,255,255,1), inset 0 -12px 25px rgba(0,0,0,0.2), inset 12px 0 20px rgba(0,0,0,0.08), inset -12px 0 20px rgba(0,0,0,0.08)',
                  border: '1px solid #dbe2e9',
                }}
              >
                {/* LCD Panel */}
                <div className="transition-opacity duration-300 flex justify-center w-full">
                  <LCDPanel channel={channel} isOffline={!isConnected} isPowerOn={isPowerOn} />
                </div>

                {/* Progress Bar */}
                {showModulator && (
                  <div
                    className={`mt-4 flex justify-center transition-opacity duration-300 w-full ${isPowerOn ? 'opacity-100' : 'opacity-30'}`}
                  >
                    <ProgressBar progress={progress} />
                  </div>
                )}

                {/* Control Buttons */}
                <div
                  className={`mt-8 mb-4 flex justify-center transition-opacity duration-300 w-full ${isPowerOn ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}
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

              {/* PTT Button */}
              {showPTT && (
                <div
                  className={`mt-24 mb-8 w-full flex justify-center transition-opacity duration-300 ${isPowerOn ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}
                >
                  <PTTButton
                    isActive={isTransmitting}
                    onPressStart={() => isPowerOn && setIsTransmitting(true)}
                    onPressEnd={() => setIsTransmitting(false)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        <Toaster />

        {/* Channel List Modal Dialog */}
        {isChannelListOpen && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            {/* Backdrop Dismiss */}
            <div
              className="absolute inset-0"
              onClick={() => {
                setIsChannelListOpen(false);
                setSearchQuery('');
              }}
            />

            {/* Modal Container */}
            <div className="bg-white w-[90%] max-h-[80%] rounded-lg shadow-2xl flex flex-col z-10 overflow-hidden border border-gray-300 animate-in fade-in zoom-in-95 duration-100">
              {/* Header */}
              <div className="flex items-center px-4 py-3 bg-white shrink-0 border-b border-gray-200 justify-between">
                <span className="text-[16px] font-bold text-gray-800">Daftar Channel</span>
                <button
                  onClick={() => {
                    setIsChannelListOpen(false);
                    setSearchQuery('');
                  }}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer focus:outline-none"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-3 bg-gray-50 border-b border-gray-100 shrink-0">
                <input
                  type="text"
                  placeholder="Cari channel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs bg-white text-black outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto bg-white text-left divide-y divide-gray-200">
                {filteredChannels.length > 0 ? (
                  filteredChannels.map((ch) => {
                    let bgClass = 'bg-gradient-to-b from-[#9E9E9E] to-[#616161]'; // Default gray
                    if (ch.type === 'green') {
                      // High-end blue gradient like INDOVWT
                      bgClass = 'bg-gradient-to-b from-[#1e88e5] to-[#1565c0]';
                    } else if (ch.type === 'red') {
                      // High-end red gradient
                      bgClass = 'bg-gradient-to-b from-[#e53935] to-[#c62828]';
                    }

                    const activeUserCount = ch.users.length;
                    const activeUsersStr =
                      activeUserCount > 0
                        ? `${activeUserCount} PENGGUNA • ${ch.users.join(', ')}`
                        : '0 PENGGUNA';

                    return (
                      <button
                        key={ch.number}
                        onClick={() => {
                          setChannelNumber(ch.number);
                          setIsChannelListOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center p-0 hover:bg-gray-50 active:bg-gray-100 text-left cursor-pointer select-none focus:outline-none"
                      >
                        <div
                          className={`w-[55px] py-2.5 flex items-center justify-center text-white font-bold text-sm shrink-0 ${bgClass} border-t-[2px] border-l-[2px] border-t-white/45 border-l-white/45 border-r-[2px] border-b-[2px] border-r-black/45 border-b-black/45 shadow-[inset_1px_1px_0px_rgba(255,255,255,0.3)]`}
                          style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.6)' }}
                        >
                          {ch.number.toString().padStart(3, '0')}
                        </div>
                        <div className="ml-3 pr-3 flex-1 min-w-0 py-1">
                          <div className="text-xs font-bold text-black truncate">{ch.name}</div>
                          <div className="text-[10px] text-gray-500 font-semibold truncate mt-0.5 uppercase">
                            {activeUsersStr}
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-xs text-gray-500 font-medium">
                    Tidak ada channel ditemukan
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
