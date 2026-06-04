import { useState } from 'react';
import { usePTTStore } from '../store/usePTTStore';
import { toast } from 'sonner';

const PROVINCE_CITIES: Record<string, string[]> = {
  ACEH: [
    'BANDA ACEH',
    'SABANG',
    'LHOKSEUMAWE',
    'LANGSA',
    'SUBULUSSALAM',
    'ACEH BARAT',
    'ACEH BARAT DAYA',
    'ACEH BESAR',
    'ACEH JAYA',
    'ACEH SELATAN',
    'ACEH SINGKIL',
    'ACEH TAMIANG',
    'ACEH TENGAH',
    'ACEH TENGGARA',
    'ACEH TIMUR',
    'ACEH UTARA',
    'BENER MERIAH',
    'BIREUEN',
    'GAYO LUES',
    'NAGAN RAYA',
    'PIDIE',
    'PIDIE JAYA',
    'SIMEULUE',
  ],
  BALI: [
    'DENPASAR',
    'BADUNG',
    'BANGLI',
    'BULELENG',
    'GIANYAR',
    'JEMBRANA',
    'KARANGASEM',
    'KLUNGKUNG',
    'TABANAN',
  ],
  'BANGKA BELITUNG': [
    'PANGKAL PINANG',
    'BANGKA',
    'BANGKA BARAT',
    'BANGKA SELATAN',
    'BANGKA TENGAH',
    'BELITUNG',
    'BELITUNG TIMUR',
  ],
  BANTEN: [
    'CILEGON',
    'SERANG',
    'TANGERANG',
    'TANGERANG SELATAN',
    'LEBAK',
    'PANDEGLANG',
    'KAB. SERANG',
    'KAB. TANGERANG',
  ],
  BENGKULU: [
    'BENGKULU',
    'BENGKULU SELATAN',
    'BENGKULU TENGAH',
    'BENGKULU UTARA',
    'KAUR',
    'KEPAHIANG',
    'LEBONG',
    'MUKOMUKO',
    'REJANG LEBONG',
    'SELUMA',
  ],
  'DAERAH ISTIMEWA YOGYAKARTA': ['YOGYAKARTA', 'BANTUL', 'GUNUNGKIDUL', 'KULON PROGO', 'SLEMAN'],
  'DAERAH KHUSUS IBUKOTA': [
    'JAKARTA BARAT',
    'JAKARTA PUSAT',
    'JAKARTA SELATAN',
    'JAKARTA TIMUR',
    'JAKARTA UTARA',
    'KEPULAUAN SERIBU',
  ],
  GORONTALO: ['GORONTALO', 'BOALEMO', 'BONE BOLANGO', 'GORONTALO UTARA', 'POHUWATO'],
  JAMBI: [
    'JAMBI',
    'SUNGAI PENUH',
    'BATANGHARI',
    'BUNGO',
    'KERINCI',
    'MERANGIN',
    'MUARO JAMBI',
    'SAROLANGUN',
    'TANJUNG JABUNG BARAT',
    'TANJUNG JABUNG TIMUR',
    'TEBO',
  ],
  'JAWA BARAT': [
    'BANDUNG',
    'BANJAR',
    'BEKASI',
    'BOGOR',
    'CIMAHI',
    'CIREBON',
    'DEPOK',
    'SUKABUMI',
    'TASIKMALAYA',
    'BANDUNG BARAT',
    'CIAMIS',
    'CIANJUR',
    'GARUT',
    'INDRAMAYU',
    'KARAWANG',
    'KUNINGAN',
    'MAJALENGKA',
    'PANGANDARAN',
    'PURWAKARTA',
    'SUBANG',
    'SUMEDANG',
    'KAB. BANDUNG',
    'KAB. BEKASI',
    'KAB. BOGOR',
    'KAB. CIREBON',
    'KAB. SUKABUMI',
    'KAB. TASIKMALAYA',
  ],
  'JAWA TENGAH': [
    'MAGELANG',
    'PEKALONGAN',
    'SALATIGA',
    'SEMARANG',
    'SURAKARTA (SOLO)',
    'TEGAL',
    'BANJARNEGARA',
    'BANYUMAS',
    'BATANG',
    'BLORA',
    'BOYOLALI',
    'BREBES',
    'CILACAP',
    'DEMAK',
    'GROBOGAN',
    'JEPARA',
    'KARANGANYAR',
    'KEBUMEN',
    'KENDAL',
    'KLATEN',
    'KUDUS',
    'PATI',
    'PEMALANG',
    'PURBALINGGA',
    'PURWOREJO',
    'REMBANG',
    'SRAGEN',
    'SUKOHARJO',
    'TEMANGGUNG',
    'WONOGIRI',
    'WONOSOBO',
    'KAB. MAGELANG',
    'KAB. PEKALONGAN',
    'KAB. SEMARANG',
    'KAB. TEGAL',
  ],
  'JAWA TIMUR': [
    'BATU',
    'BLITAR',
    'KEDIRI',
    'MADIUN',
    'MALANG',
    'MOJOKERTO',
    'PASURUAN',
    'PROBOLINGGO',
    'SURABAYA',
    'BANGKALAN',
    'BANYUWANGI',
    'BOJONEGORO',
    'BONDOWOSO',
    'GRESIK',
    'JEMBER',
    'JOMBANG',
    'LAMONGAN',
    'LUMAJANG',
    'MAGETAN',
    'NGANJUK',
    'NGAWI',
    'PACITAN',
    'PAMEKASAN',
    'PASURUAN REGENCY',
    'PONOROGO',
    'SAMPANG',
    'SIDOARJO',
    'SITUBONDO',
    'SUMENEP',
    'TRENGGALEK',
    'TUBAN',
    'TULUNGAGUNG',
    'KAB. BLITAR',
    'KAB. KEDIRI',
    'KAB. MADIUN',
    'KAB. MALANG',
    'KAB. MOJOKERTO',
    'KAB. PASURUAN',
    'KAB. PROBOLINGGO',
  ],
  'KALIMANTAN BARAT': [
    'PONTIANAK',
    'SINGKAWANG',
    'BENGKAYANG',
    'KAPUAS HULU',
    'KAYONG UTARA',
    'KETAPANG',
    'KUBU RAYA',
    'LANDAK',
    'MELAWI',
    'SAMBAS',
    'SANGGAU',
    'SEKADAU',
    'SINTANG',
    'KAB. PONTIANAK',
  ],
  'KALIMANTAN SELATAN': [
    'BANJARBARU',
    'BANJARMASIN',
    'BALANGAN',
    'BARITO KUALA',
    'HULU SUNGAI SELATAN',
    'HULU SUNGAI TENGAH',
    'HULU SUNGAI UTARA',
    'KOTABARU',
    'TABALONG',
    'TANAH BUMBU',
    'TANAH LAUT',
    'TAPIN',
    'KAB. BANJAR',
  ],
  'KALIMANTAN TENGAH': [
    'PALANGKARAYA',
    'BARITO SELATAN',
    'BARITO TIMUR',
    'BARITO UTARA',
    'GUNUNG MAS',
    'KAPUAS',
    'KATINGAN',
    'KOTAWARINGIN BARAT',
    'KOTAWARINGIN TIMUR',
    'LAMANDAU',
    'MURUNG RAYA',
    'PULANG PISAU',
    'SERUYAN',
    'SUKAMARA',
  ],
  'KALIMANTAN TIMUR': [
    'BALIKPAPAN',
    'BONTANG',
    'SAMARINDA',
    'BERAU',
    'KUTAI BARAT',
    'KUTAI KARTANEGARA',
    'KUTAI TIMUR',
    'MAHAKAM ULU',
    'PASER',
    'PENAJAM PASER UTARA',
  ],
  'KALIMANTAN UTARA': ['TARAKAN', 'BULUNGAN', 'MALINAU', 'NUNUKAN', 'TANA TIDUNG', 'TANJUNG SELOR'],
  'KEPULAUAN RIAU': [
    'BATAM',
    'TANJUNG PINANG',
    'BINTAN',
    'KARIMUN',
    'KEPULAUAN ANAMBAS',
    'LINGGA',
    'NATUNA',
  ],
  LAMPUNG: [
    'BANDAR LAMPUNG',
    'METRO',
    'LAMPUNG BARAT',
    'LAMPUNG SELATAN',
    'LAMPUNG TENGAH',
    'LAMPUNG TIMUR',
    'LAMPUNG UTARA',
    'MESUJI',
    'PESAWARAN',
    'PESISIR BARAT',
    'PRINGSEWU',
    'TANGGAMUS',
    'TULANG BAWANG',
    'TULANG BAWANG BARAT',
    'WAY KANAN',
  ],
  MALUKU: [
    'AMBON',
    'TUAL',
    'BURU',
    'BURU SELATAN',
    'KEPULAUAN ARU',
    'KEPULAUAN TANIMBAR',
    'MALUKU BARAT DAYA',
    'MALUKU TENGAH',
    'MALUKU TENGGARA',
    'SERAM BAGIAN BARAT',
    'SERAM BAGIAN TIMUR',
  ],
  'MALUKU UTARA': [
    'TERNATE',
    'TIDORE KEPULAUAN',
    'HALMAHERA BARAT',
    'HALMAHERA SELATAN',
    'HALMAHERA TENGAH',
    'HALMAHERA TIMUR',
    'HALMAHERA UTARA',
    'KEPULAUAN MOROTAI',
    'KEPULAUAN SULA',
    'PULAU TALIABU',
  ],
  'NUSA TENGGARA BARAT': [
    'BIMA',
    'MATARAM',
    'DOMPU',
    'LOMBOK BARAT',
    'LOMBOK TENGAH',
    'LOMBOK TIMUR',
    'LOMBOK UTARA',
    'SUMBAWA',
    'SUMBAWA BARAT',
  ],
  'NUSA TENGGARA TIMUR': [
    'KUPANG',
    'ALOR',
    'BELU',
    'ENDE',
    'FLORES TIMUR',
    'LEMBATA',
    'MALAKA',
    'MANGGARAI',
    'MANGGARAI BARAT',
    'MANGGARAI TIMUR',
    'NAGEKEO',
    'NGADA',
    'ROTE NDAO',
    'SABU RAIJUA',
    'SIKKA',
    'SUMBA BARAT',
    'SUMBA BARAT DAYA',
    'SUMBA TENGAH',
    'SUMBA TIMUR',
    'TIMOR TENGAH SELATAN',
    'TIMOR TENGAH UTARA',
    'LABUAN BAJO',
    'KAB. KUPANG',
  ],
  PAPUA: [
    'JAYAPURA',
    'BIAK NUMFOR',
    'KEEROM',
    'KEPULAUAN YAPEN',
    'MAMBERAMO RAYA',
    'SARMI',
    'SUPIORI',
    'WAROPEN',
    'SENTANI',
  ],
  'PAPUA BARAT': [
    'MANOKWARI',
    'FAKFAK',
    'KAIMANA',
    'MANOKWARI SELATAN',
    'PEGUNUNGAN ARFAK',
    'TELUK BINTUNI',
    'TELUK WONDAMA',
  ],
  'PAPUA BARAT DAYA': ['SORONG', 'MAYBRAT', 'RAJA AMPAT', 'SORONG SELATAN', 'TAMBRAUW', 'WAISAI'],
  'PAPUA PEGUNUNGAN': [
    'WAMENA',
    'JAYAWIJAYA',
    'LANNY JAYA',
    'MAMBERAMO TENGAH',
    'NDUGA',
    'PEGUNUNGAN BINTANG',
    'TOLIKARA',
    'YAHUKIMO',
    'YALIMO',
  ],
  'PAPUA SELATAN': ['MERAUKE', 'ASMAT', 'BOVEN DIGOEL', 'MAPPI'],
  'PAPUA TENGAH': [
    'NABIRE',
    'DEIYAI',
    'DOGIYAI',
    'INTAN JAYA',
    'MIMIKA',
    'PANIAI',
    'PUNCAK',
    'PUNCAK JAYA',
    'TIMIKA',
  ],
  RIAU: [
    'DUMAI',
    'PEKANBARU',
    'BENGKALIS',
    'INDRAGIRI HILIR',
    'INDRAGIRI HULU',
    'KAMPAR',
    'KEPULAUAN MERANTI',
    'KUANTAN SINGINGGI',
    'PELALAWAN',
    'ROKAN HILIR',
    'ROKAN HULU',
    'SIAK',
  ],
  'SULAWESI BARAT': [
    'MAJENE',
    'MAMASA',
    'MAMUJU',
    'MAMUJU TENGAH',
    'MAMUJU UTARA',
    'POLEWALI MANDAR',
  ],
  'SULAWESI SELATAN': [
    'MAKASSAR',
    'PALOPO',
    'PAREPARE',
    'BANTAENG',
    'BARRU',
    'BONE',
    'BULUKUMBA',
    'ENREKANG',
    'GOWA',
    'JENEPONTO',
    'KEPULAUAN SELAYAR',
    'LUWU',
    'LUWU TIMUR',
    'LUWU UTARA',
    'MAROS',
    'PANGKAJENE DAN KEPULAUAN',
    'PINRANG',
    'SIDENRENG RAPPANG',
    'SINJAI',
    'SOPPENG',
    'TAKALAR',
    'TANA TORAJA',
    'TORAJA UTARA',
    'WAJO',
  ],
  'SULAWESI TENGAH': [
    'PALU',
    'BANGGAI',
    'BANGGAI KEPULAUAN',
    'BANGGAI LAUT',
    'BUOL',
    'DONGGALA',
    'MOROWALI',
    'MOROWALI UTARA',
    'PARIGI MOUTONG',
    'POSO',
    'SIGI',
    'TOJO UNA-UNA',
    'TOLI-TOLI',
  ],
  'SULAWESI TENGGARA': [
    'BAUBAU',
    'KENDARI',
    'BOMBANA',
    'BUTON',
    'BUTON SELATAN',
    'BUTON TENGAH',
    'BUTON UTARA',
    'KOLAKA',
    'KOLAKA TIMUR',
    'KOLAKA UTARA',
    'KONAWE',
    'KONAWE KEPULAUAN',
    'KONAWE SELATAN',
    'KONAWE UTARA',
    'MUNA',
    'MUNA BARAT',
    'WAKATOBI',
  ],
  'SULAWESI UTARA': [
    'BITUNG',
    'KOTAMOBAGU',
    'MANADO',
    'TOMOHON',
    'BOLAANG MONGONDOW',
    'BOLAANG MONGONDOW SELATAN',
    'BOLAANG MONGONDOW TIMUR',
    'BOLAANG MONGONDOW UTARA',
    'KEPULAUAN SANGIHE',
    'KEPULAUAN SIAU TAGULANDANG BIARO',
    'KEPULAUAN TALAUD',
    'MINAHASA',
    'MINAHASA SELATAN',
    'MINAHASA TENGGARA',
    'MINAHASA UTARA',
  ],
  'SUMATRA BARAT': [
    'BUKITTINGGI',
    'PADANG',
    'PADANG PANJANG',
    'PARIAMAN',
    'PAYAKUMBUH',
    'SAWAHLUNTO',
    'SOLOK',
    'AGAM',
    'DHARMASRAYA',
    'KEPULAUAN MENTAWAI',
    'LIMA PULUH KOTA',
    'PADANG PARIAMAN',
    'PASAMAN',
    'PASAMAN BARAT',
    'PESISIR SELATAN',
    'SIJUNJUNG',
    'SOLOK SELATAN',
    'TANAH DATAR',
  ],
  'SUMATRA SELATAN': [
    'LUBUKLINGGAU',
    'PAGAR ALAM',
    'PALEMBANG',
    'PRABUMULIH',
    'BANYUASIN',
    'EMPAT LAWANG',
    'LAHAT',
    'MUARA ENIM',
    'MUSI BANYUASIN',
    'MUSI RAWAS',
    'MUSI RAWAS UTARA',
    'OGAN ILIR',
    'OGAN KOMERING ILIR',
    'OGAN KOMERING ULU',
    'OGAN KOMERING ULU SELATAN',
    'OGAN KOMERING ULU TIMUR',
    'PENUKAL ABAB LEMATANG ILIR',
    'BATURAJA',
  ],
  'SUMATRA UTARA': [
    'BINJAI',
    'GUNUNGSITOLI',
    'MEDAN',
    'PADANG SIDEMPUAN',
    'PEMATANGSIANTAR',
    'SIBOLGA',
    'TANJUNG BALAI',
    'TEBING TINGGI',
    'ASAHAN',
    'BATU BARA',
    'DAIRI',
    'DELI SERDANG',
    'HUMBANG HASUNDUTAN',
    'KARO',
    'LABUHANBATU',
    'LABUHANBATU SELATAN',
    'LABUHANBATU UTARA',
    'LANGKAT',
    'MANDAILING NATAL',
    'NIAS',
    'NIAS BARAT',
    'NIAS SELATAN',
    'NIAS UTARA',
    'PADANG LAWAS',
    'PADANG LAWAS UTARA',
    'PAKPAK BHARAT',
    'SAMOSIR',
    'SERDANG BEDAGAI',
    'SIMALUNGUN',
    'TAPANULI SELATAN',
    'TAPANULI TENGAH',
    'TAPANULI UTARA',
    'TOBA SAMOSIR',
  ],
};

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const {
    infoText,
    locationText,
    showMyPhoto,
    showOtherPhotos,
    showPhotosInList,
    fastClick,
    showModulator,
    showPTT,
    maxQueue,
    audioMode,
    pttSize,
    pttBottom,
    togglePtt,
    pttVolume,
    vibrateOnStart,
    toneOnStartEnd,
    bgActive,
    fullDuplex,
    themeText,
    updateSettings,
  } = usePTTStore();

  const [isPhraseModalOpen, setIsPhraseModalOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  const [isProvinceModalOpen, setIsProvinceModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');

  const PREDEFINED_PHRASES = [
    '1 ❤️ BERBAGI MODULASI NEXTVWT TETAP DI HATI',
    '1 NUSA 1 BANGSA 1 BAHASA',
    'ADA UDANG DI BALIK BATU... MODUS YA?',
    'AIR BERIAK TANDA TAK DALAM',
    'BERAT SAMA DIPIKUL RINGAN SAMA DIJINJING',
    'BHINNEKA TUNGGAL IKA TAN HANA DHARMA MANGRWA',
    'CINTAKU BERTEPUK SEBELAH CHANNEL',
    'DI MANA BUMI DIPIJAK DI SANA LANGIT DIJUNJUNG',
    'JANGAN ADA DUSTA DI ANTARA KITA',
    'JANGAN LUPA NGOPI ☕️☕️',
    'MALU BERTANYA TERSESAT DI CHANNEL',
    'MOHON MAAF, SEDANG BEKERJA',
    'MOHON MAAF, SEDANG DALAM PERJALANAN',
    'MOHON MAAF, SEDANG ISTIRAHAT',
    'MOHON MAAF, SEDANG MAKAN',
    'MOHON MAAF, SEDANG MENGASUH ANAK',
    'MOHON MAAF, SEDANG MENGEMUDI',
    'MOHON MAAF, SEDANG TIDAK DI TEMPAT',
    'MOHON MAAF, SEDANG TIDUR',
    'MOHON MAAF, SINYAL ADA GANGGUAN',
    'NKRI HARGA MATI',
    'SATU HATI BERBAGI MODULASI NKRI HARGA MATI',
    'TAK ADA JALAN YANG TAK BERLUBANG',
    'TAK KENAL MAKA TAK SAYANG',
    'TONG KOSONG NYARING BUNYINYA',
  ];

  // Map state setters to updateSettings
  const setInfoText = (val: string) => updateSettings({ infoText: val });
  const setLocationText = (val: string) => updateSettings({ locationText: val });
  const setShowMyPhoto = (val: boolean) => updateSettings({ showMyPhoto: val });
  const setShowOtherPhotos = (val: boolean) => updateSettings({ showOtherPhotos: val });
  const setShowPhotosInList = (val: boolean) => updateSettings({ showPhotosInList: val });
  const setFastClick = (val: boolean) => updateSettings({ fastClick: val });
  const setShowModulator = (val: boolean) => updateSettings({ showModulator: val });
  const setShowPTT = (val: boolean) => updateSettings({ showPTT: val });
  const setMaxQueue = (val: string) => updateSettings({ maxQueue: val });
  const setAudioMode = (val: 'discussion' | 'music') => updateSettings({ audioMode: val });
  const setPttSize = (val: number) => updateSettings({ pttSize: val });
  const setPttBottom = (val: number) => updateSettings({ pttBottom: val });
  const setTogglePtt = (val: boolean) => updateSettings({ togglePtt: val });
  const setPttVolume = (val: number) => updateSettings({ pttVolume: val });
  const setVibrateOnStart = (val: boolean) => updateSettings({ vibrateOnStart: val });
  const setToneOnStartEnd = (val: boolean) => updateSettings({ toneOnStartEnd: val });
  const setBgActive = (val: boolean) => updateSettings({ bgActive: val });
  const setFullDuplex = (val: boolean) => updateSettings({ fullDuplex: val });
  const setThemeText = (val: string) => updateSettings({ themeText: val });

  const emailText = 'stevanusherianto6@gmail.com';

  const handleSave = () => {
    toast.success('Pengaturan berhasil disimpan!', {
      position: 'bottom-center',
      duration: 2000,
    });
    // Let settings close after short delay
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#f0f0f0] select-none text-black">
      {/* Top Header Bar */}
      <div
        className="w-full h-[55px] flex items-center px-4 bg-white z-20 relative shrink-0"
        style={{
          borderBottom: '1px solid #cbd5e1',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        <button
          onClick={onClose}
          className="flex items-center text-[#0066cc] font-medium pr-3 py-1 cursor-pointer focus:outline-none"
        >
          {/* Back arrow chevron */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="sr-only">Back</span>
        </button>

        {/* Brand SVG logo */}
        <svg
          viewBox="0 0 100 100"
          className="h-[40px] w-auto mr-2"
          style={{
            transform: 'translateZ(1px)',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
          }}
        >
          <defs>
            {/* High-Intensity Glossy Red Radial Gradient */}
            <radialGradient id="glossyRedSettingsBar" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#ff1a1a" />
              <stop offset="70%" stopColor="#b30000" />
              <stop offset="100%" stopColor="#4a0000" />
            </radialGradient>
          </defs>

          {/* Central Red Sphere 3D Stack */}
          <circle
            cx="50"
            cy="50"
            r="10"
            fill="#2d0a0a"
            transform="translate(0.8, 1)"
            opacity="0.4"
          />
          <circle cx="50" cy="50" r="10" fill="url(#glossyRedSettingsBar)" />

          {/* Inner Arc 3D Stack - Bold Green */}
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

          {/* Middle Arc 3D Stack - Emerald Green */}
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

          {/* Outer Arc 3D Stack - Mint Green */}
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

        <span className="text-[16px] font-bold text-black tracking-wide">Pengaturan</span>
      </div>

      {/* Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto w-full pb-8">
        {/* INFO SECTION */}
        <div className="w-full bg-[#e2e8f0] py-1 px-3 text-[11px] font-bold text-[#475569] uppercase tracking-wider">
          Info
        </div>
        <div className="bg-white p-3 border-b border-gray-200 flex gap-2">
          <input
            type="text"
            value={infoText}
            onChange={(e) => setInfoText(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm bg-white text-black outline-none focus:border-blue-500"
            placeholder="Username / Display name..."
          />
          <button
            onClick={() => setIsPhraseModalOpen(true)}
            className="p-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded cursor-pointer focus:outline-none"
          >
            {/* Document icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </button>
        </div>

        {/* LOKASI SECTION */}
        <div className="w-full bg-[#e2e8f0] py-1 px-3 text-[11px] font-bold text-[#475569] uppercase tracking-wider">
          Lokasi
        </div>
        <div className="bg-white p-3 border-b border-gray-200 flex gap-2">
          <input
            type="text"
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm bg-white text-black font-semibold outline-none focus:border-blue-500"
          />
          <button
            onClick={() => setIsProvinceModalOpen(true)}
            className="p-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded cursor-pointer focus:outline-none"
          >
            {/* Search glass icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        {/* AKUN SECTION */}
        <div className="w-full bg-[#e2e8f0] py-1 px-3 text-[11px] font-bold text-[#475569] uppercase tracking-wider">
          Akun
        </div>
        <div className="bg-white p-4 border-b border-gray-200 flex flex-col items-center">
          {/* Square Profile Image Casing */}
          <div className="w-[120px] h-[140px] border border-gray-300 relative overflow-hidden bg-[#e0e0e0] flex items-center justify-center mb-3 shadow-inner">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Account Profile Avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to silhouette if offline/fails to load
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234A5568"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
              }}
            />
          </div>

          <div className="text-center text-xs font-semibold text-gray-700 mb-4">
            eMail ({emailText})
          </div>

          {/* Account action buttons */}
          <div className="w-full flex flex-col gap-2">
            <button className="w-full text-center py-2 text-sm font-semibold bg-[#e2e8f0] hover:bg-[#cbd5e1] border border-gray-300 rounded cursor-pointer">
              Ubah Kata Sandi
            </button>
            <button className="w-full text-center py-2 text-sm font-semibold bg-[#f3d9d9] hover:bg-[#e6c1c1] text-[#9c2424] border border-[#d6a5a5] rounded cursor-pointer">
              Keluar
            </button>
          </div>

          {/* Account checkboxes (Custom Toggle Switch) */}
          <div className="w-full mt-4 flex flex-col gap-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-gray-700 pr-4 leading-normal">
                Tampilkan Foto Saya Kepada Pengguna Lain (Koneksi Kembali Diharuskan)
              </span>
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="toggle-showMyPhoto"
                  checked={showMyPhoto}
                  onChange={(e) => setShowMyPhoto(e.target.checked)}
                  className="settings-checkbox-input"
                />
                <label htmlFor="toggle-showMyPhoto" className="settings-toggle-switch"></label>
              </div>
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-gray-700 pr-4 leading-normal">
                Tampilkan Foto Pengguna Lain (Koneksi Kembali Diharuskan)
              </span>
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="toggle-showOtherPhotos"
                  checked={showOtherPhotos}
                  onChange={(e) => setShowOtherPhotos(e.target.checked)}
                  className="settings-checkbox-input"
                />
                <label htmlFor="toggle-showOtherPhotos" className="settings-toggle-switch"></label>
              </div>
            </div>
          </div>
        </div>

        {/* TAMPILAN DAFTAR PENGGUNA SECTION */}
        <div className="w-full bg-[#e2e8f0] py-1 px-3 text-[11px] font-bold text-[#475569] uppercase tracking-wider">
          Tampilan Daftar Pengguna
        </div>
        <div className="bg-white p-4 border-b border-gray-200 flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-gray-700 pr-4 leading-normal">
              Tampilkan Foto (Koneksi Kembali Diharuskan)
            </span>
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="toggle-showPhotosInList"
                checked={showPhotosInList}
                onChange={(e) => setShowPhotosInList(e.target.checked)}
                className="settings-checkbox-input"
              />
              <label htmlFor="toggle-showPhotosInList" className="settings-toggle-switch"></label>
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-gray-700 pr-4 leading-normal">
              Klik Cepat (Koneksi Kembali Disarankan)
            </span>
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="toggle-fastClick"
                checked={fastClick}
                onChange={(e) => setFastClick(e.target.checked)}
                className="settings-checkbox-input"
              />
              <label htmlFor="toggle-fastClick" className="settings-toggle-switch"></label>
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-gray-700 pr-4 leading-normal">
              Tampilkan Modulator
            </span>
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="toggle-showModulator"
                checked={showModulator}
                onChange={(e) => setShowModulator(e.target.checked)}
                className="settings-checkbox-input"
              />
              <label htmlFor="toggle-showModulator" className="settings-toggle-switch"></label>
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-gray-700 pr-4 leading-normal">
              Tampilkan PTT
            </span>
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="toggle-showPTT"
                checked={showPTT}
                onChange={(e) => setShowPTT(e.target.checked)}
                className="settings-checkbox-input"
              />
              <label htmlFor="toggle-showPTT" className="settings-toggle-switch"></label>
            </div>
          </div>
        </div>

        {/* ANTRIAN MAKSIMAL SECTION */}
        <div className="w-full bg-[#e2e8f0] py-1 px-3 text-[11px] font-bold text-[#475569] uppercase tracking-wider">
          Antrian Maksimal Pemutar Suara (per 20ms)
        </div>
        <div className="bg-white p-3 border-b border-gray-200">
          <input
            type="text"
            value={maxQueue}
            onChange={(e) => setMaxQueue(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white text-black font-semibold outline-none focus:border-blue-500"
          />
        </div>

        {/* MODE AUDIO SECTION */}
        <div className="w-full bg-[#e2e8f0] py-1 px-3 text-[11px] font-bold text-[#475569] uppercase tracking-wider">
          Mode Audio
        </div>
        <div className="bg-white p-4 border-b border-gray-200 flex flex-col gap-4">
          {/* Radio Button 1 */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="audioMode"
              checked={audioMode === 'discussion'}
              onChange={() => setAudioMode('discussion')}
              className="w-4.5 h-4.5 text-green-500 accent-[#10B981] focus:ring-0 cursor-pointer"
            />
            <span className="text-xs font-semibold text-gray-700">Mode Diskusi</span>
          </label>
          {/* Radio Button 2 */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="audioMode"
              checked={audioMode === 'music'}
              onChange={() => setAudioMode('music')}
              className="w-4.5 h-4.5 text-green-500 accent-[#10B981] focus:ring-0 cursor-pointer"
            />
            <span className="text-xs font-semibold text-gray-700">Mode Musik & Karaoke</span>
          </label>
        </div>

        {/* PTT SECTION */}
        <div className="w-full bg-[#e2e8f0] py-1 px-3 text-[11px] font-bold text-[#475569] uppercase tracking-wider">
          PTT
        </div>
        <div className="bg-white p-4 border-b border-gray-200 flex flex-col gap-4">
          {/* Slider 1: Ukuran */}
          <div className="flex flex-col gap-1">
            <div className="text-xs font-semibold text-gray-700">Ukuran</div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="100"
                value={pttSize}
                onChange={(e) => setPttSize(Number(e.target.value))}
                className="flex-1 accent-[#10B981] cursor-pointer h-1 bg-gray-200 rounded-lg appearance-none"
              />
              <span className="text-[11px] text-gray-500 font-bold w-6 text-right">{pttSize}%</span>
            </div>
          </div>

          {/* Slider 2: Batas Bawah */}
          <div className="flex flex-col gap-1">
            <div className="text-xs font-semibold text-gray-700">Batas Bawah</div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="100"
                value={pttBottom}
                onChange={(e) => setPttBottom(Number(e.target.value))}
                className="flex-1 accent-[#10B981] cursor-pointer h-1 bg-gray-200 rounded-lg appearance-none"
              />
              <span className="text-[11px] text-gray-500 font-bold w-6 text-right">
                {pttBottom}%
              </span>
            </div>
          </div>

          {/* Checkbox: Toggle PTT (Custom Toggle Switch) */}
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-gray-700 pr-4 leading-normal">
              Toggle PTT
            </span>
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="toggle-togglePtt"
                checked={togglePtt}
                onChange={(e) => setTogglePtt(e.target.checked)}
                className="settings-checkbox-input"
              />
              <label htmlFor="toggle-togglePtt" className="settings-toggle-switch"></label>
            </div>
          </div>

          {/* Slider 3: Volume Pemutar Suara Saat Menekan PTT */}
          <div className="flex flex-col gap-1 mt-1">
            <div className="text-xs font-semibold text-gray-700">
              Volume Pemutar Suara Saat Menekan PTT
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={pttVolume}
                onChange={(e) => setPttVolume(Number(e.target.value))}
                className="flex-1 accent-[#10B981] cursor-pointer h-1 bg-gray-200 rounded-lg appearance-none"
              />
              <span className="text-[11px] text-gray-500 font-bold w-6 text-right">
                {pttVolume}%
              </span>
            </div>
          </div>

          {/* PTT Checkboxes (Custom Toggle Switch) */}
          <div className="flex flex-col gap-4 mt-1">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-gray-700 pr-4 leading-normal">
                Getar Mulai
              </span>
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="toggle-vibrateOnStart"
                  checked={vibrateOnStart}
                  onChange={(e) => setVibrateOnStart(e.target.checked)}
                  className="settings-checkbox-input"
                />
                <label htmlFor="toggle-vibrateOnStart" className="settings-toggle-switch"></label>
              </div>
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-gray-700 pr-4 leading-normal">
                Nada Mulai dan Akhir
              </span>
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="toggle-toneOnStartEnd"
                  checked={toneOnStartEnd}
                  onChange={(e) => setToneOnStartEnd(e.target.checked)}
                  className="settings-checkbox-input"
                />
                <label htmlFor="toggle-toneOnStartEnd" className="settings-toggle-switch"></label>
              </div>
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-gray-700 pr-4 leading-normal">
                Dapat Aktif di Latar Belakang
              </span>
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="toggle-bgActive"
                  checked={bgActive}
                  onChange={(e) => setBgActive(e.target.checked)}
                  className="settings-checkbox-input"
                />
                <label htmlFor="toggle-bgActive" className="settings-toggle-switch"></label>
              </div>
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-gray-700 pr-4 leading-normal">
                Mode Untuk Channel Full-Duplex
              </span>
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="toggle-fullDuplex"
                  checked={fullDuplex}
                  onChange={(e) => setFullDuplex(e.target.checked)}
                  className="settings-checkbox-input"
                />
                <label htmlFor="toggle-fullDuplex" className="settings-toggle-switch"></label>
              </div>
            </div>
          </div>

          <button className="w-full text-center py-2 text-sm font-semibold bg-[#e2e8f0] hover:bg-[#cbd5e1] border border-gray-300 rounded cursor-pointer">
            Tambah Tombol PTT POC
          </button>
        </div>

        {/* TEMA SECTION */}
        <div className="w-full bg-[#e2e8f0] py-1 px-3 text-[11px] font-bold text-[#475569] uppercase tracking-wider">
          Tema
        </div>
        <div className="bg-white p-3 border-b border-gray-200 flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={themeText}
              onChange={(e) => setThemeText(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm bg-white text-black outline-none focus:border-blue-500"
            />
            <button className="px-4 py-1 text-sm font-semibold bg-[#e2e8f0] hover:bg-[#cbd5e1] border border-gray-300 rounded cursor-pointer">
              Ganti
            </button>
          </div>

          {/* MAIN SIMPAN BUTTON */}
          <button
            onClick={handleSave}
            className="w-full text-center py-2.5 text-sm font-bold bg-[#c2dec2] hover:bg-[#b0d2b0] text-[#1e3f1e] border border-[#a2cba2] rounded shadow-sm cursor-pointer transition-colors"
          >
            Simpan
          </button>
        </div>

        {/* TENTANG SECTION */}
        <div className="w-full bg-[#e2e8f0] py-1 px-3 text-[11px] font-bold text-[#475569] uppercase tracking-wider">
          Tentang
        </div>
        <div className="bg-white p-4 border-b border-gray-200 flex flex-col gap-3">
          <div className="text-xs font-semibold text-gray-700 mb-1">
            Versi: <span className="font-bold text-black">2.0.0</span>
          </div>

          <div className="flex flex-col gap-2">
            <button className="w-full text-left px-3 py-2 text-xs font-semibold bg-[#e2e8f0] hover:bg-[#cbd5e1] border border-gray-300 rounded cursor-pointer">
              Persyaratan & Ketentuan
            </button>
            <button className="w-full text-left px-3 py-2 text-xs font-semibold bg-[#e2e8f0] hover:bg-[#cbd5e1] border border-gray-300 rounded cursor-pointer">
              Kebijakan Privasi
            </button>
            <button
              onClick={() => setIsUserGuideOpen(true)}
              className="w-full text-left px-3 py-2 text-xs font-semibold bg-[#e2e8f0] hover:bg-[#cbd5e1] border border-gray-300 rounded cursor-pointer focus:outline-none"
            >
              Panduan Pengguna
            </button>
            <button className="w-full text-left px-3 py-2 text-xs font-semibold bg-[#e2e8f0] hover:bg-[#cbd5e1] border border-gray-300 rounded cursor-pointer">
              Legal
            </button>
            <button className="w-full text-left px-3 py-2 text-xs font-semibold bg-[#e2e8f0] hover:bg-[#cbd5e1] border border-gray-300 rounded cursor-pointer">
              Jika Suka Berikan Rating
            </button>
            <button className="w-full text-left px-3 py-2 text-xs font-semibold bg-[#f3d9d9] hover:bg-[#e6c1c1] text-[#9c2424] border border-[#d6a5a5] rounded cursor-pointer mt-1">
              Hapus Akun Saya
            </button>
          </div>
        </div>
      </div>

      {/* Predefined Phrase Modal Dialog */}
      {isPhraseModalOpen && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          {/* Backdrop Click Dismiss */}
          <div className="absolute inset-0" onClick={() => setIsPhraseModalOpen(false)} />

          {/* Modal Container */}
          <div className="bg-white w-[90%] max-h-[85%] rounded-lg shadow-2xl flex flex-col z-10 overflow-hidden border border-gray-300">
            {/* Header */}
            <div className="flex items-center px-4 py-3 bg-white shrink-0 border-b border-gray-200">
              {/* Document Icon in Blue */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#48a4df"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2.5"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span className="text-[16px] font-bold text-[#48a4df]">Daftar kata/kalimat</span>
            </div>

            {/* Phrase List */}
            <div className="flex-1 overflow-y-auto bg-white text-left divide-y divide-gray-100">
              {PREDEFINED_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInfoText(phrase);
                    setIsPhraseModalOpen(false);
                  }}
                  className="w-full text-left py-3 px-4 hover:bg-gray-50 active:bg-gray-100 text-[11px] font-bold text-gray-800 leading-normal border-b border-gray-100 cursor-pointer select-none focus:outline-none"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* User Guide Modal Dialog */}
      {isUserGuideOpen && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          {/* Backdrop Click Dismiss */}
          <div className="absolute inset-0" onClick={() => setIsUserGuideOpen(false)} />

          {/* Modal Container */}
          <div className="bg-white w-[95%] h-[85%] rounded-lg shadow-2xl flex flex-col z-10 overflow-hidden border border-gray-300">
            {/* Header */}
            <div className="flex items-center px-4 py-3 bg-white shrink-0 border-b border-gray-200">
              <button
                onClick={() => setIsUserGuideOpen(false)}
                className="mr-2 text-gray-500 hover:text-gray-700 cursor-pointer focus:outline-none"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <span className="text-[16px] font-bold text-[#48a4df]">Panduan Pengguna</span>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 text-left text-xs text-gray-700 space-y-4 bg-gray-50 leading-relaxed">
              {/* Section 1 */}
              <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-bold text-sm text-[#0066cc] mb-1.5 flex items-center gap-1.5">
                  <span className="bg-[#e0effa] text-[#0066cc] w-5 h-5 rounded-full flex items-center justify-center text-[11px]">
                    1
                  </span>
                  PENDAHULUAN
                </h3>
                <p>
                  <strong>NextVWT (Next Virtual Walkie Talkie)</strong> adalah aplikasi komunikasi
                  suara real-time berbasis internet (VoIP) yang mensimulasikan cara kerja perangkat
                  Handy Talkie (HT) klasik secara modern. Aplikasi ini beroperasi penuh menggunakan
                  Wi-Fi atau data seluler.
                </p>
              </div>

              {/* Section 2 */}
              <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-bold text-sm text-[#0066cc] mb-1.5 flex items-center gap-1.5">
                  <span className="bg-[#e0effa] text-[#0066cc] w-5 h-5 rounded-full flex items-center justify-center text-[11px]">
                    2
                  </span>
                  REGISTRASI & LOGIN
                </h3>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Pertama kali masuk, lengkapi formulir pendaftaran akun menggunakan alamat eMail
                    aktif dan buat kata sandi yang aman.
                  </li>
                  <li>Lakukan verifikasi email sebelum melakukan login di layar utama.</li>
                  <li>
                    Disarankan untuk mengunggah foto profil asli agar pengguna lain dapat dengan
                    mudah mengenali Anda saat mengudara.
                  </li>
                </ul>
              </div>

              {/* Section 3 */}
              <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-bold text-sm text-[#0066cc] mb-1.5 flex items-center gap-1.5">
                  <span className="bg-[#e0effa] text-[#0066cc] w-5 h-5 rounded-full flex items-center justify-center text-[11px]">
                    3
                  </span>
                  KONFIGURASI PENTING (SET)
                </h3>
                <p className="mb-2 text-[#9c2424] font-semibold">
                  ⚠️ Konfigurasi Awal Sangat Disarankan:
                </p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>
                    Buka tombol <strong>SET</strong> pada menu utama.
                  </li>
                  <li>
                    Lengkapi kolom <strong>Username / Display name</strong> serta{' '}
                    <strong>Lokasi</strong> Anda.
                  </li>
                  <li>
                    Untuk kelancaran transmisi, ubah nilai kolom{' '}
                    <strong>Antrian Maksimal Pemutar Suara</strong> menjadi{' '}
                    <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[#9c2424] font-bold">
                      99999
                    </code>
                    .
                  </li>
                  <li>
                    Klik tombol <strong>Simpan</strong> untuk menerapkan konfigurasi.
                  </li>
                </ol>
              </div>

              {/* Section 4 */}
              <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-bold text-sm text-[#0066cc] mb-1.5 flex items-center gap-1.5">
                  <span className="bg-[#e0effa] text-[#0066cc] w-5 h-5 rounded-full flex items-center justify-center text-[11px]">
                    4
                  </span>
                  PENGOPERASIAN CHANNEL
                </h3>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Gunakan tombol arah <strong>UP (▲) / DOWN (▼)</strong> di panel tengah untuk
                    berpindah channel dari 1 hingga 999.
                  </li>
                  <li>
                    <strong>Landing Channel (CH 100)</strong> digunakan sebagai ruang uji coba
                    modulasi, tes volume suara, dan perkenalan awal.
                  </li>
                  <li>
                    Channel khusus 000 disediakan bagi bantuan darurat atau panduan teknis langsung
                    dari admin.
                  </li>
                </ul>
              </div>

              {/* Section 5 */}
              <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-bold text-sm text-[#0066cc] mb-1.5 flex items-center gap-1.5">
                  <span className="bg-[#e0effa] text-[#0066cc] w-5 h-5 rounded-full flex items-center justify-center text-[11px]">
                    5
                  </span>
                  MEKANISME PTT (PUSH TO TALK)
                </h3>
                <p className="mb-1.5">
                  Anda dapat mengubah mode penekanan tombol PTT melalui pengaturan{' '}
                  <strong>"Toggle PTT"</strong>:
                </p>
                <div className="space-y-1.5">
                  <div className="bg-gray-50 p-2 rounded border border-gray-100">
                    <p className="font-semibold text-gray-800">● Mode Toggle (Default / Aktif):</p>
                    <p className="text-gray-600 pl-3">
                      Klik tombol PTT satu kali untuk mulai berbicara (tombol berubah menjadi
                      merah). Jika sudah selesai bicara, klik sekali lagi untuk melepas (kembali
                      hijau).
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100">
                    <p className="font-semibold text-gray-800">● Mode Momentary (Tidak Aktif):</p>
                    <p className="text-gray-600 pl-3">
                      Tekan dan tahan tombol PTT/Spacebar selama berbicara. Lepaskan tekanan tombol
                      saat selesai berbicara untuk mengakhiri transmisi secara langsung.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 6 */}
              <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-bold text-sm text-[#0066cc] mb-1.5 flex items-center gap-1.5">
                  <span className="bg-[#e0effa] text-[#0066cc] w-5 h-5 rounded-full flex items-center justify-center text-[11px]">
                    6
                  </span>
                  INDIKATOR SINYAL & KONEKSI
                </h3>
                <p>Sinyal LCD panel di kanan atas menunjukkan latensi komunikasi server:</p>
                <ul className="list-disc pl-4 space-y-1 mt-1">
                  <li>
                    <span className="text-[#149c35] font-bold">Hijau (4/3 balok)</span>: Koneksi
                    sangat stabil, suara lancar.
                  </li>
                  <li>
                    <span className="text-[#ffbb00] font-bold">Kuning (2 balok)</span>: Latensi
                    sedang, suara berpotensi terputus-putus.
                  </li>
                  <li>
                    <span className="text-[#ff3333] font-bold">Merah (1 balok)</span>: Koneksi
                    buruk, disarankan standby atau ganti koneksi internet.
                  </li>
                  <li>
                    <span className="text-[#ff3333] font-bold">Tanda × Merah</span>: Terjadi
                    pemutusan jaringan (Offline). Aplikasi tidak akan mengirim suara sebelum koneksi
                    pulih secara otomatis.
                  </li>
                </ul>
              </div>

              {/* Section 7 */}
              <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-bold text-sm text-[#0066cc] mb-1.5 flex items-center gap-1.5">
                  <span className="bg-[#e0effa] text-[#0066cc] w-5 h-5 rounded-full flex items-center justify-center text-[11px]">
                    7
                  </span>
                  ETIKA BERKOMUNIKASI (RADIO ETIQUETTE)
                </h3>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    <strong>Antri Modulasi</strong>: Dilarang keras menabrak transmisi saat ada
                    rekan yang sedang mengudara.
                  </li>
                  <li>
                    <strong>Kata Sandi Udara</strong>: Gunakan kata penutup seperti "Ganti" (Over)
                    atau "Roger" (Diterima) agar rekan mengetahui Anda selesai berbicara.
                  </li>
                  <li>
                    <strong>Hormati Moderator</strong>: Patuhi arahan moderator channel (ikon
                    bintang) jika sedang diselenggarakan diskusi kelompok.
                  </li>
                </ul>
              </div>

              {/* Section 8 */}
              <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-bold text-sm text-[#0066cc] mb-1.5 flex items-center gap-1.5">
                  <span className="bg-[#e0effa] text-[#0066cc] w-5 h-5 rounded-full flex items-center justify-center text-[11px]">
                    8
                  </span>
                  DUKUNGAN & DARURAT
                </h3>
                <p>
                  Jika mendapati aktivitas mencurigakan atau penyalahgunaan fitur oleh pengguna
                  lain, silakan laporkan ke admin melalui eMail resmi di{' '}
                  <strong className="text-gray-800">info@nextvwt.id</strong> atau hubungi pusat
                  bantuan di WhatsApp darurat.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Province Selector Modal Dialog */}
      {isProvinceModalOpen && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0" onClick={() => setIsProvinceModalOpen(false)} />
          <div className="bg-white w-[90%] max-h-[85%] rounded-lg shadow-2xl flex flex-col z-10 overflow-hidden border border-gray-300 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center px-4 py-3 bg-white shrink-0 border-b border-gray-200">
              <button
                onClick={() => setIsProvinceModalOpen(false)}
                className="mr-2.5 text-gray-500 hover:text-gray-700 cursor-pointer focus:outline-none"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <span className="text-[16px] font-bold text-gray-800">Pilih provinsi</span>
            </div>

            <div className="flex-1 overflow-y-auto bg-white text-left divide-y divide-gray-100">
              {Object.keys(PROVINCE_CITIES).map((prov) => (
                <button
                  key={prov}
                  onClick={() => {
                    setSelectedProvince(prov);
                    setIsProvinceModalOpen(false);
                    setIsCityModalOpen(true);
                  }}
                  className="w-full text-left py-3 px-4 hover:bg-gray-50 active:bg-gray-100 text-[12px] font-bold text-gray-800 border-b border-gray-100 cursor-pointer select-none focus:outline-none"
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* City Selector Modal Dialog */}
      {isCityModalOpen && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0" onClick={() => setIsCityModalOpen(false)} />
          <div className="bg-white w-[90%] max-h-[85%] rounded-lg shadow-2xl flex flex-col z-10 overflow-hidden border border-gray-300 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center px-4 py-3 bg-white shrink-0 border-b border-gray-200">
              <button
                onClick={() => {
                  setIsCityModalOpen(false);
                  setIsProvinceModalOpen(true);
                }}
                className="mr-2.5 text-gray-500 hover:text-gray-700 cursor-pointer focus:outline-none"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <span className="text-[16px] font-bold text-gray-800">Pilih kota/kabupaten</span>
            </div>

            <div className="flex-1 overflow-y-auto bg-white text-left divide-y divide-gray-100">
              {selectedProvince &&
                PROVINCE_CITIES[selectedProvince]?.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setLocationText(`${city}, ${selectedProvince}`);
                      setIsCityModalOpen(false);
                    }}
                    className="w-full text-left py-3 px-4 hover:bg-gray-50 active:bg-gray-100 text-[12px] font-bold text-gray-800 border-b border-gray-100 cursor-pointer select-none focus:outline-none"
                  >
                    {city}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
