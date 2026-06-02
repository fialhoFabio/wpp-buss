'use client';

import { type Conversation, type LastMessagePreview, type PhoneNumber, formatConversationDate, getInitials, getPreviewText, getPhoneColorMap } from './chat-utils';

const UnreadDot = () => (
  <span className='absolute right-0 top-0 flex h-3 w-3'>
    <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75' />
    <span className='relative inline-flex h-3 w-3 rounded-full bg-emerald-500' />
  </span>
);

const WindowDot = ({ open }: { open: boolean }) => (
  <span
    title={open ? 'Janela de 24h aberta' : 'Janela de 24h encerrada'}
    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${open ? 'bg-emerald-500' : 'bg-red-400'}`}
  />
);

const WindowPill = ({ open }: { open: boolean }) =>
  open ? (
    <span className='flex-shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700'>
      Aberta
    </span>
  ) : null;

const ConversationItem = ({
  conversation,
  isSelected,
  hasUnread,
  isActive,
  phoneLabel,
  phoneDot,
  phoneBg,
  phoneText,
  onClick,
}: {
  conversation: Conversation;
  isSelected: boolean;
  hasUnread: boolean;
  isActive: boolean;
  phoneLabel?: string;
  phoneDot?: string;
  phoneBg?: string;
  phoneText?: string;
  onClick: () => void;
}) => {
  const lastMsg: LastMessagePreview | null = conversation.wpp_messages[0] ?? null;
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-100 ${isSelected ? 'bg-gray-100' : ''}`}
    >
      <div className='relative flex-shrink-0'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-lg font-semibold text-white'>
          {getInitials(conversation.contact_name, conversation.contact_phone)}
        </div>
        {hasUnread && <UnreadDot />}
        <WindowDot open={isActive} />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center justify-between gap-2'>
          <span className={`truncate text-sm ${hasUnread ? 'font-bold' : 'font-semibold'} text-gray-900`}>
            {conversation.contact_name || conversation.contact_phone}
          </span>
          <div className='flex flex-shrink-0 items-center gap-1'>
            <WindowPill open={isActive} />
            <span className='text-xs text-gray-500'>
              {formatConversationDate(conversation.last_message_at)}
            </span>
          </div>
        </div>
        <p className={`truncate text-xs ${hasUnread ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
          {lastMsg ? getPreviewText(lastMsg) : conversation.display_phone_number || conversation.contact_phone}
        </p>
        {phoneLabel && (
          <div className='mt-0.5 flex items-center gap-1'>
            <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${phoneDot}`} />
            <span className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${phoneBg} ${phoneText}`}>
              {phoneLabel}
            </span>
          </div>
        )}
      </div>
    </button>
  );
};

const PhoneNumbersPanel = ({ phones, onOpenAccounts }: { phones: PhoneNumber[]; onOpenAccounts: () => void }) => {
  const colorMap = getPhoneColorMap(phones);
  if (phones.length === 0) {
    return (
      <div className='border-b border-gray-200 px-4 py-3'>
        <div className='flex items-center justify-between'>
          <span className='text-xs font-semibold uppercase tracking-wide text-gray-400'>Números</span>
          <button onClick={onOpenAccounts} className='flex items-center gap-1 rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-600'>
            <svg className='h-3 w-3' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
            </svg>
            Vincular conta
          </button>
        </div>
        <p className='mt-2 text-xs text-gray-400'>Nenhum número vinculado.</p>
      </div>
    );
  }
  return (
    <div className='border-b border-gray-200 px-4 py-3'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-semibold uppercase tracking-wide text-gray-400'>Números</span>
        <button onClick={onOpenAccounts} className='flex items-center gap-1 rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-600'>
          <svg className='h-3 w-3' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
          </svg>
          Vincular conta
        </button>
      </div>
      <ul className='mt-2 space-y-1'>
        {phones.map((p) => {
          const color = colorMap.get(p.phone_number_id);
          return (
            <li key={p.id} className='flex items-center gap-2'>
              <span className={`h-2 w-2 flex-shrink-0 rounded-full ${color?.dot ?? 'bg-gray-400'}`} />
              <span className='truncate text-xs text-gray-700'>
                {p.verified_name ?? p.display_phone_number ?? p.phone_number_id}
              </span>
              {p.display_phone_number && p.verified_name && (
                <span className='ml-auto flex-shrink-0 text-[10px] text-gray-400'>{p.display_phone_number}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const ConversationSidebar = ({
  conversations,
  loading,
  selectedId,
  unreadIds,
  activeIds,
  search,
  onSearchChange,
  onSelect,
  phoneNumbers,
  onOpenAccounts,
}: {
  conversations: Conversation[];
  loading: boolean;
  selectedId: string | null;
  unreadIds: Set<string>;
  activeIds: Set<string>;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  phoneNumbers: PhoneNumber[];
  onOpenAccounts: () => void;
}) => {
  const colorMap = getPhoneColorMap(phoneNumbers);

  const filtered = search.trim()
    ? conversations.filter(
        (c) =>
          c.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
          c.contact_phone.includes(search)
      )
    : conversations;

  return (
    <div className='flex w-80 flex-shrink-0 flex-col border-r border-gray-200 bg-white'>
      <PhoneNumbersPanel phones={phoneNumbers} onOpenAccounts={onOpenAccounts} />
      <div className='border-b border-gray-200 p-3'>
        <div className='relative'>
          <svg className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
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
          filtered.map((c) => {
            const color = colorMap.get(c.phone_number_id);
            return (
              <ConversationItem
                key={c.id}
                conversation={c}
                isSelected={selectedId === c.id}
                hasUnread={unreadIds.has(c.id)}
                isActive={activeIds.has(c.id)}
                phoneLabel={color?.label}
                phoneDot={color?.dot}
                phoneBg={color?.bg}
                phoneText={color?.text}
                onClick={() => onSelect(c.id)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
