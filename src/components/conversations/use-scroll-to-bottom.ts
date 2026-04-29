'use client';

import { useRef, useEffect } from 'react';
import type { Message, PendingMessage } from './chat-utils';

export const useScrollToBottom = (messages: Message[], pending: PendingMessage[]) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pending]);

  return messagesEndRef;
};
