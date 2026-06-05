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
        : 'var(--btn-shadow)',
      transform: isPressed ? 'translateY(2px)' : 'translateY(0)',
      border: 'var(--btn-border)',
      transition: 'all 0.05s ease',
    };
  };

  return (
    <div className="relative flex items-center justify-center py-4 mt-2">
      {/* Molded backing base (D-Pad Frame) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-[0_12px_12px_rgba(0,0,0,0.15)]">
        <div
          className="w-[290px] h-[90px] rounded-full absolute transition-all duration-300"
          style={{
            background: 'var(--dpad-bg)',
            boxShadow: 'var(--dpad-shadow)',
            border: 'var(--dpad-border)',
          }}
        />
        <div
          className="w-[95px] h-[150px] rounded-full absolute transition-all duration-300"
          style={{
            background: 'var(--dpad-bg)',
            boxShadow: 'var(--dpad-shadow)',
            border: 'var(--dpad-border)',
          }}
        />
      </div>

      <div className="relative z-10 flex items-center gap-6 px-4">
        {/* Scan Button */}
        <button
          onClick={onScan}
          onMouseDown={() => setPressedBtn('scan')}
          onMouseUp={() => setPressedBtn(null)}
          onMouseLeave={() => setPressedBtn(null)}
          className="w-[75px] h-[50px] rounded-l-full rounded-r-[6px] text-white relative overflow-hidden flex items-center justify-center"
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

        {/* Up/Down Buttons Container */}
        <div
          className="w-[60px] h-[105px] rounded-full p-1 flex flex-col justify-between items-center relative transition-all duration-300"
          style={{
            background: 'var(--rocker-bg)',
            border: 'var(--rocker-border)',
            boxShadow:
              'inset 0 2px 4px rgba(255,255,255,0.1), 0 5px 10px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {/* Decorative center pivot for rocker switch realism */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[4px] bg-black opacity-40 z-20 pointer-events-none shadow-[0_1px_1px_rgba(255,255,255,0.1)]" />

          <button
            onClick={onUp}
            onMouseDown={() => setPressedBtn('up')}
            onMouseUp={() => setPressedBtn(null)}
            onMouseLeave={() => setPressedBtn(null)}
            className="w-full h-[48px] rounded-t-full text-white flex items-center justify-center relative z-10"
            style={{
              background: pressedBtn === 'up' ? 'rgba(0,0,0,0.4)' : 'var(--btn-bg)',
              boxShadow:
                pressedBtn === 'up' ? 'inset 0 4px 6px rgba(0,0,0,0.8)' : 'var(--btn-shadow)',
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

          <button
            onClick={onDown}
            onMouseDown={() => setPressedBtn('down')}
            onMouseUp={() => setPressedBtn(null)}
            onMouseLeave={() => setPressedBtn(null)}
            className="w-full h-[48px] rounded-b-full text-white flex items-center justify-center relative z-10"
            style={{
              background: pressedBtn === 'down' ? 'rgba(0,0,0,0.4)' : 'var(--btn-bg)',
              boxShadow:
                pressedBtn === 'down' ? 'inset 0 -4px 6px rgba(0,0,0,0.8)' : 'var(--btn-shadow)',
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
          className="w-[75px] h-[50px] rounded-r-full rounded-l-[6px] text-white flex items-center justify-center"
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
            Set
          </span>
        </button>
      </div>
    </div>
  );
}
