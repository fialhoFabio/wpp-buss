'use client';

import { supabase } from 'lib/supabase';

export function LoginWithFacebookButton() {
  async function login() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error(error);
  }

  return (
    <button
      onClick={login}
      disabled
      aria-disabled='true'
      title='Login com Facebook temporariamente indisponível'
      className='cursor-not-allowed rounded-sm bg-blue-400 px-4 py-2 text-white opacity-60'
    >
      Entrar com Facebook indisponível
    </button>
  );
}
