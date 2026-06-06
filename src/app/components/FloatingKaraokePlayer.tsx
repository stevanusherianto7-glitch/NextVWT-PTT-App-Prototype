import React, { useState, useRef, useEffect } from 'react';
import { X, Minimize2, Maximize2, Search, Disc } from 'lucide-react';

interface FloatingKaraokePlayerProps {
  onClose: () => void;
}

export function FloatingKaraokePlayer({ onClose }: FloatingKaraokePlayerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [videoId, setVideoId] = useState('S2S1Vd3r3Gg'); // Default song
  const [searchQuery, setSearchQuery] = useState('');

  // Dragging states
  const [position, setPosition] = useState({ x: 20, y: 120 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const playerRef = useRef<HTMLDivElement>(null);

  // Parse YouTube video ID from URL or input
  const handleLoadVideo = (input: string) => {
    if (!input.trim()) return;

    // Check if it's a youtube URL
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = input.match(regExp);

    if (match && match[2].length === 11) {
      setVideoId(match[2]);
    } else if (input.length === 11) {
      // Direct video ID
      setVideoId(input);
    } else {
      // Otherwise, open YouTube Search in a new tab or instruct
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(input + ' karaoke')}`;
      window.open(searchUrl, '_blank');
    }
  };

  // Drag start handlers
  const handleDragStart = (clientX: number, clientY: number) => {
    isDragging.current = true;
    dragStart.current = {
      x: clientX - position.x,
      y: clientY - position.y,
    };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    // Only drag on header/handle area, not inside iframe or input
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      handleDragStart(e.clientX, e.clientY);
      e.preventDefault();
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      const touch = e.touches[0];
      handleDragStart(touch.clientX, touch.clientY);
    }
  };

  // Drag move and end global listeners
  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging.current) return;

      let newX = clientX - dragStart.current.x;
      let newY = clientY - dragStart.current.y;

      // Keep inside window bounds
      newX = Math.max(0, Math.min(window.innerWidth - (isMinimized ? 200 : 320), newX));
      newY = Math.max(0, Math.min(window.innerHeight - (isMinimized ? 134 : 272), newY));

      setPosition({ x: newX, y: newY });
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onDragEnd = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onDragEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onDragEnd);
    };
  }, [isMinimized]);

  // Render single container structure that scales dynamically without unmounting the YouTube iframe (which stops the music)
  return (
    <div
      ref={playerRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className={`absolute z-50 flex flex-col overflow-hidden border border-indigo-500/40 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-300 ${
        isMinimized
          ? 'w-[200px] h-[134px] rounded-xl' // 112px video + 22px solid bottom drag bar
          : 'w-[320px] h-[272px] rounded-2xl'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        background: 'rgba(2, 6, 23, 0.95)',
        boxShadow: '0 0 25px rgba(99,102,241,0.25)',
      }}
    >
      {/* ─── MINI OVERLAY CONTROLS (Only shown when minimized) ─── */}
      {isMinimized && (
        <div className="absolute inset-0 bg-black/10 hover:bg-black/45 transition-colors duration-200 z-20 pointer-events-none">
          <div className="absolute top-1.5 left-1.5 flex gap-1 pointer-events-auto">
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="p-1 rounded bg-slate-950/80 hover:bg-indigo-600 text-white transition focus:outline-none cursor-pointer"
              title="Maximize"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="absolute top-1.5 right-1.5 flex gap-1 pointer-events-auto">
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded bg-slate-950/80 hover:bg-red-600 text-white transition focus:outline-none cursor-pointer"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ─── HEADER BAR (Hidden when minimized) ─── */}
      {!isMinimized && (
        <div className="drag-handle flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-indigo-950 to-slate-900 border-b border-indigo-500/20 cursor-move shrink-0 select-none">
          <div className="flex items-center gap-2">
            <Disc
              className="w-4 h-4 text-cyan-400 animate-spin"
              style={{ animationDuration: '4s' }}
            />
            <span className="text-xs font-bold tracking-wider text-indigo-200">KARAOKE PLAYER</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-indigo-500/20 transition focus:outline-none cursor-pointer"
              title="Minimize"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-red-500/10 transition focus:outline-none cursor-pointer"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ─── YOUTUBE PLAYER FRAME (Always visible, fits the container) ─── */}
      <div
        className={`bg-black shrink-0 relative ${
          isMinimized ? 'w-full h-[112px]' : 'w-full aspect-video border-b border-indigo-500/10'
        }`}
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`}
          title="YouTube Karaoke Video"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      {/* ─── CONTENT INTERFACE (Hidden when minimized) ─── */}
      {!isMinimized && (
        <div className="p-2.5 bg-slate-900/60 border-b border-indigo-500/10 flex gap-1.5 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari lagu / paste link YouTube..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLoadVideo(searchQuery)}
              className="w-full pl-7.5 pr-2 py-1 bg-slate-950/80 border border-indigo-500/30 rounded-lg text-[11px] placeholder:text-slate-500 text-white font-medium focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <button
            onClick={() => handleLoadVideo(searchQuery)}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg text-[10px] font-bold text-white transition focus:outline-none cursor-pointer"
          >
            LOAD
          </button>
        </div>
      )}

      {/* ─── MINI DRAG BAR (Only shown at the bottom when minimized) ─── */}
      {isMinimized && (
        <div className="drag-handle w-full h-[22px] bg-slate-950 border-t border-indigo-500/20 flex items-center justify-center cursor-move shrink-0 select-none pointer-events-auto">
          {/* Visual drag indicator lines */}
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/60 animate-pulse" />
            <div className="flex flex-col gap-0.5 justify-center">
              <span className="w-6 h-[2px] rounded bg-indigo-300/60" />
              <span className="w-6 h-[2px] rounded bg-indigo-300/60" />
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/60 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}
