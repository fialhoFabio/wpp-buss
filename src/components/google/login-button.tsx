'use client';

import { supabase } from 'lib/supabase';

export function LoginWithGoogleButton() {
  async function login() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) console.error(error);
  }

  return (
    <button
      onClick={login}
      className='rounded-sm bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
    >
      Entrar com Google
    </button>
  );
}
