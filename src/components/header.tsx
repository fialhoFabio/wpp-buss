'use client';

import { Link, useRouter } from 'waku';
import { supabase } from 'lib/supabase';
import { useAuth } from 'lib/useAuth';

export const Header = () => {
  const { user, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className='flex items-center justify-between gap-4 p-6 lg:fixed lg:left-0 lg:right-0 lg:top-0'>
      <h2 className='text-lg font-bold tracking-tight'>
        <Link to='/'>Whatsapp Business x Mdmed</Link>
      </h2>
      {isAuthenticated && (
        <div className='flex items-center gap-4'>
          <span className='text-sm'>Olá, {user?.user_metadata?.name || user?.email}</span>
          <button
            onClick={handleLogout}
            className='rounded-sm bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700'
          >
            Sair
          </button>
        </div>
      )}
    </header>
  );
};
