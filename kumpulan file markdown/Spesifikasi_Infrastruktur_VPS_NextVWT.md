# Spesifikasi Infrastruktur VPS NextVWT
## Dokumen Permintaan Teknis untuk Provider Cloud / VPS Indonesia

| | |
|---|---|
| **Proyek** | NextVWT — Virtual Walkie-Talkie (PTT) Platform |
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 9 Juni 2026 |
| **OS Wajib** | Ubuntu Server 22.04 LTS (64-bit) |
| **Lokasi DC** | Jakarta, Indonesia (prioritas utama) |
| **Referensi** | [NextVWT_PRD_v3.md](./NextVWT_PRD_v3.md) · [Implementasi wajib nextvwt.md](./Implementasi%20wajib%20nextvwt.md) |

---

## 1. Ringkasan untuk Provider

NextVWT membutuhkan Virtual Private Server (VPS) di **data center Jakarta** untuk menjalankan:

1. **SFU (Selective Forwarding Unit)** — relay audio real-time WebRTC (UDP intensif)
2. **MQTT Broker** — signaling floor control & presence (TLS)
3. **TURN Server (opsional)** — relay NAT traversal WebRTC
4. **Reverse Proxy** — terminasi TLS (HTTPS)

**Bukan VPN, bukan proxy anonymizer, bukan game server.** Workload ini adalah **real-time media relay** untuk aplikasi komunikasi Push-to-Talk (seperti walkie-talkie digital).

Mohon konfirmasi bahwa:
- Port **UDP** (range media WebRTC) **tidak diblokir** oleh firewall provider
- Penggunaan **media relay WebRTC** diperbolehkan sesuai Terms of Service
- IPv4 publik **dedicated** (bukan shared NAT outbound-only)

---

## 2. Paket VPS yang Diminta

### 2.1 Opsi A — PoC / Beta Tertutup (1 VPS)

| Spesifikasi | Minimum | Direkomendasikan |
|-------------|---------|------------------|
| vCPU | 4 core (dedicated/non-burstable) | 4–8 core |
| RAM | 8 GB | 8–16 GB |
| Storage | 60 GB SSD NVMe | 80 GB NVMe |
| Bandwidth | 100 Mbps fair use | Unmetered / 1 Gbps fair use |
| IPv4 | 1 alamat publik dedicated | 1 alamat publik dedicated |
| IPv6 | Opsional | Opsional (nice to have) |
| Virtualisasi | KVM | KVM |
| Backup | Opsional | Snapshot mingguan |

**Estimasi biaya pasar:** Rp 270.000 – Rp 500.000 / bulan (Jakarta, 2026)

### 2.2 Opsi B — Beta Production (2 VPS)

| Node | vCPU | RAM | Storage | Fungsi |
|------|------|-----|---------|--------|
| **media-01** | 4–8 | 8–16 GB | 80 GB NVMe | SFU + TURN |
| **signal-01** | 2 | 2–4 GB | 40 GB NVMe | MQTT Broker |

### 2.3 Opsi C — Production Awal (1 VPS upgraded)

| Spesifikasi | Nilai |
|-------------|-------|
| vCPU | 8 core |
| RAM | 16 GB |
| Storage | 100 GB NVMe |
| Bandwidth | 500 Mbps – 1 Gbps |

---

## 3. Persyaratan Jaringan & Peering

| Persyaratan | Detail |
|-------------|--------|
| **Lokasi DC** | Jakarta (Cyber, NeuCentrIX, atau setara) |
| **Peering lokal** | IIX / OpenIXP / Telkom NeuCentrIX (minimal salah satu) |
| **Latensi target** | < 30 ms dari Jakarta ke ISP besar (Telkomsel, XL, Indihome) |
| **Packet loss** | < 1% pada kondisi normal |
| **Jitter** | < 20 ms (kritis untuk audio real-time) |
| **UDP** | **Wajib tidak diblokir** — lihat §5 |
| **Anti-DDoS** | L3/L4 basic protection (disarankan) |
| **Uptime SLA** | Minimal 99.5% |

---

## 4. Sistem Operasi & Akses

| Item | Spesifikasi |
|------|-------------|
| **OS** | Ubuntu Server **22.04 LTS** (64-bit) — fresh install |
| **Akses** | SSH key-based (password login dinonaktifkan setelah setup) |
| **User** | `deploy` (non-root) + `sudo` |
| **Timezone** | `Asia/Jakarta` (WIB, UTC+7) |
| **Locale** | `en_US.UTF-8` |
| **Hostname** | `nextvwt-media-01` (atau `nextvwt-signal-01`) |
| **Panel** | Tidak wajib — akses SSH cukup |

