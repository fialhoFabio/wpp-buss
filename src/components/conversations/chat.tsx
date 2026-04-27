'use client';

import { useEffect, useState } from 'react';
import { dbGetConversations, dbGetMessages, supabase } from 'lib/supabase';
import { type Conversation, type Message } from './chat-utils';
import { ConversationSidebar } from './conversation-sidebar';
import { MessagePanel } from './message-panel';

export const ConversationsChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [search, setSearch] = useState('');
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set());

  const selectedConversation = conversations.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) supabase.realtime.setAuth(session.access_token);
    });
  }, []);

  useEffect(() => {
    dbGetConversations().then(({ data }) => {
      setConversations(data);
      setLoadingConversations(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingMessages(true);
    setMessages([]);
    dbGetMessages(selectedId).then(({ data }) => {
      setMessages(data);
      setLoadingMessages(false);
    });
  }, [selectedId]);

  // Clear unread when conversation is opened
  useEffect(() => {
    if (!selectedId) return;
    setUnreadIds((prev) => {
      if (!prev.has(selectedId)) return prev;
      const next = new Set(prev);
      next.delete(selectedId);
      return next;
    });
  }, [selectedId]);

  // Subscribe to all conversations for live updates + unread badges
  useEffect(() => {
    if (conversations.length === 0) return;
    const channels = conversations.map((c) =>
      supabase
        .channel(`wpp:conversation:${c.id}:messages`, { config: { private: true } })
        .on('broadcast', { event: 'INSERT' }, () => {
          dbGetConversations().then(({ data }) => setConversations(data));
          setSelectedId((currentId) => {
            if (currentId === c.id) {
              dbGetMessages(c.id).then(({ data }) => setMessages(data));
            } else {
              setUnreadIds((prev) => new Set(prev).add(c.id));
            }
            return currentId;
          });
        })
        .subscribe()
    );
    return () => { channels.forEach((ch) => supabase.removeChannel(ch)); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations.length]);

  return (
    <div className='flex h-[calc(100svh-5rem)] w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm'>
      <ConversationSidebar
        conversations={conversations}
        loading={loadingConversations}
        selectedId={selectedId}
        unreadIds={unreadIds}
        search={search}
        onSearchChange={setSearch}
        onSelect={setSelectedId}
      />
      <MessagePanel
        conversation={selectedConversation}
        messages={messages}
        loading={loadingMessages}
      />
    </div>
  );
};

