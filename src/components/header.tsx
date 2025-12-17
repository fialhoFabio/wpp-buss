'use client';

import { Link } from 'waku';
import { supabase } from 'lib/supabase';
import { useAuth } from 'lib/useAuth';
import { Navigation } from 'components/navigation';

export const Header = () => {
  const { user, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className='border-b border-gray-200 bg-white shadow-sm lg:fixed lg:left-0 lg:right-0 lg:top-0 lg:z-10'>
      <nav className='mx-auto flex max-w-7xl items-center justify-between p-4'>
        <div className='flex items-center gap-8'>
          <h2 className='text-lg font-bold tracking-tight'>
            <Link to='/' className='text-gray-900 hover:text-gray-700'>
              WhatsApp Business
            </Link>
          </h2>
          
          <Navigation />
        </div>

        {isAuthenticated ? (
          <div className='flex items-center gap-4'>
            <span className='hidden text-sm text-gray-600 sm:block'>
              {user?.user_metadata?.name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className='rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700'
            >
              Sair
            </button>
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
