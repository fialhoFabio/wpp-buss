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
      className='rounded-sm bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
    >
      Entrar com Facebook
    </button>
  );
}
