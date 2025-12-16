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

  return <button onClick={login}>Entrar com Facebook</button>;
}
