import { useState } from 'react';

interface ControlButtonsProps {
  onScan: () => void;
  onSet: () => void;
  onUp: () => void;
  onDown: () => void;
  isScanning?: boolean;
}

export function ControlButtons({
  onScan,
  onSet,
  onUp,
  onDown,
  isScanning = false,
}: ControlButtonsProps) {
  const [pressedBtn, setPressedBtn] = useState<string | null>(null);

  const getButtonStyle = (btnName: string) => {
    const isPressed = pressedBtn === btnName;
    return {
      background: 'var(--btn-bg)',
      boxShadow: isPressed
        ? 'inset 0 3px 8px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.1)'
        : '0 2.5px 0 #000000, var(--btn-shadow)',
      transform: isPressed ? 'translateY(2px)' : 'translateY(0)',
      border: 'var(--btn-border)',
      transition: 'all 0.05s ease',
    };
  };

  return (
    <div className="relative w-[290px] h-[150px] mt-1.5 select-none">
      {/* Molded backing base (D-Pad Frame) */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          width="290"
          height="150"
          viewBox="0 0 290 150"
          className="w-full h-full transition-all duration-300 drop-shadow-[0_12px_12px_rgba(0,0,0,0.15)]"
        >
          <defs>
            <linearGradient id="dpad-backing-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--dpad-bg-start)" />
              <stop offset="100%" stopColor="var(--dpad-bg-end)" />
            </linearGradient>

            <filter id="dpad-inset-shadow" x="-10%" y="-10%" width="120%" height="120%">
              {/* Highlight at Top-Left */}
              <feOffset dx="1.5" dy="2" />
              <feGaussianBlur stdDeviation="1.5" result="offset-blur-top" />
              <feComposite
                operator="out"
                in="SourceGraphic"
                in2="offset-blur-top"
                result="inverse-top"
              />
              <feFlood
                floodColor="white"
                floodOpacity="var(--dpad-shadow-top-opacity)"
                result="color-top"
              />
              <feComposite operator="in" in="color-top" in2="inverse-top" result="shadow-top" />

              {/* Shadow at Bottom-Right */}
              <feOffset dx="-2" dy="-2.5" />
              <feGaussianBlur stdDeviation="2" result="offset-blur-bottom" />
              <feComposite
                operator="out"
                in="SourceGraphic"
                in2="offset-blur-bottom"
                result="inverse-bottom"
              />
              <feFlood
                floodColor="var(--dpad-shadow-bottom-color)"
                floodOpacity="0.45"
                result="color-bottom"
              />
              <feComposite
                operator="in"
                in="color-bottom"
                in2="inverse-bottom"
                result="shadow-bottom"
              />

              {/* Merge shadow layers */}
              <feMerge>
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="shadow-top" />
                <feMergeNode in="shadow-bottom" />
              </feMerge>
            </filter>
          </defs>

          {/* Filled base shape with gradient and filter */}
          <path
            d="M 100 30 A 48.75 48.75 0 0 1 190 30 L 245 30 A 45 45 0 0 1 245 120 L 190 120 A 48.75 48.75 0 0 1 100 120 L 45 120 A 45 45 0 0 1 45 30 Z"
            fill="url(#dpad-backing-grad)"
            filter="url(#dpad-inset-shadow)"
          />

          {/* Clean outer border line (single path) */}
          <path
            d="M 100 30 A 48.75 48.75 0 0 1 190 30 L 245 30 A 45 45 0 0 1 245 120 L 190 120 A 48.75 48.75 0 0 1 100 120 L 45 120 A 45 45 0 0 1 45 30 Z"
            fill="none"
            stroke="var(--dpad-border-color)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Scan Button */}
      <button
        onClick={onScan}
        onMouseDown={() => setPressedBtn('scan')}
        onMouseUp={() => setPressedBtn(null)}
        onMouseLeave={() => setPressedBtn(null)}
        className="absolute left-[15px] top-[50px] w-[85px] h-[50px] rounded-l-full rounded-r-[6px] text-white overflow-hidden flex items-center justify-center animate-all z-10"
        style={getButtonStyle('scan')}
      >
        <span
          style={{
            fontSize: '16px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Scan
        </span>
        {isScanning && (
          <div className="absolute top-2 right-3 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_5px_#60a5fa]" />
        )}
      </button>

      {/* Up/Down Buttons Container (Symmetric capsule rocker) */}
      <div
        className="absolute left-[115px] top-[22.5px] w-[60px] h-[105px] rounded-full p-1 flex flex-col justify-between items-center transition-all duration-300 z-10"
        style={{
          background: 'var(--rocker-bg)',
          border: 'var(--rocker-border)',
          boxShadow:
            'inset 0 3px 5px rgba(255,255,255,0.2), inset 0 -3px 5px rgba(0,0,0,0.45), 0 6px 12px rgba(0,0,0,0.45), 0 2px 4px rgba(0,0,0,0.35)',
        }}
      >
        {/* Decorative center pivot for rocker switch realism */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[5px] bg-[#1a1a1a] opacity-65 z-20 pointer-events-none shadow-[0_1px_1px_rgba(255,255,255,0.25)]" />

        {/* Up Button */}
        <button
          onClick={onUp}
          onMouseDown={() => setPressedBtn('up')}
          onMouseUp={() => setPressedBtn(null)}
          onMouseLeave={() => setPressedBtn(null)}
          className="w-full h-[48px] rounded-t-full text-white flex items-center justify-center relative z-10"
          style={{
            background: pressedBtn === 'up' ? 'rgba(0,0,0,0.4)' : 'var(--btn-bg)',
            boxShadow:
              pressedBtn === 'up'
                ? 'inset 0 5px 8px rgba(0,0,0,0.85), inset 0 0 10px rgba(0,0,0,0.6)'
                : 'var(--btn-shadow)',
            transition: 'all 0.05s ease',
            transform: pressedBtn === 'up' ? 'translateY(1px)' : 'translateY(0)',
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }}
          >
            <path d="M12 4L22 20H2L12 4Z" />
          </svg>
        </button>

        {/* Down Button */}
        <button
          onClick={onDown}
          onMouseDown={() => setPressedBtn('down')}
          onMouseUp={() => setPressedBtn(null)}
          onMouseLeave={() => setPressedBtn(null)}
          className="w-full h-[48px] rounded-b-full text-white flex items-center justify-center relative z-10"
          style={{
            background: pressedBtn === 'down' ? 'rgba(0,0,0,0.4)' : 'var(--btn-bg)',
            boxShadow:
              pressedBtn === 'down'
                ? 'inset 0 -5px 8px rgba(0,0,0,0.85), inset 0 0 10px rgba(0,0,0,0.6)'
                : 'var(--btn-shadow)',
            transition: 'all 0.05s ease',
            transform: pressedBtn === 'down' ? 'translateY(-1px)' : 'translateY(0)',
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ filter: 'drop-shadow(0 -2px 2px rgba(0,0,0,0.5))' }}
          >
            <path d="M12 20L2 4H22L12 20Z" />
          </svg>
        </button>
      </div>

      {/* Set Button */}
      <button
        onClick={onSet}
        onMouseDown={() => setPressedBtn('set')}
        onMouseUp={() => setPressedBtn(null)}
        onMouseLeave={() => setPressedBtn(null)}
        className="absolute left-[190px] top-[50px] w-[85px] h-[50px] rounded-r-full rounded-l-[6px] text-white overflow-hidden flex items-center justify-center animate-all z-10"
        style={getButtonStyle('set')}
      >
        <span
          style={{
            fontSize: '16px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          SET
        </span>
      </button>
    </div>
  );
}
