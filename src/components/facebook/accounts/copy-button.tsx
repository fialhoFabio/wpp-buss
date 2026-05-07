'use client';

import { useState } from 'react';
import { Icons } from './icons';

export const CopyButton = ({ text, label }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!text) return null;

  return (
    <button
      onClick={handleCopy}
      className={`group relative flex items-center gap-2 rounded-md border px-2 py-1 text-xs transition-colors
        ${copied
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
        }`}
      title='Clique para copiar'
    >
      {label && <span className='font-medium text-gray-500'>{label}</span>}
      <code className='font-mono'>{text}</code>
      <div className='ml-1'>
        {copied ? <Icons.Check className='h-3 w-3' /> : <Icons.Copy className='h-3 w-3 opacity-40 group-hover:opacity-100' />}
      </div>
    </button>
  );
};
