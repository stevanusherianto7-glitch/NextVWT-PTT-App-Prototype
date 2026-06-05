import React, { useState, useRef, useEffect } from 'react';
import { X, Minimize2, Music, Search, Disc, Play } from 'lucide-react';

interface FloatingKaraokePlayerProps {
  onClose: () => void;
}

interface KaraokeSong {
  title: string;
  artist: string;
  videoId: string;
}

const POPULAR_KARAOKE_SONGS: KaraokeSong[] = [
  { title: 'Kopi Dangdut', artist: 'Fahmi Shahab', videoId: 'S2S1Vd3r3Gg' },
  { title: 'Pamer Bojo (Cendol Dawet)', artist: 'Didi Kempot', videoId: '0H0tD5XvTws' },
  { title: 'Kemesraan', artist: 'Iwan Fals', videoId: '57u_6tL98Jc' },
  { title: 'Kangen', artist: 'Dewa 19', videoId: '9GqLgUe5w9A' },
  { title: 'Rungkad', artist: 'Happy Asmara', videoId: '8zWqfE208rE' },
  { title: 'Kemesraan (Acoustic)', artist: 'Karaoke Version', videoId: 'yF-yI1kP_f8' },
  { title: 'Ku Tak Bisa', artist: 'Slank', videoId: 'bC3H09p5JIo' },
  { title: 'Cinta Luar Biasa', artist: 'Andmesh', videoId: 'wR2m89YQd3Y' },
];

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
      newX = Math.max(0, Math.min(window.innerWidth - (isMinimized ? 70 : 340), newX));
      newY = Math.max(0, Math.min(window.innerHeight - (isMinimized ? 70 : 420), newY));

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

  if (isMinimized) {
    // Minimized Floating Bubble Mode
    return (
      <div
        ref={playerRef}
        onTouchStart={onTouchStart}
        onMouseDown={onMouseDown}
        className="drag-handle absolute z-50 flex items-center justify-center cursor-move"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.2)',
          border: '2px solid #6366f1',
          transition: isDragging.current ? 'none' : 'transform 0.1s ease',
        }}
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="w-full h-full flex items-center justify-center text-white relative focus:outline-none"
        >
          <Music className="w-6 h-6 animate-pulse text-cyan-400" />
          <div
            className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 hover:bg-red-600 transition"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="sr-only">Restore Player</span>
        </button>
      </div>
    );
  }

  // Maximized Floating Glassmorphism Player Mode
  return (
    <div
      ref={playerRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className="absolute z-50 flex flex-col w-[320px] bg-slate-950/90 text-white rounded-2xl border border-indigo-500/40 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-md overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        height: '420px',
        boxShadow: '0 0 25px rgba(99,102,241,0.25)',
      }}
    >
      {/* Header Bar */}
      <div className="drag-handle flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-indigo-950 to-slate-900 border-b border-indigo-500/20 cursor-move shrink-0">
        <div className="flex items-center gap-2">
          <Disc
            className="w-4 h-4 text-cyan-400 animate-spin"
            style={{ animationDuration: '4s' }}
          />
          <span className="text-xs font-bold tracking-wider text-indigo-200">KARAOKE PLAYER</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-indigo-500/20 transition focus:outline-none"
            title="Minimize"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-red-500/10 transition focus:outline-none"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* YouTube Player Frame */}
      <div className="w-full aspect-video bg-black shrink-0 relative border-b border-indigo-500/10">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`}
          title="YouTube Karaoke Video"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      {/* Search Input */}
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
          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg text-[10px] font-bold text-white transition focus:outline-none"
        >
          LOAD
        </button>
      </div>

      {/* Popular Tracks & Instructions List */}
      <div className="flex-1 overflow-y-auto p-2 bg-slate-950/40 select-none">
        <div className="text-[10px] font-bold text-slate-400 uppercase px-1.5 py-1 tracking-wider border-b border-slate-800 mb-1">
          Lagu Karaoke Populer (Tanpa Vokal)
        </div>
        <div className="space-y-0.5">
          {POPULAR_KARAOKE_SONGS.map((song) => (
            <button
              key={song.videoId}
              onClick={() => setVideoId(song.videoId)}
              className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left transition text-[11px] ${
                videoId === song.videoId
                  ? 'bg-indigo-500/20 text-cyan-300 font-semibold border-l-2 border-cyan-400'
                  : 'hover:bg-slate-900/80 text-slate-300'
              }`}
            >
              <div className="flex flex-col truncate pr-2">
                <span className="truncate">{song.title}</span>
                <span className="text-[9px] text-slate-500">{song.artist}</span>
              </div>
              <Play
                className={`w-3 h-3 flex-shrink-0 ${videoId === song.videoId ? 'text-cyan-300 animate-pulse' : 'text-slate-500'}`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
