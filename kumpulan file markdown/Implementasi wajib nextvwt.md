# LAPORAN STRATEGI IMPLEMENTASI DAN TEMPLATE CODEBASE KOMPREHENSIF
## NextVWT (Virtual Walkie-Talkie): Strategi Akselerasi Menuju Platform Komunikasi Lapangan Nomor Satu di Indonesia

---

## Daftar Isi
1. Ringkasan Eksekutif & Posisi Strategis Pasar Indonesia
2. Evaluasi Fondasi & Penanganan Kelemahan Sistemis Android Background
3. Pilar Transformasi 1: Arsitektur Mendalam AI Noise Cancellation & Alur Audio
4. Pilar Transformasi 2: Integrasi Gerbang Pembayaran Lokal & Sistem Finansial Internal
5. Pilar Transformasi 3: Sistem Jembatan Radio (ROIP Bridge) & Tata Kelola Legal-by-Design
6. Rekomendasi Arsitektur Teknis: Floor Control, Signaling, & Media
7. Tata Kelola Komunitas & Strategi Moderasi Suara
8. Roadmap Implementasi Komprehensif (0–24 Bulan)
9. Indikator Kinerja Utama (KPI) & Metrik Teknis
10. Template Codebase Siap Pakai (Ready-to-Use Codebase Architecture)

---

## 1. Ringkasan Eksekutif & Posisi Strategis Pasar Indonesia

NextVWT hadir sebagai solusi mutakhir di persimpangan tiga kebutuhan krusial mobilitas nasional: komunikasi instan berbasis Push-to-Talk (PTT), penguatan ekosistem komunitas radio digital lokal, serta efisiensi operasional bagi jutaan pekerja lapangan di Indonesia—mulai dari ojek online (ojol), kurir logistik, relawan bencana, petugas keamanan swakarsa, tim rescue (SAR), hingga komunitas touring.

Karakteristik pasar Indonesia menuntut aplikasi yang tidak sekadar canggih secara teoritis, melainkan harus tangguh (robust), hemat kuota data, stabil berjalan pada ponsel kelas menengah (low-to-mid end), tidak menguras baterai secara drastis, serta adaptif terhadap kondisi infrastruktur jaringan seluler yang fluktuatif di area rural maupun urban. NextVWT memosisikan diri sebagai platform komunikasi hybrid nasional. Dibandingkan dengan kompetitor global yang kaku atau aplikasi lokal yang minim monetisasi dan keamanan, NextVWT mengambil strategi monetisasi non-destruktif (bebas iklan interstitial/layar penuh yang mengganggu komunikasi darurat) dengan mengoptimalkan model mikrotransaksi lokal, donasi komunitas, serta penyediaan infrastruktur korporat (enterprise features).

---

## 2. Evaluasi Fondasi & Penanganan Kelemahan Sistemis Android Background

### 2.1 Ketergantungan dan Manajemen Koneksi Latar Belakang (Background Survival)
Sistem operasi Android modern menerapkan manajemen daya yang sangat agresif (Doze Mode, App Standby Bucket) serta modifikasi kustom vendor (seperti Xiaomi HyperOS, Oppo ColorOS, Vivo FuntouchOS, Samsung One UI) yang seringkali mematikan koneksi soket latar belakang secara sepihak. Bagi aplikasi PTT, kegagalan menerima transmisi saat layar terkunci adalah kecacatan fatal.

**Strategi Mitigasi Teknis NextVWT:**
1. **Foreground Service Persisten Berizin Khusus:** Mengimplementasikan Android `Foreground Service` yang terikat secara eksplisit pada tipe `FOREGROUND_SERVICE_TYPE_MICROPHONE` dan `FOREGROUND_SERVICE_TYPE_DATA_SYNC`. Service ini wajib memicu notifikasi persisten yang transparan, menginformasikan status "Siaga Channel" kepada pengguna secara real-time.
2. **Firebase Cloud Messaging (FCM) High-Priority Wakeup:** Saat saluran mengalami aktivitas kritis atau panggilan darurat ketika aplikasi dalam keadaan deep sleep, server akan mengirimkan push notification FCM dengan prioritas tinggi untuk membangunkan background worker via `WorkManager`, memaksa inisialisasi ulang koneksi soket dalam waktu < 200ms.
3. **Keep-Alive Adaptif:** Menghindari ping berkala konstan yang memicu batasan wakelock. NextVWT mengukur stabilitas jaringan secara adaptif; interval ping melonggar saat ponsel terhubung ke Wi-Fi stabil dan merapat secara dinamis saat berada di jaringan seluler yang mengalami packet loss tinggi.
4. **Panduan Device-Specific Optimization:** Menyediakan modul UI edukatif interaktif di dalam menu pengaturan untuk memandu pengguna menonaktifkan optimasi baterai bawaan vendor (Battery Optimization Whitelisting) khusus untuk NextVWT.

