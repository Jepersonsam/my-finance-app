# My Finance App - Aplikasi Pencatatan Keuangan

Aplikasi web untuk pencatatan dan pengelolaan keuangan pribadi yang dibangun dengan Next.js, React, dan Tailwind CSS.

## Fitur Utama

### 1. Dashboard
- Tampilan saldo total, pemasukan, dan pengeluaran
- Grafik visualisasi keuangan
- Daftar transaksi terbaru

### 2. Transaksi
- Pencatatan pemasukan dan pengeluaran
- Kategorisasi transaksi
- Edit dan hapus transaksi

### 3. Laporan
- Laporan keuangan dengan filter periode
- Grafik pemasukan vs pengeluaran
- Analisis pengeluaran per kategori

### 4. Anggaran (Budgeting)
- Pengaturan anggaran per kategori
- Monitoring pengeluaran terhadap anggaran
- Peringatan saat anggaran hampir habis atau melebihi

### 5. Tabungan (Savings)
- Tujuan tabungan dengan target jumlah
- Progress tracking
- Auto save (opsional)

### 6. Cicilan (Installments)
- Manajemen pembayaran cicilan
- Tracking progress pembayaran
- Pengingat jatuh tempo

### 7. Utang (Debts)
- Pengelolaan utang
- Perhitungan bunga
- Tracking pembayaran utang

### 8. Analisis Keuangan
- Analisis pengeluaran vs pemasukan
- Distribusi pengeluaran per kategori
- Wawasan dan rekomendasi keuangan

### 9. Prediksi Keuangan
- Prediksi keuangan berdasarkan tren historis
- Rekomendasi pengelolaan uang
- Proyeksi saldo bulanan

## Teknologi yang Digunakan

- **Next.js** - Framework React untuk server-side rendering
- **React** - Library untuk membangun UI
- **Tailwind CSS** - Framework CSS utility-first
- **Recharts** - Library untuk visualisasi data dengan chart
- **React Hook Form** - Library untuk manajemen form
- **Axios** - HTTP client untuk API calls
- **MongoDB** - Database (opsional, bisa diganti dengan PostgreSQL)

## Instalasi

1. Clone repository atau download proyek
2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` dan isi dengan konfigurasi database dan JWT secret Anda.

4. Jalankan development server:
```bash
npm run dev
```

5. Buka browser dan akses `http://localhost:3000`

## Struktur Proyek

```
my-finance-app/
├── components/          # Komponen UI reusable
│   ├── Button.js
│   ├── Card.js
│   ├── Input.js
│   ├── Select.js
│   └── Layout.js
├── pages/              # Halaman aplikasi
│   ├── _app.js         # App wrapper
│   ├── index.js        # Dashboard
│   ├── login.js        # Halaman login
│   ├── register.js     # Halaman registrasi
│   ├── transactions.js # Halaman transaksi
│   ├── reports.js      # Halaman laporan
│   ├── budgets.js      # Halaman anggaran
│   ├── savings.js      # Halaman tabungan
│   ├── installments.js # Halaman cicilan
│   ├── debts.js        # Halaman utang
│   ├── analysis.js     # Halaman analisis
│   └── forecast.js     # Halaman prediksi
├── styles/             # Styling
│   └── globals.css     # CSS global
├── utils/              # Utility functions
│   └── format.js       # Format currency, date, dll
├── lib/                # Library dan konfigurasi
│   └── api.js          # API client
└── public/             # Asset statis
```

## Konfigurasi Database

Aplikasi ini mendukung MongoDB dan PostgreSQL. Untuk menggunakan MongoDB:

1. Install MongoDB atau gunakan MongoDB Atlas
2. Update `MONGODB_URI` di `.env.local`

Untuk menggunakan PostgreSQL:

1. Install PostgreSQL
2. Update `DATABASE_URL` di `.env.local`
3. Install driver PostgreSQL yang sesuai

## API Routes (Backend)

Untuk membuat backend API, buat file di folder `pages/api/`:

- `pages/api/auth/login.js` - Endpoint login
- `pages/api/auth/register.js` - Endpoint registrasi
- `pages/api/transactions/` - CRUD transaksi
- `pages/api/budgets/` - CRUD anggaran
- `pages/api/savings/` - CRUD tabungan
- `pages/api/installments/` - CRUD cicilan
- `pages/api/debts/` - CRUD utang

## Fitur Responsive

Aplikasi ini dirancang dengan responsive design menggunakan Tailwind CSS, sehingga dapat diakses dengan baik di desktop dan mobile.

## Pengembangan Lebih Lanjut

Beberapa fitur yang bisa ditambahkan:

- Export laporan ke PDF/Excel
- Notifikasi email untuk pengingat
- Multi-currency support
- Integrasi dengan bank API
- Mobile app dengan React Native
- Dark mode
- Multi-user support

## Lisensi

MIT License

## Kontribusi

Silakan buat issue atau pull request jika ingin berkontribusi pada proyek ini.
