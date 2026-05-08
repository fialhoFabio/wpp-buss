'use client';

import { useState, useMemo } from 'react';
import { fbDebugRequest } from 'lib/facebook';
import { useAuth } from 'lib/useAuth';
import { isDebugUser as checkDebugUser } from 'lib/debug';

const APP_ID = import.meta.env.WAKU_PUBLIC_FB_APP_ID as string;

type Preset = { label: string; method: string; endpoint: string; body?: string; tokenType: 'system_user' | 'app' };

const PRESETS: Preset[] = [
  { label: 'App subscriptions', method: 'GET', endpoint: `${APP_ID}/subscriptions`, tokenType: 'app' as const },
  { label: 'App info', method: 'GET', endpoint: `${APP_ID}?fields=id,name,link`, tokenType: 'app' as const },
  { label: 'WABA subscribed apps', method: 'GET', endpoint: `{WABA_ID}/subscribed_apps`, tokenType: 'system_user' as const },
  { label: 'Subscribe WABA to App', method: 'POST', endpoint: `{WABA_ID}/subscribed_apps`, tokenType: 'system_user' as const },
  { label: 'WABA phone numbers', method: 'GET', endpoint: `{WABA_ID}/phone_numbers`, tokenType: 'system_user' as const },
  { label: 'WABA info', method: 'GET', endpoint: `{WABA_ID}?fields=id,name,currency,timezone_id`, tokenType: 'system_user' as const },
  { label: 'Phone number info', method: 'GET', endpoint: `{PHONE_NUMBER_ID}?fields=id,display_phone_number,verified_name,status,quality_rating,webhook_configuration`, tokenType: 'system_user' as const },
];

const VARIABLE_LABELS: Record<string, string> = {
  WABA_ID: 'WABA ID',
  PHONE_NUMBER_ID: 'Phone Number ID',
};

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-700',
  POST: 'bg-green-100 text-green-700',
  DELETE: 'bg-red-100 text-red-700',
};

const extractVars = (tmpl: string): string[] => {
  const matches = tmpl.match(/\{([^}]+)\}/g) ?? [];
  return [...new Set(matches.map(m => m.slice(1, -1)))];
};

const interpolate = (tmpl: string, vars: Record<string, string>): string =>
  tmpl.replace(/\{([^}]+)\}/g, (_, key) => vars[key] ?? `{${key}}`);

