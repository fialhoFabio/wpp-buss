'use client';

import { useState } from 'react';
import { registerWabaPhoneNumber } from 'lib/facebook';
import { Icons } from './icons';

type Props = {
  phoneNumberId: string;
  displayPhoneNumber: string;
  onSuccess: () => void;
  onClose: () => void;
};

export const RegisterPhoneNumberModal = ({ phoneNumberId, displayPhoneNumber, onSuccess, onClose }: Props) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      await registerWabaPhoneNumber(phoneNumberId, { pin });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar número');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50' onClick={onClose}>
      <div className='w-full max-w-md rounded-xl bg-white p-6 shadow-xl' onClick={e => e.stopPropagation()}>

        <div className='mb-1 flex items-center justify-between'>
          <h2 className='text-base font-semibold text-gray-900'>Registrar número</h2>
          <button type='button' onClick={onClose} className='rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600'>
            <Icons.X className='h-4 w-4' />
          </button>
        </div>
        <p className='mb-5 text-xs text-gray-500'>{displayPhoneNumber}</p>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <p className='text-xs text-gray-600'>
            Crie um PIN de 6 dígitos para verificação em duas etapas. Guarde-o em local seguro.
          </p>
          <div>
            <label className='mb-1 block text-xs font-medium text-gray-700'>PIN (6 dígitos)</label>
            <input
              type='password'
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder='••••••'
              maxLength={6}
              minLength={6}
              pattern='\d{6}'
              required
              autoFocus
              className='block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500'
            />
          </div>

          {error !== undefined && (
            <div className='flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5'>
              <Icons.XCircle className='mt-0.5 h-4 w-4 shrink-0 text-red-500' />
              <p className='text-xs text-red-700 break-words'>{error}</p>
            </div>
          )}

          <div className='flex justify-end gap-3 pt-2'>
            <button type='button' onClick={onClose} className='rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'>
              Cancelar
            </button>
            <button type='submit' disabled={loading} className='inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50'>
              {loading && <Icons.Spinner className='h-3.5 w-3.5 text-white' />}
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
