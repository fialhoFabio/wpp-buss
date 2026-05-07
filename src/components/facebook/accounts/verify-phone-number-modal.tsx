'use client';

import { useState } from 'react';
import { requestWabaPhoneNumberCode, verifyWabaPhoneNumberCode, registerWabaPhoneNumber } from 'lib/facebook';
import { Icons } from './icons';

type Step = 'request' | 'verify' | 'register';

type Props = {
  phoneNumberId: string;
  displayPhoneNumber: string;
  onSuccess: () => void;
  onClose: () => void;
};

const STEP_LABELS: Record<Step, string> = {
  request: '1. Enviar código',
  verify: '2. Confirmar código',
  register: '3. Registrar',
};

export const VerifyPhoneNumberModal = ({ phoneNumberId, displayPhoneNumber, onSuccess, onClose }: Props) => {
  const [step, setStep] = useState<Step>('request');
  const [codeMethod, setCodeMethod] = useState('SMS');
  const [language, setLanguage] = useState('pt_BR');
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      await requestWabaPhoneNumberCode(phoneNumberId, { code_method: codeMethod, language });
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar código');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      await verifyWabaPhoneNumberCode(phoneNumberId, code);
      setStep('register');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
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

        {/* Header */}
        <div className='mb-1 flex items-center justify-between'>
          <h2 className='text-base font-semibold text-gray-900'>Verificar &amp; Registrar número</h2>
          <button type='button' onClick={onClose} className='rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600'>
            <Icons.X className='h-4 w-4' />
          </button>
        </div>
        <p className='mb-5 text-xs text-gray-500'>{displayPhoneNumber}</p>

        {/* Steps indicator */}
        <div className='mb-6 flex items-center gap-2'>
          {(['request', 'verify', 'register'] as Step[]).map((s, i) => (
            <div key={s} className='flex items-center gap-2'>
              <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold
                ${step === s ? 'bg-blue-600 text-white' : i < ['request', 'verify', 'register'].indexOf(step) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i < (['request', 'verify', 'register'] as Step[]).indexOf(step) ? <Icons.Check className='h-3 w-3' /> : i + 1}
              </div>
              <span className={`text-[11px] font-medium ${step === s ? 'text-blue-600' : 'text-gray-400'}`}>
                {STEP_LABELS[s].replace(/^\d+\. /, '')}
              </span>
              {i < 2 && <span className='text-gray-300'>›</span>}
            </div>
          ))}
        </div>

        {/* Step 1: Request code */}
        {step === 'request' && (
          <form onSubmit={handleRequestCode} className='space-y-4'>
            <div>
              <label className='mb-1 block text-xs font-medium text-gray-700'>Método de envio</label>
              <select
                value={codeMethod}
                onChange={e => setCodeMethod(e.target.value)}
                className='block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              >
                <option value='SMS'>SMS</option>
                <option value='VOICE'>Voz (ligação)</option>
              </select>
            </div>
            <div>
              <label className='mb-1 block text-xs font-medium text-gray-700'>Idioma</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className='block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              >
                <option value='pt_BR'>Português (BR)</option>
                <option value='en_US'>English (US)</option>
                <option value='es_ES'>Español</option>
              </select>
            </div>
            {error !== undefined && <p className='rounded-md bg-red-50 px-3 py-2 text-xs text-red-700'>{error}</p>}
            <div className='flex justify-end gap-3 pt-2'>
              <button type='button' onClick={onClose} className='rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'>Cancelar</button>
              <button type='submit' disabled={loading} className='inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50'>
                {loading && <Icons.Spinner className='h-3.5 w-3.5 text-white' />}
                {loading ? 'Enviando...' : 'Enviar código'}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Verify code */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyCode} className='space-y-4'>
            <p className='text-xs text-gray-600'>Digite o código recebido via {codeMethod === 'SMS' ? 'SMS' : 'ligação'}.</p>
            <div>
              <label className='mb-1 block text-xs font-medium text-gray-700'>Código de verificação</label>
              <input
                type='text'
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder='123456'
                required
                autoFocus
                className='block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              />
            </div>
            {error !== undefined && <p className='rounded-md bg-red-50 px-3 py-2 text-xs text-red-700'>{error}</p>}
            <div className='flex justify-between gap-3 pt-2'>
              <button type='button' onClick={() => { setStep('request'); setError(undefined); }} className='text-xs text-gray-500 underline hover:text-gray-700'>Reenviar código</button>
              <div className='flex gap-3'>
                <button type='button' onClick={onClose} className='rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'>Cancelar</button>
                <button type='submit' disabled={loading} className='inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50'>
                  {loading && <Icons.Spinner className='h-3.5 w-3.5 text-white' />}
                  {loading ? 'Verificando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Step 3: Register with PIN */}
        {step === 'register' && (
          <form onSubmit={handleRegister} className='space-y-4'>
            <p className='text-xs text-gray-600'>Crie um PIN de 6 dígitos para proteger o número.</p>
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
                className='block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              />
            </div>
            {error !== undefined && <p className='rounded-md bg-red-50 px-3 py-2 text-xs text-red-700'>{error}</p>}
            <div className='flex justify-end gap-3 pt-2'>
              <button type='button' onClick={onClose} className='rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'>Cancelar</button>
              <button type='submit' disabled={loading} className='inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50'>
                {loading && <Icons.Spinner className='h-3.5 w-3.5 text-white' />}
                {loading ? 'Registrando...' : 'Registrar número'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
