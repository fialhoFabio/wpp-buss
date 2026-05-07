'use client';

import { useState } from 'react';
import { Icons } from './icons';

type Props = {
  onAdd: (wabaId: string) => void;
};

export const DebugWabaPanel = ({ onAdd }: Props) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) {
      onAdd(trimmed);
      setInput('');
    }
  };

  return (
    <div className='rounded-lg border border-dashed border-orange-300 bg-orange-50 px-4 py-3'>
      <p className='mb-2 text-[10px] font-semibold uppercase tracking-wide text-orange-500'>
        🛠 Debug — inspecionar WABA
      </p>
      <form onSubmit={handleSubmit} className='flex gap-2'>
        <input
          type='text'
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder='WABA ID'
          className='block flex-1 rounded-md border border-orange-200 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400'
        />
        <button
          type='submit'
          className='inline-flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600'
        >
          <Icons.Plus className='h-3.5 w-3.5' />
          Inspecionar
        </button>
      </form>
    </div>
  );
};
