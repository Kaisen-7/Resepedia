# 🍲 Resepedia — Ensiklopedi & Asisten Cerdas Kuliner Nusantara

> **Platform Ensiklopedi Kuliner Nusantara Full-Stack berbasis Next.js 16 (App Router), Google Firebase (Cloud Firestore NoSQL & Firebase Auth), Tailwind CSS v4, dan AI Koki Interaktif (Google Gemini 2.5 Flash).**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.1-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-ffca28?logo=firebase)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash%20Streaming-orange?logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](http://www.apache.org/licenses/LICENSE-2.0)

---

## 🌟 Tentang Resepedia

**Resepedia** adalah ensiklopedi kuliner digital Nusantara modern, inklusif, dan ramah dapur. Dibangun dengan arsitektur **Next.js 16 App Router** berkinerja tinggi yang terintegrasi dengan **Google Cloud Firestore (NoSQL)** dan **Firebase Auth**, Resepedia menyajikan kekayaan rempah kepulauan Nusantara dengan kecepatan instan, sinkronisasi *real-time*, dan kecerdasan buatan Google Gemini.

---

## ✨ Fitur Unggulan Resepedia

1. **🚀 Arsitektur Full-Stack Next.js 16 & React 19**:
   - Server Components (RSC) & Server-Side Rendering (SSR) untuk pemuatan data katalog instan.
   - Dynamic Slug URLs (`/resep/[slug]`) ramah mesin pencari (SEO).
   - Dynamic JSON-LD Recipe Schema (Google Rich Snippets) & OpenGraph social sharing preview.

2. **🔥 Backend Google Firebase NoSQL & Real-Time Sync**:
   - **Cloud Firestore**: Desain skema dokumen denormalisasi untuk query cepat filter wilayah, kepedasan, dan rating bintang.
   - **Firebase Authentication**: Google One-Tap Sign-In aman dengan pop-up OAuth.
   - **Real-Time Market List**: Daftar belanja tersinkronisasi instan antar-perangkat menggunakan `onSnapshot`.
   - **Client-Side Image Optimization**: Kompresi foto cerdas berbasis WebP di browser (~50KB) yang bekerja 100% gratis pada Firebase Spark Plan tanpa memerlukan kartu kredit.

3. **🤖 Chef Resepedia AI (Gemini 2.5 Flash Streaming)**:
   - Asisten percakapan cerdas yang mengalirkan (*stream*) teks secara real-time.
   - Kontekstual otomatis: AI membaca bahan dan instruksi dari resep yang sedang Anda buka.
   - Rekomendasi substitusi bumbu daerah, tips teknik masak, dan kreasi resep kulkas.

4. **🗣️ Zen Cook Mode (Mode Memasak Bebas Genggam)**:
   - Tampilan layar penuh kontras tinggi dengan tipografi dapur ekstra besar (terbaca dari 1,5 meter).
   - **Screen Wake Lock API**: Mencegah layar ponsel mati/terkunci saat tangan sedang kotor menguleni bumbu.
   - **Web Speech API**: Membacakan langkah-langkah memasak secara otomatis.

5. **⏱️ Persistent Cooking Timer (Web Audio API Synthesizer)**:
   - Timer memasak mengambang (*floating*) yang tetap berjalan dan tidak terputus saat berpindah halaman.
   - Audio synthesizer bawaan peramban tanpa file `.mp3` eksternal.

6. **⚖️ Kalkulator Porsi Dinamis (Fraction Scaler)**:
   - Menghitung ulang kuantitas gramasi bahan masakan saat porsi diubah (1x, 2x, 3x) dengan konversi fraksi presisi (`1/2`, `1/4`, `3/4`).

7. **🛒 Daftar Belanja Pasar (Market List Assistant)**:
   - Memasukkan seluruh bahan resep ke daftar belanja dalam satu klik.
   - Pengelompokan cerdas per hidangan dengan checklist interaktif.

8. **👥 Komunitas & Kreasi Pengguna**:
   - Tulis dan publikasikan resep kreasi Anda sendiri.
   - Rating 5 bintang dan kolom ulasan komunitas dengan upvote "Bermanfaat".

---

## 📁 Struktur Direktori Proyek

```text
Resepedia/
├── src/
│   ├── actions/                  # Next.js Server Actions (resep, komentar, bookmark, belanja)
│   ├── app/                      # Next.js App Router (Halaman SSR & API Handlers)
│   │   ├── (main)/
│   │   │   ├── belanja/          # Halaman Daftar Belanja Pasar (Real-time Firestore)
│   │   │   ├── eksplorasi/       # Halaman Filter & Jelajah Resep Nusantara
│   │   │   ├── koleksi/          # Halaman Resep Favorit & Kreasi Saya
│   │   │   ├── profil/           # Halaman Preferensi & Profil Pengguna
│   │   │   ├── resep/[slug]/     # Halaman Detail Resep & Zen Cook Mode (SEO Schema)
│   │   │   └── resep/tambah/     # Halaman Unggah Resep Baru
│   │   ├── api/chat/             # Serverless Gemini 2.5 Flash Streaming API
│   │   ├── sitemap.ts            # Dynamic SEO XML Sitemap generator
│   │   └── layout.tsx            # Root Shell & Provider Tree
│   ├── components/               # Komponen UI Modular
│   │   ├── ai/                   # AI Chat Drawer & Streaming Message
│   │   ├── belanja/              # Real-time Shopping List UI
│   │   ├── layout/               # Navbar & Footer Nusantara
│   │   ├── recipe/               # RecipeCard, RecipeDetailClient, ZenCookMode
│   │   └── widgets/              # Floating Timer, Portion Scaler, Cooking Mode Modal
│   ├── contexts/                 # React Contexts (AuthContext, AIContext, TimerContext)
│   ├── lib/
│   │   ├── firebase/             # Client SDK, Admin SDK, Service Layer, Firestore Queries
│   │   └── utils/                # Image compression, SEO schema, string formatters
│   └── types/                    # TypeScript interfaces & Firestore document models
├── scripts/
│   └── seed-firestore.ts         # Seeder 20 Resep Autentik Nusantara ke Firestore
├── firebase.json                 # Konfigurasi deploy Firebase CLI
├── firestore.rules               # Aturan keamanan database Firestore
├── firestore.indexes.json        # Indeks komposit query filter Firestore
├── storage.rules                 # Aturan keamanan upload media
├── next.config.ts                # Konfigurasi Next.js 16 (remote patterns, externals)
├── package.json
└── tsconfig.json
```

---

## 🚀 Panduan Memulai Cepat (Quick Start)

### 1. Prasyarat
- [Node.js](https://nodejs.org/) (versi 18.x atau lebih baru, disarankan v20+ LTS).
- npm, pnpm, atau yarn.
- Akun [Google Firebase](https://console.firebase.google.com/) (Gratis).

### 2. Pemasangan Dependensi
```bash
npm install
```

### 3. Konfigurasi Variabel Lingkungan (`.env.local`)
Salin berkas `.env.example` ke `.env.local`:
```bash
cp .env.example .env.local
```
Lengkapi konfigurasi Firebase dan Gemini API:
```env
# Google Gemini AI
GEMINI_API_KEY=AIzaSy...

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=resepedia-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=resepedia-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=resepedia-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:...

# Firebase Admin SDK (Service Account)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@resepedia-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 4. Menanamkan 20 Resep Autentik Awal
Jalankan skrip seeder mandiri:
```bash
npm run seed:firestore
```

### 5. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di **[http://localhost:3000](http://localhost:3000)**.

### 6. Build Produksi
```bash
npm run build
npm run start
```

---

## 📄 Lisensi

Didistribusikan di bawah lisensi Apache-2.0. Silakan gunakan dan kembangkan untuk melestarikan kuliner Nusantara.
