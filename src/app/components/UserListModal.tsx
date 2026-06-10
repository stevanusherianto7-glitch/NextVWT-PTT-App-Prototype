import { useState } from 'react';
import { usePTTStore } from '../store/usePTTStore';
import iconVoice from '../../assets/icon_voice.png';
import iconOperator from '../../assets/icon_operator_otomatis.png';
import iconModerator from '../../assets/icon_moderator.png';

/** Mode types that can be assigned to users */
type UserMode = 'voice' | 'operator' | 'moderator';

/** Icon mapping per mode */
const MODE_ICONS: Record<UserMode, string> = {
  voice: iconVoice,
  operator: iconOperator,
  moderator: iconModerator,
};

/** Tooltip labels per mode */
const MODE_LABELS: Record<UserMode, string> = {
  voice: 'Voice',
  operator: 'Operator',
  moderator: 'Moderator',
};

/** Deterministic random mode assignment based on username hash */
function getUserMode(username: string): UserMode {
  let hash = 7;
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 31 + username.charCodeAt(i)) | 0;
  }
  const modes: UserMode[] = ['voice', 'operator', 'moderator'];
  return modes[Math.abs(hash) % modes.length];
}

interface UserListModalProps {
  channel: number;
  channelName: string;
  users: Array<
    | string
    | {
        userId: string;
        displayName: string;
        callSign: string;
        location: string;
        avatarUrl?: string;
      }
  >;
  onClose: () => void;
}

interface UserProfile {
  displayName: string;
  callSign: string;
  location: string;
  avatarColor: string;
  avatarUrl: string;
  isNewUser?: boolean;
}

