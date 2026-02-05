import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { authAPI } from '@/lib/api';

export default function Layout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }

      const handleScroll = () => {
        setScrolled(window.scrollY > 20);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleLogout = () => {
    authAPI.logout();
    router.push('/login');
  };

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/transactions', label: 'Transaksi', icon: '💰' },
    { href: '/budgets', label: 'Anggaran', icon: '📋' },
    { href: '/savings', label: 'Tabungan', icon: '🎯' },
    { href: '/installments', label: 'Cicilan', icon: '📅' },
    { href: '/debts', label: 'Utang', icon: '💳' },
    { href: '/reports', label: 'Laporan', icon: '📈' },
    { href: '/analysis', label: 'Analisis', icon: '🔍' },
    { href: '/forecast', label: 'Prediksi', icon: '🔮' },
  ];

  const isActive = (path) => router.pathname === path;

  return (
    <div className="min-h-screen">
      {/* Glassmorphism Header */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
            ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20'
            : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => router.push('/')}>
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg p-1.5 mr-2">
                <span className="text-xl">💰</span>
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-600">
                MyFinance
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex xl:items-center xl:space-x-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-1.5 ${isActive(item.href)
                      ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-semibold text-slate-800">
                      {user.name || 'User'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {user.email}
                    </span>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-2 p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Keluar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full shadow-md transition-all hover:shadow-lg"
                >
                  Masuk
                </Link>
              )}

              {/* Mobile Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="xl:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
              >
                <span className="text-2xl">{isMenuOpen ? '✕' : '☰'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="xl:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 absolute w-full shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive(item.href)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              {user && (
                <div className="pt-4 mt-2 border-t border-slate-100">
                  <div className="px-4 py-2 flex items-center space-x-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Spacer for Fixed Header */}
      <div className="h-16"></div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        {children}
      </main>
    </div>
  );
}