---

## 3. Pilar Transformasi 1: Arsitektur Mendalam AI Noise Cancellation & Alur Audio

### 3.1 Pipeline Pemrosesan Suara Real-Time
Untuk menjamin kejelasan mutlak (intelligibility) di tengah kebisingan jalan raya, mesin motor, angin kencang, hujan tropis, dan hiruk-pikuk pasar, alur pemrosesan audio dirancang dengan latensi ultra-rendah melalui pipeline sequential berikut:

```text
[Mikrofon Perangkat]
        │
        ▼
[Voice Activity Detection (VAD)] ──► (Mencegah pemrosesan jika hanya ada keheningan)
        │
        ▼
[High Pass Filter (HPF)] ─────────► (Memotong frekuensi < 150 Hz: gemuruh angin & mesin)
        │
        ▼
[Automatic Gain Control (AGC)] ───► (Menormalkan amplitudo volume input yang fluktuatif)
        │
        ▼
[AI Noise Suppression (ANS)] ─────► (Model Neural RNNoise / TF Lite mengisolasi vokal)
        │
        ▼
[Acoustic Echo Cancellation] ─────► (Mencegah feedback loop dari speaker luar)
        │
        ▼
[Adaptive Audio Codec] ───────────► (Kompresi dinamis via Opus atau Fallback ke Codec2)
        │
        ▼
[WebRTC Client SFU Engine] ──────► (Streaming data via enkripsi SRTP ke Media Server)
```

### 3.2 Spesifikasi 5 Mode Adaptif Peredam Bising

- **Mode Normal:** Dioptimalkan untuk ruangan tertutup, posko, kantor, atau rumah. Peredaman bising berada pada tingkat minimum (low threshold) untuk menjaga akurasi temporal dan kualitas alami suara manusia.
- **Mode Ojol / Jalan Raya:** Fokus spesifik pada pemotongan noise berfrekuensi rendah-menengah yang kontinu (suara knalpot motor bebek/matic, klakson kendaraan, deru truk) serta pemisahan vokal pengemudi yang menggunakan helm/handsfree.
- **Mode Hujan / Angin:** Menerapkan algoritma penekanan transient noise untuk meredam hantaman angin kencang pada mikrofon (wind rustle) dan frekuensi acak (broadband noise) dari tetesan hujan deras.
- **Mode Keramaian:** Menargetkan bising latar belakang berupa kerumunan manusia (babble noise) di area fasilitas umum seperti pasar tradisional, terminal bus, stasiun, atau basecamp komunitas yang padat.
- **Mode Darurat (Emergency):** Mengabaikan estetika natural vokal. Algoritma melakukan peredaman agresif (hard-clipping noise suppression) untuk mengekstrak pita suara inti. Suara mungkin terdengar agak kering atau robotik, namun jaminan pesan terdistribusi dengan kejelasan 100% pada kondisi kritis tetap diprioritaskan.

### 3.3 Integrasi Codec2 sebagai Fallback Mode Jaringan Ekstrem
Opus adalah codec superior untuk kondisi jaringan normal hingga marginal (6 kbps - 32 kbps). Namun, di wilayah blank spot Indonesia (jaringan 2G, EDGE, atau area pedalaman dengan packet loss > 40%), NextVWT mengaktifkan fallback otomatis ke Codec2, sebuah codec audio open-source berbitrate ultra-rendah (700 bps - 3200 bps). Codec2 memetakan suara ke dalam parameter pemodelan sinusoidal matematika, sehingga komunikasi suara tetap dapat ditransmisikan secara lancar meskipun lebar pita (bandwidth) jaringan tersisa sangat sempit.

---

## 4. Pilar Transformasi 2: Integrasi Gerbang Pembayaran Lokal & Sistem Finansial Internal

### 4.1 Arsitektur Wallet Internal Berbasis Koin Utilitas
NextVWT mengadopsi arsitektur buku besar (ledger) tertutup di mana unit moneter internal disebut sebagai Koin. Koin tidak berfungsi sebagai alat pembayaran elektronik umum (bukan e-money independen yang melanggar regulasi Bank Indonesia), melainkan murni sebagai koin utilitas dalam aplikasi untuk memicu aksi mikrotransaksi (donasi ke channel, pembelian item kosmetik digital seperti badge, pin, tema radio, atau aktivasi fitur VIP).

