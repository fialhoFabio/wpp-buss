'use client';

import { useEffect } from 'react';
import { supabase } from 'lib/supabase';

export function RedirectClientIfLogged() {
  useEffect(() => {
    async function checkSession() {
      const session = await supabase.auth.getSession();
      if (session.data.session) {
        window.location.href = '/conversations';
      } else {
        window.location.href = '/';
      }
    }
    checkSession();
  }, []);

  return null;
}
