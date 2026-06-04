interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  // Determine scanning head glow color dynamically based on progress
  let headGlow = '#00ff66';
  if (progress > 83.3) {
    headGlow = '#ff3333';
  } else if (progress > 62.5) {
    headGlow = '#ffaa00';
  }

  return (
    <div
      className="w-full h-[14px] overflow-hidden relative"
      style={{
        borderRadius: '2px',
        background: 'linear-gradient(to bottom, #0a0a0a 0%, #1c1c1c 40%, #141414 100%)',
        boxShadow:
          'inset 0 3px 5px rgba(0,0,0,1), inset 0 -1px 2px rgba(255,255,255,0.06), 0 1px 0px rgba(255,255,255,0.18)',
        border: '1px solid #000',
        borderTop: '1px solid #000',
        borderBottom: '1px solid #2a2a2a',
      }}
    >
      {/* Background segments/grid (optional, for that LCD meter look) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          background:
            'repeating-linear-gradient(to right, transparent, transparent 3px, #000 3px, #000 5px)',
        }}
      />

      {/* The moving mask */}
      <div
        className="h-full transition-all duration-75 relative z-10"
        style={{ width: `${progress}%`, overflow: 'hidden' }}
      >
        {/* The static laser spectrum */}
        <div
          className="h-full relative"
          style={{
            width: '100%', // Full width of parent
            background:
              'linear-gradient(to right, #00ff66 0%, #00ff66 62.5%, #ffaa00 62.5%, #ffaa00 83.3%, #ff3333 83.3%, #ff3333 100%)',
            boxShadow: 'inset 0 0 4px rgba(255,255,255,0.8), 0 0 12px rgba(255,255,255,0.4)',
          }}
        >
          {/* White Laser Core Line */}
          <div
            className="absolute top-[5px] left-0 h-[2px] bg-white opacity-95 rounded-full pointer-events-none"
            style={{
              width: '100%',
              boxShadow: '0 0 4px rgba(255,255,255,1), 0 0 8px rgba(255,255,255,0.6)',
            }}
          />
        </div>
      </div>

      {/* Scanning Laser Head (leading edge indicator) */}
      {progress > 0 && (
        <div
          className="absolute top-0 bottom-0 w-[4px] -ml-[2px] z-20 pointer-events-none transition-all duration-75"
          style={{
            left: `${progress}%`,
            background: '#fff',
            boxShadow: `0 0 8px #fff, 0 0 15px ${headGlow}, 0 0 25px ${headGlow}`,
            borderRadius: '2px',
          }}
        />
      )}
    </div>
  );
}
