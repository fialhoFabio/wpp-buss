'use client';

import { dbGetWhatsappAccounts, dbDeleteWhatsappAccount, dbUpdateWhatsappAccountName } from 'lib/supabase';
import { verifyWabaId, getWabaNumbers } from 'lib/facebook';
import { FacebookEmbbedSignupButton } from './embbed-signup-button';
import { useEffect, useState } from 'react';
import { Database } from 'types/database.types';

type WhatsappAccount = Database['public']['Tables']['whatsapp_accounts']['Row'];
type AccountWithVerification = WhatsappAccount & { 
  verificationStatus?: 'checking' | 'valid' | 'invalid' | undefined;
  phoneNumbers?: Array<{
    id: string;
    display_phone_number: string;
    verified_name: string;
    quality_rating: string;
  }>;
  isExpanded?: boolean;
  loadingNumbers?: boolean;
};

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

const VerificationBadge = ({ status }: { status?: 'checking' | 'valid' | 'invalid' | undefined }) => {
  if (status === 'checking') {
    return (
      <span className='inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800'>
        <svg className='mr-1 h-3 w-3 animate-spin' fill='none' viewBox='0 0 24 24'>
          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
          <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
        </svg>
        Verificando
      </span>
    );
  }
  
  if (status === 'valid') {
    return (
      <span className='inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800'>
        <svg className='mr-1 h-3 w-3' fill='currentColor' viewBox='0 0 20 20'>
          <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
        </svg>
        Válido
      </span>
    );
  }
  
  if (status === 'invalid') {
    return (
      <span className='inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800'>
        <svg className='mr-1 h-3 w-3' fill='currentColor' viewBox='0 0 20 20'>
          <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
        </svg>
        Inválido
      </span>
    );
  }
  
  return <span className='text-xs text-gray-400'>-</span>;
};

const EmptyState = () => (
  <div className='rounded-lg border border-gray-200 bg-gray-50 p-8 text-center'>
    <p className='text-gray-600'>Nenhuma conta do WhatsApp Business vinculada ainda.</p>
  </div>
);

const LoadingState = () => (
  <div className='flex items-center justify-center p-8'>
    <div className='text-gray-500'>Carregando contas...</div>
  </div>
);