### 4.1 Post-Install OS (dikerjakan tim NextVWT)

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Paket dasar
sudo apt install -y curl wget git ufw fail2ban htop net-tools \
  software-properties-common apt-transport-https ca-certificates \
  gnupg lsb-release unattended-upgrades

# Timezone
sudo timedatectl set-timezone Asia/Jakarta

# Aktifkan auto security update
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 5. Port & Protokol — Wajib Dibuka

### 5.1 Tabel Port Lengkap

| Port | Protokol | Layanan | Arah | Wajib | Keterangan |
|------|----------|---------|------|-------|------------|
| **22** | TCP | SSH | Inbound | ✅ | Batasi ke IP admin (lihat §6) |
| **80** | TCP | HTTP | Inbound | ✅ | Redirect ke HTTPS + ACME challenge |
| **443** | TCP | HTTPS | Inbound | ✅ | API, dashboard, WebSocket TLS |
| **8883** | TCP | MQTT over TLS | Inbound | ✅ | Signaling floor control & presence |
| **3478** | TCP + UDP | TURN/STUN | Inbound | ⚠️ | Opsional jika pakai coturn lokal |
| **5349** | TCP | TURN over TLS | Inbound | ⚠️ | Opsional |
| **49152–65535** | UDP | TURN relay | Inbound | ⚠️ | Opsional — coturn relay range |
| **40000–49999** | UDP | WebRTC media (SFU) | Inbound + Outbound | ✅ | **Kritis** — relay audio SFU |
| **10000–10200** | UDP | WebRTC media (alt) | Inbound + Outbound | ✅ | Range alternatif SFU |

> **Catatan untuk provider:** Port UDP **40000–49999** adalah kebutuhan utama SFU WebRTC. Pemblokiran UDP oleh firewall hypervisor atau network ACL akan menyebabkan **kegagalan total** komunikasi audio.

### 5.2 Diagram Alur Port

```text
                    INTERNET (User Android NextVWT)
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
     TCP 443/80          TCP 8883          UDP 40000-49999
     (HTTPS/WSS)         (MQTT TLS)         (WebRTC SRTP)
          │                   │                   │
          ▼                   ▼                   ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │  Caddy   │        │Mosquitto │        │ Mediasoup│
    │  / Nginx │        │  Broker  │        │  / Pion  │
    │  :443    │        │  :8883   │        │  SFU     │
    └──────────┘        └──────────┘        └──────────┘
          │                   │                   │
          └───────────────────┴───────────────────┘
                              │
                    Ubuntu 22.04 VPS Jakarta
                    IPv4: ___.___.___.___ 
```

---

## 6. Konfigurasi Firewall (UFW)

Konfigurasi standar yang akan diterapkan tim NextVWT setelah VPS aktif:

```bash
# Default deny
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH — GANTI <IP_ADMIN> dengan IP kantor/developer
sudo ufw allow from <IP_ADMIN>/32 to any port 22 proto tcp comment 'SSH Admin'

# Web & API
sudo ufw allow 80/tcp comment 'HTTP ACME'
sudo ufw allow 443/tcp comment 'HTTPS'

# MQTT TLS
sudo ufw allow 8883/tcp comment 'MQTT TLS'

# WebRTC SFU media — UDP WAJIB
sudo ufw allow 40000:49999/udp comment 'WebRTC SFU Media'
sudo ufw allow 10000:10200/udp comment 'WebRTC SFU Alt'

# TURN (opsional — jika coturn lokal)
sudo ufw allow 3478/tcp comment 'TURN TCP'
sudo ufw allow 3478/udp comment 'TURN UDP'
sudo ufw allow 5349/tcp comment 'TURNS TLS'
sudo ufw allow 49152:65535/udp comment 'TURN Relay'

# Aktifkan
sudo ufw enable
sudo ufw status verbose
```

### 6.1 Aturan Keamanan Tambahan

| Aturan | Implementasi |
|--------|--------------|
| SSH password login | **Disabled** — key only |
| Root login SSH | **Disabled** |
| fail2ban | Aktif untuk SSH (maxretry 3) |
| Rate limit MQTT | Max 100 koneksi/detik per IP |
| TLS minimum | TLS 1.2+ (disarankan TLS 1.3) |
| Certifikat SSL | Let's Encrypt via Caddy auto-HTTPS |

---

## 7. Stack Software yang Akan Diinstal

### 7.1 Ringkasan Stack

