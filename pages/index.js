import Link from 'next/link';
import { useRouter } from 'next/router';

export default function LandingPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
            {/* Header */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                MyFinance
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/login">
                                <button className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                                    Masuk
                                </button>
                            </Link>
                            <Link href="/register">
                                <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full hover:shadow-lg transition-all duration-300 font-medium">
                                    Mulai Gratis
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        Kelola Keuangan Anda
                        <span className="block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                            dengan Mudah
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Aplikasi pencatatan keuangan yang membantu Anda melacak pemasukan, pengeluaran,
                        dan mencapai tujuan finansial dengan visualisasi data yang intuitif.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link href="/register">
                            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full hover:shadow-xl transition-all duration-300 font-semibold text-lg">
                                Mulai Gratis Sekarang
                            </button>
                        </Link>
                        <Link href="/login">
                            <button className="px-8 py-4 bg-white text-gray-700 rounded-full hover:shadow-lg transition-all duration-300 font-semibold text-lg border-2 border-gray-200">
                                Sudah Punya Akun
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Fitur Unggulan</h2>
                    <p className="text-xl text-gray-600">Semua yang Anda butuhkan untuk mengelola keuangan</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300">
                        <div className="text-5xl mb-4">📊</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Tracking Real-time</h3>
                        <p className="text-gray-600">
                            Catat setiap transaksi dengan mudah dan lihat saldo Anda secara real-time.
                            Kategorisasi otomatis membantu Anda memahami pola pengeluaran.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300">
                        <div className="text-5xl mb-4">💰</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Budgeting & Savings</h3>
                        <p className="text-gray-600">
                            Buat anggaran bulanan dan target tabungan. Pantau progress Anda dan
                            dapatkan notifikasi saat mendekati batas anggaran.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300">
                        <div className="text-5xl mb-4">📈</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Visualisasi Data</h3>
                        <p className="text-gray-600">
                            Grafik dan chart interaktif membantu Anda memahami kondisi keuangan.
                            Export laporan dalam format Excel atau PDF.
                        </p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Cara Kerja</h2>
                    <p className="text-xl text-gray-600">Mulai dalam 3 langkah mudah</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Step 1 */}
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                            1
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Daftar Gratis</h3>
                        <p className="text-gray-600">
                            Buat akun dalam hitungan detik. Tidak perlu kartu kredit.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                            2
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Input Transaksi</h3>
                        <p className="text-gray-600">
                            Catat pemasukan dan pengeluaran Anda dengan interface yang intuitif.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                            3
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Analisis Keuangan</h3>
                        <p className="text-gray-600">
                            Lihat laporan lengkap dan insight untuk keputusan finansial yang lebih baik.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-12 text-center text-white">
                    <h2 className="text-4xl font-bold mb-4">Siap Mengelola Keuangan Anda?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Bergabunglah dengan ribuan pengguna yang sudah merasakan manfaatnya
                    </p>
                    <Link href="/register">
                        <button className="px-8 py-4 bg-white text-blue-600 rounded-full hover:shadow-2xl transition-all duration-300 font-semibold text-lg">
                            Mulai Gratis Sekarang →
                        </button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-400">
                        © 2024 MyFinance. Kelola keuangan Anda dengan bijak.
                    </p>
                </div>
            </footer>
        </div>
    );
}
