import { useState, useRef, useEffect } from 'react';
import { Smile, MessageSquare, Music, Shield } from 'lucide-react';

interface QuickActionDockProps {
  onOpenChat: () => void;
  onOpenQueue: () => void;
  onOpenPrivate: () => void;
  onSendReaction: (reaction: string) => void;
  isPowerOn: boolean;
  showPrivate?: boolean;
}

export function QuickActionDock({
  onOpenChat,
  onOpenQueue,
  onOpenPrivate,
  onSendReaction,
  isPowerOn,
  showPrivate = false,
}: QuickActionDockProps) {
  const [showReactions, setShowReactions] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const reactions = [
    { kind: 'applause', emoji: '👏' },
    { kind: 'love', emoji: '❤️' },
    { kind: 'wow', emoji: '😮' },
    { kind: 'fire', emoji: '🔥' },
    { kind: 'crown', emoji: '👑' },
    { kind: 'confetti', emoji: '🎉' },
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
      label: 'Reaction',
      icon: <Smile className="w-5 h-5 text-amber-400" />,
      onClick: () => setShowReactions(!showReactions),
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageSquare className="w-5 h-5 text-sky-400" />,
      onClick: onOpenChat,
    },
    {
      id: 'queue',
      label: 'Queue',
      icon: <Music className="w-5 h-5 text-purple-400" />,
      onClick: onOpenQueue,
    },
    {
      id: 'private',
      label: 'Private',
      icon: <Shield className="w-5 h-5 text-rose-500 fill-rose-500/20" />,
      onClick: onOpenPrivate,
    },
  ];

  const actionButtons = showPrivate 
    ? allButtons 
    : allButtons.filter((btn) => btn.id !== 'private');

  return (
    <div 
      className={`w-full max-w-[340px] mt-4 px-4 py-3 rounded-2xl relative z-30 transition-all duration-300 ${
        isPowerOn 
          ? 'bg-slate-900/50 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)]' 
          : 'bg-slate-950/20 border border-slate-900/40 opacity-40 pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-around relative">
        {actionButtons.map((btn) => (
          <div key={btn.id} className="flex flex-col items-center relative">
            {/* Popover Reaction above the Reaction button */}
            {btn.id === 'reaction' && showReactions && (
              <div
                ref={popoverRef}
                className="absolute bottom-16 left-1/2 -translate-x-[15%] bg-slate-950/90 backdrop-blur-md border border-slate-800 p-2 rounded-xl flex gap-2 shadow-2xl z-40 animate-in fade-in slide-in-from-bottom-2 duration-100"
              >
                {reactions.map((r) => (
                  <button
                    key={r.kind}
                    onClick={() => handleReactionClick(r.kind)}
                    className="text-2xl hover:scale-130 active:scale-95 transition-all duration-100 p-1 cursor-pointer focus:outline-none"
                    title={r.kind}
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Premium Metallic Keycap Button */}
            <button
              onClick={btn.onClick}
              disabled={!isPowerOn}
              className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-950 border border-slate-700 shadow-md active:translate-y-[1.5px] active:shadow-none hover:brightness-110 hover:border-slate-600 transition-all duration-100 cursor-pointer focus:outline-none"
            >
              {btn.icon}
            </button>
            
            {/* Label below button */}
            <span className="text-[10px] font-extrabold text-slate-300 mt-1.5 uppercase tracking-wider select-none">
              {btn.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
