'use client';

import { useState, useRef, useEffect } from 'react';
import { addWabaPhoneNumber } from 'lib/facebook';
import { Icons } from './icons';

const COUNTRIES = [
  { name: 'Brasil', cc: '55' },
  { name: 'Portugal', cc: '351' },
  { name: 'Estados Unidos', cc: '1' },
  { name: 'Argentina', cc: '54' },
  { name: 'México', cc: '52' },
  { name: 'Colômbia', cc: '57' },
  { name: 'Chile', cc: '56' },
  { name: 'Peru', cc: '51' },
  { name: 'Equador', cc: '593' },
  { name: 'Venezuela', cc: '58' },
  { name: 'Bolívia', cc: '591' },
  { name: 'Paraguai', cc: '595' },
  { name: 'Uruguai', cc: '598' },
  { name: 'Espanha', cc: '34' },
  { name: 'França', cc: '33' },
  { name: 'Alemanha', cc: '49' },
  { name: 'Reino Unido', cc: '44' },
  { name: 'Itália', cc: '39' },
  { name: 'Países Baixos', cc: '31' },
  { name: 'Canadá', cc: '1' },
  { name: 'Austrália', cc: '61' },
  { name: 'Índia', cc: '91' },
  { name: 'China', cc: '86' },
  { name: 'Japão', cc: '81' },
  { name: 'Coreia do Sul', cc: '82' },
  { name: 'África do Sul', cc: '27' },
  { name: 'Nigéria', cc: '234' },
  { name: 'Angola', cc: '244' },
  { name: 'Moçambique', cc: '258' },
  { name: 'Cabo Verde', cc: '238' },
];

type Props = {
  wabaId: string;
  onSuccess: () => void;
  onClose: () => void;
};

export const AddPhoneNumberModal = ({ wabaId, onSuccess, onClose }: Props) => {
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [countryQuery, setCountryQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verifiedName, setVerifiedName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = countryQuery.trim()
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(countryQuery.toLowerCase()) || c.cc.includes(countryQuery))
    : COUNTRIES;

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setCountryQuery('');
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleSelectCountry = (c: typeof COUNTRIES[0]) => {
    setCountry(c);
    setShowDropdown(false);
    setCountryQuery('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      const numericPhone = phoneNumber.replace(/\D/g, '');
      await addWabaPhoneNumber(wabaId, { cc: country.cc, phone_number: numericPhone, verified_name: verifiedName });
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
            <label className='mb-1 block text-xs font-medium text-gray-700'>País</label>
            <div className='relative' ref={dropdownRef}>
              <button
                type='button'
                onClick={() => { setShowDropdown(v => !v); setCountryQuery(''); }}
                className='flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              >
                <span>{country.name} <span className='text-gray-400'>(+{country.cc})</span></span>
                <Icons.ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-90' : 'rotate-0'}`} />
              </button>

              {showDropdown && (
                <div className='absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg'>
                  <div className='p-2'>
                    <input
                      type='text'
                      autoFocus
                      value={countryQuery}
                      onChange={e => setCountryQuery(e.target.value)}
                      placeholder='Buscar país ou código...'
                      className='block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                    />
                  </div>
                  <ul className='max-h-48 overflow-y-auto'>
                    {filtered.length === 0 ? (
                      <li className='px-3 py-2 text-xs text-gray-400'>Nenhum país encontrado</li>
                    ) : filtered.map(c => (
                      <li key={`${c.name}-${c.cc}`}>
                        <button
                          type='button'
                          onClick={() => handleSelectCountry(c)}
                          className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-blue-50 ${country.name === c.name ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-900'}`}
                        >
                          <span>{c.name}</span>
                          <span className='text-gray-400'>+{c.cc}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className='mb-1 block text-xs font-medium text-gray-700'>Número de telefone</label>
            <input
              type='text'
              inputMode='numeric'
              pattern='\d*'
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              placeholder='11999999999'
              required
              className='block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='mb-1 block text-xs font-medium text-gray-700'>Nome de exibição</label>
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
            <div className='flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5'>
              <Icons.XCircle className='mt-0.5 h-4 w-4 shrink-0 text-red-500' />
              <p className='text-xs text-red-700 break-words'>{error}</p>
            </div>
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
