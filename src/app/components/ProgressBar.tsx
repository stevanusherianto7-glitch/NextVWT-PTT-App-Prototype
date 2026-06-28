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
      className="w-[280px] h-[14px] rounded-full overflow-hidden relative transition-all duration-300"
      style={{
        background: 'var(--progress-bg)',
        boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.1), inset 0 2.5px 5px rgba(0,0,0,0.25)',
        border: '1px solid rgba(0,0,0,0.12)',
      }}
    >

      {/* The moving mask */}
      <div
        className="h-full transition-all duration-75 relative z-10"
        style={{
          width: `${progress}%`,
          overflow: 'hidden',
          transition: 'width 90ms cubic-bezier(0.1, 0.8, 0.25, 1)',
        }}
      >
        {/* The static laser spectrum */}
        <div
          className="h-full relative"
          style={{
            width: '280px', // Must match parent width
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.2) 20%, transparent 45%, rgba(0,0,0,0.9) 100%), linear-gradient(to right, #00C853 0%, #00C853 62.5%, #FFD600 62.5%, #FFD600 83.3%, #FF1744 83.3%, #FF1744 100%)',
            boxShadow: 'inset 0 0 8px rgba(255,255,255,0.85), 0 0 20px rgba(0,255,102,0.3)',
          }}
        />
      </div>

      {/* Scanning Laser Head (leading edge indicator) */}
      {progress > 0 && (
        <div
          className="absolute top-0 bottom-0 w-[5px] -ml-[2.5px] z-20 pointer-events-none"
          style={{
            left: `${progress}%`,
            background: '#ffffff',
            boxShadow: `0 0 15px #fff, 0 0 25px ${headGlow}, 0 0 50px ${headGlow}`,
            borderRadius: '3px',
            transition: 'left 90ms cubic-bezier(0.1, 0.8, 0.25, 1)',
          }}
        />
      )}
    </div>
  );
}
