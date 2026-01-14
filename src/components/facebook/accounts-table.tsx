'use client';

import { dbGetWhatsappAccounts, dbDeleteWhatsappAccount, dbUpdateWhatsappAccountName } from 'lib/supabase';
import { verifyWabaId, getWabaNumbers } from 'lib/facebook';
import { FacebookEmbbedSignupButton } from './embbed-signup-button';
import { useAuth } from 'lib/useAuth';
import { useEffect, useState, useCallback } from 'react';
import { Database } from 'types/database.types';

// --- Types ---

type WhatsappAccount = Database['public']['Tables']['whatsapp_accounts']['Row'];

type PhoneNumber = {
  id: string;
  display_phone_number: string;
  verified_name: string;
  quality_rating: string;
};

type AccountWithVerification = WhatsappAccount & { 
  verificationStatus?: 'checking' | 'valid' | 'invalid';
  phoneNumbers?: PhoneNumber[];
  isExpanded?: boolean;
  loadingNumbers?: boolean;
  error?: string;
};

// --- Icons ---

const Icons = {
  Spinner: ({ className = 'h-4 w-4' }: { className?: string }) => (
    <svg className={`animate-spin ${className}`} xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
    </svg>
  ),
  Check: ({ className = 'h-4 w-4' }: { className?: string }) => (
    <svg className={className} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
    </svg>
  ),
  CheckCircle: ({ className = 'h-5 w-5' }: { className?: string }) => (
    <svg className={className} fill='currentColor' viewBox='0 0 20 20'>
      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
    </svg>
  ),
  XCircle: ({ className = 'h-5 w-5' }: { className?: string }) => (
    <svg className={className} fill='currentColor' viewBox='0 0 20 20'>
      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
    </svg>
  ),
  ChevronRight: ({ className = 'h-5 w-5' }: { className?: string }) => (
    <svg className={className} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
    </svg>
  ),
  Trash: ({ className = 'h-4 w-4' }: { className?: string }) => (
    <svg className={className} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
    </svg>
  ),
  User: ({ className = 'h-4 w-4' }: { className?: string }) => (
    <svg className={className} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
    </svg>
  ),
  Refresh: ({ className = 'h-4 w-4', animate = false }: { className?: string; animate?: boolean }) => (
    <svg className={`${className} ${animate ? 'animate-spin' : ''}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
    </svg>
  ),
  Copy: ({ className = 'h-4 w-4' }: { className?: string }) => (
    <svg className={className} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
    </svg>
  ),
};

// --- Helper Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    active: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  
  const style = styles[status] || styles.inactive;

  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}>
      {status}
    </span>
  );
};

const VerificationBadge = ({ status }: { status?: 'checking' | 'valid' | 'invalid' | undefined }) => {
  if (status === 'checking') {
    return (
      <span className='inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10'>
        <Icons.Spinner className='h-3 w-3 text-blue-600' />
        Verificando
      </span>
    );
  }
  
  if (status === 'valid') {
    return (
      <span className='inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20'>
        <Icons.CheckCircle className='h-3.5 w-3.5' />
        Válido
      </span>
    );
  }
  
  if (status === 'invalid') {
    return (
      <span className='inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10'>
        <Icons.XCircle className='h-3.5 w-3.5' />
        Inválido
      </span>
    );
  }
  
  return <span className='text-xs text-gray-400'>-</span>;
};

const CopyButton = ({ text, label }: { text: string; label?: string }) => {
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

const DeleteConfirmation = ({ onDelete }: { onDelete: () => void }) => {
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

// --- Main Row Component ---

const AccountRow = ({ 
  account, 
  onDelete, 
  onToggleExpand 
}: { 
  account: AccountWithVerification; 
  onDelete: (id: string) => Promise<void>;
  onToggleExpand: (id: string) => void;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(account.id);
    setIsDeleting(false);
  };

  const hasWaba = !!account.waba_id;
  const canExpand = account.verificationStatus === 'valid' && hasWaba;

  return (
    <div className={`group border-b border-gray-100 bg-white last:border-b-0 ${account.isExpanded ? 'bg-gray-50/50' : ''}`}>
      <div className='grid grid-cols-12 items-center gap-4 px-6 py-4'>
        {/* Name & Icon */}
        <div className='col-span-4 flex items-center gap-3'>
            <button
              onClick={() => canExpand && onToggleExpand(account.id)}
              disabled={!canExpand}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all 
                ${canExpand 
                  ? 'hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer' 
                  : 'text-gray-200 cursor-default'
                }
              `}
            >
              <Icons.ChevronRight className={`h-5 w-5 transition-transform duration-200 ${account.isExpanded ? 'rotate-90' : ''}`} />
            </button>
          
          <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 ring-4 ring-white'>
            <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z' clipRule='evenodd' />
            </svg>
          </div>
          <div className='min-w-0'>
            <div className='font-medium text-gray-900 truncate' title={account.display_name || ''}>
              {account.display_name || 'Conta sem nome'}
            </div>
            <div className='flex items-center gap-2 text-xs text-gray-500'>
              <span>Status:</span>
              <StatusBadge status={account.status} />
            </div>
          </div>
        </div>

        {/* Verification */}
        <div className='col-span-3'>
          <VerificationBadge status={account.verificationStatus} />
        </div>

        {/* IDs */}
        <div className='col-span-3 flex flex-col gap-1.5'>
          <div className='flex items-center gap-2'>
            <span className='text-[10px] uppercase font-semibold text-gray-400 w-8'>Bus.</span>
            <CopyButton text={account.business_id} />
          </div>
          {account.waba_id && (
            <div className='flex items-center gap-2'>
              <span className='text-[10px] uppercase font-semibold text-gray-400 w-8'>WABA</span>
              <CopyButton text={account.waba_id} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className='col-span-2 flex justify-end'>
          {isDeleting ? (
             <span className='inline-flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-md'>
                <Icons.Spinner className='h-3 w-3 text-red-600' />
                Excluindo...
             </span>
          ) : (
             <DeleteConfirmation onDelete={handleDelete} />
          )}
        </div>
      </div>

      {/* Expanded Content (Numbers) */}
      {account.isExpanded && (
        <div className='border-t border-gray-100 bg-gray-50/60 px-6 py-4 shadow-inner'>
          {account.loadingNumbers ? (
            <div className='flex items-center justify-center gap-2 py-8 text-gray-500'>
              <Icons.Spinner className='h-5 w-5 text-blue-500' />
              <span className='text-sm'>Carregando números do WhatsApp...</span>
            </div>
          ) : account.phoneNumbers && account.phoneNumbers.length > 0 ? (
            <div className='space-y-3'>
              <h4 className='text-xs font-semibold uppercase tracking-wider text-gray-500'>Números do WhatsApp ({account.phoneNumbers.length})</h4>
              <div className='grid gap-3 sm:grid-cols-2'>
                {account.phoneNumbers.map((number) => (
                  <div key={number.id} className='flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600'>
                       <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 24 24'><path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z'/></svg>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between'>
                        <p className='text-sm font-medium text-gray-900 truncate'>{number.display_phone_number}</p>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium 
                          ${number.quality_rating === 'GREEN' ? 'bg-green-100 text-green-700' : 
                            number.quality_rating === 'YELLOW' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {number.quality_rating}
                        </span>
                      </div>
                      <p className='text-xs text-gray-500 truncate' title={number.verified_name}>{number.verified_name}</p>
                      <div className='mt-1 flex items-center gap-1'>
                         <span className='text-[10px] text-gray-400'>ID:</span>
                         <code className='text-[10px] bg-gray-100 rounded px-1 py-0.5 text-gray-600'>{number.id}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='py-4 text-center text-sm text-gray-500'>
              Nenhum número de WhatsApp encontrado nesta conta.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Custom Hook ---

const useWhatsappAccounts = () => {
   const [accounts, setAccounts] = useState<AccountWithVerification[]>([]);
   const [loading, setLoading] = useState(true);
   const [isRefreshing, setIsRefreshing] = useState(false);

   const loadAccounts = useCallback(async () => {
      const { data, error } = await dbGetWhatsappAccounts();
      if (error || !data) {
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      const initialAccounts = data.map(acc => ({
        ...acc,
        verificationStatus: acc.waba_id ? 'checking' : undefined,
      })) as AccountWithVerification[];

      setAccounts(initialAccounts);
      setLoading(false);
      setIsRefreshing(false);

      // Verify accounts in background
      initialAccounts.forEach(async (account) => {
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
           
           if (result.valid && result.name && result.name !== account.display_name) {
             await dbUpdateWhatsappAccountName(account.id, result.name);
           }
         }
       });
   }, []);

   useEffect(() => {
     loadAccounts();
   }, [loadAccounts]);

   const refresh = () => {
     setIsRefreshing(true);
     loadAccounts();
   };

   const deleteAccount = async (id: string) => {
     const { error } = await dbDeleteWhatsappAccount(id);
     if (!error) {
       setAccounts(prev => prev.filter(acc => acc.id !== id));
     } else {
       console.error('Failed to delete', error);
       alert('Erro ao excluir. Verifique o console.');
     }
   };

   const toggleExpand = async (id: string) => {
      const account = accounts.find(acc => acc.id === id);
      if (!account) return;

      if (account.isExpanded) {
        setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, isExpanded: false } : acc));
        return;
      }

      if (!account.phoneNumbers && account.waba_id) {
         setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, isExpanded: true, loadingNumbers: true } : acc));
         try {
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
            console.error(error);
            setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, isExpanded: false, loadingNumbers: false } : acc));
            // Ideally show a toast here
            alert('Falha ao carregar números');
         }
      } else {
         setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, isExpanded: true } : acc));
      }
   };

   return { accounts, loading, isRefreshing, refresh, deleteAccount, toggleExpand };
};

// --- View Component ---

export const WhatsappAccountsTable = () => {
  const { user } = useAuth();
  const { accounts, loading, isRefreshing, refresh, deleteAccount, toggleExpand } = useWhatsappAccounts();
  
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
            
            {/* List View instead of Table for better responsiveness and flexibility */}
            <div className='divide-y divide-gray-100'>
               {accounts.map((account) => (
                  <AccountRow 
                    key={account.id} 
                    account={account} 
                    onDelete={deleteAccount} 
                    onToggleExpand={toggleExpand} 
                  />
               ))}
            </div>
        </div>
      )}
    </div>
  );
};
