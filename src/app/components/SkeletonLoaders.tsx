import type { CSSProperties } from 'react';

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

// Generic shimmer skeleton block
function SkeletonBlock({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/10 ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

// ─── Settings Panel Skeleton ───────────────────────────────────────────────────
export function SettingsPanelSkeleton() {
  return (
    <div
      className="size-full flex flex-col"
      style={{ background: 'var(--device-bg)' }}
      role="status"
      aria-label="Memuat pengaturan..."
    >
      {/* Header */}
      <div
        className="w-full h-[64px] flex items-center px-5 gap-3"
        style={{ background: 'var(--header-bg)', borderBottom: 'var(--header-border)' }}
      >
        <SkeletonBlock className="w-8 h-8 rounded-full" />
        <SkeletonBlock className="flex-1 h-5 max-w-[140px]" />
        <SkeletonBlock className="w-16 h-8 rounded-full ml-auto" />
      </div>

      {/* Content sections */}
      <div className="flex-1 overflow-hidden px-4 pt-5 flex flex-col gap-5">
        {/* Section 1 */}
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="w-24 h-3" />
          <div className="rounded-2xl overflow-hidden flex flex-col gap-px" style={{ background: 'rgba(255,255,255,0.05)' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3.5">
                <SkeletonBlock className="w-32 h-4" />
                <SkeletonBlock className="w-12 h-6 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Section 2 */}
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="w-20 h-3" />
          <div className="rounded-2xl overflow-hidden flex flex-col gap-px" style={{ background: 'rgba(255,255,255,0.05)' }}>
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3.5">
                <SkeletonBlock className="w-28 h-4" />
                <SkeletonBlock className="w-20 h-7 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Slider section */}
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="w-16 h-3" />
          <div className="rounded-2xl px-4 py-4 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <SkeletonBlock className="w-6 h-6 rounded-full" />
            <SkeletonBlock className="flex-1 h-2 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Floating Karaoke Player Skeleton ─────────────────────────────────────────
export function KaraokePlayerSkeleton() {
  return (
    <div
      className="absolute bottom-20 left-0 right-0 mx-3"
      role="status"
      aria-label="Memuat pemutar musik..."
    >
      <div
        className="rounded-3xl overflow-hidden p-4 flex flex-col gap-3"
        style={{ background: 'rgba(20,20,30,0.9)', backdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center gap-3">
          <SkeletonBlock className="w-12 h-12 rounded-2xl flex-shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <SkeletonBlock className="w-32 h-4" />
            <SkeletonBlock className="w-20 h-3" />
          </div>
          <SkeletonBlock className="w-8 h-8 rounded-full" />
        </div>
        <SkeletonBlock className="w-full h-1.5 rounded-full" />
        <div className="flex justify-center gap-6">
          {[1, 2, 3].map((i) => <SkeletonBlock key={i} className="w-9 h-9 rounded-full" />)}
        </div>
      </div>
    </div>
  );
}

// ─── Aquarium Canvas Skeleton ──────────────────────────────────────────────────
export function AquariumSkeleton() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      role="status"
      aria-label="Memuat animasi aquarium..."
      style={{
        background: 'linear-gradient(180deg, #0a1628 0%, #0d2044 50%, #061020 100%)',
      }}
    >
      {/* Gentle wave shimmer placeholders */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 h-0.5 opacity-20 animate-pulse"
          style={{
            top: `${30 + i * 20}%`,
            background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}
