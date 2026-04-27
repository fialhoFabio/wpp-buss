'use client';

import { type Conversation, formatConversationDate, getInitials } from './chat-utils';

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

export const ConversationSidebar = ({
  conversations,
  loading,
  selectedId,
  search,
  onSearchChange,
  onSelect,
}: {
  conversations: Conversation[];
  loading: boolean;
  selectedId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
}) => {
  const filtered = search.trim()
    ? conversations.filter(
        (c) =>
          c.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
          c.contact_phone.includes(search)
      )
    : conversations;

  return (
    <div className='flex w-80 flex-shrink-0 flex-col border-r border-gray-200 bg-white'>
      <div className='border-b border-gray-200 p-3'>
        <div className='relative'>
          <svg
            className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
          </svg>
          <input
            type='text'
            placeholder='Buscar conversa...'
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className='w-full rounded-full bg-gray-100 py-2 pl-9 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500'
          />
        </div>
      </div>

      <div className='flex-1 overflow-y-auto'>
        {loading ? (
          <div className='p-4 text-center text-sm text-gray-500'>Carregando conversas...</div>
        ) : filtered.length === 0 ? (
          <div className='p-4 text-center text-sm text-gray-500'>Nenhuma conversa encontrada.</div>
        ) : (
          filtered.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedId === conversation.id}
              onClick={() => onSelect(conversation.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
