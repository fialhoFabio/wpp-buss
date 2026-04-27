'use client';

import { useEffect, useRef, useState } from 'react';
import { dbGetConversations, dbGetMessages, supabase } from 'lib/supabase';
import type { Database } from 'types/database.types';

type Conversation = Database['public']['Tables']['wpp_conversations']['Row'];
type Message = Database['public']['Tables']['wpp_messages']['Row'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMessageText(message: Message): string {
  const content = message.message_content as Record<string, unknown> | null;
  if (!content) return `[${message.message_type}]`;

  if (typeof (content['body']) === 'string') return content['body'];
  const text = content['text'];
  if (text && typeof text === 'object' && typeof (text as Record<string, unknown>)['body'] === 'string') {
    return (text as Record<string, unknown>)['body'] as string;
  }
  if (typeof (content['caption']) === 'string') return content['caption'];

  if (message.message_type === 'image') return '📷 Imagem';
  if (message.message_type === 'audio') return '🎵 Áudio';
  if (message.message_type === 'video') return '🎬 Vídeo';
  if (message.message_type === 'document') return '📄 Documento';
  if (message.message_type === 'sticker') return '🎨 Sticker';
  if (message.message_type === 'location') return '📍 Localização';
  if (message.message_type === 'reaction') return '👍 Reação';

  return `[${message.message_type}]`;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatConversationDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return formatTime(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function getInitials(name: string | null, phone: string): string {
  if (name) return name.charAt(0).toUpperCase();
  return phone.charAt(phone.length - 1);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const ConversationItem = ({
  conversation,
  isSelected,
  onClick,
}: {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-100 ${
      isSelected ? 'bg-gray-100' : ''
    }`}
  >
    <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-lg font-semibold text-white'>
      {getInitials(conversation.contact_name, conversation.contact_phone)}
    </div>
    <div className='min-w-0 flex-1'>
      <div className='flex items-center justify-between gap-2'>
        <span className='truncate text-sm font-semibold text-gray-900'>
          {conversation.contact_name || conversation.contact_phone}
        </span>
        <span className='flex-shrink-0 text-xs text-gray-500'>
          {formatConversationDate(conversation.last_message_at)}
        </span>
      </div>
      <p className='truncate text-xs text-gray-500'>
        {conversation.display_phone_number || conversation.contact_phone}
      </p>
    </div>
  </button>
);

const MessageBubble = ({ message }: { message: Message }) => {
  const text = getMessageText(message);
  return (
    <div className='flex justify-start'>
      <div className='max-w-[70%] rounded-lg rounded-tl-none bg-white px-3 py-2 shadow-sm'>
        <p className='whitespace-pre-wrap break-words text-sm text-gray-900'>{text}</p>
        <p className='mt-1 text-right text-[10px] text-gray-500'>{formatTime(message.timestamp)}</p>
      </div>
    </div>
  );
};

const EmptyPanel = () => (
  <div className='flex flex-1 flex-col items-center justify-center bg-[#f0f2f5]'>
    <div className='flex h-24 w-24 items-center justify-center rounded-full bg-gray-200'>
      <svg className='h-12 w-12 text-gray-400' fill='currentColor' viewBox='0 0 24 24'>
        <path d='M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z' />
      </svg>
    </div>
    <p className='mt-4 text-lg font-medium text-gray-600'>Selecione uma conversa</p>
    <p className='mt-1 text-sm text-gray-400'>Escolha uma conversa na lista para visualizar as mensagens.</p>
  </div>
);

const LoadingMessages = () => (
  <div className='flex flex-1 items-center justify-center'>
    <p className='text-sm text-gray-500'>Carregando mensagens...</p>
  </div>
);

// ---------------------------------------------------------------------------
// Main chat component
// ---------------------------------------------------------------------------

export const ConversationsChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations.find((c) => c.id === selectedId) ?? null;

  // Set realtime auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }
    });
  }, []);

  // Load conversations
  useEffect(() => {
    dbGetConversations().then(({ data }) => {
      setConversations(data);
      setLoadingConversations(false);
    });
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (!selectedId) return;
    setLoadingMessages(true);
    setMessages([]);
    dbGetMessages(selectedId).then(({ data }) => {
      setMessages(data);
      setLoadingMessages(false);
    });
  }, [selectedId]);

  // Real-time: new messages for selected conversation
  useEffect(() => {
    if (!selectedId) return;
    const msgChannel = supabase
      .channel(`wpp:conversation:${selectedId}:messages`, { config: { private: true } })
      .on('broadcast', { event: 'INSERT' }, () => {
        dbGetMessages(selectedId).then(({ data }) => setMessages(data));
        dbGetConversations().then(({ data }) => setConversations(data));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(msgChannel);
    };
  }, [selectedId]);

  // Real-time: conversation row updates (e.g. last_message_at)
  useEffect(() => {
    if (!selectedId) return;
    const convoChannel = supabase
      .channel(`wpp:conversation:${selectedId}`, { config: { private: true } })
      .on('broadcast', { event: 'UPDATE' }, () => {
        dbGetConversations().then(({ data }) => setConversations(data));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(convoChannel);
    };
  }, [selectedId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredConversations = search.trim()
    ? conversations.filter(
        (c) =>
          c.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
          c.contact_phone.includes(search)
      )
    : conversations;

  return (
    <div className='flex h-[calc(100svh-5rem)] w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm'>
      {/* Left sidebar */}
      <div className='flex w-80 flex-shrink-0 flex-col border-r border-gray-200 bg-white'>
        {/* Sidebar header */}
        <div className='border-b border-gray-200 p-3'>
          <div className='relative'>
            <svg
              className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
            <input
              type='text'
              placeholder='Buscar conversa...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full rounded-full bg-gray-100 py-2 pl-9 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500'
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className='flex-1 overflow-y-auto'>
          {loadingConversations ? (
            <div className='p-4 text-center text-sm text-gray-500'>Carregando conversas...</div>
          ) : filteredConversations.length === 0 ? (
            <div className='p-4 text-center text-sm text-gray-500'>Nenhuma conversa encontrada.</div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedId === conversation.id}
                onClick={() => setSelectedId(conversation.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right panel */}
      {!selectedId ? (
        <EmptyPanel />
      ) : (
        <div className='flex flex-1 flex-col overflow-hidden'>
          {/* Chat header */}
          <div className='flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm'>
            <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-base font-semibold text-white'>
              {selectedConversation &&
                getInitials(selectedConversation.contact_name, selectedConversation.contact_phone)}
            </div>
            <div>
              <p className='text-sm font-semibold text-gray-900'>
                {selectedConversation?.contact_name || selectedConversation?.contact_phone}
              </p>
              <p className='text-xs text-gray-500'>
                {selectedConversation?.display_phone_number
                  ? `via ${selectedConversation.display_phone_number}`
                  : selectedConversation?.contact_phone}
              </p>
            </div>
          </div>

          {/* Messages area */}
          <div className='flex-1 overflow-y-auto bg-[#efeae2] px-4 py-3'>
            {loadingMessages ? (
              <LoadingMessages />
            ) : messages.length === 0 ? (
              <div className='flex h-full items-center justify-center'>
                <p className='text-sm text-gray-500'>Nenhuma mensagem nesta conversa.</p>
              </div>
            ) : (
              <div className='space-y-2'>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Reply bar (disabled until sending is implemented) */}
          <div className='flex items-center gap-3 border-t border-gray-200 bg-white px-4 py-3'>
            <input
              type='text'
              placeholder='Resposta em breve...'
              disabled
              className='flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-400 outline-none cursor-not-allowed'
            />
            <button
              disabled
              className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-400 cursor-not-allowed'
            >
              <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z' />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
