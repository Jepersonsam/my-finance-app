import '@/styles/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const publicPages = ['/login', '/register'];
      const isPublicPage = publicPages.includes(router.pathname);

      if (!token && !isPublicPage) {
        router.push('/login');
      } else {
        setIsAuthenticated(!!token);
      }
      setLoading(false);
    }
  }, [router.pathname]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Don't show layout on login/register pages
  if (router.pathname === '/login' || router.pathname === '/register') {
    return <Component {...pageProps} />;
  }

  return (
    <NotificationProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </NotificationProvider>
  );
}
