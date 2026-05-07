'use client';

import { useEffect, useState, useCallback } from 'react';
import { dbGetWhatsappAccounts, dbDeleteWhatsappAccount, dbUpdateWhatsappAccountName, dbSaveWhatsappNumber } from 'lib/supabase';
import { verifyWabaId, getWabaNumbers } from 'lib/facebook';
import type { AccountWithVerification } from './types';

export const useWhatsappAccounts = () => {
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
                display_name: result.name || acc.display_name,
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
        const phoneNumbers = response.data.map(num => ({
          id: num.id,
          display_phone_number: num.display_phone_number,
          verified_name: num.verified_name,
          quality_rating: num.quality_rating,
          code_verification_status: num.code_verification_status,
        }));
        setAccounts(prev => prev.map(acc =>
          acc.id === id
            ? { ...acc, loadingNumbers: false, phoneNumbers }
            : acc
        ));
        // Sync to DB in background
        response.data.forEach(num => {
          dbSaveWhatsappNumber({
            whatsapp_account_id: account.id,
            phone_number_id: num.id,
            display_phone_number: num.display_phone_number,
            verified_name: num.verified_name,
            quality_rating: num.quality_rating,
            platform_type: num.platform_type,
          });
        });
      } catch (error) {
        console.error(error);
        setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, isExpanded: false, loadingNumbers: false } : acc));
        alert('Falha ao carregar números');
      }
    } else {
      setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, isExpanded: true } : acc));
    }
  };

  return { accounts, loading, isRefreshing, refresh, deleteAccount, toggleExpand };
};
