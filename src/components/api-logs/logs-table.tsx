'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from 'lib/useAuth';
import { dbGetApiLogs } from 'lib/supabase';
import { isDebugUser as checkDebugUser } from 'lib/debug';
import type { Database } from 'types/database.types';

type ApiLog = Database['public']['Tables']['api_logs']['Row'];

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-700',
  POST: 'bg-green-100 text-green-700',
  PUT: 'bg-yellow-100 text-yellow-700',
  PATCH: 'bg-orange-100 text-orange-700',
  DELETE: 'bg-red-100 text-red-700',
};

const statusColor = (code: number | null, success: boolean | null) => {
  if (success === false || (code !== null && code >= 400)) return 'text-red-600 font-semibold';
  if (code !== null && code >= 200 && code < 300) return 'text-green-600 font-semibold';
  return 'text-gray-500';
};

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
};

const JsonBlock = ({ value }: { value: unknown }) => (
  <pre className='max-h-48 overflow-auto rounded bg-gray-950 p-2 text-[11px] text-green-300 whitespace-pre-wrap'>
    {JSON.stringify(value, null, 2)}
  </pre>
);

const LogRow = ({ log }: { log: ApiLog }) => {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = log.body !== null || log.response !== null || log.error_message;

  return (
    <>
      <tr
        className={`border-b border-gray-100 transition-colors ${hasDetails ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={() => hasDetails && setExpanded(prev => !prev)}
      >
        <td className='px-3 py-2 text-xs text-gray-400 whitespace-nowrap'>{formatDate(log.created_at)}</td>
        <td className='px-3 py-2'>
          <span className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-bold ${METHOD_COLORS[log.method] ?? 'bg-gray-100 text-gray-600'}`}>
            {log.method}
          </span>
        </td>
        <td className='max-w-xs truncate px-3 py-2 text-sm text-gray-700' title={log.endpoint}>{log.endpoint}</td>
        <td className={`px-3 py-2 text-sm ${statusColor(log.status_code, log.success)}`}>
          {log.status_code ?? '—'}
        </td>
        <td className='px-3 py-2 text-xs text-gray-500 whitespace-nowrap'>
          {log.duration_ms !== null ? `${log.duration_ms} ms` : '—'}
        </td>
        <td className='px-3 py-2 max-w-xs truncate text-xs text-red-500' title={log.error_message ?? undefined}>
          {log.error_message ?? ''}
        </td>
        {hasDetails && (
          <td className='px-3 py-2 text-xs text-gray-400'>
            {expanded ? '▲' : '▼'}
          </td>
        )}
        {!hasDetails && <td />}
      </tr>
      {expanded && (
        <tr className='bg-gray-50'>
          <td colSpan={7} className='px-4 py-3 space-y-2'>
            {log.error_message && (
              <div>
                <p className='mb-1 text-[10px] font-semibold uppercase tracking-wide text-red-500'>Error</p>
                <p className='text-sm text-red-600'>{log.error_message}</p>
              </div>
            )}
            {log.body !== null && (
              <div>
                <p className='mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500'>Request Body</p>
                <JsonBlock value={log.body} />
              </div>
            )}
            {log.response !== null && (
              <div>
                <p className='mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500'>Response</p>
                <JsonBlock value={log.response} />
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
};

export const ApiLogsTable = () => {
  const { user, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');
  const [search, setSearch] = useState('');

  const isDebugUser = !authLoading && checkDebugUser(user?.id);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await dbGetApiLogs();
    if (err) setError(err.message);
    setLogs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isDebugUser) fetchLogs();
  }, [isDebugUser, fetchLogs]);

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

  const filtered = logs.filter(log => {
    if (filter === 'success' && log.success === false) return false;
    if (filter === 'error' && log.success !== false) return false;
    if (search && !log.endpoint.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const successCount = logs.filter(l => l.success !== false).length;
  const errorCount = logs.filter(l => l.success === false).length;

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='rounded-lg border border-dashed border-orange-300 bg-orange-50 px-4 py-3 flex items-center justify-between gap-4 flex-wrap'>
        <div>
          <p className='text-[10px] font-semibold uppercase tracking-wide text-orange-500 mb-0.5'>
            🛠 Debug — API Logs
          </p>
          <p className='text-xs text-orange-400'>{logs.length} entradas · {successCount} ok · {errorCount} erros</p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className='inline-flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50'
        >
          {loading ? 'Carregando...' : '↻ Atualizar'}
        </button>
      </div>

      {/* Filters */}
      <div className='flex items-center gap-3 flex-wrap'>
        <div className='flex rounded-md border border-gray-200 overflow-hidden text-sm'>
          {(['all', 'success', 'error'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 transition-colors ${filter === f ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              {f === 'all' ? 'Todos' : f === 'success' ? 'Sucesso' : 'Erro'}
            </button>
          ))}
        </div>
        <input
          type='text'
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder='Filtrar por endpoint...'
          className='rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400'
        />
      </div>

      {/* Error */}
      {error && (
        <div className='rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>{error}</div>
      )}

      {/* Table */}
      <div className='overflow-x-auto rounded-lg border border-gray-200 bg-white'>
        <table className='w-full text-left'>
          <thead>
            <tr className='border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
              <th className='px-3 py-2'>Data</th>
              <th className='px-3 py-2'>Método</th>
              <th className='px-3 py-2'>Endpoint</th>
              <th className='px-3 py-2'>Status</th>
              <th className='px-3 py-2'>Duração</th>
              <th className='px-3 py-2'>Erro</th>
              <th className='px-3 py-2' />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className='py-12 text-center text-sm text-gray-400'>Carregando...</td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className='py-12 text-center text-sm text-gray-400'>Nenhum log encontrado.</td>
              </tr>
            )}
            {!loading && filtered.map(log => <LogRow key={log.id} log={log} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
};
