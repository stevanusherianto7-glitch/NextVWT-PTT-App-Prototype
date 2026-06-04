import React, { useState, useEffect } from 'react';
import twinHeadsIcon from '../../imports/ikon_kepala_kembar-2.png';
import usernameIcon from '../../imports/ikon_username1.png';
import { usePTTStore } from '../store/usePTTStore';

interface LCDPanelProps {
  channel: number;
  userCount?: number;
  isOffline?: boolean;
  isPowerOn?: boolean;
}

export function LCDPanel({
  channel,
  userCount = 0,
  isOffline = false,
  isPowerOn = true,
}: LCDPanelProps) {
  const channelStr = channel.toString().padStart(3, '0');
  const infoText = usePTTStore((state) => state.infoText);
  const displayChar = infoText ? infoText.trim().charAt(0).toLowerCase() : 'p';

  // Signal strength simulator (fluctuates 1-4 bars when online, 0 when offline)
  const [signalBars, setSignalBars] = useState(4);

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
      className="relative w-[340px] h-[155px] rounded-3xl overflow-hidden mx-auto transition-colors duration-300"
      style={{
        background: isPowerOn
          ? 'linear-gradient(to bottom, #FF9500 0%, #d87d00 100%)'
          : 'linear-gradient(to bottom, #4a4a4a 0%, #2a2a2a 100%)',
        boxShadow:
          'inset 0 4px 10px rgba(0,0,0,0.5), inset 0 -2px 5px rgba(255,255,255,0.2), 0 8px 20px rgba(0,0,0,0.25)',
        borderWidth: '10px',
        borderStyle: 'solid',
        borderTopColor: '#f4d59a',
        borderRightColor: '#c2954f',
        borderBottomColor: '#8c5d26',
        borderLeftColor: '#e6ba70', // 3D gold border effect
      }}
    >
      {/* 3D Border Overlay */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.4), inset 0 0 10px rgba(0,0,0,0.6)',
        }}
      />

      {/* Content */}
      <div
        className={`relative p-3 h-full flex flex-col justify-between transition-opacity duration-300 ${isPowerOn ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Top status bar */}
        <div className="flex items-start justify-between">
          {/* Top Left: Username Icon and Letter */}
          <div className="flex items-center gap-1.5 pt-1">
            <img
              src={usernameIcon}
              alt="Username Icon"
              className="h-[48px] w-auto object-contain -mt-2 -ml-1"
              style={{ filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.2))' }}
            />
            <span className="text-sm text-black -ml-1" style={{ fontWeight: 600 }}>
              {displayChar}
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
          <div className="flex items-end h-6 relative gap-1 mt-1 mr-1">
            {isOffline && (
              <span className="text-[#E53935] font-bold text-sm leading-none absolute -left-3 top-0 z-10">
                ×
              </span>
            )}

            {/* Antenna SVG */}
            <svg
              width="12"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-black mb-[2px]"
              style={{ opacity: isOffline ? 0.3 : 1 }}
            >
              <path d="M12 2v20" />
              <path d="M8 18h8" />
              <path d="M10 22h4" />
            </svg>

            {/* Signal Bars SVG approach */}
            <div className="flex items-end gap-[1.5px] h-full pb-[2px] relative">
              {isOffline && (
                <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10 pointer-events-none -mt-[3px]">
                  <span className="text-[#E53935] text-[18px] font-black leading-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
                    ×
                  </span>
                </div>
              )}
              {[1, 2, 3, 4].map((bar) => {
                const isActive = bar <= signalBars;
                let barColor = '#ffffff'; // Solid White for empty/inactive

                if (isActive) {
                  if (signalBars >= 3) {
                    barColor = '#00e64d'; // Green (3 or 4 bars)
                  } else if (signalBars === 2) {
                    barColor = '#ffbb00'; // Yellow (2 bars)
                  } else if (signalBars === 1) {
                    barColor = '#ff3333'; // Red (1 bar)
                  }
                }

                return (
                  <div
                    key={bar}
                    className="w-[6px] flex-shrink-0"
                    style={{
                      width: '6px',
                      height: `${bar * 4 + 3}px`,
                      background: barColor,
                      border: '1px solid #000000',
                      borderRadius: '1.5px',
                      opacity: isOffline ? 0.35 : 1,
                      transition: 'background 0.2s ease-in-out',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Center/Bottom Content */}
        <div className="flex justify-between items-end pb-2 px-1 mt-auto">
          <div className="flex items-end gap-1">
            <div
              className="text-black relative translate-y-[2px]"
              style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '1px' }}
            >
              CH
            </div>
            <div
              className="text-white relative translate-y-[4px]"
              style={{
                fontFamily: "'DSEG7', monospace",
                fontSize: '52px',
                fontWeight: 'bold',
                lineHeight: 0.75,
                marginLeft: '-2px',
                textShadow: '0 0 10px rgba(255,255,255,0.8), 2px 2px 4px rgba(0,0,0,0.4)',
              }}
            >
              {channelStr}
            </div>
          </div>

          {/* Bottom Right: Twin Heads & Enlarged User Count (Shifted Left via margin) */}
          <div
            className="flex items-end gap-2 mr-4 relative translate-y-[5px]"
            style={{ marginBottom: '2px' }}
          >
            <div className="flex items-center justify-center">
              <img
                src={twinHeadsIcon}
                alt="User Count Icon"
                className="h-[48px] w-auto object-contain"
                style={{ filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.2))' }}
              />
            </div>
            <span
              className="text-3xl text-black font-medium tracking-tight leading-none"
              style={{ textShadow: '1px 1px 1px rgba(255,255,255,0.5)' }}
            >
              {userCount.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