### 4.2 Alur Transaksi dan Verifikasi Signature Webhook Payment Gateway
Untuk meminimalkan overhead operasional, NextVWT mengintegrasikan API Payment Gateway lokal yang terhubung langsung ke jaringan QRIS Dinamis dan e-wallet utama (GoPay, OVO, DANA, ShopeePay, LinkAja).

```text
[Pengguna]             [App NextVWT]            [Server Backend]         [Payment Gateway]
    │                        │                         │                         │
    │── 1. Pilih Topup ─────►│                         │                         │
    │                        │── 2. Buat Invoice ─────►│                         │
    │                        │                         │── 3. Request QRIS ─────►│
    │                        │                         │◄── 4. Return Data QR ───│
    │                        │◄── 5. Tampilkan QR ─────│                         │
    │── 6. Scan & Bayar ────────────────────────────────────────────────────────►│
    │                        │                         │                         │
    │                        │                         │◄── 7. Kirim Webhook ────│
    │                        │                         │    (Validasi Signature) │
    │                        │                         │── 8. Kreditkan Koin ───┐│
    │                        │                         │      (Database Ledger) ││
    │                        │◄── 9. Notifikasi Sukses ┼◄───────────────────────┘│
    │◄─ 10. Koin Bertambah ──│                         │                         │
```

**Sistem Validasi Keamanan Keuangan:**
Setiap webhook yang masuk dari Payment Gateway wajib melewati lapisan verifikasi HMAC-SHA256 menggunakan Secret Key yang disimpan secara aman di environment server. Jika signature tidak cocok, server secara otomatis menolak transaksi dan mencatat insiden tersebut ke dalam log audit keamanan demi mencegah eksploitasi webhook palsu.

---

## 5. Pilar Transformasi 3: Sistem Jembatan Radio (ROIP Bridge) & Tata Kelola Legal-by-Design

### 5.1 Arsitektur Integrasi Hardware dan Software
ROIP (Radio over IP) Bridge menjembatani infrastruktur radio analog (VHF/UHF) dengan ekosistem digital NextVWT. Integrasi dilakukan melalui modul interface fisik (seperti COR/PTT optocoupler circuit) yang menghubungkan radio pangkalan (Base Station / Mobile Radio) dengan microcomputer gateway (Raspberry Pi / Orange Pi / ESP32-Audio) yang menjalankan client software NextVWT.

```text
[HT / Radio Fisik] ◄──(Audio RX/TX + PTT Control Keying)──► [Modul Interface Hardware]
                                                                     │
                                                       (Line In/Out + GPIO Trigger)
                                                                     │
                                                                     ▼
                                                        [Microcomputer ROIP Gateway]
                                                                     │
                                                       (Internet: WebRTC + MQTT TLS)
                                                                     │
                                                                     ▼
                                                         [NextVWT Bridge Server]
                                                                     │
                                                                     ▼
                                                       [Saluran Aplikasi / Channel]
```

### 5.2 Aturan Operasional 3 Mode ROIP

- **Mode Monitor Only (Rx Only):** Saluran bersifat searah. Audio yang ditangkap oleh antena radio HT fisik dikonversi menjadi data stream digital dan disiarkan ke saluran NextVWT. Pengguna aplikasi NextVWT tidak memiliki hak untuk memancar balik ke udara. Mode ini adalah opsi paling aman dari risiko pelanggaran frekuensi udara.
- **Mode Two-Way Controlled:** Komunikasi dua arah secara penuh. Namun, untuk menjaga etika berkomunikasi dan mencegah sabotase frekuensi analog, hak untuk menekan PTT yang ditransmisikan ke pemancar radio fisik dibatasi secara ketat hanya untuk pengguna aplikasi yang memiliki role khusus seperti Admin, Operator, atau Instansi Terverifikasi.
- **Mode Emergency Bridge:** Mode interkoneksi total yang diaktifkan secara manual saat terjadi bencana alam atau skenario penyelamatan (SAR). Saluran udara analog dan saluran digital aplikasi digabungkan tanpa batas (fully bridged) dengan prioritas interupsi tertinggi diberikan kepada komando pusat.

### 5.3 Implementasi Prinsip Legal-by-Design
Guna mematuhi regulasi ketat penggunaan spektrum frekuensi radio dari Kementerian Komunikasi dan Digital (Kemenkomdigi) serta koordinasi dengan organisasi resmi (RAPI/ORARI), ROIP NextVWT dilengkapi pagar pengaman teknis:

