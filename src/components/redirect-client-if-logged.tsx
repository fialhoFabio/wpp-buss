'use client';

import { useEffect } from 'react';
import { supabase } from 'lib/supabase';

export function RedirectClientIfLogged() {
  useEffect(() => {
    async function checkSession() {
      const session = await supabase.auth.getSession();
      console.log('Session:', session);
      if (session.data.session) {
        window.location.href = '/whatsapp-numbers';
      } else {
        console.log('No active session found.');
        window.location.href = '/';
      }
    }
    checkSession();
  }, []);

  return null;
}
