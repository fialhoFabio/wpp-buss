import type { Database } from 'types/database.types';

export type Conversation = Database['public']['Tables']['wpp_conversations']['Row'];
export type Message = Database['public']['Tables']['wpp_messages']['Row'];

export function getMessageText(message: Message): string {
  const content = message.message_content as Record<string, unknown> | null;
  if (!content) return `[${message.message_type}]`;

  if (typeof content['body'] === 'string') return content['body'];
  const text = content['text'];
  if (text && typeof text === 'object' && typeof (text as Record<string, unknown>)['body'] === 'string') {
    return (text as Record<string, unknown>)['body'] as string;
  }
  if (typeof content['caption'] === 'string') return content['caption'];

  if (message.message_type === 'image') return '📷 Imagem';
  if (message.message_type === 'audio') return '🎵 Áudio';
  if (message.message_type === 'video') return '🎬 Vídeo';
  if (message.message_type === 'document') return '📄 Documento';
  if (message.message_type === 'sticker') return '🎨 Sticker';
  if (message.message_type === 'location') return '📍 Localização';
  if (message.message_type === 'reaction') return '👍 Reação';

  return `[${message.message_type}]`;
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