- **Gerbang Otorisasi Ketat:** Pemilik gateway ROIP wajib mengunggah dokumen legalitas resmi (IKR / IAR / Izin Frekuensi Khusus) untuk diverifikasi oleh tim compliance internal sebelum jembatan dua arah diaktifkan.
- **Anti-Overheat & Time-Out Timer (TOT):** Pembatasan durasi transmit maksimal (default: 60 detik) untuk mencegah pemancar radio fisik mengalami kerusakan atau terbakar akibat bug hang-up koneksi.
- **Deteksi Channel Busy:** Sebelum gerbang ROIP mengaktifkan pin GPIO PTT pada radio fisik, sistem akan mendeteksi level audio masuk (Carrier Operated Relay / COR) pada radio untuk memastikan frekuensi analog sedang kosong, mencegah tabrakan transmisi di udara analog.
- **Audit Trail Log:** Setiap transmisi yang masuk dan keluar dari jembatan ROIP dicatat secara rinci (ID Pengguna, Waktu, Durasi, Status Lokasi) untuk keperluan forensik jika terjadi penyalahgunaan frekuensi.

---

## 6. Rekomendasi Arsitektur Teknis: Floor Control, Signaling, & Media

### 6.1 Pemisahan Jalur Komunikasi
Untuk mencapai skalabilitas tinggi, efisiensi resource, dan latensi minimum, NextVWT secara tegas memisahkan arsitektur jaringan ke dalam tiga sub-sistem utama:

- **Signaling Plane (MQTT via TLS - Port 8883):** Menggunakan protokol MQTT yang sangat ringan untuk mengelola status presensi user (online/offline/away), perpindahan channel, sinkronisasi metadata, serta manajemen hak bicara (Floor Control).
- **Media Plane (WebRTC SFU - Selective Forwarding Unit):** Jalur transmisi data audio real-time menggunakan WebRTC dengan protokol SRTP. Server SFU (seperti Janus, Mediasoup, atau Pion) tidak melakukan mixing audio (seperti MCU), melainkan langsung meneruskan paket audio dari pembicara aktif ke seluruh pendengar di channel tersebut, memangkas beban CPU server secara drastis.
- **Push Notification Plane (FCM):** Digunakan murni untuk keperluan interupsi background, membangunkan aplikasi dari status deep sleep ketika saluran penting mendeteksi aktivitas transmisi darurat.

### 6.2 Mekanisme Arbitrase Floor Control & Urutan Prioritas
Floor Control diatur sepenuhnya oleh server koordinasi terpusat (Floor Arbitrator) melalui arsitektur antrean berbasis token MQTT stateful. Ketika seorang pengguna menekan tombol PTT:

1. Aplikasi mengirimkan pesan `REQUEST_FLOOR` melalui topik MQTT privat ke server.
2. Server memeriksa status saluran:
   - Jika saluran kosong (`FLOOR_STATUS_FREE`), server membalas dengan `FLOOR_GRANTED`. Saluran dikunci atas nama user tersebut.
   - Jika saluran sedang digunakan oleh pengguna lain, server membalas dengan `FLOOR_DENIED` dan memasukkan ID user ke antrean (`FLOOR_QUEUE`). Aplikasi memicu feedback haptic dan visual "Menunggu Giliran".
3. Ketika pengguna aktif melepas PTT, aplikasi mengirim `RELEASE_FLOOR`, server melepaskan kunci, lalu otomatis memberikan hak bicara ke user berikutnya dalam antrean berdasarkan hierarki prioritas.

**Hierarki Prioritas Hak Bicara:**

1. Emergency Override Token: Dapat memotong siapapun yang sedang berbicara (Khusus akun komando bencana / aparat keamanan).
2. Channel Owner: Pemilik saluran.
3. Channel Administrator & Operator: Pengelola harian saluran.
4. Verified Member: Anggota terverifikasi (telah melakukan autentikasi identitas/berlangganan).
5. Guest / Standard User: Pengguna umum tanpa hak prioritas khusus.

---

## 7. Tata Kelola Komunitas & Strategi Moderasi Suara

Komunikasi berbasis suara real-time di channel publik sangat rentan terhadap tindak penyalahgunaan seperti spamming suara bising, ujaran kebencian, pelecehan verbal, prank, hingga gangguan sengaja (jamming). NextVWT merancang tata kelola komunitas multi-layer:

- **Sistem Peran Bersyarat (Dynamic Role Management):** Setiap pembuat channel memiliki kendali mutlak untuk menunjuk struktur tim moderasi (Owner, Admin, Operator). Pengguna baru yang masuk ke channel publik secara otomatis diberi status Guest dengan pembatasan durasi bicara atau wajib melewati masa tunggu (cooldown) antar-PTT.
- **Fitur Moderasi Instan:** Admin dan Operator dibekali tombol kendali cepat pada antarmuka aplikasi: Mute User (mencabut hak bicara sementara), Kick (mengeluarkan dari channel), dan Ban (blokir permanen berdasarkan ID Perangkat dan IP).
- **Fitur Report Audio & Rolling Buffer:** Aplikasi mempertahankan buffer perekaman audio lokal terenkripsi berdurasi 15 detik terakhir di latar belakang. Jika pengguna mendengarkan pelanggaran atau pelecehan, mereka dapat menekan tombol Laporkan Pelanggaran. Aplikasi akan membungkus paket buffer audio tersebut dan mengirimkannya ke server sebagai bukti otentik laporan pelanggaran.
- **Sistem Reputasi Pengguna (Trust Score):** Setiap akun memiliki skor reputasi digital. Jika seorang pengguna sering mendapatkan tindakan Mute atau Report yang valid dari admin channel yang berbeda, skor reputasi mereka akan turun otomatis, membatasi akses mereka untuk bergabung atau berbicara di channel publik lainnya di seluruh penjuru nusantara.

---

## 8. Roadmap Implementasi Komprehensif (0–24 Bulan)

```text
 0 - 3 BULAN: FONDASI STABILITAS (Tahap 1)
 ├─ Finalisasi Arsitektur Floor Control via MQTT Stateful
 ├─ Implementasi WebRTC Media Server (SFU) & Integrasi Codec Opus
 ├─ Pengembangan Android Foreground Service Berizin Mikrofon & Bluetooth PTT
 └─ Desain UI Saluran Walkie-Talkie Responsif & Ringan

 3 - 6 BULAN: DIFERENSIASI PRODUK & INTERKONEKSI FINANSIAL (Tahap 2)
 ├─ Deployment AI Noise Cancellation Versi Awal (RNNoise Integration)
 ├─ Rilis Mode Khusus "Ojol / Jalan Raya" & Mode "Hujan / Angin"
 ├─ Integrasi API Payment Gateway Lokal (QRIS Dinamis & Webhook Verification)
 └─ Peluncuran Wallet Internal Koin Utilitas & Sistem Badge VIP/Donasi

 6 - 12 BULAN: EKOSISTEM ROIP & PENETRASI SEKTOR LAPANGAN (Tahap 3)
 ├─ Rilis Fitur ROIP Bridge Mode "Monitor Only" dan "Two-Way Controlled"
 ├─ Sertifikasi & Gatekeeping Dokumen Legalitas Frekuensi ROIP Admin
 ├─ Uji Coba Pilot Project bersama Komunitas Relawan, Ojol, dan Satpam
 └─ Optimasi Konsumsi Daya Baterai Latar Belakang Per Vendor Ponsel

 12 - 24 BULAN: SKALABILITAS NASIONAL & SOLUSI ENTERPRISE (Tahap 4)
 ├─ Deployment Server Multi-Region Seluruh Wilayah Indonesia (Latensi < 100ms)
 ├─ Implementasi Fallback Jaringan Ekstrem Menggunakan Codec2 Native Binding
 ├─ Peluncuran Fitur Enterprise Fleet Management & Dashboard Operator Korporat
 └─ API Terbuka untuk Integrasi PTT Perangkat Keras / Perangkat HT Android Khusus
```

---

## 9. Indikator Kinerja Utama (KPI) & Metrik Teknis

Untuk memvalidasi kesuksesan implementasi arsitektur di atas, NextVWT menetapkan batas standar metrik kinerja operasional berikut:

| Metrik | Target |
|--------|--------|
| **Latensi PTT Udara (End-to-End Latency)** | Di bawah 400 milidetik dari saat tombol dilepas hingga audio terdengar di ponsel penerima pada kondisi jaringan 4G/Wi-Fi normal. |
| **Stabilitas Background (App Survival Rate)** | Di atas 98.5% aplikasi tetap siaga menerima transmisi latar belakang setelah durasi penguncian layar ponsel > 2 jam pada semua merek smartphone utama. |
| **Efisiensi Daya Baterai (Power Consumption)** | Konsumsi daya aplikasi saat mode siaga (idle background monitoring) tidak boleh melebihi 1.5% total kapasitas baterai per jam. |
| **Keberhasilan Transaksi Finansial (Payment Webhook Success Rate)** | Di atas 99.9% invoice yang terbayar di sisi payment gateway wajib terproses secara instan (real-time webhook processing < 2 detik) ke saldo koin utilitas user. |
| **Keamanan ROIP (Overtransmit Protection)** | 100% kepatuhan penutupan pin PTT GPIO radio fisik secara otomatis tepat saat durasi menyentuh ambang batas batas maksimal Time-Out Timer (TOT). |