| Komponen | Software | Versi | Fungsi |
|----------|----------|-------|--------|
| Runtime | Node.js | 20 LTS | SFU server (Mediasoup/Pion) |
| SFU | Mediasoup | 3.x | Selective Forwarding Unit audio |
| MQTT Broker | Eclipse Mosquitto | 2.x | Signaling floor control |
| Reverse Proxy | Caddy | 2.x | HTTPS + auto SSL |
| TURN (opsional) | coturn | 4.x | NAT traversal relay |
| Container (opsional) | Docker + Compose | 24.x | Orkestrasi layanan |
| Monitoring (opsional) | Prometheus + Grafana | Latest | Metrik latensi & uptime |

### 7.2 Instalasi Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version   # v20.x
npm --version
```

### 7.3 Instalasi Docker (Opsional — Direkomendasikan)

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker deploy
sudo apt install -y docker-compose-plugin
```

### 7.4 Instalasi Mosquitto MQTT Broker

```bash
sudo apt install -y mosquitto mosquitto-clients

# Konfigurasi TLS di /etc/mosquitto/conf.d/nextvwt.conf
# Port: 8883
# Auth: username/password + ACL per channel
# Persistence: enabled
```

**Konfigurasi minimum `/etc/mosquitto/conf.d/nextvwt.conf`:**

```ini
per_listener_settings true

listener 8883
cafile /etc/caddy/certs/acme-v02.api.letsencrypt.org-directory/your.domain/ca.crt
certfile /etc/caddy/certs/acme-v02.api.letsencrypt.org-directory/your.domain/your.domain.crt
keyfile /etc/caddy/certs/acme-v02.api.letsencrypt.org-directory/your.domain/your.domain.key
require_certificate false
use_identity_as_username false

allow_anonymous false
password_file /etc/mosquitto/passwd
acl_file /etc/mosquitto/acl

persistence true
persistence_location /var/lib/mosquitto/
log_dest file /var/log/mosquitto/mosquitto.log
max_connections 5000
```

### 7.5 Instalasi Caddy (Reverse Proxy)

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

**Contoh `Caddyfile`:**

```caddyfile
media.nextvwt.id {
    reverse_proxy localhost:3001
    encode gzip
}

api.nextvwt.id {
    reverse_proxy localhost:3000
    encode gzip
}
```

### 7.6 Instalasi coturn — TURN Server (Opsional)

```bash
sudo apt install -y coturn
```

**`/etc/turnserver.conf` (cuplikan):**

```ini
listening-port=3478
tls-listening-port=5349
min-port=49152
max-port=65535
fingerprint
lt-cred-mech
realm=nextvwt.id
server-name=turn.nextvwt.id
cert=/etc/ssl/certs/turn.pem
pkey=/etc/ssl/private/turn.key
no-multicast-peers
no-cli
log-file=/var/log/turnserver.log
```

### 7.7 SFU — Mediasoup (via Docker Compose)

**Struktur direktori di VPS:**

```text
/opt/nextvwt/
├── docker-compose.yml
├── .env                    # secrets — tidak di-commit
├── sfu/
│   ├── Dockerfile
│   ├── package.json
│   └── src/server.ts
├── mqtt/
│   └── config/
└── caddy/
    └── Caddyfile
```

**`docker-compose.yml` (template):**

```yaml
services:
  sfu:
    build: ./sfu
    restart: unless-stopped
    network_mode: host
    environment:
      - MEDIASOUP_LISTEN_IP=0.0.0.0
      - MEDIASOUP_ANNOUNCED_IP=${VPS_PUBLIC_IP}
      - RTC_MIN_PORT=40000
      - RTC_MAX_PORT=49999
      - NODE_ENV=production
    volumes:
      - ./sfu/logs:/app/logs

  mosquitto:
    image: eclipse-mosquitto:2
    restart: unless-stopped
    ports:
      - "8883:8883"
    volumes:
      - ./mqtt/config:/mosquitto/config
      - ./mqtt/data:/mosquitto/data
      - ./mqtt/log:/mosquitto/log
      - /etc/letsencrypt:/etc/letsencrypt:ro

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./caddy/Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config

volumes:
  caddy_data:
  caddy_config:
```

> **Penting:** SFU Mediasoup menggunakan `network_mode: host` agar UDP media tidak ter-NAT oleh Docker bridge.

---

## 8. Domain & DNS yang Diperlukan

Siapkan DNS record berikut (di registrar domain Anda) setelah VPS aktif:

