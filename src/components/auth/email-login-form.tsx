'use client';

import { useState } from 'react';
import { supabase } from 'lib/supabase';

export function EmailLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        
        if (error) throw error;

        // Check if user exists but just linked (handling the case where Supabase doesn't throw but returns existing user info in some configs)
        if (data.user && data.user.identities && data.user.identities.length === 0) {
             setError('Este e-mail já está cadastrado. Tente fazer login ou usar o Login Social.');
             return;
        }

        setMessage('Verifique seu e-mail para confirmar o cadastro.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
            // Detailed handling for OAuth users trying to use password
            if (error.message === 'Invalid login credentials') {
                throw new Error('E-mail ou senha incorretos. Se você costuma entrar com Google/Facebook, use os botões acima.');
            }
            throw error;
        }
        
        window.location.href = '/link-whatsapp-account'; 
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full space-y-4'>
      <form onSubmit={handleAuth} className='space-y-4'>
        <div>
          <label htmlFor='email' className='block text-xs font-medium text-gray-700'>
            E-mail
          </label>
          <input
            id='email'
            type='email'
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500'
            placeholder='seu@email.com'
          />
        </div>
        <div>
          <div className='flex justify-between items-center'>
            <label htmlFor='password' className='block text-xs font-medium text-gray-700'>
                Senha
            </label>
            {!isSignUp && (
                <button type='button' onClick={() => alert('Função em desenvolvimento. Contate o suporte.')} className='text-xs text-gray-400 hover:text-gray-600'>
                    Esqueceu?
                </button>
            )}
          </div>
          <input
            id='password'
            type='password'
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500'
            placeholder='••••••••'
          />
        </div>

        {error && (
          <div className='rounded-md bg-red-50 p-3 text-xs text-red-600 border border-red-100'>
            {error}
          </div>
        )}
        
        {message && (
          <div className='rounded-md bg-green-50 p-3 text-xs text-green-600 border border-green-100'>
            {message}
          </div>
        )}

        <button
          type='submit'
          disabled={loading}
          className='w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          {loading ? (
             <svg className='animate-spin -ml-1 mr-2 h-4 w-4 text-white' fill='none' viewBox='0 0 24 24'>
               <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
               <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
             </svg>
          ) : null}
          {isSignUp ? 'Criar conta' : 'Entrar'}
        </button>
      </form>

      <div className='text-center pt-2'>
        <button
          type='button'
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
            setMessage(null);
          }}
          className='group text-xs text-gray-500 transition-colors hover:text-gray-900'
        >
          {isSignUp ? (
              <>Já tem uma conta? <span className='font-semibold underline decoration-gray-400 underline-offset-2 group-hover:decoration-gray-900'>Entrar</span></>
          ) : (
              <>Não tem conta? <span className='font-semibold underline decoration-gray-400 underline-offset-2 group-hover:decoration-gray-900'>Cadastre-se</span></>
          )}
        </button>
      </div>
    </div>
  );
}
