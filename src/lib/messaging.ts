'use server';

import { getEnv } from 'waku/server';

const MESSAGING_API_BASE = 'https://wpp-buss-api.vercel.app';

export const sendFreeMessage = async (
  phoneNumberId: string,
  toPhoneNumber: string,
  message: string,
): Promise<{ error: string | null }> => {
  try {
    const token = getEnv('MESSAGING_API_SECRET_TOKEN');
    const response = await fetch(`${MESSAGING_API_BASE}/${phoneNumberId}/send-free-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ to_phone_number: toPhoneNumber, message }),
    });
    if (!response.ok) {
      const text = await response.text();
      return { error: text || `HTTP ${response.status}` };
    }
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
};
