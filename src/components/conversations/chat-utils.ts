import type { Database } from 'types/database.types';

export type LastMessagePreview = Pick<Database['public']['Tables']['wpp_messages']['Row'], 'message_content' | 'message_type' | 'timestamp'>;
export type Conversation = Database['public']['Tables']['wpp_conversations']['Row'] & {
  wpp_messages: LastMessagePreview[];
  isDebugLoaded?: boolean;
};
export type Message = Database['public']['Tables']['wpp_messages']['Row'];
export type PendingMessage = { tempId: string; text: string };
export type PhoneNumber = Database['public']['Tables']['whatsapp_phone_numbers']['Row'];

const NUMBER_COLORS = [
  { dot: 'bg-emerald-500', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { dot: 'bg-blue-500',    bg: 'bg-blue-100',    text: 'text-blue-700' },
  { dot: 'bg-purple-500',  bg: 'bg-purple-100',  text: 'text-purple-700' },
  { dot: 'bg-orange-500',  bg: 'bg-orange-100',  text: 'text-orange-700' },
  { dot: 'bg-rose-500',    bg: 'bg-rose-100',    text: 'text-rose-700' },
  { dot: 'bg-teal-500',    bg: 'bg-teal-100',    text: 'text-teal-700' },
];

export function getPhoneColorMap(phones: PhoneNumber[]): Map<string, { dot: string; bg: string; text: string; label: string }> {
  const map = new Map<string, { dot: string; bg: string; text: string; label: string }>();
  phones.forEach((p, i) => {
    const color = NUMBER_COLORS[i % NUMBER_COLORS.length]!;
    map.set(p.phone_number_id, {
      ...color,
      label: p.verified_name ?? p.display_phone_number ?? p.phone_number_id,
    });
  });
  return map;
}

function extractText(content: Record<string, unknown>, type: string): string | null {
  if (typeof content['body'] === 'string') return content['body'];
  if (typeof content['text'] === 'string') return content['text'];
  const text = content['text'];
  if (text && typeof text === 'object' && typeof (text as Record<string, unknown>)['body'] === 'string') {
    return (text as Record<string, unknown>)['body'] as string;
  }
  if (typeof content['caption'] === 'string') return content['caption'];
  if (type === 'template') {
    const name = typeof content['name'] === 'string' ? content['name'] : null;
    return name ? `📋 ${name}` : '📋 Template';
  }
  const mediaLabels: Record<string, string> = {
    image: '📷 Imagem', audio: '🎵 Áudio', video: '🎬 Vídeo',
    document: '📄 Documento', sticker: '🎨 Sticker', location: '📍 Localização', reaction: '👍 Reação',
  };
  return mediaLabels[type] ?? null;
}

export function getPreviewText(preview: LastMessagePreview): string {
  const content = preview.message_content as Record<string, unknown> | null;
  if (!content) return `[${preview.message_type}]`;
  return extractText(content, preview.message_type) ?? `[${preview.message_type}]`;
}

export function getMessageText(message: Message): string {
  const content = message.message_content as Record<string, unknown> | null;
  if (!content) return `[${message.message_type}]`;
  return extractText(content, message.message_type) ?? `[${message.message_type}]`;
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatConversationDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const isToday = date.toDateString() === new Date().toDateString();
  if (isToday) return formatTime(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function getInitials(name: string | null, phone: string): string {
  if (name) return name.charAt(0).toUpperCase();
  return phone.charAt(phone.length - 1);
}