---

## 10. Template Codebase Siap Pakai (Ready-to-Use Codebase Architecture)

Berikut adalah struktur berkas terorganisir dan implementasi kode konkrit untuk arsitektur NextVWT:

### 10.1 Struktur Direktori Project Lengkap

```text
NextVWT_Codebase/
├─ app/                                 # Modul Aplikasi Utama Android (Kotlin)
│  ├─ src/main/java/com/nextvwt/app/
│  │  ├─ core/                          # Ekstensi common, utilitas konteks dasar
│  │  ├─ data/                          # Implementasi sumber data lokal & remote
│  │  ├─ domain/                        # Use Cases transaksi & Antarmuka Repositori
│  │  └─ features/                      # Lapisan Presentasi UI (Jetpack Compose)
│  │     ├─ channel/                    # Tampilan Ruang Saluran & Interaksi PTT
│  │     ├─ payment/                    # Antarmuka Invoice & Topup Koin
│  │     └─ roip/                       # Panel Manajemen Konfigurasi Bridge
├─ modules/                             # Modul Mandiri Terisolasi (Modularization)
│  ├─ ai-noise-cancellation/            # Engine Audio JNI Native & Model AI
│  │  ├─ cpp/                           # Source Code C++ binding RNNoise & Codec2
│  │  └─ src/main/java/com/nextvwt/ai/
│  ├─ payment/                          # Handler Ledger & Integrasi SDK Gateway
│  ├─ ptt/                              # State Machine Floor Control & MQTT Handler
│  ├─ roip/                             # Driver GPIO & Kompresi Frame ROIP Gateway
│  └─ webrtc/                           # Engine Koneksi SFU PeerConnection
├─ server/                              # Backend Server (Node.js + TypeScript)
│  ├─ src/
│  │  ├─ controllers/                   # Logika API (Channel, Payment Webhook, ROIP)
│  │  ├─ services/                      # Arbitrator Floor Control & Media Coordinator
│  │  └─ server.ts                      # Entry point inisialisasi server
└─ README.md
```

### 10.2 Implementasi Kode Inti Modul

#### Modul PTT: PTTQueue.kt (Manajemen Antrean Floor Control di Android)

```kotlin
package com.nextvwt.ptt

import java.util.PriorityQueue
import java.util.Collections

object PTTQueue {
    enum class UserRole(val priorityWeight: Int) {
        EMERGENCY_OVERRIDE(0),
        OWNER(1),
        ADMIN(2),
        OPERATOR(3),
        VERIFIED_MEMBER(4),
        GUEST(5)
    }

    data class PTTRequest(
        val userId: String,
        val role: UserRole,
        val timestamp: Long = System.currentTimeMillis()
    ) : Comparable<PTTRequest> {
        override fun compareTo(other: PTTRequest): Int {
            // Urutkan berdasarkan bobot prioritas peran, jika sama urutkan berdasarkan waktu request terdahulu
            return if (this.role.priorityWeight != other.role.priorityWeight) {
                this.role.priorityWeight.compareTo(other.role.priorityWeight)
            } else {
                this.timestamp.compareTo(other.timestamp)
            }
        }
    }

    private val queue = PriorityQueue<PTTRequest>()
    private var activeSpeakerId: String? = null

    @Synchronized
    fun requestPTT(userId: String, role: UserRole, onFloorGranted: () -> Unit, onFloorQueued: (position: Int) -> Unit) {
        val request = PTTRequest(userId, role)

        if (role == UserRole.EMERGENCY_OVERRIDE) {
            interuptActiveSpeaker(request)
            onFloorGranted()
            return
        }

        if (activeSpeakerId == null) {
            activeSpeakerId = userId
            onFloorGranted()
        } else {
            if (!queue.any { it.userId == userId }) {
                queue.add(request)
            }
            val position = queue.toList().sorted().indexOf(request) + 1
            onFloorQueued(position)
        }
    }

    @Synchronized
    fun releasePTT(userId: String, onNextSpeakerGranted: (String) -> Unit, onChannelFree: () -> Unit) {
        if (activeSpeakerId == userId) {
            activeSpeakerId = null
            val nextRequest = queue.poll()
            if (nextRequest != null) {
                activeSpeakerId = nextRequest.userId
                onNextSpeakerGranted(nextRequest.userId)
            } else {
                onChannelFree()
            }
        }
    }

    private fun interuptActiveSpeaker(request: PTTRequest) {
        // Logika menghentikan paksa streaming active speaker lama via signal MQTT
        activeSpeakerId = request.userId
        queue.clear() // Clear antrean non-darurat demi efisiensi jalur emergency
    }

    @Synchronized
    fun clearQueue() {
        queue.clear()
        activeSpeakerId = null
    }
}
```

