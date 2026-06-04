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
      background: 'linear-gradient(to bottom, #4a4a4a 0%, #1a1a1a 100%)',
      boxShadow: isPressed
        ? 'inset 0 3px 8px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.2)'
        : 'inset 0 2px 2px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.4)',
      transform: isPressed ? 'translateY(2px)' : 'translateY(0)',
      border: '2px solid #000',
      transition: 'all 0.05s ease',
    };
  };

  return (
    <div className="relative flex items-center justify-center py-4 mt-2">
      {/* Molded white background base (D-Pad Frame) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-[0_12px_12px_rgba(0,0,0,0.2)] drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)]">
        <div
          className="w-[310px] h-[90px] rounded-full absolute bg-gradient-to-b from-[#ffffff] to-[#e8ebf0]"
          style={{
            boxShadow:
              'inset 0 8px 12px rgba(255,255,255,1), inset 0 -6px 12px rgba(0,0,0,0.15), inset 0 0 20px rgba(0,0,0,0.18)',
            border: '1px solid #c8d1db',
          }}
        />
        <div
          className="w-[95px] h-[150px] rounded-full absolute bg-gradient-to-b from-[#ffffff] to-[#e8ebf0]"
          style={{
            boxShadow:
              'inset 0 8px 12px rgba(255,255,255,1), inset 0 -6px 12px rgba(0,0,0,0.15), inset 0 0 20px rgba(0,0,0,0.18)',
            border: '1px solid #c8d1db',
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
          className="w-[85px] h-[55px] rounded-full text-white relative overflow-hidden flex items-center justify-center"
          style={getButtonStyle('scan')}
        >
          <span
            style={{
              fontSize: '18px',
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
          className="w-[60px] h-[105px] rounded-full p-1 flex flex-col justify-between items-center relative"
          style={{
            background: 'linear-gradient(to right, #2a2a2a, #1a1a1a)',
            border: '2px solid #000',
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
              background:
                pressedBtn === 'up' ? '#111' : 'linear-gradient(to top, #2c2c2c, #4a4a4a)',
              boxShadow:
                pressedBtn === 'up'
                  ? 'inset 0 4px 6px rgba(0,0,0,0.9)'
                  : 'inset 0 2px 2px rgba(255,255,255,0.2), inset 0 -1px 2px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.5)',
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
              background:
                pressedBtn === 'down' ? '#111' : 'linear-gradient(to bottom, #2c2c2c, #4a4a4a)',
              boxShadow:
                pressedBtn === 'down'
                  ? 'inset 0 -4px 6px rgba(0,0,0,0.9)'
                  : 'inset 0 -2px 2px rgba(255,255,255,0.1), inset 0 1px 2px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.5)',
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
          className="w-[85px] h-[55px] rounded-full text-white flex items-center justify-center"
          style={getButtonStyle('set')}
        >
          <span
            style={{
              fontSize: '18px',
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
