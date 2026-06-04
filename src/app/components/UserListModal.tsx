import React, { useState } from 'react';

interface UserListModalProps {
  channel: number;
  channelName: string;
  users: string[];
  onClose: () => void;
}

interface UserProfile {
  displayName: string;
  callSign: string;
  location: string;
  avatarColor: string;
}

const USER_PROFILES: Record<string, UserProfile> = {
  'Pebri Haryanto': {
    displayName: 'Pebri Haryanto',
    callSign: '2DYUA',
    location: 'BANDUNG, JABAR',
    avatarColor: '#3F51B5',
  },
  'Pebe Herianto': {
    displayName: 'Pebe Herianto',
    callSign: '2DYUA',
    location: 'BANDUNG, JABAR',
    avatarColor: '#3F51B5',
  },
  antoni_99: {
    displayName: 'Arthur',
    callSign: 'FLPSP',
    location: 'CILEGON, BANTEN',
    avatarColor: '#E91E63',
  },
  budi_salatiga: {
    displayName: 'Benhur',
    callSign: '6EKR4',
    location: 'DEMAK, JATENG',
    avatarColor: '#9C27B0',
  },
  rudi_bandung: {
    displayName: 'Ayda',
    callSign: 'L2P8G',
    location: 'SEMARANG, JATENG',
    avatarColor: '#FF9800',
  },
  medan_dx: {
    displayName: 'Zainiz',
    callSign: '6Y2RM',
    location: 'BANDA ACEH, ACEH',
    avatarColor: '#009688',
  },
  palembang_line: {
    displayName: 'Gun Pakabelo',
    callSign: 'JYQTJ',
    location: 'PALU, SULTENG',
    avatarColor: '#795548',
  },
  touring_rider: {
    displayName: 'Topo',
    callSign: '0S9W4',
    location: 'BANDAR LAMPUNG, LAMPUNG',
    avatarColor: '#4CAF50',
  },
  ninja_club: {
    displayName: 'Nengkleo',
    callSign: 'J3REY',
    location: 'PASURUAN, JATIM',
    avatarColor: '#00BCD4',
  },
  pak_rudi_rt: {
    displayName: 'Endang Wahyuni',
    callSign: 'JK4Z1',
    location: 'SOLO, JATENG',
    avatarColor: '#FF5722',
  },
  siskamling_1: {
    displayName: 'Gwenie',
    callSign: 'KWZ10',
    location: 'SAMARINDA, KALTIM',
    avatarColor: '#607D8B',
  },
  lalin_update: {
    displayName: 'Rudi Interizti',
    callSign: 'QR95J',
    location: 'CILACAP, JATENG',
    avatarColor: '#3F51B5',
  },
  anto_bekasi: {
    displayName: 'Vida',
    callSign: 'XGYQK',
    location: 'LIMA PULUH KOTA, SUMBAR',
    avatarColor: '#E91E63',
  },
  doni_depok: {
    displayName: 'Zaki',
    callSign: '1C0TT',
    location: 'SUMENEP, JATIM',
    avatarColor: '#9C27B0',
  },
  makassar_boy: {
    displayName: 'Pin Ponelipu',
    callSign: '84NCR',
    location: 'MOROWALI, SULTENG',
    avatarColor: '#FF9800',
  },
  sar_team_1: {
    displayName: 'Dino',
    callSign: 'FKXFV',
    location: 'JAMBI KOTA, JAMBI',
    avatarColor: '#009688',
  },
  mount_hiker: {
    displayName: 'Saif Sereyang',
    callSign: '5UFQ4',
    location: 'METRO, LAMPUNG',
    avatarColor: '#795548',
  },
  support_admin: {
    displayName: '☆•°•LÌÀ••°•☆',
    callSign: 'SATU HATI',
    location: 'SEMARANG, JATENG',
    avatarColor: '#4CAF50',
  },
  eko_pratama: {
    displayName: 'Gam Cantoy',
    callSign: 'H4T1P',
    location: 'BANDA ACEH, ACEH',
    avatarColor: '#00BCD4',
  },
  dewi_sari: {
    displayName: 'Neng Tien',
    callSign: 'NPT3U',
    location: 'PADANG LAWAS, SUMUT',
    avatarColor: '#FF5722',
  },
  siti_aminah: {
    displayName: 'Zha Zha',
    callSign: 'XJV6T',
    location: 'MADIUN, JATIM',
    avatarColor: '#607D8B',
  },
  joko_susilo: {
    displayName: 'Putra Paser',
    callSign: '65TQH',
    location: 'BANTAENG, SULSEL',
    avatarColor: '#3F51B5',
  },
  hendra_w: {
    displayName: 'Hendra Wijaya',
    callSign: '8YFD3',
    location: 'DENPASAR, BALI',
    avatarColor: '#E91E63',
  },
  yudi_antara: {
    displayName: 'Yudi Antara',
    callSign: '5TGB7',
    location: 'MATARAM, NTB',
    avatarColor: '#9C27B0',
  },
  agus_setiawan: {
    displayName: 'Agus Setiawan',
    callSign: '4RFV2',
    location: 'SURABAYA, JATIM',
    avatarColor: '#FF9800',
  },
  roni_h: {
    displayName: 'Roni Hidayat',
    callSign: '9OLK4',
    location: 'BALIKPAPAN, KALTIM',
    avatarColor: '#009688',
  },
  irma_p: {
    displayName: 'Irma Permata',
    callSign: '1QAZ2',
    location: 'PALEMBANG, SUMSEL',
    avatarColor: '#795548',
  },
  pebri_fans: {
    displayName: 'Pebri Fans Club',
    callSign: '7UJM8',
    location: 'CIREBON, JABAR',
    avatarColor: '#4CAF50',
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

  return { displayName, callSign, location, avatarColor };
}

export function UserListModal({ channel, channelName, users, onClose }: UserListModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Map user list or generate dynamic fallback
  const allUsersMapped = users.map((username) => {
    if (USER_PROFILES[username]) {
      return USER_PROFILES[username];
    }
    return getDeterministicProfile(username);
  });

  const filteredUsers = allUsersMapped.filter(
    (u) =>
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.callSign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="w-full h-[440px] bg-white border border-gray-300 rounded-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      style={{
        boxShadow:
          'inset 0 0 1px rgba(0,0,0,0.1), 0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center px-4 py-3 shrink-0 border-b border-gray-200"
        style={{
          background: 'linear-gradient(to bottom, #ffffff 0%, #f7f9fa 100%)',
        }}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-gray-700 hover:text-blue-600 active:scale-95 transition-all select-none p-1 -ml-1 rounded focus:outline-none"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-wider">Kembali</span>
        </button>

        <div className="flex-1 text-center mr-8">
          <div className="text-[10px] text-gray-400 font-extrabold tracking-widest uppercase">
            DAFTAR PENGGUNA
          </div>
          <div className="text-xs font-black text-gray-800 truncate uppercase mt-0.5">
            CH {channel.toString().padStart(3, '0')} • {channelName}
          </div>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="p-3 bg-gray-50 border-b border-gray-100 shrink-0 relative">
        <div className="absolute left-6.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Cari nama, callsign atau kota..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs bg-white text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 font-semibold transition-all"
        />
      </div>

      {/* User List Container (Scrollable) */}
      <div className="flex-1 overflow-y-auto bg-[#fafbfc] divide-y divide-gray-100">
        {/* Server Row (Fixed first item like in IndoVWT screenshot) */}
        {searchQuery === '' && (
          <div className="w-full flex items-center px-4 py-2.5 border-b border-gray-100 bg-[#f4f7f6]">
            <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-inner relative">
              <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-900">Server</div>
              <div className="text-[10px] text-gray-500 font-extrabold uppercase mt-0.5 tracking-wider">
                SERVER NextVWT
              </div>
            </div>
          </div>
        )}

        {/* Users List */}
        {filteredUsers.length > 0 ? (
          filteredUsers.map((profile, idx) => (
            <div
              key={`${profile.callSign}-${idx}`}
              className="w-full flex items-center px-4 py-2.5 hover:bg-white active:bg-gray-100 transition-colors bg-[#fafbfc]"
            >
              {/* Avatar with blue silhouette overlay */}
              <div className="relative w-11 h-11 shrink-0 select-none">
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-white font-extrabold text-[17px] shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.4),_0_2px_4px_rgba(0,0,0,0.1)]"
                  style={{ backgroundColor: profile.avatarColor }}
                >
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>
                {/* Blue status overlay badge */}
                <div className="absolute bottom-0 right-0 w-[15px] h-[15px] bg-[#0088cc] rounded-full border-[1.5px] border-white flex items-center justify-center shadow-sm">
                  <svg viewBox="0 0 24 24" className="w-2 h-2 text-white" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>

              {/* Name & Details */}
              <div className="ml-3 flex-1 min-w-0">
                <div className="text-[14px] font-bold text-gray-800 truncate leading-snug">
                  {profile.displayName}
                </div>
                <div className="flex items-center text-[11px] mt-0.5 truncate gap-1.5 font-medium leading-none">
                  <span className="text-[#0088cc] font-extrabold tracking-wide">
                    {profile.callSign}
                  </span>
                  <span className="text-gray-500 font-bold uppercase">{profile.location}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-gray-400 font-semibold">
            Tidak ada pengguna ditemukan
          </div>
        )}
      </div>
    </div>
  );
}
