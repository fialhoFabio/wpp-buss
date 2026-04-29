'use client';

import { useRef, useEffect } from 'react';
import { type Conversation, type Message, getMessageText, formatTime, getInitials } from './chat-utils';

const MessageBubble = ({ message }: { message: Message }) => {
  const isOutbound = message.direction === 'outbound';
  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] px-3 py-2 shadow-sm rounded-lg ${isOutbound ? 'rounded-tr-none bg-[#d9fdd3]' : 'rounded-tl-none bg-white'}`}>
        <p className='whitespace-pre-wrap break-words text-sm text-gray-900'>{getMessageText(message)}</p>
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

export const MessagePanel = ({
  conversation,
  messages,
  loading,
}: {
  conversation: Conversation | null;
  messages: Message[];
  loading: boolean;
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) return <EmptyPanel />;

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      <div className='flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm'>
        <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-base font-semibold text-white'>
          {getInitials(conversation.contact_name, conversation.contact_phone)}
        </div>
        <div>
          <p className='text-sm font-semibold text-gray-900'>
            {conversation.contact_name || conversation.contact_phone}
          </p>
          <p className='text-xs text-gray-500'>
            {conversation.display_phone_number ? `via ${conversation.display_phone_number}` : conversation.contact_phone}
          </p>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto bg-[#efeae2] px-4 py-3'>
        {loading ? (
          <div className='flex h-full items-center justify-center'>
            <p className='text-sm text-gray-500'>Carregando mensagens...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className='flex h-full items-center justify-center'>
            <p className='text-sm text-gray-500'>Nenhuma mensagem nesta conversa.</p>
          </div>
        ) : (
          <div className='space-y-2'>
            {messages.map((message) => <MessageBubble key={message.id} message={message} />)}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className='flex items-center gap-3 border-t border-gray-200 bg-white px-4 py-3'>
        <input
          type='text'
          placeholder='Resposta em breve...'
          disabled
          className='flex-1 cursor-not-allowed rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-400 outline-none'
        />
        <button disabled className='flex h-10 w-10 flex-shrink-0 cursor-not-allowed items-center justify-center rounded-full bg-gray-200 text-gray-400'>
          <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
            <path d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z' />
          </svg>
        </button>
      </div>
    </div>
  );
};