| Record | Tipe | Nilai | Fungsi |
|--------|------|-------|--------|
| `media.nextvwt.id` | A | `<VPS_PUBLIC_IP>` | SFU API + WebSocket |
| `mqtt.nextvwt.id` | A | `<VPS_PUBLIC_IP>` | MQTT broker (opsional subdomain) |
| `turn.nextvwt.id` | A | `<VPS_PUBLIC_IP>` | TURN server (opsional) |
| `api.nextvwt.id` | A | `<VPS_PUBLIC_IP>` | Floor arbitrator API |

Ganti `nextvwt.id` dengan domain aktual Anda.

---

## 9. Variabel Environment Server

| Variabel | Contoh | Keterangan |
|----------|--------|------------|
| `VPS_PUBLIC_IP` | `103.xxx.xxx.xxx` | IPv4 publik VPS — wajib untuk WebRTC |
| `MEDIASOUP_ANNOUNCED_IP` | sama dengan di atas | IP yang dikirim ke client |
| `RTC_MIN_PORT` | `40000` | Port UDP awal SFU |
| `RTC_MAX_PORT` | `49999` | Port UDP akhir SFU |
| `MQTT_BROKER_URL` | `mqtts://mqtt.nextvwt.id:8883` | URL broker untuk app |
| `MQTT_USERNAME` | `nextvwt_svc` | Service account MQTT |
| `MQTT_PASSWORD` | `<strong-secret>` | Simpan di password manager |
| `JWT_SECRET` | `<random-256-bit>` | Auth token floor control |
| `CORS_ALLOWED_ORIGINS` | `https://app.nextvwt.id` | Bukan wildcard `*` |

---

## 10. Monitoring & KPI Server

Metrik yang akan dipantau untuk memenuhi KPI PRD v3:

| Metrik | Target | Tool |
|--------|--------|------|
| Latensi PTT E2E | < 400 ms | Custom probe + Grafana |
| CPU usage SFU | < 70% normal load | Prometheus node_exporter |
| RAM usage | < 80% | node_exporter |
| UDP packet loss | < 1% | `mtr` / custom |
| MQTT connections | < 5000 concurrent | Mosquitto `$SYS` |
| Uptime | > 99.5% | Uptime Kuma / Pingdom |
| Disk usage | < 80% | node_exporter |

**Port monitoring (internal only — tidak expose publik):**

| Port | Layanan |
|------|---------|
| 9090 | Prometheus |
| 3000 | Grafana |
| 9100 | node_exporter |

---

## 11. Checklist Konfirmasi untuk Provider

Mohon jawab **Ya/Tidak** untuk setiap item sebelum aktivasi:

| # | Pertanyaan | Ya | Tidak |
|---|------------|----|-------|
| 1 | Apakah UDP port **40000–49999** inbound diizinkan? | ☐ | ☐ |
| 2 | Apakah UDP port **10000–10200** inbound diizampkan? | ☐ | ☐ |
| 3 | Apakah TCP port **8883** (MQTT TLS) diizinkan? | ☐ | ☐ |
| 4 | Apakah IPv4 publik **dedicated** (bukan shared NAT)? | ☐ | ☐ |
| 5 | Apakah relay media **WebRTC** (bukan VPN) diperbolehkan di ToS? | ☐ | ☐ |
| 6 | Apakah DC berlokasi di **Jakarta**? | ☐ | ☐ |
| 7 | Apakah ada peering **IIX / OpenIXP / NeuCentrIX**? | ☐ | ☐ |
| 8 | Apakah Ubuntu 22.04 LTS tersedia? | ☐ | ☐ |
| 9 | Apakah KVM (bukan OpenVZ/Virtuozzo)? | ☐ | ☐ |
| 10 | Apakah upgrade vCPU/RAM tanpa reinstall OS? | ☐ | ☐ |
| 11 | Apakah anti-DDoS basic tersedia? | ☐ | ☐ |
| 12 | Apakah snapshot/backup tersedia? | ☐ | ☐ |

**Jika ada jawaban "Tidak" pada item 1, 4, atau 5 — server tidak cocok untuk NextVWT SFU.**

---

## 12. Formulir Order — Isi Saat Pemesanan

