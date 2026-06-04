interface ProgressBarProps {
  progress: number;
}

// IndoVWT-style LED segment meter
// Always shows all segments (no "hollow" look) — inactive = dim dark, active = lit color
const TOTAL_SEGMENTS = 28;

export function ProgressBar({ progress }: ProgressBarProps) {
  const activeCount = Math.round((progress / 100) * TOTAL_SEGMENTS);

  const getSegmentColor = (index: number, isActive: boolean) => {
    if (!isActive) {
      // Inactive segments: always visible as dark placeholder (IndoVWT style)
      return {
        background: 'linear-gradient(to bottom, #2a2a2a 0%, #1a1a1a 100%)',
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04)',
        opacity: 1,
      };
    }

    // Active segments: green → yellow → red
    if (index < TOTAL_SEGMENTS * 0.6) {
      // Green zone (0–60%)
      return {
        background: 'linear-gradient(to bottom, #00ff88 0%, #00cc55 50%, #009933 100%)',
        boxShadow:
          'inset 0 1px 2px rgba(255,255,255,0.5), 0 0 5px rgba(0,255,100,0.6)',
        opacity: 1,
      };
    } else if (index < TOTAL_SEGMENTS * 0.83) {
      // Yellow zone (60–83%)
      return {
        background: 'linear-gradient(to bottom, #ffee44 0%, #ffaa00 50%, #cc7700 100%)',
        boxShadow:
          'inset 0 1px 2px rgba(255,255,255,0.4), 0 0 5px rgba(255,170,0,0.6)',
        opacity: 1,
      };
    } else {
      // Red zone (83–100%)
      return {
        background: 'linear-gradient(to bottom, #ff6666 0%, #ff2222 50%, #cc0000 100%)',
        boxShadow:
          'inset 0 1px 2px rgba(255,255,255,0.3), 0 0 6px rgba(255,50,50,0.7)',
        opacity: 1,
      };
    }
  };

  return (
    <div
      className="w-[320px] relative"
      style={{ padding: '0 2px' }}
    >
      {/* Outer shell — mimics IndoVWT's recessed trough */}
      <div
        className="w-full rounded-sm overflow-hidden"
        style={{
          height: '16px',
          background: '#0d0d0d',
          boxShadow:
            'inset 0 3px 6px rgba(0,0,0,0.95), inset 0 1px 3px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.12)',
          border: '1px solid #000',
          borderTop: '1px solid #000',
          borderBottom: '1px solid #3a3a3a',
          padding: '2px 3px',
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
        }}
      >
        {Array.from({ length: TOTAL_SEGMENTS }).map((_, i) => {
          const isActive = i < activeCount;
          const segStyle = getSegmentColor(i, isActive);
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: '10px',
                borderRadius: '1px',
                transition: 'background 0.06s ease-out, box-shadow 0.06s ease-out',
                ...segStyle,
              }}
            />
          );
        })}
      </div>

      {/* Bottom label: "MODULATOR" text — like a real audio meter */}
      <div
        className="flex justify-between mt-[2px] px-[3px]"
        style={{ fontSize: '7px', color: '#555', fontFamily: 'monospace', letterSpacing: '0.05em' }}
      >
        <span>0</span>
        <span style={{ color: '#444' }}>MODULATOR</span>
        <span style={{ color: '#8a2a2a' }}>MAX</span>
      </div>
    </div>
  );
}
