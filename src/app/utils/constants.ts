export interface ChannelItem {
  number: number;
  name: string;
  type: 'green' | 'red' | 'gray';
  users: string[];
}

export const STATIC_CHANNELS: ChannelItem[] = [
  { number: 0, name: 'DUKUNGAN & BANTUAN', type: 'green', users: [] },
  {
    number: 100,
    name: 'LANDING-ECHO CHANNEL',
    type: 'green',
    users: [
      'Pebri Haryanto',
      'antoni_99',
      'budi_salatiga',
      'rudi_bandung',
      'medan_dx',
      'palembang_line',
      'touring_rider',
      'ninja_club',
      'pak_rudi_rt',
      'siskamling_1',
      'lalin_update',
      'anto_bekasi',
      'doni_depok',
      'makassar_boy',
      'sar_team_1',
      'mount_hiker',
      'support_admin',
      'eko_pratama',
      'dewi_sari',
      'siti_aminah',
      'joko_susilo',
      'hendra_w',
      'yudi_antara',
      'agus_setiawan',
      'roni_h',
      'irma_p',
      'pebri_fans',
    ],
  },
  {
    number: 1,
    name: 'KOPDAR NASIONAL UTAMA',
    type: 'green',
    users: ['antoni_99', 'budi_salatiga', 'rudi_bandung'],
  },
  { number: 2, name: 'LINTAS SUMATERA DX', type: 'green', users: ['medan_dx', 'palembang_line'] },
  { number: 3, name: 'LINTAS JAWA DX LINE', type: 'green', users: [] },
  { number: 4, name: 'LINTAS BALI & NTT DX', type: 'green', users: [] },
  {
    number: 5,
    name: 'KOMUNITAS MOTOR INDO',
    type: 'green',
    users: ['touring_rider', 'ninja_club'],
  },
  {
    number: 6,
    name: 'PATROLI KEAMANAN WARGA',
    type: 'red',
    users: ['pak_rudi_rt', 'siskamling_1'],
  },
  { number: 7, name: 'INFO MUDIK & LALIN', type: 'red', users: ['lalin_update'] },
  { number: 8, name: 'CH-KEDALUWARSA', type: 'gray', users: [] },
  { number: 9, name: 'STANDBY CHANNEL 09', type: 'gray', users: [] },
  { number: 10, name: 'STANDBY CHANNEL 10', type: 'gray', users: [] },
  {
    number: 11,
    name: 'PAGUYUBAN JABODETABEK',
    type: 'green',
    users: ['anto_bekasi', 'doni_depok'],
  },
  { number: 12, name: 'DX SULAWESI & MALUKU', type: 'green', users: ['makassar_boy'] },
  { number: 13, name: 'RELAWAN KEMANUSIAAN', type: 'red', users: ['sar_team_1'] },
  { number: 14, name: 'STANDBY CHANNEL 14', type: 'gray', users: [] },
  { number: 15, name: 'STANDBY CHANNEL 15', type: 'gray', users: [] },
  { number: 16, name: 'STANDBY CHANNEL 16', type: 'gray', users: [] },
  { number: 17, name: 'STANDBY CHANNEL 17', type: 'gray', users: [] },
  { number: 18, name: 'STANDBY CHANNEL 18', type: 'gray', users: [] },
  { number: 19, name: 'STANDBY CHANNEL 19', type: 'gray', users: [] },
  { number: 20, name: 'PECINTA ALAM INDO', type: 'green', users: ['mount_hiker'] },
  { number: 21, name: 'STANDBY CHANNEL 21', type: 'gray', users: [] },
  { number: 22, name: 'STANDBY CHANNEL 22', type: 'gray', users: [] },
  { number: 23, name: 'STANDBY CHANNEL 23', type: 'gray', users: [] },
  { number: 24, name: 'STANDBY CHANNEL 24', type: 'gray', users: [] },
  { number: 25, name: 'STANDBY CHANNEL 25', type: 'gray', users: [] },
  { number: 26, name: 'STANDBY CHANNEL 26', type: 'gray', users: [] },
  { number: 27, name: 'STANDBY CHANNEL 27', type: 'gray', users: [] },
  { number: 28, name: 'STANDBY CHANNEL 28', type: 'gray', users: [] },
  { number: 29, name: 'STANDBY CHANNEL 29', type: 'gray', users: [] },
  { number: 30, name: 'BANTUAN TEKNIS ADMIN', type: 'red', users: ['support_admin'] },
];

export function getChannelUserCount(channelNum: number): number {
  const ch = STATIC_CHANNELS.find((c) => c.number === channelNum);
  if (ch) {
    return ch.users ? ch.users.length : 0;
  }
  if (channelNum === 100) return 27; // Matches original mockup
  // Deterministic user count computation for other channels
  const hash = (channelNum * 13 + 7) % 37;
  return hash + 2;
}
