# 📖 Dokumentasi Lengkap Proyek: Resepedia

> **Resepedia — Ensiklopedi & Asisten Cerdas Kuliner Nusantara**  
> *Platform Web Full-Stack Modern untuk Pelestarian dan Eksplorasi Warisan Kuliner Indonesia*  
> **URL Produksi:** [https://resepedia-seven.vercel.app](https://resepedia-seven.vercel.app)  
> **Repository:** [https://github.com/Kaisen-7/Resepedia](https://github.com/Kaisen-7/Resepedia)

---

## 📑 Daftar Isi
1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Tech Stack & Spesifikasi Ketergantungan](#2-tech-stack--spesifikasi-ketergantungan)
3. [Arsitektur Sistem & Diagram Alur](#3-arsitektur-sistem--diagram-alur)
4. [Struktur Direktori Proyek](#4-struktur-direktori-proyek)
5. [Skema Data & Entitas Firestore](#5-skema-data--entitas-firestore)
6. [Fitur-Fitur Utama & Implementasi Teknis](#6-fitur-fitur-utama--implementasi-teknis)
7. [Server Actions & API Routes](#7-server-actions--api-routes)
8. [Aturan Keamanan (Security Rules) & Indeks Database](#8-aturan-keamanan-security-rules--indeks-database)
9. [Internasionalisasi & Lokalisasi (i18n)](#9-internasionalisasi--lokalisasi-i18n)
10. [Responsivitas Mobile & Sistem Desain](#10-responsivitas-mobile--sistem-desain)
11. [Panduan Instalasi & Pengembangan Lokal](#11-panduan-instalasi--pengembangan-lokal)
12. [Panduan Deployment Produksi (Vercel & Firebase)](#12-panduan-deployment-produksi-vercel--firebase)
13. [Catatan Pemecahan Masalah & Rekayasa Teknis](#13-catatan-pemecahan-masalah--rekayasa-teknis)

---

## 1. Ringkasan Eksekutif

**Resepedia** adalah aplikasi web ensiklopedi kuliner Nusantara interaktif yang dirancang untuk mendokumentasikan, melestarikan, dan mempermudah praktik memasak hidangan tradisional Indonesia dari 6 kepulauan besar (Sumatra, Jawa, Bali & Nusa Tenggara, Sulawesi, Kalimantan, dan Papua & Maluku).

Berbeda dari aplikasi resep konvensional, Resepedia mengintegrasikan teknologi ramah dapur (*kitchen-friendly features*):
- **Zen Cook Mode**: Pembacaan langkah memasak otomatis berbasis suara (*speech synthesis*) dengan pencegahan layar padam (*Screen Wake Lock API*).
- **Asisten Koki Cerdas Gemini**: Konsultasi bumbu pengganti dan tips memasak secara *real-time streaming* dengan injeksi konteks resep aktif.
- **Floating Cooking Timer**: Timer audio synthesizer berbasis browser yang persisten antar navigasi halaman.
- **Portion Scaler**: Perhitungan gramasi bahan otomatis berbasis matematika fraksi presisi.
- **Sinkronisasi Ganda (Dual-Persistence)**: Dukungan penuh cloud real-time Firebase untuk pengguna login dan *localStorage fallback* untuk pengguna tamu.

---

## 2. Tech Stack & Spesifikasi Ketergantungan

### Inti Aplikasi (Core Framework)
| Komponen | Teknologi | Versi | Peran / Deskripsi |
|---|---|---|---|
| **Framework** | Next.js | `^16.4.3` | App Router, Turbopack, React Server Components (RSC), Server Actions |
| **Library UI** | React & React DOM | `^19.0.1` | Concurrent Rendering, Actions, Hooks modern |
| **Bahasa** | TypeScript | `~5.8.2` | Static Typing ketat (`tsc --noEmit`) |
| **CSS Engine** | Tailwind CSS | `^4.1.14` | Tailwind v4 dengan `@tailwindcss/postcss`, sintaks kanonikal modern |
| **Ikon UI** | Lucide React | `^0.546.0` | Ikon SVG modular & konsisten |
| **Animasi** | Motion (Framer) | `^12.23.24` | Drawer panel, modal backdrop, timer animations |
| **Markdown** | React-Markdown + Remark-GFM | `^10.1.0` / `^4.0.1` | Rendering jawaban Markdown AI Chef |

### Backend & Cloud Services
| Layanan | Package | Versi | Peran / Deskripsi |
|---|---|---|---|
| **Client SDK** | Firebase | `^13.1.0` | Auth (Google Sign-In), Cloud Firestore client, Storage |
| **Admin SDK** | Firebase Admin | `^13.1.0` | Server-side mutations & Firestore admin access |
| **JWT / RSA Override** | `jose` | `^4.15.9` | Memastikan kompatibilitas CommonJS `jwks-rsa` pada Vercel Node runtime |
| **AI LLM Engine** | `@google/genai` | `^1.29.0` | Google Gemini 2.5 Flash dengan streaming SSE response |
| **Observability** | `@opentelemetry/api` | `^1.10.0` | Tracing & telemetry instrumentation standar Vercel |

---

## 3. Arsitektur Sistem & Diagram Alur

### 3.1 Diagram Arsitektur Tingkat Tinggi
```mermaid
graph TD
    User["👤 Klien / Pengguna Web & Mobile"]
    
    subgraph Frontend["Frontend (Next.js 16 + React 19)"]
        RSC["Server Components (RSC / SSR)<br/>Halaman Katalog, Detail Resep, SEO"]
        RCC["Client Components (RCC)<br/>Zen Mode, Scaler, Timer, Drawer AI"]
        Contexts["State Contexts<br/>Auth, AI, Timer, Toast, Language"]
    end
    
    subgraph Server["Next.js Server Layer (Vercel Serverless)"]
        Actions["Next.js Server Actions<br/>(recipe, comment, bookmark, shopping)"]
        API["Route Handlers<br/>POST /api/chat (SSE Stream)"]
        AdminSDK["Firebase Admin SDK 13.1.0"]
    end
    
    subgraph External["Layanan Pihak Ketiga & Cloud"]
        Firestore[("🔥 Google Cloud Firestore<br/>NoSQL Database")]
        FirebaseAuth["🔐 Firebase Authentication<br/>Google OAuth 2.0"]
        GeminiAPI["🤖 Google Gemini 2.5 Flash<br/>AI Assistant Engine"]
        YouTube["📺 YouTube NoCookie Player<br/>Video Embed"]
    end

    User -->|HTTP / Interaksi Touch| Frontend
    RSC -->|Akses Admin Langsung| AdminSDK
    RCC -->|Eksekusi Server Action| Actions
    RCC -->|Streaming Chat| API
    RCC -->|Auth Pop-up / Listener| FirebaseAuth
    RCC -->|Snapshot Realtime Belanja| Firestore
    Actions -->|CRUD Data| AdminSDK
    AdminSDK -->|Operasi Database| Firestore
    API -->|Generate Stream| GeminiAPI
    RCC -->|Embed Aman| YouTube
```

### 3.2 Diagram Alur Persistensi Ganda (Dual-Persistence)
Aplikasi menjamin pengguna tetap dapat menyimpan resep, membuat resep sendiri, dan mengelola daftar belanja meskipun belum masuk (*guest mode*).
```mermaid
flowchart TD
    A["Tindakan Pengguna<br/>(Bookmark / Tambah Belanja / Buat Resep)"] --> B{"Apakah User Login?<br/>(AuthContext.user != null)"}
    
    B -->|Ya| C["Kirim ke Server Action & Cloud Firestore"]
    C --> D["Update State React & Cache Lokal"]
    
    B -->|Tidak / Tamu| E["Simpan ke Browser LocalStorage<br/>(resepedia_my_recipes / culinary_shopping_list)"]
    E --> F["Dispatch Custom Event Window<br/>('shopping-list-updated' / 'my-recipes-updated')"]
    F --> G["Sinkronisasi UI Seluruh Komponen"]
```

### 3.3 Diagram Alur Asisten AI dengan Konteks Resep
```mermaid
sequenceDiagram
    autonumber
    actor Pengguna
    participant UI as AIChatDrawer (Client)
    participant Route as /api/chat (Serverless API)
    participant Gemini as Google Gemini 2.5 Flash API

    Pengguna->>UI: Buka Asisten Dapur & Ketik Pertanyaan
    UI->>Route: POST payload { messages, currentRecipeContext }
    Note over Route: Injeksi system prompt +<br/>data resep yang sedang dibuka
    Route->>Gemini: ai.models.generateContentStream()
    loop Streaming Response (SSE)
        Gemini-->>Route: Chunk respons teks
        Route-->>UI: Data stream chunk
        UI-->>Pengguna: Render Markdown secara bertahap (Streaming)
    end
```

---

## 4. Struktur Direktori Proyek

```text
Resepedia/
├── .env.example                  # Template variabel lingkungan
├── .gitignore                    # Berkas yang diabaikan Git (.env, serviceAccountKey, dll.)
├── DOCUMENTATION.md              # Dokumentasi lengkap sistem
├── README.md                     # Panduan pengantar ringkas
├── firebase.json                 # Konfigurasi Firebase CLI
├── firestore.indexes.json        # Indeks query komposit Cloud Firestore
├── firestore.rules               # Aturan keamanan database Firestore
├── next.config.ts                # Konfigurasi Next.js 16 (remote patterns, node externalization)
├── package.json                  # Dependensi dan skrip proyek
├── postcss.config.mjs            # Konfigurasi PostCSS Tailwind v4
├── storage.rules                 # Aturan keamanan Firebase Storage
├── tsconfig.json                 # Konfigurasi TypeScript compiler
│
├── scripts/
│   └── seed-firestore.ts         # Script seeder untuk menanam 20 resep autentik Nusantara
│
└── src/
    ├── actions/                  # Next.js Server Actions (Mutasi Data)
    │   ├── bookmark.actions.ts   # Server action toggle simpan resep
    │   ├── comment.actions.ts    # Server action tambah ulasan & upvote bantuan
    │   ├── recipe.actions.ts     # Server action create, edit, delete resep
    │   └── shopping.actions.ts   # Server action kelola daftar belanja
    │
    ├── app/                      # App Router (Halaman & Endpoint)
    │   ├── globals.css           # Token Tailwind CSS v4, tema warna, font imported
    │   ├── layout.tsx            # Root layout HTML, viewport metadata, Provider Tree
    │   ├── sitemap.ts            # Dynamic SEO Sitemap generator
    │   ├── robots.ts             # Directives perayap mesin pencari
    │   │
    │   ├── (main)/               # Route Group dengan MainLayout (Navbar + MobileBottomNav + Footer)
    │   │   ├── layout.tsx        # Shell tata letak responsif dengan padding mobile
    │   │   ├── page.tsx          # Halaman Beranda (SSR / RSC)
    │   │   ├── belanja/          # Halaman Daftar Belanja Pasar (Realtime Sync)
    │   │   ├── eksplorasi/       # Halaman Jelajah & Filter Komprehensif
    │   │   ├── koleksi/          # Halaman Resep Disimpan & Kreasi Resep Saya
    │   │   ├── profil/           # Halaman Akun, Ganti Bahasa, dan Preferensi Diet
    │   │   ├── tentang/          # Halaman Misi Pelestarian Budaya Kuliner
    │   │   └── resep/
    │   │       ├── tambah/       # Halaman Formulir Pembuatan Resep Baru
    │   │       └── [slug]/       # Halaman Detail Resep Dinamis + JSON-LD SEO
    │   │           ├── page.tsx
    │   │           ├── loading.tsx
    │   │           └── edit/     # Halaman Formulir Edit Resep oleh Penulis
    │   │
    │   ├── api/
    │   │   └── chat/
    │   │       └── route.ts      # Serverless Endpoint Gemini 2.5 Flash Streaming
    │   └── auth/
    │       └── callback/         # Endpoint callback OAuth (opsional)
    │
    ├── components/               # Komponen Antarmuka Pengguna
    │   ├── ai/
    │   │   └── AIChatDrawer.tsx  # Drawer interaktif Asisten Dapur Resepedia
    │   ├── belanja/
    │   │   └── BelanjaClient.tsx # Client component daftar belanja terkelompok
    │   ├── eksplorasi/
    │   │   └── EksplorasiClient.tsx # Client component filter multi-kriteria
    │   ├── home/
    │   │   └── HomeClient.tsx    # Client component Beranda, saring kulkas & carousel
    │   ├── koleksi/
    │   │   └── KoleksiClient.tsx # Client component tab Simpanan & Resep Buatan Sendiri
    │   ├── layout/
    │   │   ├── Footer.tsx        # Footer informasi daerah & navigasi
    │   │   ├── MobileBottomNav.tsx # Bilah navigasi bawah khusus mobile dengan tombol Tulis
    │   │   └── Navbar.tsx        # Navigasi atas desktop & pencarian command bar
    │   ├── profil/
    │   │   └── ProfilClient.tsx  # Pengaturan bahasa, dark mode, dan status profil
    │   ├── recipe/
    │   │   ├── AddRecipeClient.tsx     # Form tambah resep responsif
    │   │   ├── EditRecipeClient.tsx    # Form edit resep responsif
    │   │   ├── HandsFreeCookModal.tsx  # Modal layar penuh Zen Cook Mode
    │   │   ├── PortionScaler.tsx       # Widget pengubah kelipatan porsi
    │   │   ├── RecipeCard.tsx          # Kartu resep responsif & navigasi detail
    │   │   └── RecipeDetailClient.tsx  # Halaman detail resep lengkap
    │   └── widgets/
    │       └── CookingTimer.tsx  # Floating audio synthesizer cooking timer
    │
    ├── contexts/                 # React Context Providers
    │   ├── AIContext.tsx         # State manajemen laci chat AI
    │   ├── AuthContext.tsx       # State sesi login Firebase & sinkronisasi bookmark
    │   ├── LanguageContext.tsx   # State internasionalisasi ID/EN & kamus terjemahan
    │   ├── TimerContext.tsx      # State timer masak dan audio synthesizer
    │   └── ToastContext.tsx      # Notifikasi toast mengambang responsif
    │
    ├── lib/                      # Utilitas & Integrasi Layanan
    │   ├── firebase/
    │   │   ├── admin.ts          # Inisialisasi Firebase Admin SDK server-side
    │   │   ├── client.ts         # Inisialisasi Firebase Client SDK
    │   │   ├── firestore-queries.ts # Query data resep, ulasan, & pencarian
    │   │   └── service.ts        # Service upload media & Firestore subscriber
    │   └── utils/
    │       ├── fraction-scaler.ts   # Konversi kalkulasi takaran pecahan
    │       ├── image-compression.ts # Kompresi gambar client-side WebP
    │       ├── recipe-storage.ts    # Storage utilitas resep lokal (guest/offline)
    │       ├── seo-schema.ts        # Generator JSON-LD Schema.org Recipe
    │       ├── shopping-storage.ts  # Storage utilitas belanja lokal & cloud
    │       └── youtube.ts           # Ekstraksi ID & URL embed YouTube NoCookie
    │
    ├── translations.ts           # Kamus terjemahan Bahasa Indonesia & Inggris
    └── types/
        └── recipe.types.ts       # Definisi interface TypeScript & tipe dokumen Firestore
```

---

## 5. Skema Data & Entitas Firestore

### 5.1 Entitas Resep (`recipes/{recipeId}`)
| Field | Tipe Data | Deskripsi |
|---|---|---|
| `id` | `string` | ID unik dokumen Firestore |
| `slug` | `string` | Slug ramah URL (contoh: `rendang-daging-sapi-a8f2`) |
| `title` | `string` | Judul masakan |
| `description` | `string` | Deskripsi singkat atau latar belakang budaya |
| `image` | `string` | URL gambar (Firebase Storage atau WebP eksternal) |
| `prepTime` | `string` | Waktu persiapan (contoh: `20 Mnt`) |
| `cookTime` | `string` | Waktu memasak (contoh: `45 Mnt`) |
| `servings` | `string` | Porsi standar dasar (contoh: `4 Porsi`) |
| `calories` | `string` | Perkiraan kalori (contoh: `350 kcal`) |
| `difficulty` | `'Easy' \| 'Medium' \| 'Hard'` | Tingkat kesulitan |
| `category` | `'Appetizer' \| 'Main Course' \| 'Dessert' \| 'Drink'` | Kategori hidangan |
| `region` | `'Sumatra' \| 'Jawa' \| 'Bali' \| 'Sulawesi' \| 'Kalimantan' \| 'Papua'` | Asal kepulauan daerah |
| `spicy` | `boolean` | Indikator rasa pedas |
| `youtubeUrl` | `string \| null` | URL embed YouTube tutorial |
| `authorId` | `string \| null` | UID Firebase Auth pembuat resep |
| `authorName` | `string` | Nama tampilan koki pembuat |
| `isDefault` | `boolean` | `true` jika merupakan resep kurasi bawaan sistem |
| `rating` | `number` | Rata-rata bintang penilaian (0.0 jika baru) |
| `ratingCount` | `number` | Jumlah pengguna yang memberi ulasan (0 jika baru) |
| `ingredients` | `Array<{ name, detail, role }>` | Daftar komposisi bahan, takaran, dan fungsi |
| `instructions` | `Array<{ title, text }>` | Tahapan langkah memasak terstruktur |
| `variations` | `Array<{ title, description }>` | Tips alternatif bahan atau modifikasi |
| `ingredientNames` | `string[]` | Array lowercase nama bahan untuk query filter cepat |
| `searchKeywords` | `string[]` | Token pencarian teks |
| `createdAt` | `number` | Timestamp epoch milidetik |

### 5.2 Entitas Pengguna (`users/{userId}`)
| Field | Tipe Data | Deskripsi |
|---|---|---|
| `id` | `string` | UID Firebase Auth |
| `displayName` | `string` | Nama profil Google |
| `email` | `string` | Alamat email terverifikasi |
| `avatarUrl` | `string \| null` | URL foto profil |
| `savedRecipeIds` | `string[]` | Kumpulan ID resep yang dibookmark pengguna |
| `preferences` | `UserPreferences` | Preferensi `darkMode`, `language`, dan `dietary` |
| `createdAt` | `number` | Waktu bergabung |

### 5.3 Subkoleksi Daftar Belanja (`users/{userId}/shopping_items/{itemId}`)
| Field | Tipe Data | Deskripsi |
|---|---|---|
| `id` | `string` | ID unik item belanja |
| `name` | `string` | Nama bahan belanjaan |
| `detail` | `string` | Takaran atau jumlah yang dibutuhkan |
| `checked` | `boolean` | Status coret / selesai dibeli |
| `recipeTitle` | `string \| null` | Asal nama hidangan untuk pengelompokan |
| `createdAt` | `number` | Waktu penambahan |

### 5.4 Subkoleksi Ulasan (`recipes/{recipeId}/comments/{commentId}`)
| Field | Tipe Data | Deskripsi |
|---|---|---|
| `id` | `string` | ID ulasan |
| `recipeId` | `string` | ID resep yang diulas |
| `authorId` | `string` | UID pemberi ulasan |
| `authorName` | `string` | Nama pemberi ulasan |
| `authorAvatar` | `string \| null` | Foto profil pemberi ulasan |
| `text` | `string` | Teks ulasan pengalaman memasak (maks 500 karakter) |
| `rating` | `number \| null` | Nilai bintang yang diberikan (1 - 5) |
| `helpfulCount` | `number` | Jumlah pengguna yang menandai ulasan ini bermanfaat |
| `createdAt` | `number` | Timestamp ulasan |

---

## 6. Fitur-Fitur Utama & Implementasi Teknis

### 6.1 Zen Cook Mode (Mode Memasak Bebas Genggam)
- **Tujuan**: Memungkinkan koki membaca dan mendengarkan instruksi tanpa perlu menyentuh layar ponsel saat tangan berlumuran minyak atau tepung.
- **Teknologi**:
  1. **Screen Wake Lock API**: Menggunakan `navigator.wakeLock.request('screen')` agar layar tetap menyala terus-menerus selama modal aktif.
  2. **Web Speech API**: Menggunakan `window.speechSynthesis` dengan `SpeechSynthesisUtterance` beraksen `id-ID` pada kecepatan tempo `0.95`.
  3. **Auto Timer Detection**: Mendeteksi otomatis kata-kata durasi waktu pada instruksi (contoh: *"tumis selama 15 menit"*) dan menyediakan tombol langsung aktivasi timer.
  4. **Tipografi Dapur Kontras Tinggi**: Teks instruksi berskala dinamis `text-xl sm:text-3xl md:text-4xl` dengan latar belakang hitam pekat `zinc-950`.

### 6.2 Asisten Koki Interaktif (Google Gemini 2.5 Flash)
- **Tujuan**: Menjawab pertanyaan kuliner seputar bumbu pengganti, tips agar santan tidak pecah, atau rekomendasi menu keluarga.
- **Implementasi**:
  1. Menggunakan `@google/genai` dengan model `gemini-2.5-flash`.
  2. Injeksi konteks dinamis: Server menerima `currentRecipeContext` dari halaman yang sedang dibuka pengguna dan menyisipkannya ke dalam *system instruction*.
  3. Streaming respon langsung menggunakan Server-Sent Events (SSE) sehingga teks langsung muncul kata demi kata tanpa menunggu generasi selesai.

### 6.3 Persistent Audio Synthesizer Cooking Timer
- **Tujuan**: Menyediakan timer memasak yang tetap berdetak meskipun pengguna berpindah-pindah halaman di dalam aplikasi.
- **Implementasi**:
  1. Berada pada tingkat root shell melalui `TimerContext` dan `CookingTimer.tsx`.
  2. Menggunakan **Web Audio API** (`AudioContext` dan `OscillatorNode`) untuk menghasilkan nada dering akord harmonis saat waktu habis tanpa memerlukan unduhan berkas `.mp3` eksternal.
  3. Dilengkapi kontrol fleksibel: Tambah/kurang menit (`+1m`, `+5m`, `-1m`), tombol jeda/lanjut, dan mode minimalkan ke pil kecil mengambang.

### 6.4 Kalkulator Porsi Dinamis (Fraction Scaler)
- **Tujuan**: Menghitung kuantitas bahan saat jumlah porsi dinaikkan atau diturunkan.
- **Implementasi**:
  - Modul [fraction-scaler.ts](file:///c:/Users/dipsk/Ngoding%20Terus/Resepedia/src/lib/utils/fraction-scaler.ts) mengenali bilangan bulat, desimal, dan pecahan campuran (contoh: `1/2 sdt`, `1 1/2 sdm`, `500 gr`).
  - Menghitung nilai proporsional baru secara akurat tanpa menghasilkan angka desimal aneh.

### 6.5 Kompresi Gambar Cerdas di Browser (Client-Side WebP)
- **Tujuan**: Menghindari beban biaya kompresi server dan mematuhi batas Firebase Spark Plan gratis.
- **Implementasi**:
  - [image-compression.ts](file:///c:/Users/dipsk/Ngoding%20Terus/Resepedia/src/lib/utils/image-compression.ts) menggunakan HTML5 Canvas API untuk me-resize gambar hingga resolusi maksimal 1200px dan mengonversinya ke format WebP terkompresi (~50KB–90KB) sebelum dikirim ke Firebase Storage.

### 6.6 Sinkronisasi Real-Time Daftar Belanja
- **Tujuan**: Membantu pengguna saat berbelanja bahan di pasar tradisional atau supermarket.
- **Implementasi**:
  - Pengguna dapat memasukkan seluruh bahan dari resep ke daftar belanja hanya dengan 1 kali klik.
  - Menggunakan Firestore `onSnapshot` sehingga jika satu anggota keluarga mencoret bahan di ponselnya, ponsel anggota keluarga lainnya langsung ter-update seketika.
  - Dilengkapi tombol coret instan, pengelompokan bahan berdasarkan hidangan, dan pembersihan bahan yang sudah dibeli.

---

## 7. Server Actions & API Routes

### 7.1 Server Actions (`src/actions/`)
Next.js Server Actions dieksekusi secara aman di server tanpa membuat API endpoint terpisah:

1. **`recipe.actions.ts`**:
   - `createRecipeAction(data, userId)`: Memvalidasi bahan dan instruksi, membuat slug unik, mengekstrak kata kunci pencarian, dan menyimpan dokumen ke Firestore.
   - `updateRecipeAction(recipeId, data, userId)`: Memverifikasi kepemilikan resep dan memperbarui isi dokumen resep.
   - `deleteRecipeAction(recipeId, userId)`: Memverifikasi hak cipta penulis, memastikan bukan resep default, dan menghapus dokumen dari Firestore.
   - `getRecipeBySlugAction(slug)`: Mengambil data resep berdasarkan slug untuk rendering halaman detail.

2. **`comment.actions.ts`**:
   - `createCommentAction(recipeId, text, author, rating)`: Menyimpan ulasan pengguna ke subkoleksi komentar, sekaligus menghitung ulang rata-rata bintang resep secara atomik jika rating disertakan.
   - `incrementCommentHelpfulAction(commentId, currentHelpful, recipeId)`: Menambahkan nilai dukungan bermanfaat pada komentar.
   - `getCommentsAction(recipeId)`: Mengambil seluruh komentar suatu resep yang diurutkan dari waktu terbaru.

3. **`bookmark.actions.ts`**:
   - `toggleBookmarkAction(recipeId, userId)`: Menambah atau menghapus ID resep pada array `savedRecipeIds` milik pengguna di Firestore.
   - `getSavedRecipesAction(userId)`: Mengambil seluruh data resep lengkap yang telah dibookmark oleh pengguna.

4. **`shopping.actions.ts`**:
   - `addShoppingItemAction(name, detail, recipeTitle, userId)`: Menambahkan bahan baru ke subkoleksi `shopping_items`.
   - `toggleShoppingItemAction(itemId, currentChecked, userId)`: Mengubah status centang item belanja.
   - `deleteShoppingItemAction(itemId, userId)`: Menghapus satu item belanja.
   - `clearCheckedShoppingItemsAction(userId)`: Menghapus massal seluruh item yang telah dicentang.

### 7.2 API Handler: `POST /api/chat`
- **Tujuan**: Endpoint percakapan dengan Google Gemini 2.5 Flash.
- **Request Body**:
  ```json
  {
    "messages": [
      { "role": "user", "text": "Apa alternatif santan untuk opor?" }
    ],
    "currentRecipeContext": {
      "title": "Opor Ayam Kuning",
      "region": "Jawa",
      "ingredients": [...],
      "instructions": [...]
    }
  }
  ```
- **Response**: `ReadableStream` (text/plain; charset=utf-8) yang mengalirkan kata-kata Markdown secara langsung (*streaming*).

---

## 8. Aturan Keamanan (Security Rules) & Indeks Database

### 8.1 Aturan Keamanan (`firestore.rules`)
- **Publik**: Seluruh pengunjung (tanpa login) dapat membaca (`allow read: if true;`) koleksi `recipes`, `comments`, dan profil publik `users`.
- **Pengguna Login**:
  - Hanya dapat membuat resep dengan `authorId` yang cocok dengan UID akun miliknya.
  - Hanya dapat memperbarui atau menghapus resep miliknya sendiri (`isOwner(userId)`).
  - Resep bawaan sistem (`isDefault == true`) tidak dapat dihapus oleh siapa pun.
  - Pembaruan rating diperbolehkan untuk pengguna login lain hanya pada field `rating` dan `ratingCount`.
- **Privasi Daftar Belanja**: Subkoleksi `shopping_items` **hanya dapat dibaca dan ditulis oleh pemilik akun yang bersangkutan** (`isOwner(userId)`).

### 8.2 Indeks Komposit (`firestore.indexes.json`)
Menyediakan indeks gabungan untuk mendukung filter komprehensif pada halaman eksplorasi:
1. `recipes` -> `region` (ASC) + `createdAt` (DESC)
2. `recipes` -> `category` (ASC) + `createdAt` (DESC)
3. `recipes` -> `difficulty` (ASC) + `createdAt` (DESC)
4. `recipes` -> `spicy` (ASC) + `createdAt` (DESC)

---

## 9. Internasionalisasi & Lokalisasi (i18n)

Resepedia mendukung antarmuka dwibahasa:
- **ID**: Bahasa Indonesia (Default)
- **EN**: English

### Cara Kerja:
1. Dikelola oleh [LanguageContext.tsx](file:///c:/Users/dipsk/Ngoding%20Terus/Resepedia/src/contexts/LanguageContext.tsx) dan kamus [translations.ts](file:///c:/Users/dipsk/Ngoding%20Terus/Resepedia/src/translations.ts).
2. Fungsi `t('Kunci Teks')` menyediakan terjemahan instan pada setiap komponen.
3. Pilihan bahasa tersimpan otomatis di `localStorage` dan profil Firestore pengguna, sehingga preferensi tetap terjaga pada kunjungan berikutnya.

---

## 10. Responsivitas Mobile & Sistem Desain

Resepedia menerapkan filosofi **Mobile-First Responsive Design**:
- **Bilah Navigasi Bawah (`MobileBottomNav`)**: Terlihat khusus layar ponsel (`md:hidden`) dengan tombol melayang *"Tulis Resep"* di tengah dan dukungan `safe-area-inset-bottom` untuk ponsel tanpa tombol fisik (iPhone / modern Android).
- **Sticky Actions Safety**: Tombol simpan melayang pada halaman formulir edit diposisikan `bottom-20 md:bottom-4` agar tidak tertutup oleh bilah navigasi bawah.
- **Touch-Friendly Controls**: Tombol hapus bahan pada daftar belanja selalu terlihat di mobile (`opacity-100 sm:opacity-0 sm:group-hover:opacity-100`) karena layar sentuh tidak mendukung *mouse hover*.
- **Desain Formulir Adaptif**: Komposisi bahan pada form tambah/edit resep otomatis beralih dari satu baris penuh menjadi kartu bertingkat di layar kecil, menjaga keterbacaan kolom nama bahan dan takaran.
- **Aturan CSS Modern**: Menggunakan `overflow-x: clip;` pada tag `body` untuk mencegah pergeseran horizontal tanpa mematikan fitur `position: sticky` pada navigasi atas dan bilah aksi.
- **Sintaks Kanonikal Tailwind v4**: Seluruh kelas utilitas mematuhi spesifikasi v4 (`aspect-4/3`, `max-w-37.5`, `stroke-3`, `z-9999`, `bg-linear-to-t`).

---

## 11. Panduan Instalasi & Pengembangan Lokal

### 11.1 Prasyarat
- **Node.js**: Versi 20.x LTS atau lebih baru.
- **npm** atau **pnpm**.
- Proyek **Google Firebase** dengan Firestore & Auth diaktifkan.
- Kunci API **Google Gemini** dari [Google AI Studio](https://aistudio.google.com/).

### 11.2 Langkah Instalasi
1. **Clone repository**:
   ```bash
   git clone https://github.com/Kaisen-7/Resepedia.git
   cd Resepedia
   ```

2. **Pasang seluruh dependensi**:
   ```bash
   npm install
   ```

3. **Buat berkas konfigurasi lingkungan (`.env.local`)**:
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

   # Firebase Admin SDK (Opsional untuk lingkungan lokal, wajib di produksi)
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@resepedia-app.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
   ```

4. **Jalankan Seeder Resep Awal (Opsional)**:
   ```bash
   npm run seed:firestore
   ```

5. **Jalankan Server Pengembangan**:
   ```bash
   npm run dev
   ```
   Buka peramban di [http://localhost:3000](http://localhost:3000).

---

## 12. Panduan Deployment Produksi (Vercel & Firebase)

### 12.1 Deploy ke Vercel
1. Hubungkan repository GitHub `Kaisen-7/Resepedia` ke akun [Vercel](https://vercel.com).
2. Pada pengaturan proyek Vercel, masukkan seluruh *Environment Variables* dari `.env.local`:
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` *(Pastikan format baris baru `\n` terbaca dengan benar)*
3. Framework Preset: **Next.js**.
4. Klik **Deploy**. Setiap *push* ke branch `main` akan memicu build produksi otomatis.

### 12.2 Deploy Aturan Keamanan Firebase
Gunakan Firebase CLI untuk mengunggah aturan keamanan dan indeks:
```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

---

## 13. Catatan Pemecahan Masalah & Rekayasa Teknis

Dalam pengembangan Resepedia, beberapa kendala teknis krusial berhasil dipecahkan dengan solusi arsitektur yang kokoh:

1. **Error Serverless Vercel `ERR_REQUIRE_ESM` pada `jose` / `jwks-rsa`**:
   - *Masalah*: `firebase-admin@^14.x` mengimpor `jwks-rsa` yang me-`require()` modul ESM `jose` v5/v6, memicu error 500 runtime pada serverless Next.js.
   - *Solusi*: Menggunakan versi stabil `firebase-admin@^13.1.0` dan menambahkan package override `"jose": "^4.15.9"` pada `package.json` untuk menjamin kompatibilitas runtime CommonJS/ESM.

2. **Video YouTube Menolak Terhubung (Connection Refused)**:
   - *Masalah*: Embed YouTube standar sering ditolak oleh kebijakan keamanan browser atau header `X-Frame-Options`.
   - *Solusi*: Modul [youtube.ts](file:///c:/Users/dipsk/Ngoding%20Terus/Resepedia/src/lib/utils/youtube.ts) secara otomatis mengekstrak ID video dan mengonversi link menjadi `https://www.youtube-nocookie.com/embed/{id}` dengan atribut `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"` dan `allowFullScreen`.

3. **Hilangnya Tombol Tulis Resep & Elemen Tertutup di Mobile**:
   - *Masalah*: Di layar kecil, tombol aksi di navbar tersembunyi dan bilah bawah menutupi tombol simpan form.
   - *Solusi*: Ditambahkan `MobileBottomNav` dengan tombol tengah *action button* `+ Tulis`, serta layout padding dinamis `pb-20 md:pb-0` pada `main` dan `bottom-20 md:bottom-4` pada bar aksi formulir.

4. **Kemandirian Pengguna Tamu (Guest Mode)**:
   - *Masalah*: Pengguna yang belum login kehilangan bookmark dan daftar belanja ketika me-refresh browser.
   - *Solusi*: Dibuat modul sinkronisasi ganda (`recipe-storage.ts` & `shopping-storage.ts`) yang menyimpan data di `localStorage` saat offline/guest dan menyinkronkannya ke Firestore saat pengguna melakukan login Google.

---

*Dokumentasi ini disusun secara komprehensif untuk pengembang, kontributor, dan pemangku kepentingan proyek Resepedia.*