const USER_PROFILES: Record<string, UserProfile> = {
  'Pebri Haryanto': {
    displayName: 'Pebri Haryanto',
    callSign: '2DYUA',
    location: 'BANDUNG, JABAR',
    avatarColor: '#3F51B5',
    avatarUrl:
      'https://images.unsplash.com/photo-1504257404764-5a9b0ad04e26?w=80&h=80&fit=crop&crop=faces',
  },
  'Pebe Herianto': {
    displayName: 'Pebe Herianto',
    callSign: '2DYUA',
    location: 'BANDUNG, JABAR',
    avatarColor: '#3F51B5',
    avatarUrl:
      'https://images.unsplash.com/photo-1504257404764-5a9b0ad04e26?w=80&h=80&fit=crop&crop=faces',
  },
  antoni_99: {
    displayName: 'Arthur',
    callSign: 'FLPSP',
    location: 'CILEGON, BANTEN',
    avatarColor: '#E91E63',
    avatarUrl:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=faces',
  },
  budi_salatiga: {
    displayName: 'Benhur',
    callSign: '6EKR4',
    location: 'DEMAK, JATENG',
    avatarColor: '#9C27B0',
    avatarUrl:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop&crop=faces',
  },
  rudi_bandung: {
    displayName: 'Ayda',
    callSign: 'L2P8G',
    location: 'SEMARANG, JATENG',
    avatarColor: '#FF9800',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces',
  },
  medan_dx: {
    displayName: 'Zainiz',
    callSign: '6Y2RM',
    location: 'BANDA ACEH, ACEH',
    avatarColor: '#009688',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces',
  },
  palembang_line: {
    displayName: 'Gun Pakabelo',
    callSign: 'JYQTJ',
    location: 'PALU, SULTENG',
    avatarColor: '#795548',
    avatarUrl:
      'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=80&h=80&fit=crop&crop=faces',
  },
  touring_rider: {
    displayName: 'Topo',
    callSign: '0S9W4',
    location: 'BANDAR LAMPUNG, LAMPUNG',
    avatarColor: '#4CAF50',
    avatarUrl:
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&h=80&fit=crop&crop=faces',
  },
  ninja_club: {
    displayName: 'Nengkleo',
    callSign: 'J3REY',
    location: 'PASURUAN, JATIM',
    avatarColor: '#00BCD4',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
  },
  pak_rudi_rt: {
    displayName: 'Endang Wahyuni',
    callSign: 'JK4Z1',
    location: 'SOLO, JATENG',
    avatarColor: '#FF5722',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=faces',
  },
  siskamling_1: {
    displayName: 'Gwenie',
    callSign: 'KWZ10',
    location: 'SAMARINDA, KALTIM',
    avatarColor: '#607D8B',
    avatarUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=faces',
  },
  lalin_update: {
    displayName: 'Rudi Interizti',
    callSign: 'QR95J',
    location: 'CILACAP, JATENG',
    avatarColor: '#3F51B5',
    avatarUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=faces',
    isNewUser: true,
  },
  anto_bekasi: {
    displayName: 'Vida',
    callSign: 'XGYQK',
    location: 'LIMA PULUH KOTA, SUMBAR',
    avatarColor: '#E91E63',
    avatarUrl:
      'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=80&h=80&fit=crop&crop=faces',
  },
  doni_depok: {
    displayName: 'Zaki',
    callSign: '1C0TT',
    location: 'SUMENEP, JATIM',
    avatarColor: '#9C27B0',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces',
  },
  makassar_boy: {
    displayName: 'Pin Ponelipu',
    callSign: '84NCR',
    location: 'MOROWALI, SULTENG',
    avatarColor: '#FF9800',
    avatarUrl:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=faces',
  },
  sar_team_1: {
    displayName: 'Dino',
    callSign: 'FKXFV',
    location: 'JAMBI KOTA, JAMBI',
    avatarColor: '#009688',
    avatarUrl:
      'https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?w=80&h=80&fit=crop&crop=faces',
  },
  mount_hiker: {
    displayName: 'Saif Sereyang',
    callSign: '5UFQ4',
    location: 'METRO, LAMPUNG',
    avatarColor: '#795548',
    avatarUrl:
      'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?w=80&h=80&fit=crop&crop=faces',
  },
  support_admin: {
    displayName: '☆•°•LÌÀ••°•☆',
    callSign: 'SATU HATI',
    location: 'SEMARANG, JATENG',
    avatarColor: '#4CAF50',
    avatarUrl:
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=faces',
  },
  eko_pratama: {
    displayName: 'Gam Cantoy',
    callSign: 'H4T1P',
    location: 'BANDA ACEH, ACEH',
    avatarColor: '#00BCD4',
    avatarUrl:
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop&crop=faces',
  },
  dewi_sari: {
    displayName: 'Neng Tien',
    callSign: 'NPT3U',
    location: 'PADANG LAWAS, SUMUT',
    avatarColor: '#FF5722',
    avatarUrl:
      'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=80&h=80&fit=crop&crop=faces',
  },
  siti_aminah: {
    displayName: 'Zha Zha',
    callSign: 'XJV6T',
    location: 'MADIUN, JATIM',
    avatarColor: '#607D8B',
    avatarUrl:
      'https://images.unsplash.com/photo-1548142813-c348350df52b?w=80&h=80&fit=crop&crop=faces',
  },
  joko_susilo: {
    displayName: 'Putra Paser',
    callSign: '65TQH',
    location: 'BANTAENG, SULSEL',
    avatarColor: '#3F51B5',
    avatarUrl:
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&h=80&fit=crop&crop=faces',
  },
  hendra_w: {
    displayName: 'Hendra Wijaya',
    callSign: '8YFD3',
    location: 'DENPASAR, BALI',
    avatarColor: '#E91E63',
    avatarUrl:
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&h=80&fit=crop&crop=faces',
  },
  yudi_antara: {
    displayName: 'Yudi Antara',
    callSign: '5TGB7',
    location: 'MATARAM, NTB',
    avatarColor: '#9C27B0',
    avatarUrl:
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=80&h=80&fit=crop&crop=faces',
  },
  agus_setiawan: {
    displayName: 'Agus Setiawan',
    callSign: '4RFV2',
    location: 'SURABAYA, JATIM',
    avatarColor: '#FF9800',
    avatarUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=faces',
  },
  roni_h: {
    displayName: 'Roni Hidayat',
    callSign: '9OLK4',
    location: 'BALIKPAPAN, KALTIM',
    avatarColor: '#009688',
    avatarUrl:
      'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=80&h=80&fit=crop&crop=faces',
  },
  irma_p: {
    displayName: 'Irma Permata',
    callSign: '1QAZ2',
    location: 'PALEMBANG, SUMSEL',
    avatarColor: '#795548',
    avatarUrl:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=80&h=80&fit=crop&crop=faces',
  },
  pebri_fans: {
    displayName: 'Pebri Fans Club',
    callSign: '7UJM8',
    location: 'CIREBON, JABAR',
    avatarColor: '#4CAF50',
    avatarUrl:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&h=80&fit=crop&crop=faces',
  },
};

