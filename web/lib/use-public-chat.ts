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
import { stripFichaWirePrefix, stripLeakedToolTalk, visibleAssistantStream } from '@/lib/chat-sanitize';

export type Bubble = {
  key: string;
  role: 'user' | 'assistant';
  content: string;
  widgets?: ChatWidget[];
};

const NEAR_BOTTOM_PX = 40;
const CHARS_PER_TICK = 5;
const TICK_MS = 18;
const OPENING =
  'Hola, soy Luciano Mocchegiani, Software Engineer. Preguntame algo.';

function openingBubbles(): Bubble[] {
  return [{ key: 'opening', role: 'assistant', content: OPENING, widgets: [] }];
}

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
      out.push({ key: row.id, role: 'user', content: stripFichaWirePrefix(row.content) });
      continue;
    }
    if (row.role === 'assistant') {
      out.push({
        key: row.id,
        role: 'assistant',
        content: stripLeakedToolTalk(row.content),
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

function isNearBottom(el: HTMLElement): boolean {
  return el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
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
  const stickRef = useRef(true);
  const jumpingRef = useRef(false);
  const lastTouchYRef = useRef(0);
  const queueRef = useRef('');
  const tickRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heldWidgetsRef = useRef<ChatWidget[]>([]);
  const sseOpenRef = useRef(false);
  const rawAssistantRef = useRef('');
  const emittedVisibleRef = useRef('');

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    streamingRef.current = streaming;
  }, [streaming]);

  const scrollIfStuck = useCallback(() => {
    const el = threadRef.current;
    if (el && stickRef.current) {
      jumpingRef.current = true;
      el.scrollTop = el.scrollHeight;
      requestAnimationFrame(() => {
        jumpingRef.current = false;
      });
    }
  }, []);

  const flushHeldWidgets = useCallback(() => {
    if (sseOpenRef.current || queueRef.current.length > 0) {
      return;
    }
    const held = heldWidgetsRef.current;
    if (held.length === 0) {
      return;
    }
    heldWidgetsRef.current = [];
    setBubbles((prev) => {
      const last = [...prev].reverse().find((item) => item.role === 'assistant');
      return patchLastAssistant(prev, {
        widgets: mergeWidgets(null, [...(last?.widgets ?? []), ...held]),
      });
    });
  }, []);

  const drainQueue = useCallback(() => {
    if (tickRef.current) {
      clearTimeout(tickRef.current);
      tickRef.current = null;
    }
    const chunk = queueRef.current.slice(0, CHARS_PER_TICK);
    if (!chunk) {
      flushHeldWidgets();
      return;
    }
    queueRef.current = queueRef.current.slice(CHARS_PER_TICK);
    setBubbles((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last?.role === 'assistant') {
        copy[copy.length - 1] = { ...last, content: last.content + chunk };
      }
      return copy;
    });
    tickRef.current = setTimeout(drainQueue, TICK_MS);
  }, [flushHeldWidgets]);

  useEffect(() => {
    scrollIfStuck();
  }, [bubbles, streaming, scrollIfStuck]);

  useEffect(() => {
    const el = threadRef.current;
    if (!el) {
      return;
    }
    const node = el;
    function onScroll(): void {
      if (jumpingRef.current) {
        return;
      }
      stickRef.current = isNearBottom(node);
    }
    function onWheel(e: WheelEvent): void {
      if (e.deltaY < 0) {
        stickRef.current = false;
      }
    }
    function onTouchStart(e: TouchEvent): void {
      lastTouchYRef.current = e.touches[0]?.clientY ?? 0;
    }
    function onTouchMove(e: TouchEvent): void {
      const y = e.touches[0]?.clientY ?? lastTouchYRef.current;
      if (y - lastTouchYRef.current > 6) {
        stickRef.current = false;
      }
      lastTouchYRef.current = y;
    }
    node.addEventListener('scroll', onScroll, { passive: true });
    node.addEventListener('wheel', onWheel, { passive: true });
    node.addEventListener('touchstart', onTouchStart, { passive: true });
    node.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      node.removeEventListener('scroll', onScroll);
      node.removeEventListener('wheel', onWheel);
      node.removeEventListener('touchstart', onTouchStart);
      node.removeEventListener('touchmove', onTouchMove);
    };
  }, [ready, bubbles.length]);

  useEffect(() => {
    return () => {
      if (tickRef.current) {
        clearTimeout(tickRef.current);
      }
    };
  }, []);

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
      setBubbles(rows.length === 0 ? openingBubbles() : bubblesFromHistory(rows));
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

  const send = useCallback(
    async (display: string, wire?: string) => {
      const shown = display.trim();
      const payload = (wire ?? display).trim();
      const id = conversationIdRef.current;
      if (!shown || !payload || !id || streamingRef.current) {
        return;
      }
      setError(null);
      setText('');
      stickRef.current = true;
      queueRef.current = '';
      heldWidgetsRef.current = [];
      sseOpenRef.current = true;
      rawAssistantRef.current = '';
      emittedVisibleRef.current = '';
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
              heldWidgetsRef.current = mergeWidgets(widget, heldWidgetsRef.current);
            },
            onTextDelta: (delta) => {
              if (!delta) {
                return;
              }
              rawAssistantRef.current += delta;
              const visible = visibleAssistantStream(rawAssistantRef.current);
              const emitted = emittedVisibleRef.current;
              if (
                visible.length < emitted.length ||
                !visible.startsWith(emitted)
              ) {
                emittedVisibleRef.current = visible;
                queueRef.current = '';
                setBubbles((prev) =>
                  patchLastAssistant(prev, { content: visible }),
                );
                return;
              }
              const extra = visible.slice(emitted.length);
              emittedVisibleRef.current = visible;
              if (!extra) {
                return;
              }
              queueRef.current += extra;
              if (!tickRef.current) {
                drainQueue();
              }
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
        sseOpenRef.current = false;
        setStreaming(false);
        abortRef.current = null;
        if (!tickRef.current) {
          flushHeldWidgets();
        }
      }
    },
    [drainQueue, flushHeldWidgets],
  );

  const startNew = useCallback(async () => {
    if (streamingRef.current) {
      abortRef.current?.abort();
    }
    if (tickRef.current) {
      clearTimeout(tickRef.current);
      tickRef.current = null;
    }
    queueRef.current = '';
    heldWidgetsRef.current = [];
    sseOpenRef.current = false;
    rawAssistantRef.current = '';
    emittedVisibleRef.current = '';
    setStreaming(false);
    setText('');
    stickRef.current = true;
    await boot(true);
  }, [boot]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    if (tickRef.current) {
      clearTimeout(tickRef.current);
      tickRef.current = null;
    }
    queueRef.current = '';
    sseOpenRef.current = false;
    const visible = visibleAssistantStream(rawAssistantRef.current);
    if (visible) {
      setBubbles((prev) => patchLastAssistant(prev, { content: visible }));
    }
    flushHeldWidgets();
  }, [flushHeldWidgets]);

  return {
    bubbles,
    text,
    setText,
    streaming,
    error,
    ready,
    threadRef,
    boot,
    startNew,
    send,
    stop,
  };
}
