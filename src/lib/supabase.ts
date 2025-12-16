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
    .insert({
      whatsapp_account_id,
      phone_number_id,
      display_phone_number,
      verified_name,
      quality_rating,
      platform_type,
    })
    .select()
    .single();
  return { insertData, error };
};

export const dbGetWhatsappNumbers = async () => {
  const { data, error } = await supabase
    .from('whatsapp_phone_numbers')
    .select('*');
  return { data, error };
};