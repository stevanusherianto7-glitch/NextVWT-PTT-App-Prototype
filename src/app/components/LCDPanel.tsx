import React, { useState, useEffect } from 'react';
import twinHeadsIcon from '../../imports/ikon_kepala_kembar-2.png';
import usernameIcon from '../../imports/ikon_username1.png';
import { usePTTStore } from '../store/usePTTStore';

interface LCDPanelProps {
  channel: number;
  userCount?: number;
  isOffline?: boolean;
  isPowerOn?: boolean;
  onUserCountClick?: () => void;
}

export function LCDPanel({
  channel,
  userCount = 0,
  isOffline = false,
  isPowerOn: _isPowerOn = true,
  onUserCountClick,
}: LCDPanelProps) {
  const channelStr = channel.toString().padStart(3, '0');
  const infoText = usePTTStore((state) => state.infoText);
  const user = usePTTStore((state) => state.user);
  const activeTransmitter = usePTTStore((state) => state.activeTransmitter);
  const isTransmitting = usePTTStore((state) => state.isTransmitting);
  const localUserId = usePTTStore((state) => state.userId);

  const localName = user?.user_metadata?.full_name || infoText || 'Pebe Herianto';
  const isReceiving = activeTransmitter && activeTransmitter.userId !== localUserId;
  const username = isTransmitting
    ? localName
    : isReceiving
      ? activeTransmitter?.displayName
      : localName;

  // Signal strength simulator (fluctuates 1-4 bars when online, 0 when offline)
  const [signalBars, setSignalBars] = useState(4);

  // Latency info tooltip interaction
  const [showLatency, setShowLatency] = useState(false);
  const [latencyVal, setLatencyVal] = useState(77);

  const handleSignalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showLatency) {
      setShowLatency(false);
      return;
    }

    if (isOffline) {
      setLatencyVal(999);
      setShowLatency(true);
      return;
    }

    let base = 77;
    if (signalBars === 4) {
      base = Math.floor(Math.random() * 15) + 25; // 25-40ms
    } else if (signalBars === 3) {
      base = Math.floor(Math.random() * 25) + 45; // 45-70ms
    } else if (signalBars === 2) {
      base = Math.floor(Math.random() * 45) + 75; // 75-120ms
    } else if (signalBars === 1) {
      base = Math.floor(Math.random() * 100) + 125; // 125-225ms
    }
    setLatencyVal(base);
    setShowLatency(true);
  };

  useEffect(() => {
    if (showLatency) {
      const timer = setTimeout(() => {
        setShowLatency(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showLatency]);

  useEffect(() => {
    if (isOffline) {
      setSignalBars(0);
      return;
    }

    // Default to 4 bars
    setSignalBars(4);

    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.75) {
        setSignalBars(4);
      } else if (rand < 0.9) {
        setSignalBars(3);
      } else if (rand < 0.97) {
        setSignalBars(2);
      } else {
        setSignalBars(1);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOffline]);

  return (
    <div
      className="relative w-[300px] h-[155px] rounded-3xl mx-auto transition-all duration-300"
      style={{
        background: 'var(--lcd-bg)',
        boxShadow: 'var(--lcd-glow)',
        borderWidth: '10px',
        borderStyle: 'solid',
        borderTopColor: 'var(--lcd-border-top)',
        borderRightColor: 'var(--lcd-border-right)',
        borderBottomColor: 'var(--lcd-border-bottom)',
        borderLeftColor: 'var(--lcd-border-left)',
      }}
    >
      {/* 3D Gold Bezel Emboss Overlay */}
      <div
        className="absolute -inset-[10px] pointer-events-none rounded-3xl"
        style={{
          boxShadow:
            'inset 0 0 0 1px rgba(0,0,0,0.22), inset 0 3.5px 6px rgba(255,255,255,0.45), inset 0 -3.5px 6px rgba(0,0,0,0.45), inset 0 0 10px rgba(0,0,0,0.15)',
        }}
      />

      {/* 3D Border Overlay */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.4), inset 0 0 10px rgba(0,0,0,0.6)',
        }}
      />

      {/* Content */}
      <div className="relative p-3 h-full flex flex-col justify-between transition-opacity duration-300 opacity-100">
        {/* Top status bar */}
        <div className="flex items-start justify-between">
          {/* Top Left: Username Icon and Letter */}
          <div className="flex items-center gap-1.5 pt-1">
            <img
              src={usernameIcon}
              alt="Username Icon"
              className="h-[58px] w-auto object-contain -mt-3.5 -ml-1"
              style={{ filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.2))' }}
            />
            <span
              className="text-base -ml-1 truncate max-w-[110px]"
              style={{ fontWeight: 600, color: 'var(--lcd-label-color)' }}
            >
              {username}
            </span>
          </div>

          {/* OFFLINE Badge */}
          {isOffline && (
            <div
              className="absolute left-1/2 -translate-x-1/2 top-3 px-2 py-0.5 rounded-full bg-[#E53935] flex items-center gap-1"
              style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.3)', border: '1px solid #d32f2f' }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M4 12a8 8 0 0 1 16 0" />
                <path d="M8 12a4 4 0 0 1 8 0" />
                <circle cx="12" cy="12" r="1" />
              </svg>
              <span className="text-[10px] text-white font-bold tracking-wide uppercase">
                Offline
              </span>
            </div>
          )}

          {/* Signal Bar */}
          <div
            onClick={handleSignalClick}
            className="flex items-end h-[28px] relative gap-1 mt-1 mr-1 cursor-pointer select-none"
          >
            {isOffline && (
              <span className="text-[#d32f2f] font-black text-base leading-none absolute -left-2 top-0 z-10 drop-shadow-[1px_1px_0px_rgba(255,255,255,0.6)]">
                ×
              </span>
            )}

            {/* Latency Tooltip */}
            {showLatency && (
              <div
                className="absolute bottom-full right-0 mb-1.5 px-2 py-0.5 rounded bg-black text-white text-[10px] font-sans font-medium border border-neutral-800 shadow-lg whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-150"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
                }}
              >
                {isOffline ? 'Latency: Offline' : `Latency: ${latencyVal}ms`}
              </div>
            )}

            {/* Signal Bars SVG approach */}
            <div className="flex items-end gap-0 h-full pb-[2px] relative">
              {[1, 2, 3, 4].map((bar) => {
                const isActive = bar <= signalBars;
                let barBackground =
                  'linear-gradient(to bottom, #ffffff 0%, #e5e5e5 50%, #cccccc 100%)';

                if (isActive) {
                  if (signalBars >= 3) {
                    barBackground =
                      'linear-gradient(to bottom, #a2f3a5 0%, #00e64d 40%, #009c34 100%)';
                  } else if (signalBars === 2) {
                    barBackground =
                      'linear-gradient(to bottom, #ffea85 0%, #ffbb00 40%, #cc9600 100%)';
                  } else if (signalBars === 1) {
                    barBackground =
                      'linear-gradient(to bottom, #ff9999 0%, #ff3333 40%, #b31a1a 100%)';
                  }
                }

                return (
                  <div
                    key={bar}
                    className="flex-shrink-0"
                    style={{
                      width: '9px',
                      height: `${bar * 6 + 3}px`,
                      background: barBackground,
                      border: '1px solid #1a1a1a',
                      borderRadius: '1.5px',
                      boxShadow:
                        'inset 1px 1.5px 0.5px rgba(255,255,255,0.5), inset -1px -1px 0.5px rgba(0,0,0,0.3)',
                      opacity: 1,
                      transition: 'background 0.2s ease-in-out',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Center/Bottom Content */}
        <div className="flex justify-between items-end pb-0 px-1 mt-auto">
          <div className="flex items-end gap-1">
            <div
              className="relative"
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                paddingBottom: '5px',
                color: 'var(--lcd-label-color)',
              }}
            >
              CH
            </div>
            <div
              className="relative"
              style={{
                fontFamily: "'DSEG7', monospace",
                fontSize: '52px',
                fontWeight: 'bold',
                lineHeight: 0.75,
                marginLeft: '-2px',
                textShadow: 'var(--lcd-glow)',
                paddingBottom: '5px',
                color: 'var(--lcd-text-color)',
              }}
            >
              {channelStr}
            </div>
          </div>

          {/* Bottom Right: Twin Heads & Enlarged User Count (Shifted Left via margin) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (_isPowerOn && onUserCountClick) {
                onUserCountClick();
              }
            }}
            className={`flex items-end gap-0.5 mr-4 relative transition-[opacity,transform] duration-150 ${_isPowerOn && onUserCountClick ? 'cursor-pointer hover:opacity-75 active:scale-95' : ''}`}
            style={{ paddingBottom: '5px' }}
          >
            <div className="flex items-center justify-center">
              <img
                src={twinHeadsIcon}
                alt="User Count Icon"
                className="h-[58px] w-auto object-contain"
                style={{ filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.2))' }}
              />
            </div>
            <span
              className="text-2xl font-medium tracking-tight leading-none"
              style={{
                textShadow: '1px 1px 1px rgba(255,255,255,0.3)',
                color: 'var(--lcd-label-color)',
              }}
            >
              {_isPowerOn ? userCount.toString().padStart(2, '0') : '00'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
