'use client';

import { dbGetWhatsappNumbers } from 'lib/supabase';
import { syncWhatsappNumbers } from 'lib/sync-numbers';
import { useEffect, useState } from 'react';
import { Database } from 'types/database.types';

type WhatsappNumber = Database['public']['Tables']['whatsapp_phone_numbers']['Row'];

const StatusBadge = ({ status }: { status: string }) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-gray-100 text-gray-800',
  };
  
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[status as keyof typeof colors] || colors.inactive}`}>
      {status}
    </span>
  );
};

const QualityBadge = ({ rating }: { rating: string | null }) => {
  const colors = {
    GREEN: 'bg-green-100 text-green-800',
    YELLOW: 'bg-yellow-100 text-yellow-800',
    RED: 'bg-red-100 text-red-800',
    UNKNOWN: 'bg-gray-100 text-gray-800',
  };
  
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[(rating || 'UNKNOWN') as keyof typeof colors] || colors.UNKNOWN}`}>
      {rating || 'Unknown'}
    </span>
  );
};

const InfoAlert = () => (
  <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
    <div className='flex items-start gap-3'>
      <svg className='h-5 w-5 flex-shrink-0 text-blue-600' fill='currentColor' viewBox='0 0 20 20'>
        <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' />
      </svg>
      <div className='flex-1'>
        <p className='text-sm font-medium text-blue-900'>Manter dados sincronizados</p>
        <p className='mt-1 text-sm text-blue-700'>Clique no botão "Atualizar" para buscar as alterações mais recentes do Meta Business Manager.</p>
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className='rounded-lg border border-gray-200 bg-gray-50 p-8 text-center'>
    <p className='text-gray-600'>Nenhum número do WhatsApp cadastrado ainda.</p>
  </div>
);

const LoadingState = () => (
  <div className='flex items-center justify-center p-8'>
    <div className='text-gray-500'>Carregando números...</div>
  </div>
);

const RefreshButton = ({ onClick, loading }: { onClick: () => void; loading: boolean }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className='flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50'
  >
    <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
    </svg>
    Atualizar
  </button>
);

const NumberRow = ({ number }: { number: WhatsappNumber }) => (
  <tr className='hover:bg-gray-50'>
    <td className='whitespace-nowrap px-6 py-4'>
      <div className='flex items-center'>
        <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100'>
          <svg className='h-5 w-5 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
            <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
          </svg>
        </div>
        <div className='ml-4'>
          <div className='text-sm font-medium text-gray-900'>{number.display_phone_number}</div>
          <div className='text-xs text-gray-500'>ID: {number.phone_number_id}</div>
        </div>
      </div>
    </td>
    <td className='whitespace-nowrap px-6 py-4'>
      <div className='text-sm text-gray-900'>{number.verified_name || '-'}</div>
    </td>
    <td className='whitespace-nowrap px-6 py-4'>
      <QualityBadge rating={number.quality_rating} />
    </td>
    <td className='whitespace-nowrap px-6 py-4'>
      <StatusBadge status={number.status} />
    </td>
  </tr>
);

const NumbersTable = ({ numbers, onRefresh, loading }: { numbers: WhatsappNumber[]; onRefresh: () => void; loading: boolean }) => (
  <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
    <div className='flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-3'>
      <h3 className='text-sm font-semibold text-gray-700'>Números do WhatsApp</h3>
      <RefreshButton onClick={onRefresh} loading={loading} />
    </div>
    <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Número
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Nome Verificado
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Qualidade
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Status
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200 bg-white'>
          {numbers.map((number) => (
            <NumberRow key={number.id} number={number} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const WhatsappNumbersTable = () => {
  const [numbers, setNumbers] = useState<WhatsappNumber[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNumbers = async () => {
    setLoading(true);
    await syncWhatsappNumbers();
    const { data } = await dbGetWhatsappNumbers();
    setNumbers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNumbers();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className='space-y-4'>
      <InfoAlert />
      {numbers.length === 0 ? <EmptyState /> : <NumbersTable numbers={numbers} onRefresh={fetchNumbers} loading={loading} />}
    </div>
  );
};