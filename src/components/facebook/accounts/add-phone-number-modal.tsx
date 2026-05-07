'use client';

import { useState } from 'react';
import { addWabaPhoneNumber } from 'lib/facebook';
import { Icons } from './icons';

type Props = {
  wabaId: string;
  onSuccess: () => void;
  onClose: () => void;
};

export const AddPhoneNumberModal = ({ wabaId, onSuccess, onClose }: Props) => {
  const [cc, setCc] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verifiedName, setVerifiedName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      await addWabaPhoneNumber(wabaId, { cc, phone_number: phoneNumber, verified_name: verifiedName });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar número');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50' onClick={onClose}>
      <div className='w-full max-w-md rounded-xl bg-white p-6 shadow-xl' onClick={e => e.stopPropagation()}>

        <div className='mb-5 flex items-center justify-between'>
          <h2 className='text-base font-semibold text-gray-900'>Adicionar número de telefone</h2>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          >
            <Icons.X className='h-4 w-4' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='mb-1 block text-xs font-medium text-gray-700'>Código do país (CC)</label>
            <input
              type='text'
              value={cc}
              onChange={e => setCc(e.target.value)}
              placeholder='55'
              required
              className='block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='mb-1 block text-xs font-medium text-gray-700'>Número de telefone</label>
            <input
              type='text'
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder='11999999999'
              required
              className='block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='mb-1 block text-xs font-medium text-gray-700'>Nome verificado</label>
            <input
              type='text'
              value={verifiedName}
              onChange={e => setVerifiedName(e.target.value)}
              placeholder='Meu Negócio'
              required
              className='block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            />
          </div>

          {error !== undefined && (
            <p className='rounded-md bg-red-50 px-3 py-2 text-xs text-red-700'>{error}</p>
          )}

          <div className='flex justify-end gap-3 pt-2'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={loading}
              className='inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50'
            >
              {loading && <Icons.Spinner className='h-3.5 w-3.5 text-white' />}
              {loading ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
