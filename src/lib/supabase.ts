import { createClient } from '@supabase/supabase-js';
import type { Database } from 'types/database.types';

const supabaseUrl = import.meta.env.WAKU_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.WAKU_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const dbSaveWhatsappAccount = async ({
  business_id,
  waba_id = '',
  status = 'active',
}: {
  business_id: string;
  waba_id?: string;
  status?: string;
}) => {
  const { data: insertData, error } = await supabase
    .from('whatsapp_accounts')
    .insert({business_id, waba_id, status})
    .select()
    .single();
  return { insertData, error };
};

export const dbSaveWhatsappNumber = async ({
  whatsapp_account_id,
  phone_number_id,
  display_phone_number,
  verified_name,
  quality_rating,
  platform_type,
}: {
  whatsapp_account_id: string;
  phone_number_id: string;
  display_phone_number: string;
  verified_name: string;
  quality_rating: string;
  platform_type: string;
}) => {
  const { data: insertData, error } = await supabase
    .from('whatsapp_phone_numbers')
    .upsert(
      {
        whatsapp_account_id,
        phone_number_id,
        display_phone_number,
        verified_name,
        quality_rating,
        platform_type,
      },
      { onConflict: 'phone_number_id' }
    )
    .select()
    .single();
  return { insertData, error };
};

export const dbGetWhatsappAccounts = async () => {
  const { data, error } = await supabase
    .from('whatsapp_accounts')
    .select('*');
  if (error) {
    console.error('Error fetching WhatsApp accounts:', error);
  }
  if (data === null) {
    return { data: [], error };
  }
  return { data, error };
};

export const dbGetWhatsappNumbers = async () => {
  const { data, error } = await supabase
    .from('whatsapp_phone_numbers')
    .select('*');
  if (error) {
    console.error('Error fetching WhatsApp numbers:', error);
  }
  if (data === null) {
    return { data: [], error };
  }
  return { data, error };
};

export const dbDeleteWhatsappAccount = async (id: string) => {
  const { error } = await supabase
    .from('whatsapp_accounts')
    .delete()
    .eq('id', id);
  return { error };
};

export const dbUpdateWhatsappAccountName = async (id: string, display_name: string) => {
  const { error } = await supabase
    .from('whatsapp_accounts')
    .update({ display_name })
    .eq('id', id);
  return { error };
};