'use client';

import {
  type Conversation,
  type LastMessagePreview,
  type PhoneNumber,
  formatConversationDate,
  getInitials,
  getPreviewText,
  getPhoneColorMap,
} from './chat-utils';

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
  phoneLabel?: string | undefined;
  phoneDot?: string | undefined;
  phoneBg?: string | undefined;
  phoneText?: string | undefined;
  onClick: () => void;
}) => {
  const lastMsg: LastMessagePreview | null =
    conversation.wpp_messages[0] ?? null;
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-gray-100 ${
        isSelected ? 'bg-gray-100' : ''
      } ${
        conversation.isDebugLoaded
          ? 'border-l-4 border-orange-500 pl-3 pr-4 bg-orange-50/20 hover:bg-orange-50/40'
          : 'px-4'
      }`}
    >
      <div className='relative flex-shrink-0'>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white ${
            conversation.isDebugLoaded ? 'bg-orange-500' : 'bg-emerald-500'
          }`}
        >
          {getInitials(conversation.contact_name, conversation.contact_phone)}
        </div>
        {hasUnread && <UnreadDot />}
        <WindowDot open={isActive} />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center justify-between gap-2'>
          <span
            className={`truncate text-sm ${hasUnread ? 'font-bold' : 'font-semibold'} text-gray-900`}
          >
            {conversation.contact_name || conversation.contact_phone}
          </span>
          <div className='flex flex-shrink-0 items-center gap-1'>
            {conversation.isDebugLoaded && (
              <span className='flex-shrink-0 rounded bg-orange-100 px-1 py-0.5 text-[9px] font-bold text-orange-700 uppercase tracking-wider'>
                Debug
              </span>
            )}
            <WindowPill open={isActive} />
            <span className='text-xs text-gray-500'>
              {formatConversationDate(conversation.last_message_at)}
            </span>
          </div>
        </div>
        <p
          className={`truncate text-xs ${hasUnread ? 'font-semibold text-gray-800' : 'text-gray-500'}`}
        >
          {lastMsg
            ? getPreviewText(lastMsg)
            : conversation.display_phone_number || conversation.contact_phone}
        </p>
        {phoneLabel && (
          <div className='mt-0.5 flex items-center gap-1'>
            <span
              className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${phoneDot}`}
            />
            <span
              className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${phoneBg} ${phoneText}`}
            >
              {phoneLabel}
            </span>
          </div>
        )}
      </div>
    </button>
  );
};

const PhoneNumbersPanel = ({
  phones,
  onOpenAccounts,
  isDebugUser,
  onOpenDebug,
}: {
  phones: PhoneNumber[];
  onOpenAccounts: () => void;
  isDebugUser?: boolean | undefined;
  onOpenDebug?: (() => void) | undefined;
}) => {
  const colorMap = getPhoneColorMap(phones);
  if (phones.length === 0) {
    return (
      <div className='border-b border-gray-200 px-4 py-3'>
        <div className='flex items-center justify-between'>
          <span className='text-xs font-semibold uppercase tracking-wide text-gray-400'>
            Números
          </span>
          <div className='flex items-center gap-1.5'>
            {isDebugUser && onOpenDebug && (
              <button
                onClick={onOpenDebug}
                className='flex items-center gap-1 rounded-md bg-orange-500 px-2 py-1 text-xs font-semibold text-white hover:bg-orange-600 transition-colors'
              >
                🛠 Debug
              </button>
            )}
            <button
              onClick={onOpenAccounts}
              className='flex items-center gap-1 rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-600'
            >
              <svg
                className='h-3.5 w-3.5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                />
              </svg>
              Gerenciar contas
            </button>
          </div>
        </div>
        <p className='mt-2 text-xs text-gray-400'>Nenhum número vinculado.</p>
      </div>
    );
  }
  return (
    <div className='border-b border-gray-200 px-4 py-3'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-semibold uppercase tracking-wide text-gray-400'>
          Números
        </span>
        <div className='flex items-center gap-1.5'>
          {isDebugUser && onOpenDebug && (
            <button
              onClick={onOpenDebug}
              className='flex items-center gap-1 rounded-md bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-orange-600 transition-colors'
            >
              🛠 Debug
            </button>
          )}
          <button
            onClick={onOpenAccounts}
            className='flex items-center gap-1 rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-600'
          >
            <svg
              className='h-3.5 w-3.5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
              />
            </svg>
            Gerenciar contas
          </button>
        </div>
      </div>
      <ul className='mt-2 space-y-1'>
        {phones.map((p) => {
          const color = colorMap.get(p.phone_number_id);
          return (
            <li key={p.id} className='flex items-center gap-2'>
              <span
                className={`h-2 w-2 flex-shrink-0 rounded-full ${color?.dot ?? 'bg-gray-400'}`}
              />
              <span className='truncate text-xs text-gray-700'>
                {p.verified_name ?? p.display_phone_number ?? p.phone_number_id}
              </span>
              {p.display_phone_number && p.verified_name && (
                <span className='ml-auto flex-shrink-0 text-[10px] text-gray-400'>
                  {p.display_phone_number}
                </span>
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
  isDebugUser,
  onOpenDebug,
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
  isDebugUser?: boolean | undefined;
  onOpenDebug?: (() => void) | undefined;
}) => {
  const colorMap = getPhoneColorMap(phoneNumbers);

  const filtered = search.trim()
    ? conversations.filter(
        (c) =>
          c.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
          c.contact_phone.includes(search),
      )
    : conversations;

  return (
    <div className='flex w-80 flex-shrink-0 flex-col border-r border-gray-200 bg-white'>
      <PhoneNumbersPanel
        phones={phoneNumbers}
        onOpenAccounts={onOpenAccounts}
        isDebugUser={isDebugUser}
        onOpenDebug={onOpenDebug}
      />
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
            onChange={(e) => onSearchChange(e.target.value)}
            className='w-full rounded-full bg-gray-100 py-2 pl-9 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500'
          />
        </div>
      </div>
      <div className='flex-1 overflow-y-auto'>
        {loading ? (
          <div className='p-4 text-center text-sm text-gray-500'>
            Carregando conversas...
          </div>
        ) : filtered.length === 0 ? (
          <div className='p-4 text-center text-sm text-gray-500'>
            Nenhuma conversa encontrada.
          </div>
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
