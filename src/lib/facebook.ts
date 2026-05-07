'use server';

import { getEnv } from 'waku/server';

// ---------------------------------------------------------------------------
// Internal HTTP client
// ---------------------------------------------------------------------------

const GRAPH_API_BASE = 'https://graph.facebook.com/v25.0';

/**
 * Maps known Meta error code+subcode pairs to actionable Portuguese messages.
 * Falls back to the raw API message when no match is found.
 */
const META_ERRORS: Record<string, string> = {
  '136024.2388091': 'Este número já está vinculado ao WhatsApp pessoal. Remova-o do app WhatsApp antes de registrá-lo na API Business.',
  '136024': 'Falha na validação do número de telefone.',
  '100.2640': 'O parâmetro phone_number deve conter apenas dígitos.',
  '100': 'Parâmetro inválido na requisição.',
  '200': 'Permissão insuficiente para executar esta ação.',
  '190': 'Token de acesso inválido ou expirado.',
  '10': 'Permissão negada. Verifique as permissões do usuário do sistema.',
};

const friendlyMetaError = (code?: number, subcode?: number, raw?: string): string => {
  if (code !== undefined) {
    const withSubcode = subcode !== undefined ? `${code}.${subcode}` : undefined;
    if (withSubcode && META_ERRORS[withSubcode]) return META_ERRORS[withSubcode];
    if (META_ERRORS[String(code)]) return META_ERRORS[String(code)] as string;
  }
  return raw ?? 'Erro desconhecido da API do Meta.';
};

const fbFetch = async (endpoint: string, options: RequestInit = {}): Promise<unknown> => {
  const res = await fetch(`${GRAPH_API_BASE}/${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getEnv('FACEBOOK_SYSTEM_USER_SECRET_TOKEN')}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    let traceId: string | undefined;
    try {
      const body = await res.json() as { error?: { message?: string; code?: number; error_subcode?: number; fbtrace_id?: string } };
      const err = body.error;
      if (err) {
        const friendly = friendlyMetaError(err.code, err.error_subcode, err.message);
        const codeTag = err.code !== undefined
          ? ` [#${err.code}${err.error_subcode !== undefined ? `.${err.error_subcode}` : ''}]`
          : '';
        message = `${friendly}${codeTag}`;
        traceId = err.fbtrace_id;
      }
    } catch { /* non-JSON body — keep generic message */ }
    throw new Error(traceId ? `${message} (trace: ${traceId})` : message);
  }

  return res.json();
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PhoneNumber = {
  id: string;
  display_phone_number: string;
  verified_name: string;
  code_verification_status: string;
  last_onboarded_time: string;
  platform_type: string;
  quality_rating: string;
  throughput: { level: string };
  webhook_configuration?: { application: string };
};

// ---------------------------------------------------------------------------
// WhatsApp Business Account (WABA)
// ---------------------------------------------------------------------------

export const verifyWabaId = async (
  waba_id: string,
): Promise<{ valid: boolean; name?: string; error?: string }> => {
  try {
    const data = await fbFetch(`${waba_id}?fields=id,name`) as { name: string };
    return { valid: true, name: data.name };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// ---------------------------------------------------------------------------
// Phone Numbers
// ---------------------------------------------------------------------------

export const getWabaNumbers = async (waba_id: string): Promise<{ data: PhoneNumber[] }> => {
  return fbFetch(`${waba_id}/phone_numbers`) as Promise<{ data: PhoneNumber[] }>;
};

export const addWabaPhoneNumber = async (
  waba_id: string,
  params: { cc: string; phone_number: string; verified_name: string },
): Promise<{ id: string }> => {
  return fbFetch(`${waba_id}/phone_numbers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  }) as Promise<{ id: string }>;
};

export const requestWabaPhoneNumberCode = async (
  phone_number_id: string,
  params: { code_method: string; language: string },
): Promise<void> => {
  const query = new URLSearchParams(params).toString();
  await fbFetch(`${phone_number_id}/request_code?${query}`, { method: 'POST' });
};

export const verifyWabaPhoneNumberCode = async (
  phone_number_id: string,
  code: string,
): Promise<void> => {
  await fbFetch(`${phone_number_id}/verify_code?code=${encodeURIComponent(code)}`, { method: 'POST' });
};

export const registerWabaPhoneNumber = async (
  phone_number_id: string,
  params: { pin: string },
): Promise<void> => {
  await fbFetch(`${phone_number_id}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', ...params }),
  });
};