const AccountRow = ({ account, onDelete, onToggleExpand }: { 
  account: AccountWithVerification; 
  onDelete: (id: string) => void;
  onToggleExpand: (id: string) => void;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      setIsDeleting(true);
      await onDelete(account.id);
    }
  };

  const canExpand = account.verificationStatus === 'valid' && account.waba_id;

  return (
    <>
    <tr className='hover:bg-gray-50'>
      <td className='whitespace-nowrap px-6 py-4'>
        <div className='flex items-center gap-2'>
          {canExpand && (
            <button
              onClick={() => onToggleExpand(account.id)}
              className='text-gray-400 hover:text-gray-600'
            >
              <svg 
                className={`h-5 w-5 transition-transform ${account.isExpanded ? 'rotate-90' : ''}`} 
                fill='currentColor' 
                viewBox='0 0 20 20'
              >
                <path fillRule='evenodd' d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z' clipRule='evenodd' />
              </svg>
            </button>
          )}
          <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100'>
            <svg className='h-5 w-5 text-blue-600' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z' clipRule='evenodd' />
            </svg>
          </div>
          <div className='ml-4'>
            <div className='text-sm font-medium text-gray-900'>{account.display_name || 'Sem nome'}</div>
          </div>
        </div>
      </td>
      <td className='whitespace-nowrap px-6 py-4'>
        <StatusBadge status={account.status} />
      </td>
      <td className='whitespace-nowrap px-6 py-4'>
        <VerificationBadge status={account.verificationStatus} />
      </td>
      <td className='px-6 py-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <span className='text-xs text-gray-400'>Business:</span>
            <code className='rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600'>{account.business_id}</code>
          </div>
          {account.waba_id && (
            <div className='flex items-center gap-2'>
              <span className='text-xs text-gray-400'>WABA:</span>
              <code className='rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600'>{account.waba_id}</code>
            </div>
          )}
        </div>
      </td>
      <td className='whitespace-nowrap px-6 py-4 text-right'>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className='inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isDeleting ? (
            'Excluindo...'
          ) : (
            <>
              <svg className='mr-1 h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
              </svg>
              Excluir
            </>
          )}
        </button>
      </td>
    </tr>
    {account.isExpanded && account.loadingNumbers && (
      <tr>
        <td colSpan={6} className='bg-gray-50 px-6 py-4'>
          <div className='flex items-center justify-center gap-2 py-4'>
            <svg className='h-5 w-5 animate-spin text-blue-600' fill='none' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
            </svg>
            <span className='text-sm text-gray-600'>Carregando números...</span>
          </div>
        </td>
      </tr>
    )}
    {account.isExpanded && !account.loadingNumbers && account.phoneNumbers && (
      <tr>
        <td colSpan={6} className='bg-gray-50 px-6 py-4'>
          <div className='space-y-2'>
            <h4 className='text-sm font-semibold text-gray-700'>Números do WhatsApp</h4>
            <div className='grid gap-2'>
              {account.phoneNumbers.map((number) => (
                <div key={number.id} className='flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-2'>
                  <div className='flex items-center gap-3'>
                    <svg className='h-5 w-5 text-green-600' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z'/>
                    </svg>
                    <div>
                      <div className='text-sm font-medium text-gray-900'>{number.display_phone_number}</div>
                      <div className='text-xs text-gray-500'>{number.verified_name}</div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-gray-500'>Quality:</span>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      number.quality_rating === 'GREEN' ? 'bg-green-100 text-green-800' :
                      number.quality_rating === 'YELLOW' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {number.quality_rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </td>
      </tr>
    )}
    </>
  );
};

const AccountsTable = ({ accounts, onDelete, onToggleExpand }: { 
  accounts: AccountWithVerification[]; 
  onDelete: (id: string) => void;
  onToggleExpand: (id: string) => void;
}) => (
  <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
    <div className='border-b border-gray-200 bg-gray-50 px-6 py-3'>
      <h3 className='text-sm font-semibold text-gray-700'>Contas Vinculadas</h3>
    </div>
    <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Nome
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Status
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Verificação API
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400'>
              IDs
            </th>
            <th className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500'>
              Ações
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200 bg-white'>
          {accounts.map((account) => (
            <AccountRow key={account.id} account={account} onDelete={onDelete} onToggleExpand={onToggleExpand} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const WhatsappAccountsTable = () => {
  const [accounts, setAccounts] = useState<AccountWithVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAccounts = async () => {
    const { data } = await dbGetWhatsappAccounts();
    const accountsWithStatus: AccountWithVerification[] = (data || []).map(acc => ({
      ...acc,
      verificationStatus: acc.waba_id ? 'checking' : undefined,
    }));
    setAccounts(accountsWithStatus);
    setLoading(false);
    setIsRefreshing(false);
    
    // Verificar cada conta com waba_id
    accountsWithStatus.forEach(async (account) => {
      if (account.waba_id) {
        const result = await verifyWabaId(account.waba_id);
        setAccounts(prev => prev.map(acc => 
          acc.id === account.id 
            ? { 
                ...acc, 
                verificationStatus: result.valid ? 'valid' : 'invalid',
                display_name: result.name || acc.display_name
              }
            : acc
        ));
        
        // Atualizar nome no banco de dados se for válido
        if (result.valid && result.name) {
          await dbUpdateWhatsappAccountName(account.id, result.name);
        }
      }
    });
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAccounts();
  };

  const handleDelete = async (id: string) => {
    const { error } = await dbDeleteWhatsappAccount(id);
    
    if (error) {
      console.error('Error deleting account:', error);
      alert('Erro ao excluir conta. Tente novamente.');
      return;
    }
    
    // Remove da lista local
    setAccounts((prev) => prev.filter((account) => account.id !== id));
  };

  const handleToggleExpand = async (id: string) => {
    const account = accounts.find(acc => acc.id === id);
    if (!account) return;

    // Se já está expandido, apenas recolhe
    if (account.isExpanded) {
      setAccounts(prev => prev.map(acc => 
        acc.id === id ? { ...acc, isExpanded: false } : acc
      ));
      return;
    }

    // Se não tem números ainda, busca da API
    if (!account.phoneNumbers && account.waba_id) {
      try {
        // Marca como expandido e loading
        setAccounts(prev => prev.map(acc => 
          acc.id === id ? { ...acc, isExpanded: true, loadingNumbers: true } : acc
        ));

        const response = await getWabaNumbers(account.waba_id);
        
        setAccounts(prev => prev.map(acc => 
          acc.id === id 
            ? { 
                ...acc, 
                loadingNumbers: false,
                phoneNumbers: response.data.map(num => ({
                  id: num.id,
                  display_phone_number: num.display_phone_number,
                  verified_name: num.verified_name,
                  quality_rating: num.quality_rating,
                }))
              } 
            : acc
        ));
      } catch (error) {
        console.error('Error fetching phone numbers:', error);
        // Remove loading e recolhe em caso de erro
        setAccounts(prev => prev.map(acc => 
          acc.id === id ? { ...acc, isExpanded: false, loadingNumbers: false } : acc
        ));
        alert('Erro ao buscar números. Tente novamente.');
      }
    } else {
      // Já tem os números, apenas expande
      setAccounts(prev => prev.map(acc => 
        acc.id === id ? { ...acc, isExpanded: true } : acc
      ));
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <FacebookEmbbedSignupButton />
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className='inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        >
          <svg 
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} 
            fill='none' 
            stroke='currentColor' 
            viewBox='0 0 24 24'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
          </svg>
          {isRefreshing ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>
      {accounts.length === 0 ? <EmptyState /> : <AccountsTable accounts={accounts} onDelete={handleDelete} onToggleExpand={handleToggleExpand} />}
    </div>
  );
};
