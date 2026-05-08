'use client';

import { useState, useRef, useEffect } from 'react';
import { Link } from 'waku';
import { supabase } from 'lib/supabase';
import { useAuth } from 'lib/useAuth';
import { Navigation } from 'components/navigation';

export const Header = () => {
  const { user, isAuthenticated } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await supabase.auth.signOut();
  };

  return (
    <header className='border-b border-gray-200 bg-white shadow-sm lg:fixed lg:left-0 lg:right-0 lg:top-0 lg:z-10'>
      <nav className='mx-auto flex max-w-7xl items-center justify-between p-4'>
        <div className='flex items-center gap-8'>
          <h2 className='text-lg font-bold tracking-tight'>
            <Link to='/' className='text-gray-900 hover:text-gray-700'>
              Mdmed Alerts
            </Link>
          </h2>

          <Navigation />
        </div>

        {isAuthenticated ? (
          <div className='relative' ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(prev => !prev)}
              className='inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900'
            >
              <span className='hidden sm:block'>
                {user?.user_metadata?.name || user?.email}
              </span>
              <svg className={`h-3.5 w-3.5 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
              </svg>
            </button>
            {userMenuOpen && (
              <div className='absolute right-0 z-50 mt-1 w-52 rounded-lg border border-gray-100 bg-white py-1 shadow-lg'>
                <Link
                  to='/privacy-policy'
                  onClick={() => setUserMenuOpen(false)}
                  className='block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50'
                >
                  Política de Privacidade
                </Link>
                <div className='my-1 border-t border-gray-100' />
                <button
                  onClick={handleLogout}
                  className='block w-full px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50'
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className='text-sm text-gray-600'>
            <Link to='/' className='font-medium text-blue-600 hover:text-blue-700'>
              Fazer login
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};