function getDeterministicProfile(username: string): UserProfile {
  let hash = 5381;
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 33) ^ username.charCodeAt(i);
  }
  hash = Math.abs(hash);

  const cities = [
    'JAKARTA, DKI',
    'SURABAYA, JATIM',
    'MEDAN, SUMUT',
    'BANDUNG, JABAR',
    'MAKASSAR, SULSEL',
    'SEMARANG, JATENG',
    'PALEMBANG, SUMSEL',
    'BALIKPAPAN, KALTIM',
    'DENPASAR, BALI',
    'YOGYAKARTA, DIY',
  ];

  const colors = [
    '#3F51B5',
    '#E91E63',
    '#9C27B0',
    '#FF9800',
    '#009688',
    '#795548',
    '#4CAF50',
    '#00BCD4',
    '#FF5722',
    '#607D8B',
  ];

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';

  let callSign = '';
  callSign += alphabet[hash % 26];
  callSign += alphabet[(hash >> 1) % 26];
  callSign += digits[(hash >> 2) % 10];
  callSign += alphabet[(hash >> 3) % 26];
  callSign += digits[(hash >> 4) % 10];

  const location = cities[hash % cities.length];
  const avatarColor = colors[hash % colors.length];

  const nameParts = username.split(/[_\s]+/);
  const displayName = nameParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

  const picNum = (hash % 70) + 1;
  const avatarUrl = `https://randomuser.me/api/portraits/${hash % 2 === 0 ? 'men' : 'women'}/${picNum}.jpg`;

  return { displayName, callSign, location, avatarColor, avatarUrl };
}

function AvatarImage({
  src,
  displayName,
  avatarColor,
}: {
  src?: string;
  displayName: string;
  avatarColor: string;
}) {
  const [hasError, setHasError] = useState(false);
  const initial = displayName.charAt(0).toUpperCase();

  if (hasError || !src) {
    return (
      <div
        className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-[22px] shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)] border border-white/20"
        style={{ backgroundColor: avatarColor }}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={displayName}
      onError={() => setHasError(true)}
      className="w-full h-full rounded-full object-cover shadow-[0_2px_4px_rgba(0,0,0,0.15)] border border-white/20"
    />
  );
}

