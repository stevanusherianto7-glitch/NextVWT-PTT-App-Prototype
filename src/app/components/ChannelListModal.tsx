import { useState } from 'react';
import { STATIC_CHANNELS, ChannelItem } from '../utils/constants';

interface ChannelListModalProps {
  onClose: () => void;
  onSelectChannel: (channelNum: number) => void;
}

export function ChannelListModal({ onClose, onSelectChannel }: ChannelListModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePrivateChannel, setActivePrivateChannel] = useState<ChannelItem | null>(null);
  const [restrictedChannel, setRestrictedChannel] = useState<ChannelItem | null>(null);
  const [infoChannel, setInfoChannel] = useState<ChannelItem | null>(null);

  const filteredChannels = STATIC_CHANNELS.filter(
    (ch) =>
      ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.number.toString().includes(searchQuery)
  );

  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      {/* Backdrop Dismiss */}
      <div
        className="absolute inset-0"
        onClick={() => {
          onClose();
          setSearchQuery('');
        }}
      />

      {/* Modal Container */}
      <div className="bg-white w-full max-w-[340px] max-h-[80%] rounded-lg shadow-2xl flex flex-col z-10 overflow-hidden border border-gray-300 animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="flex flex-col items-center px-4 py-4 bg-white shrink-0 border-b border-gray-200">
          <div className="flex items-center justify-center gap-1.5 w-full px-2 py-1">
            <span
              className="text-[30px] sm:text-[34px] font-black tracking-tighter uppercase"
              style={{
                color: '#22c55e',
                textShadow: '1px 1px 0px #16a34a, 2px 2px 0px #15803d, 2px 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              NEXT
            </span>
            <svg
              viewBox="0 0 100 100"
              className="h-[36px] sm:h-[42px] w-auto shrink-0 mx-0.5 translate-y-[2px]"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
              }}
            >
              <defs>
                <radialGradient id="glossyRedModal" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="25%" stopColor="#ff1a1a" />
                  <stop offset="70%" stopColor="#b30000" />
                  <stop offset="100%" stopColor="#4a0000" />
                </radialGradient>
              </defs>

              <circle
                cx="50"
                cy="50"
                r="10"
                fill="#2d0a0a"
                transform="translate(0.8, 1)"
                opacity="0.4"
              />
              <circle cx="50" cy="50" r="10" fill="url(#glossyRedModal)" />

              <path
                d="M 37.3 62.7 A 18 18 0 1 1 62.7 62.7"
                stroke="#0a3c10"
                strokeWidth="5.5"
                strokeLinecap="round"
                fill="none"
                transform="translate(0.8, 1)"
              />
              <path
                d="M 37.3 62.7 A 18 18 0 1 1 62.7 62.7"
                stroke="#00C853"
                strokeWidth="5.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 37.3 62.7 A 18 18 0 1 1 62.7 62.7"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
                opacity="0.7"
                transform="translate(-0.5, -0.6)"
              />

              <path
                d="M 30.2 69.8 A 28 28 0 1 1 69.8 69.8"
                stroke="#083818"
                strokeWidth="5.5"
                strokeLinecap="round"
                fill="none"
                transform="translate(0.8, 1)"
              />
              <path
                d="M 30.2 69.8 A 28 28 0 1 1 69.8 69.8"
                stroke="#10B981"
                strokeWidth="5.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 30.2 69.8 A 28 28 0 1 1 69.8 69.8"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
                opacity="0.7"
                transform="translate(-0.5, -0.6)"
              />

              <path
                d="M 23.1 76.9 A 38 38 0 1 1 76.9 76.9"
                stroke="#0c351c"
                strokeWidth="5.5"
                strokeLinecap="round"
                fill="none"
                transform="translate(0.8, 1)"
              />
              <path
                d="M 23.1 76.9 A 38 38 0 1 1 76.9 76.9"
                stroke="#34D399"
                strokeWidth="5.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 23.1 76.9 A 38 38 0 1 1 76.9 76.9"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
                opacity="0.7"
                transform="translate(-0.5, -0.6)"
              />
            </svg>
            <span
              className="text-[30px] sm:text-[34px] font-black tracking-tighter uppercase"
              style={{
                color: '#22c55e',
                textShadow: '1px 1px 0px #16a34a, 2px 2px 0px #15803d, 2px 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              VWT
            </span>
          </div>
          <div className="text-[9px] sm:text-[10px] font-black text-[#e53935] tracking-[0.18em] mt-1.5 text-center uppercase">
            NEXT VIRTUAL WALKIE TALKIE
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-gray-50 border-b border-gray-100 shrink-0">
          <input
            type="text"
            placeholder="Cari channel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs bg-white text-black outline-none focus:border-blue-500 font-semibold"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto bg-white text-left divide-y divide-gray-200">
          {filteredChannels.length > 0 ? (
            filteredChannels.map((ch) => {
              let bgClass = 'bg-gradient-to-b from-[#9E9E9E] to-[#616161]'; // Default gray
              if (ch.type === 'green') {
                if (ch.number === 0 || ch.number === 100) {
                  bgClass = 'bg-gradient-to-b from-[#1b5e20] to-[#0e3b12]';
                } else {
                  bgClass = 'bg-gradient-to-b from-[#66bb6a] to-[#388e3c]';
                }
              } else if (ch.type === 'red') {
                bgClass = 'bg-gradient-to-b from-[#e53935] to-[#c62828]';
              }

              const activeUserCount = ch.users.length;
              let activeUsersStr =
                activeUserCount > 0
                  ? `${activeUserCount} PENGGUNA • ${ch.users.join(', ')}`
                  : '0 PENGGUNA';

              if (ch.number === 0) {
                activeUsersStr = 'WWW.NEXTVWT.ID';
              }

              return (
                <button
                  key={ch.number}
                  onClick={() => {
                    setActivePrivateChannel(ch);
                  }}
                  className="w-full flex items-center p-0 hover:bg-gray-50 active:bg-gray-100 text-left cursor-pointer select-none focus:outline-none"
                >
                  <div
                    className={`w-[55px] py-2.5 flex items-center justify-center text-white font-bold text-sm shrink-0 ${bgClass} border-t-[2px] border-l-[2px] border-t-white/45 border-l-white/45 border-r-[2px] border-b-[2px] border-r-black/45 border-b-black/45 shadow-[inset_1px_1px_0px_rgba(255,255,255,0.3)]`}
                    style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.6)' }}
                  >
                    {ch.number.toString().padStart(3, '0')}
                  </div>
                  <div className="ml-3 pr-3 flex-1 min-w-0 py-1">
                    <div className="text-xs font-bold text-black truncate">{ch.name}</div>
                    <div className="text-[10px] text-gray-500 font-semibold truncate mt-0.5 uppercase">
                      {activeUsersStr}
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-gray-500 font-medium">
              Tidak ada channel ditemukan
            </div>
          )}
        </div>

        {/* Overlays inside Modal */}
        {activePrivateChannel && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-55 p-6 animate-in fade-in duration-100">
            <div className="absolute inset-0" onClick={() => setActivePrivateChannel(null)} />
            <div className="bg-white w-[85%] max-w-[280px] rounded-lg shadow-2xl flex flex-col z-10 overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  const ch = activePrivateChannel;
                  setActivePrivateChannel(null);
                  if (ch.type === 'red') {
                    setRestrictedChannel(ch);
                  } else {
                    onSelectChannel(ch.number);
                    onClose();
                    setSearchQuery('');
                  }
                }}
                className="w-full text-left px-5 py-4.5 hover:bg-gray-50 active:bg-gray-100 text-[16px] text-gray-800 font-medium border-b border-gray-100 cursor-pointer select-none focus:outline-none"
              >
                Menuju Channel {activePrivateChannel.number}
              </button>
              <button
                onClick={() => {
                  const ch = activePrivateChannel;
                  setActivePrivateChannel(null);
                  setInfoChannel(ch);
                }}
                className="w-full text-left px-5 py-4.5 hover:bg-gray-50 active:bg-gray-100 text-[16px] text-gray-800 font-medium cursor-pointer select-none focus:outline-none"
              >
                Info Channel {activePrivateChannel.number}
              </button>
            </div>
          </div>
        )}

        {restrictedChannel && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-60 p-6 animate-in fade-in duration-100">
            <div className="bg-white w-[85%] max-w-[300px] rounded-2xl shadow-2xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-100 text-left">
              <h3 className="text-[17px] font-bold text-gray-800">
                Channel {restrictedChannel.number} terbatas
              </h3>
              <p className="text-[14px] text-gray-600 mt-2.5 leading-relaxed">
                Channel ini terbatas hanya untuk anggota channel
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setRestrictedChannel(null)}
                  className="text-[15px] font-bold text-[#0c62a8] hover:text-[#0b5490] px-6 py-2 cursor-pointer focus:outline-none select-none"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {infoChannel && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-60 p-6 animate-in fade-in duration-100">
            <div className="absolute inset-0" onClick={() => setInfoChannel(null)} />
            <div className="bg-white w-[85%] max-w-[300px] rounded-2xl shadow-2xl flex flex-col p-5 z-10 animate-in fade-in zoom-in-95 duration-100 text-left border border-gray-100">
              <div className="flex items-center gap-2 pb-2.5">
                <svg
                  className="w-5 h-5 text-[#0c62a8] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <h3 className="text-[16px] font-bold text-gray-800">
                  Channel {infoChannel.number}
                </h3>
              </div>

              <div className="flex items-center justify-center py-4">
                <svg
                  viewBox="0 0 100 100"
                  className="h-[75px] w-auto shrink-0"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
                  }}
                >
                  <defs>
                    <radialGradient id="glossyRedInfo" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="25%" stopColor="#ff1a1a" />
                      <stop offset="70%" stopColor="#b30000" />
                      <stop offset="100%" stopColor="#4a0000" />
                    </radialGradient>
                  </defs>

                  <circle
                    cx="50"
                    cy="50"
                    r="10"
                    fill="#2d0a0a"
                    transform="translate(0.8, 1)"
                    opacity="0.4"
                  />
                  <circle cx="50" cy="50" r="10" fill="url(#glossyRedInfo)" />

                  <path
                    d="M 37.3 62.7 A 18 18 0 1 1 62.7 62.7"
                    stroke="#0a3c10"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    fill="none"
                    transform="translate(0.8, 1)"
                  />
                  <path
                    d="M 37.3 62.7 A 18 18 0 1 1 62.7 62.7"
                    stroke="#00C853"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 37.3 62.7 A 18 18 0 1 1 62.7 62.7"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.7"
                    transform="translate(-0.5, -0.6)"
                  />

                  <path
                    d="M 30.2 69.8 A 28 28 0 1 1 69.8 69.8"
                    stroke="#083818"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    fill="none"
                    transform="translate(0.8, 1)"
                  />
                  <path
                    d="M 30.2 69.8 A 28 28 0 1 1 69.8 69.8"
                    stroke="#10B981"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 30.2 69.8 A 28 28 0 1 1 69.8 69.8"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.7"
                    transform="translate(-0.5, -0.6)"
                  />

                  <path
                    d="M 23.1 76.9 A 38 38 0 1 1 76.9 76.9"
                    stroke="#0c351c"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    fill="none"
                    transform="translate(0.8, 1)"
                  />
                  <path
                    d="M 23.1 76.9 A 38 38 0 1 1 76.9 76.9"
                    stroke="#34D399"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 23.1 76.9 A 38 38 0 1 1 76.9 76.9"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.7"
                    transform="translate(-0.5, -0.6)"
                  />
                </svg>
              </div>

              <div className="flex border-t border-gray-100 py-3.5 text-[14px]">
                <span className="w-14 font-bold text-gray-400 shrink-0">Nama</span>
                <span className="font-bold text-gray-800 flex-1 min-w-0 break-words">
                  {infoChannel.name}
                </span>
              </div>
              <div className="flex border-t border-b border-gray-100 py-3.5 text-[14px]">
                <span className="w-14 font-bold text-gray-400 shrink-0">Info</span>
                <span className="font-semibold text-gray-700 flex-1 min-w-0 break-words">
                  {infoChannel.users.length > 0 ? (
                    <span>
                      {infoChannel.users.length} Pengguna • {infoChannel.users.join(', ')}
                    </span>
                  ) : (
                    <span>0 Pengguna</span>
                  )}
                </span>
              </div>

              <div className="mt-5 flex justify-center">
                <button
                  onClick={() => setInfoChannel(null)}
                  className="text-[15px] font-bold text-[#0c62a8] hover:text-[#0b5490] px-6 py-2 cursor-pointer focus:outline-none select-none"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
