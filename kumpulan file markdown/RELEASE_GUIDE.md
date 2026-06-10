# Panduan Rilis Android & CI/CD — NextVWT PTT App
**Versi:** 2.0 · **Diperbarui:** Juni 2026

---

## Prasyarat Sebelum Rilis

> ⚠️ **Wajib diselesaikan sebelum rilis apapun:**
> 1. Credential `.env` sudah dirotasi dan dihapus dari git history
> 2. RLS policies di database sudah diperbaiki (bukan `USING (true)`)
> 3. TURN_PROVIDER dikonfigurasi di Supabase Secrets

---

## 1. Membuat Android Release Keystore

```bash
keytool -genkey -v \
  -keystore nextvwt-release.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias nextvwt-key \
  -dname "CN=NextVWT, OU=Mobile, O=NextVWT, L=Bandung, ST=West Java, C=ID"
```

Simpan file `.jks` ini di tempat yang aman — **jangan commit ke git**.

---

## 2. Konfigurasi GitHub Secrets

Tambahkan secrets berikut di GitHub Repository → Settings → Secrets → Actions:

| Secret | Nilai |
|--------|-------|
| `KEYSTORE_BASE64` | Output dari `base64 nextvwt-release.jks` |
| `KEY_STORE_PASSWORD` | Password keystore |
| `KEY_ALIAS` | `nextvwt-key` |
| `KEY_PASSWORD` | Password key |
| `SUPABASE_URL` | URL Supabase (setelah rotasi) |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key (setelah rotasi) |
| `GOOGLE_CLIENT_ID` | OAuth Client ID (setelah rotasi) |
| `TURN_URL` | URL TURN server |
| `TURN_USERNAME` | Username TURN |
| `TURN_CREDENTIAL` | Credential TURN |

---

## 3. Hapus `.env` dari Git History (WAJIB)

```bash
# Install BFG Repo Cleaner
# Download dari: https://rtyley.github.io/bfg-repo-cleaner/

# 1. Clone fresh copy
git clone --mirror https://github.com/USERNAME/REPO.git

# 2. Jalankan BFG
java -jar bfg.jar --delete-files .env REPO.git

# 3. Cleanup
cd REPO.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 4. Push force
git push --force

# 5. Di working copy
git rm --cached .env
echo ".env" >> .gitignore
git commit -m "chore(security): remove .env from git tracking"
```

---

## 4. Pipeline CI/CD (GitHub Actions)

Pipeline di `.github/workflows/ci-cd.yml` mencakup:

```
push/PR → main
  ├── Format check (Prettier)
  ├── Lint (ESLint)
  ├── Type check (tsc --noEmit)
  ├── Unit test (Vitest + coverage)
  ├── E2E test (Playwright)
  ├── Build web (Vite)
  ├── Sync Capacitor (cap sync android)
  └── Build Android APK + AAB (Gradle)
       └── Upload artifacts
```

---

## 5. Build Manual Android

```bash
# 1. Build web
pnpm build

# 2. Sync ke Capacitor
npx cap sync android

# 3. Build debug APK (untuk testing)
cd android
./gradlew assembleDebug

# 4. Build release APK
./gradlew assembleRelease

# 5. Build AAB (untuk Play Store)
./gradlew bundleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

---

## 6. Verifikasi Signing

```bash
# Cek APK signing
apksigner verify --verbose android/app/build/outputs/apk/release/app-release.apk

# Cek package info
aapt dump badging android/app/build/outputs/apk/release/app-release.apk | grep -E "package|versionCode|versionName"
```

---

## 7. Certificate Pinning — Update Berkala

Certificate pinning dikonfigurasi di `android/app/src/main/res/xml/network_security_config.xml`.

**Expiry saat ini:** `2028-01-01`

Sebelum expiry, update pin SHA-256:
```bash
# Ambil certificate fingerprint dari Supabase domain:
openssl s_client -connect tqixjycrxhjmpyffhxvg.supabase.co:443 2>/dev/null \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform DER \
  | openssl dgst -sha256 -binary \
  | base64
```

---

## 8. Play Store Checklist

Sebelum submit ke Google Play:

- [ ] Version code di-increment di `android/app/build.gradle`
- [ ] APK signed dengan release keystore
- [ ] APK diuji di minimal 3 device fisik yang berbeda
- [ ] Screenshot minimal 2 device size (phone + tablet)
- [ ] Deskripsi app ditulis dalam Bahasa Indonesia
- [ ] Privacy Policy URL tersedia
- [ ] Izin mikrofon dijelaskan di Play Store listing

---

*RELEASE_GUIDE.md · NextVWT PTT App · v2.0 · Juni 2026*
