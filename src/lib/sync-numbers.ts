'use server';

import { getWabaNumbers } from 'lib/facebook';
import { dbGetWhatsappAccounts, dbSaveWhatsappNumber } from 'lib/supabase';
import { supabase } from 'lib/supabase';

export async function syncWhatsappNumbers() {
  const { data: accounts } = await dbGetWhatsappAccounts();
  
  if (!accounts || accounts.length === 0) {
    return { success: false, message: 'Nenhuma conta encontrada' };
  }

  let totalSynced = 0;
  let totalDeleted = 0;

  for (const account of accounts) {
    if (!account.waba_id) continue;

    try {
      const metaNumbers = await getWabaNumbers(account.waba_id);
      const metaNumberIds = metaNumbers.data.map(n => n.id);
      
      // Busca números existentes no DB para esta conta
      const { data: existingNumbers } = await supabase
        .from('whatsapp_phone_numbers')
        .select('phone_number_id')
        .eq('whatsapp_account_id', account.id);
      
      // Remove números que não existem mais no Meta
      if (existingNumbers && existingNumbers.length > 0) {
        const numbersToDelete = existingNumbers
          .filter(n => !metaNumberIds.includes(n.phone_number_id))
          .map(n => n.phone_number_id);
        
        if (numbersToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('whatsapp_phone_numbers')
            .delete()
            .in('phone_number_id', numbersToDelete);
          
          if (!deleteError) {
            totalDeleted += numbersToDelete.length;
          }
        }
      }
      
      // Faz upsert de cada número do Meta
      for (const number of metaNumbers.data) {
        await dbSaveWhatsappNumber({
          whatsapp_account_id: account.id,
          phone_number_id: number.id,
          display_phone_number: number.display_phone_number,
          verified_name: number.verified_name,
          quality_rating: number.quality_rating,
          platform_type: number.platform_type,
        });
        totalSynced++;
      }
    } catch (error) {
      console.error(`Erro ao sincronizar conta ${account.waba_id}:`, error);
    }
  }

  return { success: true, totalSynced, totalDeleted };
}
