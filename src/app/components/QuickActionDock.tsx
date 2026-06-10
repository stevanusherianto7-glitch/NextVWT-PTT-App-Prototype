import { useState, useRef, useEffect } from 'react';
import { Smile, MessageSquare, Music, Shield } from 'lucide-react';

interface QuickActionDockProps {
  onOpenChat: () => void;
  onOpenQueue: () => void;
  onOpenPrivate: () => void;
  onSendReaction: (reaction: string) => void;
  isPowerOn: boolean;
  showPrivate?: boolean;
  showSocialFeatures?: boolean;
}

export function QuickActionDock({
  onOpenChat,
  onOpenQueue,
  onOpenPrivate,
  onSendReaction,
  isPowerOn,
  showPrivate = false,
  showSocialFeatures = false,
}: QuickActionDockProps) {
  const [showReactions, setShowReactions] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const reactions = [
    { kind: 'applause', emoji: '👏' },
    { kind: 'love',     emoji: '❤️' },
    { kind: 'kiss',     emoji: '😘' },
    { kind: 'wow',      emoji: '😮' },
    { kind: 'fire',     emoji: '🔥' },
    { kind: 'crown',    emoji: '👑' },
    { kind: 'confetti', emoji: '🎉' },
    { kind: 'bart',     emoji: '🛹' },
    { kind: 'fox',      emoji: '🦊' },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowReactions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReactionClick = (kind: string) => {
    if (!isPowerOn) return;
    onSendReaction(kind);
    setShowReactions(false);
  };

  const allButtons = [
    {
      id: 'reaction',
      label: 'Reaksi',
      icon: <Smile className="w-5 h-5" />,
      iconColor: '#fbbf24',
      glowColor: 'rgba(251,191,36,0.35)',
      onClick: () => setShowReactions(!showReactions),
      active: showReactions,
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageSquare className="w-5 h-5" />,
      iconColor: '#38bdf8',
      glowColor: 'rgba(56,189,248,0.35)',
      onClick: onOpenChat,
      active: false,
    },
    {
      id: 'queue',
      label: 'Queue',
      icon: <Music className="w-5 h-5" />,
      iconColor: '#a78bfa',
      glowColor: 'rgba(167,139,250,0.35)',
      onClick: onOpenQueue,
      active: false,
    },
    {
      id: 'private',
      label: 'Private',
      icon: <Shield className="w-5 h-5" />,
      iconColor: '#fb7185',
      glowColor: 'rgba(251,113,133,0.35)',
      onClick: onOpenPrivate,
      active: false,
    },
  ];

  const actionButtons = allButtons.filter((btn) => {
    if (btn.id === 'private') return showPrivate;
    return showSocialFeatures;
  });

  if (actionButtons.length === 0) return null;

  return (
    <div className="w-full mt-3 relative z-30">
      {/* ── Floating Skeuomorphic + Glassmorphic Container ── */}
      <div
        className={`relative w-full flex items-end justify-around px-4 py-3 rounded-2xl transition-all duration-300 ${
          isPowerOn ? '' : 'opacity-35 pointer-events-none'
        }`}
        style={{
          /* Glassmorphic base */
          background: 'linear-gradient(145deg, rgba(30,34,46,0.82) 0%, rgba(15,18,28,0.92) 100%)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          /* Skeuomorphic bevel: bright top-left, dark bottom-right */
          border: '1px solid rgba(255,255,255,0.10)',
          borderTop: '1px solid rgba(255,255,255,0.18)',
          borderLeft: '1px solid rgba(255,255,255,0.13)',
          borderBottom: '1px solid rgba(0,0,0,0.45)',
          borderRight: '1px solid rgba(0,0,0,0.35)',
          /* Floating elevation shadow */
          boxShadow: [
            '0 2px 0 rgba(255,255,255,0.06) inset',       /* top inner highlight */
            '0 -1px 0 rgba(0,0,0,0.5) inset',             /* bottom inner shadow */
            '0 8px 32px rgba(0,0,0,0.55)',                 /* main drop shadow */
            '0 2px 8px rgba(0,0,0,0.4)',                   /* close shadow */
            '0 0 0 1px rgba(0,0,0,0.25)',                  /* outer edge */
          ].join(', '),
        }}
      >
        {/* Subtle top-edge gloss strip */}
        <div
          className="absolute top-0 left-3 right-3 h-px pointer-events-none rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)' }}
        />

        {actionButtons.map((btn, index) => (
          <div key={btn.id} className="relative flex flex-col items-center gap-1.5">

            {/* Vertical divider between buttons */}
            {index > 0 && (
              <div
                className="absolute left-[-6px] top-[4px] bottom-[16px] w-px pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.07) 40%, rgba(255,255,255,0.07) 60%, transparent)',
                }}
              />
            )}

            {/* ── Reaction Popover ── */}
            {btn.id === 'reaction' && showReactions && (
              <div
                ref={popoverRef}
                className="absolute bottom-[68px] left-1/2 -translate-x-1/2 z-50 p-2 rounded-2xl grid grid-cols-4 gap-1.5 min-w-[176px]"
                style={{
                  background: 'linear-gradient(160deg, rgba(22,26,38,0.97) 0%, rgba(12,14,22,0.98) 100%)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderTop: '1px solid rgba(255,255,255,0.16)',
                  boxShadow: [
                    '0 2px 0 rgba(255,255,255,0.05) inset',
                    '0 16px 48px rgba(0,0,0,0.75)',
                    '0 4px 12px rgba(0,0,0,0.4)',
                    '0 0 0 1px rgba(0,0,0,0.3)',
                  ].join(', '),
                  animation: 'qdPopIn 0.18s cubic-bezier(0.34,1.56,0.64,1) both',
                }}
              >
                {/* Arrow */}
                <div
                  className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45"
                  style={{
                    background: 'rgba(12,14,22,0.98)',
                    borderRight: '1px solid rgba(255,255,255,0.08)',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                  }}
                />
                {reactions.map((r) => (
                  <button
                    key={r.kind}
                    onClick={() => handleReactionClick(r.kind)}
                    className="w-9 h-9 flex items-center justify-center text-xl rounded-xl cursor-pointer focus:outline-none transition-all duration-100 active:scale-90"
                    style={{
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        'linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }}
                    title={r.kind}
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>
            )}

            {/* ── Skeuomorphic Keycap Button ── */}
            <button
              onClick={btn.onClick}
              disabled={!isPowerOn}
              title={btn.label}
              className="relative w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer focus:outline-none transition-all duration-100 group"
              style={{
                background: btn.active
                  ? `linear-gradient(160deg, rgba(20,24,36,0.9) 0%, rgba(28,33,48,0.85) 100%)`
                  : `linear-gradient(160deg, rgba(52,60,82,0.75) 0%, rgba(28,33,50,0.90) 100%)`,
                border: '1px solid rgba(255,255,255,0.08)',
                borderTop: btn.active
                  ? '1px solid rgba(0,0,0,0.4)'
                  : '1px solid rgba(255,255,255,0.18)',
                borderLeft: btn.active
                  ? '1px solid rgba(0,0,0,0.3)'
                  : '1px solid rgba(255,255,255,0.12)',
                borderBottom: btn.active
                  ? '1px solid rgba(255,255,255,0.05)'
                  : '1px solid rgba(0,0,0,0.55)',
                borderRight: btn.active
                  ? '1px solid rgba(255,255,255,0.04)'
                  : '1px solid rgba(0,0,0,0.40)',
                boxShadow: btn.active
                  ? [
                      '0 1px 3px rgba(0,0,0,0.6) inset',
                      '0 2px 6px rgba(0,0,0,0.4) inset',
                      `0 0 10px ${btn.glowColor}`,
                    ].join(', ')
                  : [
                      '0 2px 0 rgba(255,255,255,0.06) inset',
                      '0 -1px 0 rgba(0,0,0,0.5) inset',
                      '0 3px 6px rgba(0,0,0,0.45)',
                      '0 1px 2px rgba(0,0,0,0.3)',
                    ].join(', '),
                transform: btn.active ? 'translateY(1.5px)' : 'translateY(0)',
                color: btn.iconColor,
              }}
              onMouseDown={(e) => {
                const el = e.currentTarget;
                el.style.transform = 'translateY(1.5px)';
                el.style.boxShadow = [
                  '0 1px 3px rgba(0,0,0,0.6) inset',
                  '0 2px 6px rgba(0,0,0,0.4) inset',
                  `0 0 8px ${btn.glowColor}`,
                ].join(', ');
              }}
              onMouseUp={(e) => {
                const el = e.currentTarget;
                if (!btn.active) {
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = [
                    '0 2px 0 rgba(255,255,255,0.06) inset',
                    '0 -1px 0 rgba(0,0,0,0.5) inset',
                    '0 3px 6px rgba(0,0,0,0.45)',
                    '0 1px 2px rgba(0,0,0,0.3)',
                  ].join(', ');
                }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                if (!btn.active) {
                  el.style.transform = 'translateY(0)';
                }
              }}
            >
              {/* Icon glow layer */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 60%, ${btn.glowColor} 0%, transparent 70%)`,
                }}
              />
              {/* Top gloss strip */}
              <div
                className="absolute top-0 left-2 right-2 h-px rounded-full pointer-events-none"
                style={{
                  background: btn.active
                    ? 'rgba(0,0,0,0.3)'
                    : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                }}
              />
              {btn.icon}
            </button>

            {/* Label */}
            <span
              className="text-[8.5px] font-bold uppercase tracking-widest select-none leading-none"
              style={{ color: 'rgba(148,163,184,0.65)' }}
            >
              {btn.label}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes qdPopIn {
          from { opacity: 0; transform: translateX(-50%) translateY(8px) scale(0.90); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)   scale(1);    }
        }
      `}</style>
    </div>
  );
}