```
=== PERMINTAAN VPS NEXTVWT ===

Nama Proyek     : NextVWT PTT Platform
Tipe Layanan    : Cloud VPS / KVM
Lokasi          : Jakarta, Indonesia
OS              : Ubuntu Server 22.04 LTS (64-bit) — Fresh Install

Spesifikasi:
  vCPU          : 4 core (non-burstable)
  RAM           : 8 GB
  Storage       : 80 GB SSD NVMe
  Bandwidth     : Unmetered / 1 Gbps fair use
  IPv4          : 1 dedicated public IP

Port yang WAJIB terbuka (inbound):
  TCP  22, 80, 443, 8883
  UDP  40000-49999, 10000-10200
  UDP  3478, 49152-65535 (opsional — TURN)

Catatan Khusus:
  - Workload: WebRTC SFU media relay (real-time audio PTT)
  - BUKAN VPN / proxy / game server
  - UDP media port tidak boleh diblokir firewall hypervisor
  - Mohon konfirmasi peering IIX/OpenIXP

Akses:
  - SSH key akan dikirim setelah VPS aktif
  - Hostname: nextvwt-media-01

Kontak Teknis:
  Nama  : _______________________
  Email : _______________________
  WA    : _______________________

================================
```

---

## 13. Rencana Deployment (Timeline)

| Hari | Aktivitas |
|------|-----------|
| **H+0** | VPS aktif, SSH key, catat IPv4 publik |
| **H+1** | Setup OS, UFW, fail2ban, timezone |
| **H+1** | Install Docker, Node.js, Caddy |
| **H+2** | Deploy Mosquitto + TLS (port 8883) |
| **H+2** | Deploy SFU Mediasoup (UDP 40000-49999) |
| **H+3** | DNS A record → IP VPS, SSL aktif |
| **H+3** | Uji koneksi dari 3 operator (Telkomsel, XL, Indihome) |
| **H+5** | Load test 10 user simultan per channel |
| **H+7** | Integrasi ke app NextVWT (ganti endpoint SFU/MQTT) |

---

## 14. Troubleshooting Umum

| Gejala | Penyebab Umum | Solusi |
|--------|---------------|--------|
| Audio tidak keluar, signaling OK | UDP diblokir provider | Hubungi support, buka UDP 40000-49999 |
| MQTT connect refused | Port 8883 diblokir | Cek UFW + firewall provider |
| WebRTC ICE failed | `announced_ip` salah | Set `MEDIASOUP_ANNOUNCED_IP` = IPv4 publik VPS |
| Latensi > 400 ms | DC bukan Jakarta / routing buruk | Pindah provider dengan peering IIX |
| SFU CPU 100% | Terlalu banyak channel/user | Upgrade vCPU atau pisah node SFU |

**Perintah diagnostik:**

```bash
# Cek port UDP listening
sudo ss -ulnp | grep -E '40000|mediasoup|turn'

# Cek MQTT
mosquitto_sub -h localhost -p 8883 --cafile /etc/ssl/certs/ca-certificates.crt -t '$SYS/#' -v

# Test latency ke ISP
mtr -r -c 100 8.8.8.8

# Cek bandwidth
iperf3 -s   # di VPS
iperf3 -c <VPS_IP>  # dari client
```

---

## 15. Lampiran — Provider yang Sudah Dievaluasi

| Provider | Paket Rekomendasi | Estimasi Harga | Catatan |
|----------|-------------------|----------------|---------|
| [Biznet Gio](https://www.biznetgio.com) | NEO Lite MM 8.4 (4C/8GB) | ~Rp 270–400rb/bln | **Rekomendasi utama** — IIX, Tier-3 |
| [IDCloudHost](https://idcloudhost.com) | Cloud VPS 4C/8GB Jakarta | ~Rp 300–500rb/bln | Multi-region Jakarta+SG |
| [DewaVPS](https://www.dewavps.com) | Custom 4C/8GB | ~Rp 400–600rb/bln | Anti-DDoS, EPYC |
| [Klikserver](https://www.klikserver.com) | VPS Jakarta 4C/8GB | Bervariasi | NeuCentrIX Telkom |
| [Nevacloud](https://nevacloud.com) | NVMe Jakarta 4C/8GB | ~Rp 200–400rb/bln | Harga kompetitif |

---

## 16. Kontak & Eskalasi

| Role | Tanggung Jawab |
|------|----------------|
| **Pemilik Proyek** | Order VPS, domain, pembayaran provider |
| **DevOps / Backend** | Setup stack §7, firewall §6, monitoring §10 |
| **Mobile / Android** | Integrasi endpoint SFU + MQTT ke app |
| **Provider VPS** | Konfirmasi §11, buka port UDP, uptime |

---

*Spesifikasi Infrastruktur VPS NextVWT v1.0 · 9 Juni 2026*  
*Dokumen ini dapat dikirim langsung ke sales/support provider cloud Indonesia.*
