'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { sendFreeMessage } from 'lib/messaging';
import type { Conversation, Message, PendingMessage } from './chat-utils';

export const useMessageSend = (
  conversation: Conversation | null,
  messages: Message[],
  onMessageSent: () => void,
) => {
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

  return { text, setText, pending, failedText, setFailedText, handleSend, handleKeyDown };
};
