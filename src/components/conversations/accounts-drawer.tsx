'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FacebookEmbbedSignupButton } from 'components/facebook/embbed-signup-button';
import { Icons } from 'components/facebook/accounts/icons';
import { StatusBadge, VerificationBadge } from 'components/facebook/accounts/badges';
import { AddPhoneNumberModal } from 'components/facebook/accounts/add-phone-number-modal';
import { VerifyPhoneNumberModal } from 'components/facebook/accounts/verify-phone-number-modal';
import { RegisterPhoneNumberModal } from 'components/facebook/accounts/register-phone-number-modal';
import { useWhatsappAccounts } from 'components/facebook/accounts/use-whatsapp-accounts';
import type { AccountWithVerification, PhoneNumber } from 'components/facebook/accounts/types';

/* ─── Phone number card ───────────────────────────────────── */

const PhoneCard = ({
  number,
  onVerify,
  onRegister,
}: {
  number: PhoneNumber;
  onVerify: () => void;
  onRegister: () => void;
}) => {
  const needsVerification = number.code_verification_status !== 'VERIFIED';
  const needsRegistration =
    !needsVerification && (!number.quality_rating || number.quality_rating === 'UNKNOWN');
  const isActive = !needsVerification && !needsRegistration;

  return (
    <div
      className={`overflow-hidden rounded-lg border ${
        needsVerification
          ? 'border-yellow-200 bg-yellow-50/60'
          : needsRegistration
            ? 'border-blue-200 bg-blue-50/60'
            : 'border-gray-100 bg-white'
      }`}
    >
      <div className='flex items-start gap-3 p-3'>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            needsVerification
              ? 'bg-yellow-100 text-yellow-600'
              : needsRegistration
                ? 'bg-blue-100 text-blue-600'
                : 'bg-green-100 text-green-600'
          }`}
        >
          <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 24 24'>
            <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' />
          </svg>
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between gap-2'>
            <p className='text-sm font-semibold text-gray-900'>{number.display_phone_number}</p>
            {isActive && number.quality_rating && number.quality_rating !== 'UNKNOWN' && (
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  number.quality_rating === 'GREEN'
                    ? 'bg-green-100 text-green-700'
                    : number.quality_rating === 'YELLOW'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {number.quality_rating}
              </span>
            )}
          </div>
          <p className='text-xs text-gray-500 truncate'>{number.verified_name}</p>
          {isActive && (
            <span className='mt-1.5 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 ring-1 ring-inset ring-green-600/20'>
              <Icons.CheckCircle className='h-3 w-3' />
              Ativo
            </span>
          )}
        </div>
      </div>

      {needsVerification && (
        <div className='flex items-center justify-between gap-2 border-t border-yellow-200 bg-yellow-100/60 px-3 py-2'>
          <p className='text-[11px] font-medium text-yellow-800'>Verificação pendente via SMS</p>
          <button
            onClick={onVerify}
            className='inline-flex items-center gap-1 rounded-md bg-yellow-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-yellow-700'
          >
            <Icons.Check className='h-3 w-3' />
            Verificar
          </button>
        </div>
      )}

      {needsRegistration && (
        <div className='flex items-center justify-between gap-2 border-t border-blue-200 bg-blue-100/60 px-3 py-2'>
          <p className='text-[11px] font-medium text-blue-800'>Registrar na API do Meta</p>
          <button
            onClick={onRegister}
            className='inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-700'
          >
            <Icons.CheckCircle className='h-3 w-3' />
            Registrar
          </button>
        </div>
      )}
    </div>
  );
};

/* ─── Account card ────────────────────────────────────────── */

const AccountCard = ({
  account,
  onDelete,
  onRefreshNumbers,
}: {
  account: AccountWithVerification;
  onDelete: (id: string) => Promise<void>;
  onRefreshNumbers: (id: string) => Promise<void>;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [verifyingNumber, setVerifyingNumber] = useState<PhoneNumber | undefined>();
  const [registeringNumber, setRegisteringNumber] = useState<PhoneNumber | undefined>();

  const handleDelete = async () => {
    setIsDeleting(true);
    setConfirmDelete(false);
    await onDelete(account.id);
    setIsDeleting(false);
  };

  return (
    <div className='relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
      {/* Corner actions */}
      <div className='absolute right-2 top-2 z-10 flex items-center gap-0.5'>
        {isDeleting ? (
          <Icons.Spinner className='h-4 w-4 text-red-400' />
        ) : confirmDelete ? (
          <button
            onClick={handleDelete}
            title='Confirmar exclusão'
            className='flex h-7 w-7 items-center justify-center rounded-md bg-red-50 text-red-600 hover:bg-red-100'
          >
            <Icons.Check className='h-3.5 w-3.5' />
          </button>
        ) : (
          <button
            onClick={() => {
              setConfirmDelete(true);
              setTimeout(() => setConfirmDelete(false), 3000);
            }}
            title='Excluir conta'
            className='flex h-7 w-7 items-center justify-center rounded-md text-gray-300 hover:bg-red-50 hover:text-red-500'
          >
            <Icons.Trash className='h-3.5 w-3.5' />
          </button>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expandir' : 'Recolher'}
          className='flex h-7 w-7 items-center justify-center rounded-md text-gray-300 hover:bg-gray-100 hover:text-gray-500'
        >
          <Icons.ChevronRight className={`h-4 w-4 transition-transform duration-200 ${collapsed ? '' : 'rotate-90'}`} />
        </button>
      </div>

      {/* Clickable toggle area */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className='w-full px-4 py-4 pr-20 text-left'
      >
        <div className='flex items-start gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600'>
            <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='flex-1 min-w-0'>
            <p className='font-semibold text-gray-900 truncate' title={account.display_name ?? ''}>
              {account.display_name || 'Conta sem nome'}
            </p>
            <div className='mt-1 flex flex-wrap items-center gap-1.5'>
              <StatusBadge status={account.status} />
              <VerificationBadge status={account.verificationStatus} />
            </div>
            {account.waba_id && (
              <div className='mt-1.5 flex items-center gap-1.5'>
                <span className='text-[9px] font-bold uppercase tracking-wider text-gray-300'>WABA</span>
                <code className='text-[10px] font-mono text-gray-500'>{account.waba_id}</code>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (account.waba_id) void navigator.clipboard.writeText(account.waba_id);
                  }}
                  title='Copiar WABA ID'
                  className='text-gray-300 hover:text-gray-500'
                >
                  <Icons.Copy className='h-3 w-3' />
                </button>
              </div>
            )}
          </div>
        </div>
      </button>

      {!collapsed && (
        <div className='border-t border-gray-100 bg-gray-50/60 px-4 py-3'>
        {account.loadingNumbers ? (
          <div className='flex items-center gap-2 py-3 text-sm text-gray-400'>
            <Icons.Spinner className='h-4 w-4 text-blue-400' />
            Carregando números...
          </div>
        ) : account.phoneNumbers && account.phoneNumbers.length > 0 ? (
          <div className='space-y-2'>
            <p className='text-[10px] font-semibold uppercase tracking-wider text-gray-400'>
              Números ({account.phoneNumbers.length})
            </p>
            {account.phoneNumbers.map((number) => (
              <PhoneCard
                key={number.id}
                number={number}
                onVerify={() => setVerifyingNumber(number)}
                onRegister={() => setRegisteringNumber(number)}
              />
            ))}
          </div>
        ) : (
          <p className='py-2 text-sm text-gray-400'>Nenhum número encontrado nesta conta.</p>
        )}

        {account.verificationStatus === 'valid' && account.waba_id && (
          <button
            type='button'
            onClick={() => setShowAddModal(true)}
            className='mt-3 inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50'
          >
            <Icons.Plus className='h-3.5 w-3.5' />
            Adicionar número
          </button>
        )}
      </div>
      )}

      {showAddModal && account.waba_id && (
        <AddPhoneNumberModal
          wabaId={account.waba_id}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            void onRefreshNumbers(account.id);
          }}
        />
      )}

      {verifyingNumber !== undefined && (
        <VerifyPhoneNumberModal
          phoneNumberId={verifyingNumber.id}
          displayPhoneNumber={verifyingNumber.display_phone_number}
          onClose={() => setVerifyingNumber(undefined)}
          onSuccess={() => {
            setVerifyingNumber(undefined);
            void onRefreshNumbers(account.id);
          }}
        />
      )}

      {registeringNumber !== undefined && (
        <RegisterPhoneNumberModal
          phoneNumberId={registeringNumber.id}
          displayPhoneNumber={registeringNumber.display_phone_number}
          onClose={() => setRegisteringNumber(undefined)}
          onSuccess={() => {
            setRegisteringNumber(undefined);
            void onRefreshNumbers(account.id);
          }}
        />
      )}
    </div>
  );
};

/* ─── Drawer inner content ────────────────────────────────── */

const DrawerContent = ({ onClose }: { onClose: () => void }) => {
  const { accounts, loading, isRefreshing, refresh, deleteAccount, refreshNumbers } =
    useWhatsappAccounts();

  return (
    <div className='flex h-full flex-col'>
      {/* Header */}
      <div className='flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4'>
        <h2 className='text-base font-semibold text-gray-900'>Contas Vinculadas</h2>
        <div className='flex items-center gap-1'>
          <button
            onClick={refresh}
            disabled={isRefreshing}
            title='Atualizar'
            className='flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40'
          >
            <Icons.Refresh className='h-4 w-4' animate={isRefreshing} />
          </button>
          <button
            onClick={onClose}
            aria-label='Fechar'
            className='flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
          >
            <Icons.X className='h-5 w-5' />
          </button>
        </div>
      </div>

      {/* Connect new account */}
      <div className='shrink-0 flex items-center justify-end border-b border-gray-100 px-4 py-2'>
        <FacebookEmbbedSignupButton minimal />
      </div>

      {/* Accounts list */}
      <div className='flex-1 overflow-y-auto px-5 py-4'>
        {loading ? (
          <div className='flex h-48 flex-col items-center justify-center gap-3 text-gray-400'>
            <Icons.Spinner className='h-6 w-6 text-blue-400' />
            <p className='text-sm'>Carregando contas...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className='flex h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 text-center'>
            <div className='rounded-full bg-gray-100 p-3'>
              <svg className='h-6 w-6 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
              </svg>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-700'>Nenhuma conta vinculada</p>
              <p className='mt-0.5 text-xs text-gray-400'>Use o botão acima para conectar.</p>
            </div>
          </div>
        ) : (
          <div className='space-y-3'>
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onDelete={deleteAccount}
                onRefreshNumbers={refreshNumbers}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Portal wrapper ──────────────────────────────────────── */

export const AccountsDrawer = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className='fixed inset-0 z-[9999] flex items-stretch justify-end'>
      <div className='absolute inset-0 bg-black/40' onClick={onClose} />
      <div className='relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl'>
        <DrawerContent onClose={onClose} />
      </div>
    </div>,
    document.body
  );
};
