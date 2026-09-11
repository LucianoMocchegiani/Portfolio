import { ChatClientError, type ChatConversation } from '@/lib/api/chat';

const TOKEN_KEY = 'luciano.publicChat.token';
const CONVERSATION_KEY = 'luciano.publicChat.conversationId';

type PublicSession = {
  token: string;
  conversation: ChatConversation;
};

function chatBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_CHAT_API_URL?.replace(/\/$/, '') ?? '';
  if (!base) {
    throw new ChatClientError(503, 'Chat no configurado (NEXT_PUBLIC_CHAT_API_URL)');
  }
  return base;
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

function readStoredSession(): { token: string; conversationId: string } | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const token = window.localStorage.getItem(TOKEN_KEY)?.trim();
  const conversationId = window.localStorage.getItem(CONVERSATION_KEY)?.trim();
  if (!token || !conversationId) {
    return null;
  }
  return { token, conversationId };
}

function writeStoredSession(token: string, conversationId: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(CONVERSATION_KEY, conversationId);
}

export function resetPublicChatSession(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(CONVERSATION_KEY);
}

async function createPublicSession(): Promise<PublicSession> {
  const res = await fetch(`${chatBaseUrl()}/v1/public/session`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
  });
  const parsed = await parseJsonBody(res);
  if (!res.ok) {
    throw new ChatClientError(
      res.status,
      'No se pudo abrir el chat. Reintentá en un momento.',
    );
  }
  const rec = parsed as { token?: unknown; conversation?: ChatConversation };
  if (typeof rec.token !== 'string' || !rec.conversation?.id) {
    throw new ChatClientError(502, 'El asistente no está disponible.');
  }
  writeStoredSession(rec.token, rec.conversation.id);
  return { token: rec.token, conversation: rec.conversation };
}

export async function ensurePublicChatSession(): Promise<PublicSession> {
  const stored = readStoredSession();
  if (stored) {
    return {
      token: stored.token,
      conversation: {
        id: stored.conversationId,
        tenantId: 'public',
        userId: 'landing',
        title: null,
        archivedAt: null,
        createdAt: '',
        updatedAt: '',
      },
    };
  }
  return createPublicSession();
}

export async function startFreshPublicChatSession(): Promise<PublicSession> {
  resetPublicChatSession();
  return createPublicSession();
}
