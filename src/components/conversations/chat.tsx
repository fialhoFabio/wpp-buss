'use client';

import { useCallback, useEffect, useState } from 'react';
import { dbGetConversations, dbGetMessages, dbGetActiveConversationIds, dbGetPhoneNumbers, supabase } from 'lib/supabase';
import { type Conversation, type Message, type PhoneNumber } from './chat-utils';
import { ConversationSidebar } from './conversation-sidebar';
import { MessagePanel } from './message-panel';
import { AccountsDrawer } from './accounts-drawer';
import { ChatDebugDrawer } from './chat-debug-drawer';
import { useAuth } from 'lib/useAuth';
import { isDebugUser as checkDebugUser } from 'lib/debug';

export const ConversationsChat = () => {
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [search, setSearch] = useState('');
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set());
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [showAccountsDrawer, setShowAccountsDrawer] = useState(false);
  const [showDebugDrawer, setShowDebugDrawer] = useState(false);

  const isDebugUser = !authLoading && checkDebugUser(user?.id);

  const selectedConversation = conversations.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) supabase.realtime.setAuth(session.access_token);
    });
  }, []);

  useEffect(() => {
    if (authLoading) return;
    dbGetConversations(user?.id).then(({ data }) => {
      setConversations(data);
      setLoadingConversations(false);
    });
    dbGetActiveConversationIds(user?.id).then(setActiveIds);
    dbGetPhoneNumbers(user?.id).then(({ data }) => setPhoneNumbers(data));
  }, [user, authLoading]);

  // Reload conversations when the tab regains focus (catches missed inbound new conversations)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        dbGetConversations(user?.id).then(({ data }) => setConversations(data));
        dbGetActiveConversationIds(user?.id).then(setActiveIds);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user?.id]);

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
          dbGetConversations(user?.id).then(({ data }) => setConversations(data));
          dbGetActiveConversationIds(user?.id).then(setActiveIds);
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
  }, [conversations.length, user?.id]);

  // Subscribe to new conversations channel so first-contact inbounds appear without F5
  useEffect(() => {
    const channel = supabase
      .channel('wpp:conversations', { config: { private: true } })
      .on('broadcast', { event: 'INSERT' }, () => {
        dbGetConversations(user?.id).then(({ data }) => setConversations(data));
        dbGetActiveConversationIds(user?.id).then(setActiveIds);
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user?.id]);

  const handleLoadConversation = useCallback((newConv: Conversation) => {
    setConversations((prev) => {
      const exists = prev.some((c) => c.id === newConv.id);
      if (exists) {
        return prev.map((c) => (c.id === newConv.id ? { ...c, isDebugLoaded: true } : c));
      }
      return [{ ...newConv, isDebugLoaded: true }, ...prev];
    });
    setSelectedId(newConv.id);
  }, []);

  const onMessageSent = useCallback(() => {
    if (selectedId) void dbGetMessages(selectedId).then(({ data }) => setMessages(data));
  }, [selectedId]);

  return (
    <>
    <AccountsDrawer open={showAccountsDrawer} onClose={() => setShowAccountsDrawer(false)} />
    {isDebugUser && (
      <ChatDebugDrawer
        open={showDebugDrawer}
        onClose={() => setShowDebugDrawer(false)}
        onLoadConversation={handleLoadConversation}
      />
    )}
    <div className='flex h-[calc(100svh-5rem)] w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm'>
      <ConversationSidebar
        conversations={conversations}
        loading={loadingConversations}
        selectedId={selectedId}
        unreadIds={unreadIds}
        activeIds={activeIds}
        search={search}
        onSearchChange={setSearch}
        onSelect={setSelectedId}
        phoneNumbers={phoneNumbers}
        onOpenAccounts={() => setShowAccountsDrawer(true)}
        isDebugUser={isDebugUser}
        onOpenDebug={() => setShowDebugDrawer(true)}
      />
      <MessagePanel
        conversation={selectedConversation}
        messages={messages}
        loading={loadingMessages}
        isActive={selectedId !== null && activeIds.has(selectedId)}
        onMessageSent={onMessageSent}
      />
    </div>
    </>  
  );
};