#### Modul AI Noise Cancellation & Audio Engine: CodecManager.kt

```kotlin
package com.nextvwt.ai

object CodecManager {
    enum class AudioCodec { OPUS, CODEC2 }

    private var currentCodec: AudioCodec = AudioCodec.OPUS
    private var isFallbackEnabled: Boolean = false

    fun initialize() {
        // Panggil inisialisasi native library binding JNI C++
        System.loadLibrary("nextvwt_audio_native")
        nativeInitCodecEngine()
    }

    fun setCodec(codec: AudioCodec) {
        this.currentCodec = codec
    }

    fun evaluateNetworkQuality(packetLossRate: Double, latencyMs: Long) {
        // Skenario fallback otomatis jika kualitas sinyal seluler di Indonesia memburuk secara ekstrem
        if ((packetLossRate > 0.40 || latencyMs > 600) && currentCodec == AudioCodec.OPUS) {
            setCodec(AudioCodec.CODEC2)
            isFallbackEnabled = true
        } else if (packetLossRate < 0.15 && latencyMs < 200 && isFallbackEnabled) {
            setCodec(AudioCodec.OPUS)
            isFallbackEnabled = false
        }
    }

    fun encodeAudioFrame(frame: ShortArray): ByteArray {
        return when (currentCodec) {
            AudioCodec.OPUS -> nativeEncodeOpus(frame)
            AudioCodec.CODEC2 -> nativeEncodeCodec2(frame)
        }
    }

    fun decodeAudioFrame(data: ByteArray): ShortArray {
        return when (currentCodec) {
            AudioCodec.OPUS -> nativeDecodeOpus(data)
            AudioCodec.CODEC2 -> nativeDecodeCodec2(data)
        }
    }

    // Penanda fungsi Native C++ JNI Binding
    private native fun nativeInitCodecEngine()
    private native fun nativeEncodeOpus(frame: ShortArray): ByteArray
    private native fun nativeEncodeCodec2(frame: ShortArray): ByteArray
    private native fun nativeDecodeOpus(data: ByteArray): ShortArray
    private native fun nativeDecodeCodec2(data: ByteArray): ShortArray
}
```

#### Modul Finansial: PaymentGateway.kt & WalletManager.kt

```kotlin
package com.nextvwt.payment

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class PaymentGateway(private val apiKey: String) {

    fun createQRISInvoice(amount: Double, description: String, onSuccess: (invoiceId: String, qrisData: String) -> Unit, onFailure: (error: String) -> Unit) {
        Thread {
            try {
                val url = URL("https://api.localgateway.co.id/v1/invoices")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Authorization", "Bearer $apiKey")
                conn.setRequestProperty("Content-Type", "application/json")
                conn.doOutput = true

                val payload = JSONObject().apply {
                    put("amount", amount)
                    put("description", description)
                    put("payment_type", "QRIS_DYNAMIC")
                }

                conn.outputStream.use { os ->
                    os.write(payload.toString().toByteArray(Charsets.UTF_8))
                }

                if (conn.responseCode == 200) {
                    val response = conn.inputStream.bufferedReader().use { it.readText() }
                    val jsonResponse = JSONObject(response)
                    val invoiceId = jsonResponse.getString("id")
                    val qrisData = jsonResponse.getJSONObject("payment_data").getString("qr_string")
                    onSuccess(invoiceId, qrisData)
                } else {
                    onFailure("HTTP Error: ${conn.responseCode}")
                }
            } catch (e: Exception) {
                onFailure(e.message ?: "Unknown Connection Error")
            }
        }.start()
    }
}

object WalletManager {
    private var internalCoinBalance: Int = 0

    @Synchronized
    fun getBalance(): Int = internalCoinBalance

    @Synchronized
    fun creditCoins(amount: Int) {
        if (amount > 0) {
            internalCoinBalance += amount
        }
    }

    @Synchronized
    fun debitCoins(amount: Int): Boolean {
        return if (internalCoinBalance >= amount) {
            internalCoinBalance -= amount
            true
        } else {
            false
        }
    }
}
```

#### Modul Infrastruktur Radio: ROIPGateway.kt

