'use client';

import { useState } from 'react';
import { Icons } from './icons';
import { StatusBadge, VerificationBadge } from './badges';
import { CopyButton } from './copy-button';
import { DeleteConfirmation } from './delete-confirmation';
import { AddPhoneNumberModal } from './add-phone-number-modal';
import { VerifyPhoneNumberModal } from './verify-phone-number-modal';
import { RegisterPhoneNumberModal } from './register-phone-number-modal';
import type { AccountWithVerification, PhoneNumber } from './types';

export const AccountRow = ({
  account,
  onDelete,
  onToggleExpand,
  onRefreshNumbers,
}: {
  account: AccountWithVerification;
  onDelete: (id: string) => Promise<void>;
  onToggleExpand: (id: string) => void;
  onRefreshNumbers: (id: string) => Promise<void>;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [verifyingNumber, setVerifyingNumber] = useState<PhoneNumber | undefined>();
  const [registeringNumber, setRegisteringNumber] = useState<PhoneNumber | undefined>();

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
              <div className='flex items-center justify-between'>
                <h4 className='text-xs font-semibold uppercase tracking-wider text-gray-500'>Números do WhatsApp ({account.phoneNumbers.length})</h4>
                <button
                  type='button'
                  onClick={() => setShowAddModal(true)}
                  className='inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50'
                >
                  <Icons.Plus className='h-3.5 w-3.5' />
                  Adicionar número
                </button>
              </div>
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
                      <div className='mt-1.5 flex flex-wrap items-center gap-2'>
                        {number.code_verification_status === 'VERIFIED' ? (
                          <span className='inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 ring-1 ring-inset ring-green-600/20'>
                            <Icons.CheckCircle className='h-3 w-3' />
                            Verificado
                          </span>
                        ) : (
                          <>
                            <span className='inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20'>
                              <Icons.XCircle className='h-3 w-3' />
                              Não verificado
                            </span>
                            <button
                              type='button'
                              onClick={() => setVerifyingNumber(number)}
                              className='inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 hover:bg-blue-100'
                            >
                              <Icons.Check className='h-3 w-3' />
                              Verificar
                            </button>
                          </>
                        )}
                        <button
                          type='button'
                          onClick={() => setRegisteringNumber(number)}
                          className='inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 ring-1 ring-inset ring-green-600/20 hover:bg-green-100'
                        >
                          <Icons.Check className='h-3 w-3' />
                          Registrar
                        </button>
                      </div>
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
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <p className='py-4 text-sm text-gray-500'>Nenhum número de WhatsApp encontrado nesta conta.</p>
                <button
                  type='button'
                  onClick={() => setShowAddModal(true)}
                  className='inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50'
                >
                  <Icons.Plus className='h-3.5 w-3.5' />
                  Adicionar número
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddModal && account.waba_id && (
        <AddPhoneNumberModal
          wabaId={account.waba_id}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            onRefreshNumbers(account.id);
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
            onRefreshNumbers(account.id);
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
            onRefreshNumbers(account.id);
          }}
        />
      )}
    </div>
  );
};