export const FbDebugPanel = () => {
  const { user, loading: authLoading } = useAuth();
  const [endpoint, setEndpoint] = useState('');
  const [method, setMethod] = useState('GET');
  const [body, setBody] = useState('');
  const [tokenType, setTokenType] = useState<'system_user' | 'app'>('system_user');
  const [vars, setVars] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ data: unknown; error?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ endpoint: string; method: string; ok: boolean }>>([]);

  const isDebugUser = !authLoading && checkDebugUser(user?.id);

  const detectedVars = useMemo(() => extractVars(endpoint), [endpoint]);
  const resolvedEndpoint = useMemo(() => interpolate(endpoint, vars), [endpoint, vars]);

  const run = async () => {
    if (!resolvedEndpoint.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await fbDebugRequest(resolvedEndpoint.trim(), method, body.trim() || undefined, tokenType);
    setResult(res);
    setHistory(prev => [{ endpoint: resolvedEndpoint.trim(), method, ok: !res.error }, ...prev.slice(0, 19)]);
    setLoading(false);
  };

  const applyPreset = (preset: Preset) => {
    setEndpoint(preset.endpoint);
    setMethod(preset.method);
    setTokenType(preset.tokenType);
    setBody(preset.body ?? '');
  };

  if (authLoading) {
    return <div className='py-12 text-center text-sm text-gray-400'>A verificar autenticação...</div>;
  }

  if (!isDebugUser) {
    return (
      <div className='flex flex-col items-center gap-2 py-24 text-center'>
        <span className='text-4xl'>🔒</span>
        <p className='text-gray-500 text-sm'>Acesso restrito.</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Debug banner */}
      <div className='rounded-lg border border-dashed border-orange-300 bg-orange-50 px-4 py-3'>
        <p className='text-[10px] font-semibold uppercase tracking-wide text-orange-500'>
          🛠 Debug — Facebook Graph API
        </p>
        <p className='mt-0.5 text-xs text-orange-400'>
          Base URL: <code className='font-mono'>https://graph.facebook.com/v25.0/</code> · Auth: System User Token
        </p>
      </div>

      {/* Presets */}
      <div>
        <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400'>Presets</p>
        <div className='flex flex-wrap gap-2'>
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className='inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600'
            >
              <span className={`inline-block rounded px-1 py-0.5 text-[10px] font-bold ${METHOD_COLORS[p.method] ?? 'bg-gray-100 text-gray-600'}`}>{p.method}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Request builder */}
      <div className='rounded-lg border border-gray-200 bg-white p-4 space-y-3'>
        <p className='text-xs font-semibold uppercase tracking-wide text-gray-400'>Requisição</p>

        <div className='flex gap-2'>
          <select
            value={method}
            onChange={e => setMethod(e.target.value)}
            className='rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400'
          >
            <option>GET</option>
            <option>POST</option>
            <option>DELETE</option>
          </select>
          <select
            value={tokenType}
            onChange={e => setTokenType(e.target.value as 'system_user' | 'app')}
            className='rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400'
            title='Token type'
          >
            <option value='system_user'>System User Token</option>
            <option value='app'>App Token</option>
          </select>
          <div className='flex flex-1 items-center rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400'>
            <span className='mr-1 shrink-0 font-mono text-xs'>https://graph.facebook.com/v25.0/</span>
            <input
              type='text'
              value={endpoint}
              onChange={e => setEndpoint(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && run()}
              placeholder='<ID>/subscriptions'
              className='min-w-0 flex-1 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none'
            />
          </div>
          <button
            onClick={run}
            disabled={loading || !endpoint.trim()}
            className='inline-flex items-center gap-1.5 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50'
          >
            {loading ? '...' : 'Enviar'}
          </button>
        </div>

        {/* Variable inputs */}
        {detectedVars.length > 0 && (
          <div className='rounded-md border border-blue-100 bg-blue-50 p-3 space-y-2'>
            <p className='text-[10px] font-semibold uppercase tracking-wide text-blue-400'>Variáveis</p>
            <div className='flex flex-wrap gap-3'>
              {detectedVars.map(v => (
                <label key={v} className='flex flex-col gap-1'>
                  <span className='text-[11px] font-medium text-blue-600 font-mono'>{`{${v}}`}</span>
                  <input
                    type='text'
                    value={vars[v] ?? ''}
                    onChange={e => setVars(prev => ({ ...prev, [v]: e.target.value }))}
                    placeholder={VARIABLE_LABELS[v] ?? v}
                    className='rounded-md border border-blue-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 w-56'
                  />
                </label>
              ))}
            </div>
            {detectedVars.some(v => vars[v]) && (
              <p className='text-[11px] text-blue-400 font-mono truncate'>
                → {resolvedEndpoint}
              </p>
            )}
          </div>
        )}

        {method !== 'GET' && method !== 'DELETE' && (
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder='Request body (JSON opcional)'
            rows={4}
            className='w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-700 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400'
          />
        )}
      </div>

      {/* Result */}
      {result !== null && (
        <div className='rounded-lg border border-gray-200 bg-white p-4 space-y-2'>
          <div className='flex items-center justify-between'>
            <p className={`text-[10px] font-semibold uppercase tracking-wide ${result.error ? 'text-red-500' : 'text-green-600'}`}>
              {result.error ? '✗ Erro' : '✓ Resposta'}
            </p>
            <button
              onClick={() => {
                void navigator.clipboard.writeText(JSON.stringify(result.error ? result : result.data, null, 2));
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className='inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700'
            >
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
          {result.error && (
            <p className='text-sm text-red-600'>{result.error}</p>
          )}
          <pre className='max-h-96 overflow-auto rounded bg-gray-950 p-3 text-[11px] text-green-300 whitespace-pre-wrap'>
            {JSON.stringify(result.error ? result : result.data, null, 2)}
          </pre>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400'>Histórico desta sessão</p>
          <div className='space-y-1'>
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => { setEndpoint(h.endpoint); setMethod(h.method); }}
                className='flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs transition-colors hover:bg-gray-50'
              >
                <span className={`inline-block rounded px-1 py-0.5 text-[10px] font-bold ${METHOD_COLORS[h.method] ?? 'bg-gray-100 text-gray-600'}`}>{h.method}</span>
                <span className={`font-mono ${h.ok ? 'text-gray-600' : 'text-red-500'}`}>{h.endpoint}</span>
                <span className='ml-auto'>{h.ok ? '✓' : '✗'}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
