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

export const dbRemoveStalePhoneNumbers = async (whatsapp_account_id: string, activePhoneNumberIds: string[]) => {
  const { error } = await supabase
    .from('whatsapp_phone_numbers')
    .delete()
    .eq('whatsapp_account_id', whatsapp_account_id)
    .not('phone_number_id', 'in', `(${activePhoneNumberIds.join(',')})`);
  return { error };
};

export const dbGetWhatsappAccounts = async (ownerId?: string) => {
  let query = supabase
    .from('whatsapp_accounts')
    .select('*');

  if (ownerId) {
    query = query.eq('owner_id', ownerId);
  }

  const { data, error } = await query;
  if (error) console.error('Error fetching WhatsApp accounts:', error);
  return { data: data ?? [], error };
};

export const dbGetActiveConversationIds = async (ownerId?: string): Promise<Set<string>> => {
  let query = supabase
    .from('wpp_active_conversations')
    .select('id')
    .eq('is_active', true);

  if (ownerId) {
    query = query.eq('owner_id', ownerId);
  }

  const { data } = await query;
  return new Set((data ?? []).map((r) => r.id).filter((id): id is string => id !== null));
};

export const dbGetPhoneNumbers = async (ownerId?: string) => {
  let query = supabase
    .from('whatsapp_phone_numbers')
    .select('*, whatsapp_accounts!inner(owner_id)')
    .order('created_at', { ascending: true });

  if (ownerId) {
    query = query.eq('whatsapp_accounts.owner_id', ownerId);
  }

  const { data, error } = await query;
  if (error) console.error('Error fetching phone numbers:', error);
  const cleanData = (data ?? []).map(({ whatsapp_accounts, ...rest }) => rest);
  return { data: cleanData, error };
};

export const dbGetConversations = async (ownerId?: string) => {
  let query = supabase
    .from('wpp_conversations')
    .select('*, wpp_messages(message_content, message_type, timestamp)');

  if (ownerId) {
    query = query.eq('owner_id', ownerId);
  }

  const { data, error } = await query
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

export const dbUpdateWhatsappAccountStatus = async (id: string, status: string) => {
  const { error } = await supabase
    .from('whatsapp_accounts')
    .update({ status })
    .eq('id', id);
  return { error };
};

export const dbGetApiLogs = async ({
  limit = 200,
  status,
  endpoint,
  dateFrom,
  dateTo,
}: {
  limit?: number;
  status?: 'success' | 'error';
  endpoint?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}) => {
  let query = supabase
    .from('api_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status === 'success') query = query.eq('success', true);
  if (status === 'error') query = query.eq('success', false);
  if (endpoint) query = query.ilike('endpoint', `%${endpoint}%`);
  if (dateFrom) query = query.gte('created_at', dateFrom);
  // dateTo: include the full day by going to end of day
  if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59.999Z`);

  const { data, error } = await query;
  if (error) console.error('Error fetching api_logs:', error);
  return { data: data ?? [], error };
};

export const dbGetConversationWithMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('wpp_conversations')
    .select('*, wpp_messages(message_content, message_type, timestamp)')
    .eq('id', conversationId)
    .order('timestamp', { ascending: false, foreignTable: 'wpp_messages' })
    .limit(1, { foreignTable: 'wpp_messages' })
    .maybeSingle();
  return { data, error };
};

export const dbSearchProfiles = async (query: string, isUuid: boolean) => {
  if (isUuid) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('id', query);
    return { data: data ?? [], error };
  } else {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name')
      .ilike('name', `%${query}%`);
    return { data: data ?? [], error };
  }
};

export const dbGetWhatsappAccountsWithPhoneNumbers = async (
  profileIds: string[],
  isUuid: boolean,
  query: string
) => {
  let accountsQuery = supabase
    .from('whatsapp_accounts')
    .select('*, whatsapp_phone_numbers(*)');

  if (profileIds.length > 0) {
    accountsQuery = accountsQuery.in('owner_id', profileIds);
  } else if (isUuid) {
    accountsQuery = accountsQuery.eq('owner_id', query);
  } else {
    return { data: [], error: null };
  }

  const { data, error } = await accountsQuery;
  return { data: data ?? [], error };
};