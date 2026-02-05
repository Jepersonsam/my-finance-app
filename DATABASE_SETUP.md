# Setup Database PostgreSQL

## Untuk Development Lokal

1. **Install PostgreSQL** di komputer Anda
   - Windows: Download dari https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Buat Database**
   ```bash
   # Login ke PostgreSQL
   psql -U postgres
   
   # Buat database
   CREATE DATABASE my_finance_app;
   
   # Keluar
   \q
   ```

3. **Update `.env.local`**
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/my_finance_app
   ```
   Ganti `username` dan `password` dengan kredensial PostgreSQL Anda.

4. **Jalankan aplikasi**
   ```bash
   npm run dev
   ```
   
   Database tables akan otomatis dibuat saat pertama kali API dipanggil.

## Untuk Deployment di Vercel

1. **Buat Vercel Postgres Database**
   - Login ke Vercel Dashboard
   - Pilih project Anda
   - Pergi ke tab "Storage"
   - Klik "Create Database" → Pilih "Postgres"
   - Database akan otomatis dibuat dan `DATABASE_URL` akan ditambahkan ke environment variables

2. **Atau gunakan provider PostgreSQL lain:**
   - **Neon** (https://neon.tech) - Gratis tier tersedia
   - **Supabase** (https://supabase.com) - Gratis tier tersedia
   - **Railway** (https://railway.app) - Gratis tier tersedia

3. **Set Environment Variables di Vercel:**
   - `DATABASE_URL` - Connection string dari provider PostgreSQL
   - `JWT_SECRET` - Secret key untuk JWT (gunakan random string yang kuat)

4. **Deploy:**
   ```bash
   vercel --prod
   ```

   Database tables akan otomatis dibuat saat pertama kali API dipanggil setelah deployment.

## Catatan Penting

- Database tables akan otomatis dibuat saat pertama kali API dipanggil (register/login)
- Tidak perlu menjalankan migration manual
- Pastikan `DATABASE_URL` sudah benar di environment variables
- Untuk production, ubah `JWT_SECRET` menjadi random string yang kuat

## Troubleshooting

**Error: "relation does not exist"**
- Pastikan database sudah dibuat
- Pastikan `DATABASE_URL` benar
- Coba restart aplikasi

**Error: "password authentication failed"**
- Periksa username dan password di `DATABASE_URL`
- Pastikan user PostgreSQL memiliki akses ke database

**Error: "could not connect to server"**
- Pastikan PostgreSQL service berjalan
- Periksa port (default: 5432)
- Periksa firewall settings
