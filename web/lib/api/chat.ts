/**
 * Cliente HTTP+SSE hacia `NEXT_PUBLIC_CHAT_API_URL` (sesión pública).
 */

export type ChatConversation = {
  id: string;
  tenantId: string;
  userId: string;
  title: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  toolName: string | null;
  toolResult?: unknown;
  createdAt: string;
};

export class ChatClientError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ChatClientError';
    this.status = status;
  }
}

function chatBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_CHAT_API_URL?.replace(/\/$/, '') ?? '';
  if (!base) {
    throw new ChatClientError(503, 'Chat no configurado (NEXT_PUBLIC_CHAT_API_URL)');
  }
  return base;
}

let accessToken: string | null = null;

export function setChatAccessToken(token: string | null): void {
  accessToken = token;
}

function errorMessage(status: number, parsed: unknown, fallback: string): string {
  if (typeof parsed === 'object' && parsed !== null) {
    const rec = parsed as { error?: unknown; message?: unknown };
    if (typeof rec.error === 'string' && rec.error.trim()) {
      return rec.error;
    }
    if (typeof rec.message === 'string' && rec.message.trim()) {
      return rec.message;
    }
  }
  if (status === 429) {
    return 'Llegaste al tope de consultas por ahora. Probá más tarde.';
  }
  if (status === 503) {
    return 'El chat no está habilitado en este entorno.';
  }
  if (status === 401) {
    return 'La sesión venció. Reintentá.';
  }
  return fallback;
}

async function parseJsonBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text.trim()) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

async function chatFetch(path: string, init: RequestInit): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('Accept', headers.get('Accept') ?? 'application/json');
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return fetch(`${chatBaseUrl()}${path}`, { ...init, headers });
}

async function chatJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await chatFetch(path, init);
  const parsed = await parseJsonBody(res);
  if (!res.ok) {
    throw new ChatClientError(
      res.status,
      errorMessage(res.status, parsed, `Error HTTP ${res.status}`),
    );
  }
  return parsed as T;
}

export async function listChatMessages(id: string): Promise<ChatMessage[]> {
  const data = await chatJson<{ items: ChatMessage[] }>(
    `/v1/conversations/${id}/messages`,
  );
  return data.items ?? [];
}

export type ChatStreamHandlers = {
  onToolStart: (toolCallId: string, toolName: string) => void;
  onToolDone: (toolCallId: string, toolName: string, output?: unknown) => void;
  onTextDelta: (delta: string) => void;
  onStreamError: (message: string) => void;
};

export function isChatAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  );
}

export async function streamChatTurn(
  conversationId: string,
  text: string,
  handlers: ChatStreamHandlers,
  signal?: AbortSignal,
): Promise<'ok' | 'aborted'> {
  try {
    const res = await chatFetch(`/v1/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ text }),
      signal,
    });

    if (!res.ok) {
      const parsed = await parseJsonBody(res);
      throw new ChatClientError(
        res.status,
        errorMessage(res.status, parsed, `Error HTTP ${res.status}`),
      );
    }
    if (!res.body) {
      throw new ChatClientError(502, 'El asistente no está disponible.');
    }
    await consumeUiMessageStream(res.body, handlers);
    return signal?.aborted ? 'aborted' : 'ok';
  } catch (error) {
    if (isChatAbortError(error) || signal?.aborted) {
      return 'aborted';
    }
    throw error;
  }
}

async function consumeUiMessageStream(
  body: ReadableStream<Uint8Array>,
  handlers: ChatStreamHandlers,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';
    for (const part of parts) {
      dispatchSseBlock(part, handlers);
    }
  }
  if (buffer.trim()) {
    dispatchSseBlock(buffer, handlers);
  }
}

function dispatchSseBlock(block: string, handlers: ChatStreamHandlers): void {
  const lines = block.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data:')) {
      continue;
    }
    const payload = trimmed.slice(5).trim();
    if (!payload || payload === '[DONE]') {
      continue;
    }
    let event: unknown;
    try {
      event = JSON.parse(payload) as unknown;
    } catch {
      continue;
    }
    applyStreamEvent(event, handlers);
  }
}

function applyStreamEvent(event: unknown, handlers: ChatStreamHandlers): void {
  if (typeof event !== 'object' || event === null) {
    return;
  }
  const rec = event as {
    type?: unknown;
    toolCallId?: unknown;
    toolName?: unknown;
    delta?: unknown;
    errorText?: unknown;
    output?: unknown;
    result?: unknown;
  };
  const type = typeof rec.type === 'string' ? rec.type : '';
  if (type === 'tool-input-start') {
    const id = typeof rec.toolCallId === 'string' ? rec.toolCallId : '';
    const name = typeof rec.toolName === 'string' ? rec.toolName : 'tool';
    if (id) {
      handlers.onToolStart(id, name);
    }
    return;
  }
  if (type === 'tool-output-available') {
    const id = typeof rec.toolCallId === 'string' ? rec.toolCallId : '';
    const name = typeof rec.toolName === 'string' ? rec.toolName : 'tool';
    if (id) {
      handlers.onToolDone(id, name, rec.output ?? rec.result);
    }
    return;
  }
  if (type === 'text-delta' && typeof rec.delta === 'string') {
    handlers.onTextDelta(rec.delta);
    return;
  }
  if (type === 'error') {
    const message =
      typeof rec.errorText === 'string' && rec.errorText.trim()
        ? rec.errorText
        : 'El proveedor de IA no está disponible. Reintentá en un momento.';
    handlers.onStreamError(message);
  }
}