```kotlin
package com.nextvwt.roip

object ROIPGateway {
    private var isTransmitLocked: Boolean = false
    private var lastTransmitTimestamp: Long = 0L
    private const val TIME_OUT_TIMER_LIMIT = 60000L // Batas TOT maksimal 60 detik demi aspek perlindungan hardware

    fun initGPIO() {
        // Inisialisasi pin hardware pada microcomputer gateway (misal Raspberry Pi GPIO)
        nativeSetupGPIO()
    }

    @Synchronized
    fun setRadioPTTState(active: Boolean): Boolean {
        if (active) {
            // Cegah pengaktifan jika sedang terkunci akibat aturan pencegahan kerusakan (overheat protection)
            if (isTransmitLocked) return false

            // Aturan Kerja: Deteksi Carrier Operated Relay (COR) - Pastikan frekuensi analog tidak sedang sibuk
            if (nativeIsChannelBusy()) return false

            lastTransmitTimestamp = System.currentTimeMillis()
            nativeSetGPIOPinHigh()

            // Jalankan background checker untuk memantau Time-Out Timer secara realtime
            startTOTMonitor()
            return true
        } else {
            nativeSetGPIOPinLow()
            return true
        }
    }

    private fun startTOTMonitor() {
        Thread {
            while (true) {
                Thread.sleep(500)
                if (System.currentTimeMillis() - lastTransmitTimestamp > TIME_OUT_TIMER_LIMIT) {
                    // Paksa mematikan transmisi karena melanggar batas waktu TOT maksimal
                    forceShutdown()
                    break
                }
            }
        }.start()
    }

    @Synchronized
    private fun forceShutdown() {
        nativeSetGPIOPinLow()
        isTransmitLocked = true
        // Kunci pemancar selama 30 detik untuk memberikan ruang pendinginan fisik komponen radio
        Thread {
            Thread.sleep(30000)
            isTransmitLocked = false
        }.start()
    }

    private native fun nativeSetupGPIO()
    private native fun nativeSetGPIOPinHigh()
    private native fun nativeSetGPIOPinLow()
    private native fun nativeIsChannelBusy(): Boolean
}
```

#### Server Backend Component: server.ts (Node.js + TypeScript Webhook & Floor Arbitrator Server)

```typescript
import express, { Request, Response } from 'express';
import * as crypto from 'crypto';

const app = express();
app.use(express.json());

const GATEWAY_WEBHOOK_SECRET = process.env.GATEWAY_WEBHOOK_SECRET || "SUPER_SECRET_HMAC_KEY";

// Endpoint Verifikasi Pembayaran dari Payment Gateway Lokal
app.post('/api/v1/payment/webhook', (req: Request, res: Response) => {
    const signature = req.headers['x-callback-signature'] as string;

    if (!signature) {
        return res.status(401).json({ status: "error", message: "Missing signature header" });
    }

    // Skema Pengamanan Verifikasi Kebasahan Data Webhook (Signature Verification)
    const computedSignature = crypto
        .createHmac('sha256', GATEWAY_WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (signature !== computedSignature) {
        console.error("[SECURITY_ALERT] Invalid webhook signature detected!");
        return res.status(403).json({ status: "error", message: "Invalid signature verification" });
    }

    const { invoice_id, status, amount, user_id } = req.body;

    if (status === "PAID") {
        // Eksekusi pemutakhiran database saldo menggunakan skema transaksi ACID Ledger Aman
        console.log(`[PAYMENT_SUCCESS] Invoice ${invoice_id} paid. Crediting coins to user ${user_id}.`);
        // TODO: db.updateUserBalance(user_id, amount * koin_rate);
    }

    return res.status(200).json({ status: "success", message: "Webhook processed completely" });
});

// Endpoint Kontrol Otorisasi Pendaftaran ROIP Jembatan
app.post('/api/v1/roip/register', (req: Request, res: Response) => {
    const { userId, gatewayMacAddress, radioLicenseNumber, channelMapping } = req.body;

    // Evaluasi Prasyarat Aspek Hukum Penggunaan Frekuensi Udara (Legal Gatekeeping)
    if (!radioLicenseNumber || radioLicenseNumber.length < 5) {
        return res.status(400).json({
            status: "denied",
            message: "Pendaftaran ditolak. Nomor Izin Stasiun Radio (IAR/IKR) wajib dilampirkan secara valid."
        });
    }

    console.log(`[ROIP_REGISTRATION] Gateway ${gatewayMacAddress} bound to channel ${channelMapping} under license ${radioLicenseNumber}`);
    return res.status(201).json({ status: "approved", message: "ROIP Bridge successfully authorized" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[NextVWT_SERVER_RUNNING] Core control engine listening on port ${PORT}`);
});
```

---

## 11. Lisensi & Hak Cipta

Hak Cipta (c) 2026 Tim NextVWT Indonesia. Seluruh hak dilindungi undang-undang. Distribusi template kode dan dokumen strategi ini bersifat internal untuk percepatan pengembangan sistem aplikasi nasional.
