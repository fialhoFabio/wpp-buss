import { Database } from 'types/database.types';

export type WhatsappAccount = Database['public']['Tables']['whatsapp_accounts']['Row'];

export type PhoneNumber = {
  id: string;
  display_phone_number: string;
  verified_name: string;
  quality_rating: string;
  code_verification_status: string;
};

export type AccountWithVerification = WhatsappAccount & {
  verificationStatus?: 'checking' | 'valid' | 'invalid';
  phoneNumbers?: PhoneNumber[];
  isExpanded?: boolean;
  loadingNumbers?: boolean;
  error?: string;
};
