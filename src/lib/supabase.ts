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
  if (error) console.error('Error fetching WhatsApp accounts:', error);
  return { data: data ?? [], error };
};

export const dbGetWhatsappNumbers = async () => {
  const { data, error } = await supabase
    .from('whatsapp_phone_numbers')
    .select('*');
  if (error) console.error('Error fetching WhatsApp numbers:', error);
  return { data: data ?? [], error };
};

export const dbGetActiveConversationIds = async (): Promise<Set<string>> => {
  const { data } = await supabase
    .from('wpp_active_conversations')
    .select('id')
    .eq('is_active', true);
  return new Set((data ?? []).map((r) => r.id).filter((id): id is string => id !== null));
};

export const dbGetConversations = async () => {
  const { data, error } = await supabase
    .from('wpp_conversations')
    .select('*, wpp_messages(message_content, message_type, timestamp)')
    .order('last_message_at', { ascending: false })
    .order('timestamp', { ascending: false, foreignTable: 'wpp_messages' })
    .limit(1, { foreignTable: 'wpp_messages' });
  if (error) console.error('Error fetching conversations:', error);
  return { data: data ?? [], error };
};

export const dbGetMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('wpp_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: true });
  if (error) console.error('Error fetching messages:', error);
  return { data: data ?? [], error };
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