'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { type Conversation, type Message, getMessageText, formatTime, getInitials } from './chat-utils';
import { sendFreeMessage } from 'lib/messaging';
import { ClockIcon, SingleCheckIcon, TemplateBadge, ButtonBadge } from './icons';

type PendingMessage = { tempId: string; text: string };


const MessageBubble = ({ message, pending = false }: { message: Message | PendingMessage; pending?: boolean }) => {
  const isOutbound = pending || (message as Message).direction === 'outbound';
  const isTemplate = !pending && (message as Message).message_type === 'template';
  const isButton = !pending && (message as Message).message_type === 'button';
  const text = pending ? (message as PendingMessage).text : getMessageText(message as Message);
  const timeLabel = pending ? 'enviando...' : formatTime((message as Message).timestamp);
  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] px-3 py-2 shadow-sm rounded-lg ${isOutbound ? 'rounded-tr-none bg-[#d9fdd3]' : 'rounded-tl-none bg-white'} ${pending ? 'opacity-70' : ''}`}>
        {isTemplate && <TemplateBadge />}
        {isButton && <ButtonBadge />}
        <p className='whitespace-pre-wrap break-words text-sm text-gray-900'>{text}</p>
        <p className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${pending ? 'text-gray-400' : 'text-gray-500'}`}>
          {timeLabel}
          {isOutbound && (pending ? <ClockIcon /> : <SingleCheckIcon />)}
        </p>
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
  isActive,
  onMessageSent,
}: {
  conversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  isActive: boolean;
  onMessageSent: () => void;
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingRemoval = useRef<Set<string>>(new Set());
  const [text, setText] = useState('');
  const [pending, setPending] = useState<PendingMessage[]>([]);
  const [failedText, setFailedText] = useState<string | null>(null);

  // Remove pending bubbles on whichever messages update arrives first (realtime or explicit fetch)
  useEffect(() => {
    if (pendingRemoval.current.size === 0) return;
    const toRemove = pendingRemoval.current;
    pendingRemoval.current = new Set();
    setPending((prev) => prev.filter((p) => !toRemove.has(p.tempId)));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pending]);

  const handleSend = useCallback(async () => {
    if (!conversation || !text.trim()) return;
    const snapshot = text.trim();
    const tempId = crypto.randomUUID();
    setText('');
    setFailedText(null);
    setPending((prev) => [...prev, { tempId, text: snapshot }]);
    const { error } = await sendFreeMessage(conversation.phone_number_id, conversation.contact_phone, snapshot);
    if (error) {
      setPending((prev) => prev.filter((p) => p.tempId !== tempId));
      setFailedText(snapshot);
    } else {
      pendingRemoval.current.add(tempId);
      onMessageSent();
    }
  }, [conversation, text, onMessageSent]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  if (!conversation) return <EmptyPanel />;

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      <div className='flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm'>
        <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-base font-semibold text-white'>
          {getInitials(conversation.contact_name, conversation.contact_phone)}
        </div>
        <div className='flex-1'>
          <p className='text-sm font-semibold text-gray-900'>
            {conversation.contact_name || conversation.contact_phone}
          </p>
          <p className='text-xs text-gray-500'>
            {conversation.display_phone_number ? `via ${conversation.display_phone_number}` : conversation.contact_phone}
          </p>
        </div>
        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
          {isActive ? 'Janela aberta' : 'Janela encerrada'}
        </span>
      </div>

      {!isActive && (
        <div className='flex items-center gap-2 border-b border-orange-200 bg-orange-50 px-4 py-2 text-xs text-orange-700'>
          <svg className='h-4 w-4 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
            <path fillRule='evenodd' d='M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z' clipRule='evenodd' />
          </svg>
          Janela de 24h encerrada — apenas mensagens de template podem ser enviadas.
        </div>
      )}

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
            {pending.map((p) => <MessageBubble key={p.tempId} message={p} pending />)}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {failedText && (
        <div className='flex items-center justify-between border-t border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600'>
          <span>Falha ao enviar: &quot;{failedText}&quot;</span>
          <button
            onClick={() => { setText(failedText); setFailedText(null); }}
            className='ml-2 font-medium underline'
          >
            Tentar novamente
          </button>
        </div>
      )}
      <div className='flex items-center gap-3 border-t border-gray-200 bg-white px-4 py-3'>
        <input
          type='text'
          placeholder={isActive ? 'Digite uma mensagem...' : 'Janela encerrada — envio indisponível'}
          disabled={!isActive}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`flex-1 rounded-full px-4 py-2 text-sm outline-none ${
            isActive
              ? 'bg-gray-100 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-400'
              : 'cursor-not-allowed bg-gray-100 text-gray-400'
          }`}
        />
        <button
          disabled={!isActive || !text.trim()}
          onClick={() => void handleSend()}
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
            isActive && text.trim()
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'cursor-not-allowed bg-gray-200 text-gray-400'
          }`}
        >
          <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
            <path d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z' />
          </svg>
        </button>
      </div>
    </div>
  );
};
