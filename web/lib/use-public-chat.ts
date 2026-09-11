'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChatClientError,
  listChatMessages,
  setChatAccessToken,
  streamChatTurn,
  type ChatMessage,
} from '@/lib/api/chat';
import {
  ensurePublicChatSession,
  startFreshPublicChatSession,
} from '@/lib/api/public-chat';
import {
  mergeWidgets,
  widgetFromToolOutput,
  widgetsFromAssistantText,
  type ChatWidget,
} from '@/lib/chat-paint';

export type Bubble = {
  key: string;
  role: 'user' | 'assistant';
  content: string;
  widgets?: ChatWidget[];
};

function statusMessage(error: unknown): string {
  if (error instanceof ChatClientError) {
    return error.message;
  }
  return 'No hay red.';
}

function bubblesFromHistory(rows: ChatMessage[]): Bubble[] {
  const out: Bubble[] = [];
  let pending: ChatWidget | null = null;
  for (const row of rows) {
    if (row.role === 'tool') {
      pending = widgetFromToolOutput(row.toolResult ?? row.content) ?? pending;
      continue;
    }
    if (row.role === 'user') {
      pending = null;
      out.push({ key: row.id, role: 'user', content: row.content });
      continue;
    }
    if (row.role === 'assistant') {
      out.push({
        key: row.id,
        role: 'assistant',
        content: row.content,
        widgets: mergeWidgets(pending, widgetsFromAssistantText(row.content)),
      });
      pending = null;
    }
  }
  return out;
}

function patchLastAssistant(
  prev: Bubble[],
  patch: Partial<Pick<Bubble, 'content' | 'widgets'>>,
): Bubble[] {
  const next = [...prev];
  for (let i = next.length - 1; i >= 0; i -= 1) {
    if (next[i].role === 'assistant') {
      next[i] = { ...next[i], ...patch };
      break;
    }
  }
  return next;
}

export function usePublicChat() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [text, setText] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string | null>(null);
  const streamingRef = useRef(false);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    streamingRef.current = streaming;
  }, [streaming]);

  useEffect(() => {
    const el = threadRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [bubbles, streaming]);

  const boot = useCallback(async (fresh: boolean) => {
    setError(null);
    abortRef.current?.abort();
    try {
      const session = fresh
        ? await startFreshPublicChatSession()
        : await ensurePublicChatSession();
      setChatAccessToken(session.token);
      setConversationId(session.conversation.id);
      const rows = await listChatMessages(session.conversation.id);
      setBubbles(bubblesFromHistory(rows));
      setReady(true);
    } catch (caught) {
      if (
        caught instanceof ChatClientError &&
        (caught.status === 401 || caught.status === 404) &&
        !fresh
      ) {
        await boot(true);
        return;
      }
      setError(statusMessage(caught));
      setReady(false);
    }
  }, []);

  useEffect(() => {
    void boot(false);
    return () => {
      abortRef.current?.abort();
    };
  }, [boot]);

  const send = useCallback(async (display: string, wire?: string) => {
    const shown = display.trim();
    const payload = (wire ?? display).trim();
    const id = conversationIdRef.current;
    if (!shown || !payload || !id || streamingRef.current) {
      return;
    }
    setError(null);
    setText('');
    setBubbles((prev) => [
      ...prev,
      { key: `user-${Date.now()}`, role: 'user', content: shown },
      { key: `asst-${Date.now()}`, role: 'assistant', content: '', widgets: [] },
    ]);
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await streamChatTurn(
        id,
        payload,
        {
          onToolStart: () => undefined,
          onToolDone: (_toolCallId, _toolName, output) => {
            const widget = widgetFromToolOutput(output);
            if (!widget) {
              return;
            }
            setBubbles((prev) => {
              const last = [...prev].reverse().find((item) => item.role === 'assistant');
              const merged = mergeWidgets(widget, last?.widgets ?? []);
              return patchLastAssistant(prev, { widgets: merged });
            });
          },
          onTextDelta: (delta) => {
            setBubbles((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              if (last?.role === 'assistant') {
                copy[copy.length - 1] = {
                  ...last,
                  content: last.content + delta,
                };
              }
              return copy;
            });
          },
          onStreamError: (streamError) => {
            setError(streamError);
          },
        },
        controller.signal,
      );
    } catch (caught) {
      setError(statusMessage(caught));
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    bubbles,
    text,
    setText,
    streaming,
    error,
    ready,
    threadRef,
    boot,
    send,
    stop,
  };
}
