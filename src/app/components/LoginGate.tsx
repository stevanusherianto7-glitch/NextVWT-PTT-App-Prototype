import { useState } from 'react';

interface LoginGateProps {
  onLogin: () => void;
  onGuestLogin: () => void;
}

export function LoginGate({ onLogin, onGuestLogin }: LoginGateProps) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await onLogin();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="size-full flex flex-col items-center justify-center bg-gradient-to-b from-[#1a1c23] to-[#0e1013] px-6 text-center select-none relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px]" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-48 h-48 bg-orange-500/10 rounded-full blur-[80px]" />

      <div className="w-full bg-[#1e2230]/75 backdrop-blur-lg border border-white/10 rounded-[32px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.5)] z-10 flex flex-col items-center">
        <svg
          viewBox="0 0 100 100"
          className="h-16 w-auto mb-4"
          style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))' }}
        >
          <defs>
            <radialGradient id="nextvwtSphere3D" cx="32%" cy="30%" r="68%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="18%" stopColor="#ff6b6b" />
              <stop offset="50%" stopColor="#cc0000" />
              <stop offset="80%" stopColor="#800000" />
              <stop offset="100%" stopColor="#3d0000" />
            </radialGradient>
          </defs>

          <path
            d="M 22 77 A 38 38 0 1 1 78 77"
            stroke="#0a2e1a"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            transform="translate(1, 1.2)"
            opacity="0.5"
          />
          <path
            d="M 22 77 A 38 38 0 1 1 78 77"
            stroke="#34D399"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 22 77 A 38 38 0 1 1 78 77"
            stroke="#a7f3d0"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.65"
            transform="translate(-0.6, -0.7)"
          />

          <path
            d="M 29 71 A 28 28 0 1 1 71 71"
            stroke="#064e3b"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            transform="translate(1, 1.2)"
            opacity="0.5"
          />
          <path
            d="M 29 71 A 28 28 0 1 1 71 71"
            stroke="#10B981"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 29 71 A 28 28 0 1 1 71 71"
            stroke="#6ee7b7"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.65"
            transform="translate(-0.6, -0.7)"
          />

          <path
            d="M 36 65 A 18 18 0 1 1 64 65"
            stroke="#003a17"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            transform="translate(1, 1.2)"
            opacity="0.5"
          />
          <path
            d="M 36 65 A 18 18 0 1 1 64 65"
            stroke="#00C853"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 36 65 A 18 18 0 1 1 64 65"
            stroke="#69f0ae"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.65"
            transform="translate(-0.6, -0.7)"
          />

          <circle
            cx="50"
            cy="50"
            r="11"
            fill="#1a0000"
            transform="translate(1.2, 1.5)"
            opacity="0.45"
          />
          <circle cx="50" cy="50" r="11" fill="url(#nextvwtSphere3D)" />
          <circle
            cx="50"
            cy="50"
            r="11"
            fill="none"
            stroke="#ff4444"
            strokeWidth="0.8"
            opacity="0.4"
          />
          <ellipse
            cx="46.5"
            cy="45.5"
            rx="3.2"
            ry="2.2"
            fill="white"
            opacity="0.7"
            transform="rotate(-25, 46.5, 45.5)"
          />
        </svg>

        <h1 className="text-xl font-bold text-white tracking-wide font-sans mb-1">NextVWT</h1>
        <p className="text-xs text-gray-400 font-medium mb-6 uppercase tracking-wider">
          Virtual Walkie-Talkie
        </p>

        <div className="w-full bg-black/35 rounded-xl p-3 border border-white/5 mb-6 text-left">
          <p className="text-[11px] text-gray-400 leading-normal">
            Hubungkan diri Anda ke saluran frekuensi digital. Masuk menggunakan akun Google Anda
            untuk mensinkronisasikan profil secara instan.
          </p>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-12 bg-white text-black font-semibold rounded-full flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 border border-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_0_20px_rgba(255,255,255,0.7)] cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Masuk dengan Google</span>
            </>
          )}
        </button>

        <button
          onClick={onGuestLogin}
          className="w-full h-12 mt-3 text-slate-700 font-semibold rounded-full flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 border border-gray-200 hover:text-black cursor-pointer shadow-sm"
          style={{
            background: 'linear-gradient(to bottom, #ffffff 0%, #cbd5e1 100%)',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(148, 163, 184, 0.15)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow =
              '0 0 15px rgba(255, 255, 255, 0.9), 0 4px 8px rgba(148, 163, 184, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow =
              '0 0 8px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(148, 163, 184, 0.15)';
          }}
        >
          <svg
            className="w-5 h-5 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span>Masuk sebagai Tamu</span>
        </button>
      </div>

      <div className="absolute bottom-6 left-0 right-0 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
        NextVWT Transceiver App
      </div>
    </div>
  );
}
