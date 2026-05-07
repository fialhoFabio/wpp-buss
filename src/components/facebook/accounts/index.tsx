'use client';

import { useAuth } from 'lib/useAuth';
import { FacebookEmbbedSignupButton } from '../embbed-signup-button';
import { Icons } from './icons';
import { CopyButton } from './copy-button';
import { AccountRow } from './account-row';
import { useWhatsappAccounts } from './use-whatsapp-accounts';

export const WhatsappAccountsTable = () => {
  const { user } = useAuth();
  const { accounts, loading, isRefreshing, refresh, deleteAccount, toggleExpand, refreshNumbers } = useWhatsappAccounts();

  return (
    <div className='space-y-6'>

      {/* Header Actions */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-wrap items-center gap-4'>
          <FacebookEmbbedSignupButton />

          {user?.id && (
            <div className='flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm'>
              <div className='flex items-center gap-2'>
                <div className='rounded-full bg-gray-100 p-1.5'>
                  <Icons.User className='h-3.5 w-3.5 text-gray-500' />
                </div>
                <div className='flex flex-col'>
                  <span className='text-[10px] font-medium text-gray-400 uppercase tracking-wide'>Seu ID</span>
                  <code className='text-xs font-semibold text-gray-700'>{user.id.substring(0, 8)}...</code>
                </div>
              </div>
              <CopyButton text={user.id} />
            </div>
          )}
        </div>

        <button
          onClick={refresh}
          disabled={isRefreshing}
          className='inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:bg-gray-100 disabled:opacity-50'
        >
          <Icons.Refresh className='h-4 w-4' animate={isRefreshing} />
          <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Lista'}</span>
        </button>
      </div>

      {loading ? (
        <div className='flex h-64 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50'>
          <Icons.Spinner className='h-8 w-8 text-blue-500' />
          <p className='text-sm font-medium text-gray-500'>Carregando suas contas...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className='flex h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center'>
          <div className='rounded-full bg-gray-100 p-4'>
            <svg className='h-8 w-8 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
            </svg>
          </div>
          <div>
            <h3 className='text-lg font-medium text-gray-900'>Nenhuma conta vinculada</h3>
            <p className='mt-1 text-sm text-gray-500'>Conecte sua conta do Facebook para começar a gerenciar.</p>
          </div>
          <FacebookEmbbedSignupButton />
        </div>
      ) : (
        <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-black/5'>
          <div className='border-b border-gray-200 bg-gray-50/80 px-6 py-4 backdrop-blur-sm'>
            <div className='flex items-center justify-between'>
              <h3 className='text-base font-semibold text-gray-900'>Contas Conectadas</h3>
              <span className='rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-600'>
                {accounts.length}
              </span>
            </div>
          </div>

          <div className='divide-y divide-gray-100'>
            {accounts.map((account) => (
              <AccountRow
                key={account.id}
                account={account}
                onDelete={deleteAccount}
                onToggleExpand={toggleExpand}
                onRefreshNumbers={refreshNumbers}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
