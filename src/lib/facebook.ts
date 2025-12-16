'use server';

import { getEnv } from 'waku/server';

const FACEBOOK_GRAPH_API_URL = 'https://graph.facebook.com/';
const FACEBOOK_GRAPH_API_VERSION = 'v24.0';

const fbFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${FACEBOOK_GRAPH_API_URL}${FACEBOOK_GRAPH_API_VERSION}/${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${getEnv('FACEBOOK_SYSTEM_USER_SECRET_TOKEN')}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`Facebook API error: ${errorData.error.message}`);
  }
  return res.json();
};

type getWabaNumbersResponse = {
  data: Array<{
    code_verification_status: string;
    display_phone_number: string;
    id: string;
    last_onboarded_time: string;
    platform_type: string;
    quality_rating: string;
    throughput: {
      level: string;
    };
    verified_name: string;
    webhook_configuration?: {
      application: string;
    };
  }>;  
};

export const getWabaNumbers = async (waba_id: string): Promise<getWabaNumbersResponse> => {
  return await fbFetch(`${waba_id}/phone_numbers`);
};