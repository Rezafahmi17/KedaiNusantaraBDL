# Kedai Kopi Nusantara

Aplikasi web Kedai Kopi Nusantara yang dibangun menggunakan **React**, **Vite**, dan **Tailwind CSS**. Mengadopsi gaya desain **Neobrutalism UI** dengan ciri khas border tebal, warna kontras yang berani, dan bayangan solid.

## Fitur Utama

- **Landing Page**: Menampilkan informasi kedai, menu, galeri, dan cerita tentang Kopi Nusantara.
- **Sistem Pemesanan QR**: 
  - **QR Simulator**: Admin dapat mensimulasikan dan mencetak QR Code untuk masing-masing meja.
  - **Halaman Pemesanan (Customer)**: Pelanggan yang memindai QR Code akan diarahkan ke halaman pemesanan otomatis sesuai dengan nomor mejanya.
- **Admin Dashboard**: Panel khusus admin untuk memantau pesanan yang masuk dan riwayat transaksi.
- **Desain Neobrutalism**: Antarmuka pengguna yang mencolok, tebal, responsif, dan memberikan pengalaman interaktif yang unik.

## Teknologi yang Digunakan

- **Frontend Framework**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animasi**: [Framer Motion](https://www.framer.com/motion/)
- **Ikon**: [React Icons](https://react-icons.github.io/react-icons/)

## Struktur Folder

Project utama berada di dalam direktori `Nusantara/`. Berikut adalah struktur dasarnya:

```text
KopiNusantara/
├── Nusantara/
│   ├── public/              # Aset publik statis
│   ├── src/                 # Source code utama (React)
│   │   ├── components/      # Komponen UI (Navbar, Hero, AdminDashboard, dll.)
│   │   ├── data/            # Data statis (contoh: menuData.js)
│   │   ├── utils/           # Fungsi utilitas (storage lokal, export, dll.)
│   │   ├── App.jsx          # Komponen utama dan sistem routing manual
│   │   ├── main.jsx         # Entry point React
│   │   └── index.css        # Konfigurasi Tailwind & Neobrutalism styling
│   ├── server.js            # Simulasi backend/server
│   ├── tailwind.config.js   # Konfigurasi Tailwind CSS
│   └── package.json         # Dependensi proyek
└── README.md
```

## Cara Menjalankan secara Lokal

1. Masuk ke direktori `Nusantara`:
   ```bash
   cd Nusantara
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   ```
4. Buka browser dan akses alamat yang diberikan (biasanya `http://localhost:5173`).

## Cara Build untuk Produksi

Untuk mem-build proyek (misalnya untuk di-deploy ke Netlify atau Vercel), jalankan:

```bash
cd Nusantara
npm run build
```
Hasil build akan berada di dalam folder `Nusantara/dist/`.

## Akses Admin Login

Untuk mengakses halaman Admin Dashboard (`/#admin`), gunakan kredensial berikut:

- **Username**: `admin`
- **Password**: `kopi123`

## URL Khusus

- **Halaman Utama**: `/`
- **Dashboard Admin**: `/#admin`
- **QR Simulator**: `/#qr-simulator`
- **Pemesanan Meja**: `/#meja=[NomorMeja]` (Contoh: `/#meja=5`)

---

*Dikembangkan oleh Reza Fahmi Alkhamdani*
