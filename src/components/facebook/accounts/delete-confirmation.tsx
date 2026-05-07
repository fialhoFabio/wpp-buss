'use client';

import { useState } from 'react';
import { Icons } from './icons';

export const DeleteConfirmation = ({ onDelete }: { onDelete: () => void }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  if (isConfirming) {
    return (
      <div className='flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200'>
        <span className='text-xs text-red-600 font-medium'>Tem certeza?</span>
        <button
          onClick={onDelete}
          className='rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700'
        >
          Sim
        </button>
        <button
          onClick={() => setIsConfirming(false)}
          className='rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300'
        >
          Não
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsConfirming(true)}
      className='inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700'
    >
      <Icons.Trash className='h-3.5 w-3.5' />
      Excluir
    </button>
  );
};