export function UserListModal({
  channel: _channel,
  channelName: _channelName,
  users,
  onClose: _onClose,
}: UserListModalProps) {
  const isTransmitting = usePTTStore((state) => state.isTransmitting);
  const activeTransmitter = usePTTStore((state) => state.activeTransmitter);
  const localUserId = usePTTStore((state) => state.userId);
  const localUser = usePTTStore((state) => state.user);
  const localInfoText = usePTTStore((state) => state.infoText);
  const localName = localUser?.user_metadata?.full_name || localInfoText;

  const showMyPhoto = usePTTStore((state) => state.showMyPhoto);
  const showOtherPhotos = usePTTStore((state) => state.showOtherPhotos);
  const showPhotosInList = usePTTStore((state) => state.showPhotosInList);

  const [activeZoomedAvatar, setActiveZoomedAvatar] = useState<{
    displayName: string;
    callSign: string;
    location: string;
    avatarUrl: string;
    avatarColor: string;
  } | null>(null);

  // Map user list or generate dynamic fallback
  const allUsersMapped = users.map((user) => {
    if (typeof user === 'string') {
      const profileData = USER_PROFILES[user] || getDeterministicProfile(user);
      return {
        ...profileData,
        userId: user,
      };
    } else {
      // It's a live presence activeUser object
      return {
        displayName: user.displayName,
        callSign: user.callSign,
        location: user.location,
        avatarColor: '#3F51B5',
        avatarUrl: user.avatarUrl || '',
        isNewUser: (user as any).isNewUser,
        userId: user.userId,
      };
    }
  });

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-[340px] user-list-modal -mt-[14px] pb-4 bg-white border-x-2 border-b-2 border-gray-400 rounded-b-2xl flex flex-col overflow-hidden animate-in fade-in duration-200"
    >
      <style>{`
        .user-list-modal {
          height: 400px;
        }
        @media (min-height: 700px) {
          .user-list-modal {
            height: 535px;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 1px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
        }
        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
        }
        @keyframes activeUserPulse {
          0%, 100% {
            background-color: rgba(239, 246, 255, 0.75);
            box-shadow: inset 0 0 12px rgba(0, 136, 204, 0.15);
          }
          50% {
            background-color: rgba(219, 234, 254, 0.95);
            box-shadow: inset 0 0 22px rgba(0, 136, 204, 0.4), 0 0 10px rgba(0, 136, 204, 0.25);
          }
        }
        .active-user-glow {
          animation: activeUserPulse 1.5s infinite ease-in-out;
        }
      `}</style>

      {/* User List Container (Scrollable) */}
      <div className="flex-1 overflow-y-auto bg-[#fafbfc] divide-y divide-gray-100 custom-scrollbar">
        {/* Server Row */}
        <div className="w-full flex items-center px-4 py-2.5 border-b border-gray-100 bg-[#f4f7f6]">
          <div className="w-[52px] h-[52px] shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-inner relative">
            <svg className="w-7 h-7 text-white fill-current" viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="ml-3 flex-1 min-w-0 text-left">
            <div className="text-sm font-medium text-gray-900">Server</div>
            <div className="text-[10px] text-gray-500 font-normal uppercase mt-0.5 tracking-wider">
              SERVER NextVWT
            </div>
          </div>
        </div>

        {/* Users List */}
        {allUsersMapped.length > 0 ? (
          allUsersMapped.map((profile, idx) => {
            const isLocalUser =
              profile.userId === localUserId ||
              profile.displayName === localName ||
              profile.callSign === '2DYUA';
            const isSpeaking =
              (isTransmitting && isLocalUser) ||
              (activeTransmitter && activeTransmitter.userId === profile.userId);

            let avatarUrlToUse = profile.avatarUrl;
            if (!showPhotosInList) {
              avatarUrlToUse = '';
            } else if (isLocalUser && !showMyPhoto) {
              avatarUrlToUse = '';
            } else if (!isLocalUser && !showOtherPhotos) {
              avatarUrlToUse = '';
            }

            return (
              <div
                key={`${profile.callSign}-${idx}`}
                className={`w-full flex items-center px-4 py-2.5 hover:bg-white active:bg-gray-100 transition-all duration-300 border-b border-gray-300/70 ${
                  isSpeaking ? 'active-user-glow z-10' : 'bg-[#fafbfc]'
                }`}
              >
                {/* Avatar with mode icon overlay */}
                <div
                  className="relative w-[52px] h-[52px] shrink-0 select-none cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveZoomedAvatar({
                      displayName: profile.displayName,
                      callSign: profile.callSign,
                      location: profile.location,
                      avatarUrl: avatarUrlToUse,
                      avatarColor: profile.avatarColor,
                    });
                  }}
                >
                  <AvatarImage
                    src={avatarUrlToUse}
                    displayName={profile.displayName}
                    avatarColor={profile.avatarColor}
                  />
                  {/* Mode icon badge at bottom-right */}
                  {(() => {
                    const mode = getUserMode(profile.userId || profile.displayName);
                    return (
                      <div className="absolute -bottom-[2px] -right-[2px] w-[22px] h-[22px] rounded-full bg-white flex items-center justify-center shadow-[0_2px_5px_rgba(0,0,0,0.2)] border border-gray-100 select-none">
                        <img
                          src={MODE_ICONS[mode]}
                          alt={MODE_LABELS[mode]}
                          title={MODE_LABELS[mode]}
                          className="w-[15px] h-[15px] object-contain"
                          draggable={false}
                        />
                      </div>
                    );
                  })()}
                </div>

                {/* Name & Details */}
                <div className="ml-3 flex-1 min-w-0 text-left">
                  <div className="text-[14px] font-medium text-gray-800 truncate leading-snug">
                    <span className="truncate">{profile.displayName}</span>
                  </div>
                  <div className="flex items-center text-[11px] mt-0.5 truncate gap-1.5 font-medium leading-none">
                    <span className="text-[#00C853] font-medium tracking-wide">
                      {profile.callSign}
                    </span>
                    <span className="text-gray-500 font-normal uppercase">{profile.location}</span>
                  </div>
                </div>

                {/* Active Speaker Megaphone Toa Icon */}
                {isSpeaking && (
                  <div className="mr-1 flex items-center justify-center animate-pulse text-[#0088cc]">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="currentColor">
                      <path d="M16 5v14c0 .55-.45 1-1 1h-1l-4-4H6c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h4l4-4h1c.55 0 1 .45 1 1zm3 7c0-2.03-1.02-3.82-2.58-4.88L15 8.56C16.2 9.29 17 10.55 17 12s-.8 2.71-2 3.44l1.42 1.44C17.98 15.82 19 14.03 19 12zm-3-2.28c.59.54.96 1.3.96 2.28s-.37 1.74-.96 2.28l1.42 1.42c1.07-1 1.71-2.39 1.71-3.7s-.64-2.7-1.71-3.7l-1.42 1.42z" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-gray-400 font-medium">
            Tidak ada pengguna ditemukan
          </div>
        )}
      </div>

      {/* Zoomed Avatar Overlay Modal */}
      {activeZoomedAvatar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveZoomedAvatar(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-[280px] w-full mx-4 shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Expanded Avatar */}
            <div className="w-40 h-40 rounded-full overflow-hidden shadow-lg border-2 border-[#00C853] relative flex items-center justify-center bg-gray-100">
              {activeZoomedAvatar.avatarUrl ? (
                <img
                  src={activeZoomedAvatar.avatarUrl}
                  alt={activeZoomedAvatar.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white font-bold text-5xl"
                  style={{ backgroundColor: activeZoomedAvatar.avatarColor }}
                >
                  {activeZoomedAvatar.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile Info Details */}
            <h3 className="mt-4 text-lg font-bold text-gray-900 text-center truncate w-full">
              {activeZoomedAvatar.displayName}
            </h3>
            <div className="text-sm font-semibold text-[#00C853] mt-1 tracking-wider">
              {activeZoomedAvatar.callSign}
            </div>
            <div className="text-xs text-gray-500 mt-0.5 uppercase tracking-wide">
              {activeZoomedAvatar.location}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setActiveZoomedAvatar(null)}
              className="mt-5 px-6 py-2 bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-white text-xs font-semibold rounded-full shadow transition-colors duration-200"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
