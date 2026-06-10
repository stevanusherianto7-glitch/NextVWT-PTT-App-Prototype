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

  // Close reaction selector when clicking outside
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
      icon: <Smile className="w-[18px] h-[18px] text-amber-400" />,
      glow: 'rgba(251,191,36,0.25)',
      onClick: () => setShowReactions(!showReactions),
      active: showReactions,
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageSquare className="w-[18px] h-[18px] text-sky-400" />,
      glow: 'rgba(56,189,248,0.25)',
      onClick: onOpenChat,
      active: false,
    },
    {
      id: 'queue',
      label: 'Queue',
      icon: <Music className="w-[18px] h-[18px] text-violet-400" />,
      glow: 'rgba(167,139,250,0.25)',
      onClick: onOpenQueue,
      active: false,
    },
    {
      id: 'private',
      label: 'Private',
      icon: <Shield className="w-[18px] h-[18px] text-rose-400 fill-rose-400/20" />,
      glow: 'rgba(251,113,133,0.25)',
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
    <div className="flex justify-center mt-3 relative z-30">
      {/* Compact pill container */}
      <div
        className={`inline-flex items-center gap-1 px-2.5 py-2 rounded-full transition-all duration-300 ${
          isPowerOn
            ? 'bg-slate-900/70 backdrop-blur-xl border border-white/8 shadow-[0_4px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.07)]'
            : 'bg-slate-950/30 border border-slate-900/30 opacity-35 pointer-events-none'
        }`}
      >
        {actionButtons.map((btn, index) => (
          <div key={btn.id} className="relative flex flex-col items-center">
            {/* Divider between buttons */}
            {index > 0 && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-5 bg-white/8 -translate-x-0.5 pointer-events-none" />
            )}

            {/* Reaction popover */}
            {btn.id === 'reaction' && showReactions && (
              <div
                ref={popoverRef}
                className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-[#0d0f14]/97 backdrop-blur-xl border border-white/10 p-2 rounded-2xl grid grid-cols-4 gap-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)] z-50 min-w-[172px]"
                style={{
                  animation: 'reactionPopIn 0.15s cubic-bezier(0.34,1.56,0.64,1) both',
                }}
              >
                {/* Arrow tip */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0d0f14] border-r border-b border-white/10 rotate-45" />
                {reactions.map((r) => (
                  <button
                    key={r.kind}
                    onClick={() => handleReactionClick(r.kind)}
                    className="w-9 h-9 flex items-center justify-center text-xl hover:bg-white/8 hover:scale-110 active:scale-95 transition-all duration-120 rounded-xl cursor-pointer focus:outline-none"
                    title={r.kind}
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Button */}
            <button
              onClick={btn.onClick}
              disabled={!isPowerOn}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer focus:outline-none active:scale-90 group ${
                btn.active
                  ? 'bg-white/12 shadow-inner'
                  : 'hover:bg-white/8 active:bg-white/5'
              }`}
              title={btn.label}
              style={{
                boxShadow: btn.active ? `0 0 12px ${btn.glow}` : undefined,
              }}
            >
              {/* Glow on hover */}
              <div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${btn.glow} 0%, transparent 70%)` }}
              />
              {btn.icon}
            </button>

            {/* Label */}
            <span
              className="text-[8px] font-bold text-slate-500 mt-0.5 uppercase tracking-widest select-none leading-none"
            >
              {btn.label}
            </span>
          </div>
        ))}
      </div>

      {/* Inline keyframe for popover animation */}
      <style>{`
        @keyframes reactionPopIn {
          from { opacity: 0; transform: translateX(-50%) translateY(6px) scale(0.92); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  );
}
