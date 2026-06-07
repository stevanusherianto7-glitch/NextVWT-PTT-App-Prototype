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
      // Otherwise, open YouTube Search in a new tab
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

  return (
    <div
      ref={playerRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className={`absolute z-50 flex flex-col overflow-hidden border transition-all duration-300 ${
        isMinimized
          ? 'w-[200px] h-[134px] rounded-xl' // 112px video + 22px solid bottom drag bar
          : 'w-[320px] h-[272px] rounded-2xl'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        background: 'var(--panel-bg)',
        borderColor: 'var(--panel-border)',
        boxShadow:
          'var(--panel-shadow), 0 16px 35px rgba(0, 0, 0, 0.45), inset 0 1.5px 2.5px rgba(255, 255, 255, 0.55)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* 3D Glass Inner Edge Highlight Overlay */}
      {!isMinimized && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl z-20"
          style={{
            boxShadow:
              'inset 0 1px 1.5px rgba(255, 255, 255, 0.65), inset 0 0 1px 1px rgba(255, 255, 255, 0.15)',
          }}
        />
      )}

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
        <div
          className="drag-handle flex items-center justify-between px-3.5 py-2.5 cursor-move shrink-0 select-none border-b animate-in fade-in duration-300"
          style={{
            background: 'var(--header-bg)',
            borderColor: 'var(--header-border)',
            color: 'var(--header-text-color)',
          }}
        >
          <div className="flex items-center gap-2">
            <Disc
              className="w-4 h-4 animate-spin"
              style={{
                animationDuration: '4s',
                color: 'var(--header-text-color)',
              }}
            />
            <span
              className="text-xs font-bold tracking-wider"
              style={{ color: 'var(--header-text-color)', fontFamily: "'Outfit', sans-serif" }}
            >
              NextVWT Karaoke Player
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition focus:outline-none cursor-pointer"
              style={{ color: 'var(--header-text-color)' }}
              title="Minimize"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-red-500/10 transition focus:outline-none cursor-pointer"
              style={{ color: 'var(--header-text-color)' }}
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
          isMinimized ? 'w-full h-[112px]' : 'w-full aspect-video border-b'
        }`}
        style={{
          borderColor: 'var(--panel-border)',
        }}
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
        <div
          className="p-2.5 flex gap-1.5 shrink-0 border-b animate-in fade-in duration-300"
          style={{
            background: 'rgba(0, 0, 0, 0.08)',
            borderColor: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <div className="relative flex-1">
            <Search
              className="absolute left-2.5 top-2.5 w-3.5 h-3.5"
              style={{ color: 'var(--panel-text-color)', opacity: 0.6 }}
            />
            <input
              type="text"
              placeholder="Cari lagu / paste link YouTube..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLoadVideo(searchQuery)}
              className="w-full pl-8 pr-2 py-1.5 bg-black/15 border rounded-lg text-[11px] placeholder:text-current placeholder:opacity-50 text-current font-medium focus:outline-none focus:ring-1 focus:ring-current"
              style={{
                color: 'var(--panel-text-color)',
                borderColor: 'var(--panel-border)',
              }}
            />
          </div>
          <button
            onClick={() => handleLoadVideo(searchQuery)}
            className="px-2.5 py-1 text-[10px] font-bold text-white transition focus:outline-none cursor-pointer active:scale-95 flex items-center justify-center rounded-lg"
            style={{
              background: 'var(--btn-bg)',
              border: 'var(--btn-border)',
              boxShadow: 'var(--btn-shadow)',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            LOAD
          </button>
        </div>
      )}

      {/* ─── MINI DRAG BAR (Only shown at the bottom when minimized) ─── */}
      {isMinimized && (
        <div
          className="drag-handle w-full h-[22px] border-t flex items-center justify-center cursor-move shrink-0 select-none pointer-events-auto"
          style={{
            background: 'var(--header-bg)',
            borderColor: 'var(--header-border)',
          }}
        >
          {/* Visual drag indicator lines */}
          <div className="flex gap-1 items-center">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--header-text-color)', opacity: 0.5 }}
            />
            <div className="flex flex-col gap-0.5 justify-center">
              <span
                className="w-6 h-[2px] rounded"
                style={{ backgroundColor: 'var(--header-text-color)', opacity: 0.4 }}
              />
              <span
                className="w-6 h-[2px] rounded"
                style={{ backgroundColor: 'var(--header-text-color)', opacity: 0.4 }}
              />
            </div>
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--header-text-color)', opacity: 0.5 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
