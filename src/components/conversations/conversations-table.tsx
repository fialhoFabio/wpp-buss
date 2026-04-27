'use client';

import { dbGetConversations } from 'lib/supabase';
import { useEffect, useState } from 'react';
import { Database } from 'types/database.types';

type Conversation = Database['public']['Tables']['wpp_conversations']['Row'];

const EmptyState = () => (
  <div className='rounded-lg border border-gray-200 bg-gray-50 p-8 text-center'>
    <p className='text-gray-600'>Nenhuma conversa encontrada.</p>
  </div>
);

const LoadingState = () => (
  <div className='flex items-center justify-center p-8'>
    <div className='text-gray-500'>Carregando conversas...</div>
  </div>
);

const ConversationRow = ({ conversation }: { conversation: Conversation }) => {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  return (
    <tr className='hover:bg-gray-50'>
      <td className='whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900'>
        {conversation.contact_name || '—'}
      </td>
      <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-600'>
        {conversation.contact_phone}
      </td>
      <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-600'>
        {conversation.display_phone_number || '—'}
      </td>
      <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-600'>
        {formatDate(conversation.last_message_at)}
      </td>
      <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-600'>
        {formatDate(conversation.created_at)}
      </td>
    </tr>
  );
};

export const ConversationsTable = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    setLoading(true);
    const { data } = await dbGetConversations();
    setConversations(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  if (loading) return <LoadingState />;
  if (conversations.length === 0) return <EmptyState />;

  return (
    <div className='overflow-hidden rounded-lg border border-gray-200 shadow-sm'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Contato
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Telefone do contato
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Número do WhatsApp
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Última mensagem
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Criado em
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200 bg-white'>
          {conversations.map((conversation) => (
            <ConversationRow key={conversation.id} conversation={conversation} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
