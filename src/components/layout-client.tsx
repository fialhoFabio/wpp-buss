'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'waku';
import { useAuth } from 'lib/useAuth';
import { navigation } from './navigation';

// Rotas que requerem autenticação
const PROTECTED_ROUTES = navigation.filter(item => item.requireAuth).map(item => item.href);

interface LayoutClientProps {
  children: ReactNode;
}

export function LayoutClient({ children }: LayoutClientProps) {
  const { isAuthenticated, loading } = useAuth();
  const { path, push } = useRouter();

  useEffect(() => {
    // Só redireciona depois que terminar de carregar
    if (loading) return;

    const isProtectedRoute = PROTECTED_ROUTES.some(route => path.startsWith(route));
    
    if (isProtectedRoute && !isAuthenticated) {
      push('/');
    } else if (!isProtectedRoute && isAuthenticated) {
      push('/whatsapp-numbers');
    }
  }, [isAuthenticated, loading, path, push]);

  if (loading && PROTECTED_ROUTES.some(route => path.startsWith(route))) {
    return <div className='flex min-h-screen items-center justify-center'>Carregando...</div>;
  }

  return <>{children}</>;
}
