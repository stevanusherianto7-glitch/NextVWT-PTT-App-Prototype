import { UserProfile } from './utils';

/**
 * Static seed profiles for the demo/user-list modal.
 *
 * Extracted from UserListModal.tsx to keep the component focused on rendering
 * and moderation logic. These are demo fixtures only — real presence/roles
 * come from Supabase Realtime + channel_roles.
 */
export const USER_PROFILES: Record<string, UserProfile> = {
  'Pebri Haryanto': {
    userId: 'Pebri Haryanto',
    displayName: 'Pebri Haryanto',
    callSign: '2DYUA',
    location: 'BANDUNG, JABAR',
    avatarColor: '#3F51B5',
    avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
    role: 'operator',
    badges: ['❤️', '☕'],
  },
  'Pebe Herianto': {
    userId: 'Pebe Herianto',
    displayName: 'Pebe Herianto',
    callSign: 'N.O.C',
    location: 'BANDUNG, JABAR',
    avatarColor: '#3F51B5',
    avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
    role: 'noc',
  },
  agus_santika: {
    userId: 'agus_santika',
    displayName: 'Agus Santika',
    callSign: 'MOD01',
    location: 'JAKARTA, DKI',
    avatarColor: '#4CAF50',
    avatarUrl: 'https://randomuser.me/api/portraits/women/4.jpg',
    role: 'operator',
    badges: ['💛', '😊'],
  },
  budi_santoso: {
    userId: 'budi_santoso',
    displayName: 'Budi',
    callSign: 'MUT02',
    location: 'SURABAYA, JATIM',
    avatarColor: '#F44336',
    avatarUrl: 'https://randomuser.me/api/portraits/men/5.jpg',
    isMuted: true,
    badges: ['☕'],
  },
  citra_kirana: {
    userId: 'citra_kirana',
    displayName: 'Citra',
    callSign: 'CTR03',
    location: 'YOGYAKARTA, DIY',
    avatarColor: '#9C27B0',
    avatarUrl: 'https://randomuser.me/api/portraits/women/6.jpg',
    isControlled: true,
    badges: ['💙', '🌟'],
  },
  dedi_pratama: {
    userId: 'dedi_pratama',
    displayName: 'Dedi',
    callSign: 'WAT04',
    location: 'MEDAN, SUMUT',
    avatarColor: '#FF9800',
    avatarUrl: 'https://randomuser.me/api/portraits/men/7.jpg',
    isWait: true,
  },
  euis_cahyani: {
    userId: 'euis_cahyani',
    displayName: 'Euis',
    callSign: 'WTC05',
    location: 'BANDUNG, JABAR',
    avatarColor: '#E91E63',
    avatarUrl: 'https://randomuser.me/api/portraits/women/8.jpg',
    isWaitControlled: true,
  },
  fajar_nugraha: {
    userId: 'fajar_nugraha',
    displayName: 'Fajar',
    callSign: 'OPR06',
    location: 'DENPASAR, BALI',
    avatarColor: '#00BCD4',
    avatarUrl: 'https://randomuser.me/api/portraits/men/9.jpg',
    role: 'operator',
  },
  gilang_ramadhan: {
    userId: 'gilang_ramadhan',
    displayName: 'Gilang',
    callSign: 'GST07',
    location: 'LOMBOK, NTB',
    avatarColor: '#607D8B',
    avatarUrl: 'https://randomuser.me/api/portraits/men/26.jpg',
    role: 'guest',
  },
  noc_global: {
    userId: 'noc_global',
    displayName: 'NOC Global',
    callSign: 'NOC00',
    location: 'JAKARTA, DKI',
    avatarColor: '#3F51B5',
    avatarUrl: 'https://randomuser.me/api/portraits/women/10.jpg',
    role: 'noc',
    badges: ['🔥', '💻'],
  },
  sys_admin_vwt: {
    userId: 'sys_admin_vwt',
    displayName: 'SysAdmin VWT',
    callSign: 'SYS99',
    location: 'BANDUNG, JABAR',
    avatarColor: '#009688',
    avatarUrl: 'https://randomuser.me/api/portraits/men/11.jpg',
    role: 'sys_admin',
    badges: ['👑', '🛡️'],
  },
  pjc_room_manager: {
    userId: 'pjc_room_manager',
    displayName: 'PJC Room Mgr',
    callSign: 'PJC01',
    location: 'SURABAYA, JATIM',
    avatarColor: '#E91E63',
    avatarUrl: 'https://randomuser.me/api/portraits/women/12.jpg',
    role: 'pjc',
    badges: ['💜', '🍵'],
  },
  operator_otomatis: {
    userId: 'operator_otomatis',
    displayName: 'Operator Auto',
    callSign: 'OPR99',
    location: 'SEMARANG, JATENG',
    avatarColor: '#FF9800',
    avatarUrl: 'https://randomuser.me/api/portraits/men/13.jpg',
    role: 'operator',
  },
  mario_teguh: {
    userId: 'mario_teguh',
    displayName: 'Siswa Baru',
    callSign: 'NEW01',
    location: 'MALANG, JATIM',
    avatarColor: '#4CAF50',
    avatarUrl: 'https://randomuser.me/api/portraits/women/14.jpg',
    isNewUser: true,
  },
  nina_marlina: {
    userId: 'nina_marlina',
    displayName: 'Pendengar Setia',
    callSign: 'LSTNR',
    location: 'MEDAN, SUMUT',
    avatarColor: '#9E9E9E',
    avatarUrl: 'https://randomuser.me/api/portraits/men/15.jpg',
    isMuted: true,
  },
  oscar_lawalata: {
    userId: 'oscar_lawalata',
    displayName: 'Tamu (Ctrl)',
    callSign: 'GST02',
    location: 'DENPASAR, BALI',
    avatarColor: '#9C27B0',
    avatarUrl: 'https://randomuser.me/api/portraits/women/16.jpg',
    isControlled: true,
  },
  test_user_1: {
    userId: 'test_user_1',
    displayName: 'Test User 1',
    callSign: 'TST01',
    location: 'JAKARTA SELATAN, DKI',
    avatarColor: '#2196F3',
    avatarUrl: 'https://randomuser.me/api/portraits/men/44.jpg',
    role: 'operator',
  },
};

export function getDeterministicProfile(username: string): UserProfile {
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

  return { userId: username, displayName, callSign, location, avatarColor, avatarUrl };
}
