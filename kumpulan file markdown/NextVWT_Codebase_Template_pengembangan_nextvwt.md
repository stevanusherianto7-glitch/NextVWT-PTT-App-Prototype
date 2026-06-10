
# NextVWT Codebase Template – Ready-to-Use

Template codebase lengkap untuk NextVWT (Virtual Walkie-Talkie) yang mencakup modul berikut:

- Core PTT dengan floor control (queue management)
- AI Noise Cancellation (on-device)
- QRIS & E-Wallet Payment Gateway
- ROIP (Radio Over IP) Bridge (Monitor Only & Two-Way Controlled)
- WebRTC (SFU-ready) + MQTT Signaling

---

## Daftar Isi

1. Struktur Project
2. Setup Project
3. Konfigurasi
4. Modul PTT (Floor Control & Queue)
5. AI Noise Cancellation
6. Payment (QRIS & E-Wallet)
7. ROIP Bridge
8. WebRTC + MQTT
9. Server (Signaling, Media, Bridge, Payment)
10. Build & Run
11. Lisensi

---

## 1. Struktur Project

Struktur folder utama:

```
NextVWT_Codebase/
├─ app/                 # Aplikasi Android (Kotlin + Jetpack Compose)
├─ core/                # Core utilities, common models, extensions
├─ data/                # Data sources (local, remote, repository impl)
├─ domain/              # Use cases, repository interfaces, entities
├─ features/            # Fitur aplikasi (UI + Logic)
│  ├─ channel/
│  ├─ contacts/
│  └─ settings/
├─ modules/             # Modular feature (independent modules)
│  ├─ ai-noise-cancellation/
│  ├─ payment/
│  ├─ ptt/
│  ├─ roip/
│  ├─ webrtc/
│  └─ mqtt/
├─ libwebrtc/           # WebRTC native binaries
├─ server/              # Backend server (Node.js + TypeScript)
├─ tools/               # Tools & utilities (scripts, mocks, docs helpers)
├─ scripts/             # Build & deployment scripts
├─ .github/             # GitHub Actions CI/CD
├─ build.gradle.kts
├─ settings.gradle.kts
└─ README.md
```

💡 *Catatan:* Struktur mengikuti prinsip Clean Architecture + Modularization.

---

## 2. Setup Project

### 2.1 Prasyarat

- Android Studio 2023.1+ (Hedgehog)
- JDK 17+
- Node.js 18+ (untuk server)
- Git

### 2.2 Clone Repository

```
git clone https://github.com/yourorg/nextvwt.git
cd nextvwt
```

### 2.3 Build Android

```
./gradlew clean build
```

### 2.4 Build Server

```
cd server
npm install
npm run build
npm start
```

---

## 3. Konfigurasi

- File `config.json` untuk API Keys (WebRTC, Payment Gateway, ROIP)
- File `.env` untuk variabel environment server

---

## 4. Modul PTT (Floor Control & Queue)

- `PTTQueue.kt` – Mengatur antrean PTT, lock channel, prioritas pengguna
- Floor control memastikan satu pengguna berbicara per waktu
- Override untuk emergency / operator / owner

```kotlin
fun requestPTT(userId: String) {
    if (channel.isFree()) { lock(userId) } else { queue(userId) }
}
```

---

## 5. AI Noise Cancellation

- `AudioEngine.kt` – Capture mikrofon dan jalur pemrosesan audio
- `NoiseSuppression.kt` – Modul peredam bising (RNNoise / TF Lite)

```
### 5.1.1 Codec2 – Fallback Mode untuk Jaringan Ekstrem

- Codec2 digunakan saat jaringan sangat lemah (2G, EDGE, atau area remote).  
- Latency ultra-rendah, bitrate 700–3200 bps.  
- Digunakan dalam mode darurat untuk memastikan intelligibility suara tetap jelas.  
- Bisa diaktifkan otomatis oleh AudioEngine jika Opus mengalami packet loss tinggi.  

```kotlin
// CodecManager.kt
object CodecManager {
    enum class AudioCodec { OPUS, CODEC2 }

    private var selectedCodec: AudioCodec = AudioCodec.OPUS

    fun setCodec(codec: AudioCodec) {
        selectedCodec = codec
    }

    fun encode(frame: ShortArray): ByteArray {
        return when(selectedCodec) {
            AudioCodec.OPUS -> OpusWrapper.encode(frame)
            AudioCodec.CODEC2 -> Codec2Wrapper.encode(frame)
        }
    }

    fun decode(data: ByteArray): ShortArray {
        return when(selectedCodec) {
            AudioCodec.OPUS -> OpusWrapper.decode(data)
            AudioCodec.CODEC2 -> Codec2Wrapper.decode(data)
        }
    }
}
```

- Codec2Wrapper bisa diimplementasikan via JNI dengan binding C/C++ native Codec2.  
- UI dapat menampilkan status codec aktif (OPUS / CODEC2).  
- Mode fallback otomatis jika latency > 600ms atau packet loss > threshold.
kotlin
val engine = AudioEngine(context)
engine.startCapture()
```

- Mode adaptif: Normal, Jalan Raya/Ojol, Hujan/Angin, Keramaian, Darurat

---

## 6. Payment (QRIS & E-Wallet)

- `PaymentGateway.kt` – Buat invoice dan verifikasi pembayaran
- `WalletManager.kt` – Saldo koin internal, donasi, VIP, badge

```kotlin
val pg = PaymentGateway(apiKey)
pg.createInvoice(5000.0, "Topup Koin") { invoiceId -> ... }
```

- Integrasi gateway mendukung QRIS, GoPay, OVO, DANA, ShopeePay

---

## 7. ROIP Bridge

- `ROIPGateway.kt` – Monitor Only / Two-Way Controlled
- Audio HT fisik → aplikasi NextVWT → channel
- Kontrol legal: admin verification, log transmisi, pembatasan channel

```kotlin
roip.pushAudioToRadio(audioFrame)
val audio = roip.receiveAudioFromRadio()
```

---

## 8. WebRTC + MQTT

- WebRTC: peer connection, SFU client engine, Opus codec
- MQTT: signaling ringan untuk status user, PTT lock, metadata

```kotlin
WebRTCManager.sendAudioFrame(cleanAudio)
MQTTManager.publish("channel/229/ptt", payload)
```

---

## 9. Server (Signaling, Media, Bridge, Payment)

- Node.js + TypeScript
- Endpoints: `/api/payment`, `/api/roip`, `/api/channel`
- WebSocket/SFU untuk media real-time

---

## 10. Build & Run

```
# Android
./gradlew assembleDebug

# Server
cd server
npm run build
npm start
```

---

## 11. Lisensi

- MIT License
- Copyright 2026 NextVWT Team
