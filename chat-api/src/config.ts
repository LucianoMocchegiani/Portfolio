/**
 * Env del servicio chat (portable). Si falta un required, el proceso no arranca.
 *
 * @remarks Cero `GYMBRO_*`. El huésped inyecta URLs (introspect, MCP, CORS).
 */

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env ${name}`);
  }
  return value;
}

/** OpenRouter trata `replace-me` como “sin Authorization”; fallá al boot. */
function requiredOpenRouterKey(): string {
  const value = required('OPENROUTER_API_KEY');
  if (value === 'replace-me') {
    throw new Error(
      'OPENROUTER_API_KEY is still replace-me. Recreate the container after editing chat-api/.env (restart does not reload env_file).',
    );
  }
  return value;
}

function parsePort(raw: string | undefined): number {
  if (!raw?.trim()) {
    return 3010;
  }
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${raw}`);
  }
  return port;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw?.trim()) {
    return fallback;
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`Invalid integer env: ${raw}`);
  }
  return value;
}

function parseOrigins(raw: string): string[] {
  const origins = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  if (origins.length === 0) {
    throw new Error('CORS_ORIGIN must list at least one origin');
  }
  return origins;
}

function parseBool(raw: string | undefined, fallback: boolean): boolean {
  if (!raw?.trim()) {
    return fallback;
  }
  const value = raw.trim().toLowerCase();
  if (value === 'true' || value === '1') {
    return true;
  }
  if (value === 'false' || value === '0') {
    return false;
  }
  throw new Error(`Invalid boolean env: ${raw}`);
}

function publicSessionSecret(databaseUrl: string, openrouterKey: string): string {
  const explicit = process.env.CHAT_PUBLIC_SESSION_SECRET?.trim();
  if (explicit) {
    return explicit;
  }
  return `${databaseUrl}::${openrouterKey}::public-landing`;
}

const DEFAULT_STAFF_PROMPT =
  'Hablá en español. Usá get_help. Topics: about, experience, skills, contact, projects, kuatia, faciliter, bax, quarkid, servicios-ba, aubilities, seekitup, ipskynet. No inventes empresas, fechas ni links.';

const DEFAULT_PUBLIC_PROMPT = `Sos la voz del portfolio de Luciano Mocchegiani. Hablá en español, cercano, sin vender “una IA”. No inflés el CV.

Antes de afirmar hechos, llamá get_help. Topics: about (quién es), experience, skills, contact, projects (índice), y un topic por proyecto: kuatia, faciliter, bax (asignación actual, GCBA), quarkid, servicios-ba, aubilities, seekitup, ipskynet.

Cuando listes proyectos, skills, experiencia o contacto, llamá get_help (topic projects, skills, experience, contact, o el slug). No pegues URLs largas en crudo: la UI las pinta como cards y links.

Si listás proyectos, escribí prosa (no viñetas). Links así: [Kuatia](https://kuatia.xyz/). No pongas (kuatia.xyz/) al lado del nombre.

Si preguntan por una reunión, entrevista, coordinar, charlar o “agendar”, llamá get_help topic contact y ofrecé el Calendar. No inventes otro link.

Propios: Faciliter y Kuatia. Asignados: BAX, QuarkID, Servicios BA, Aubilities, Seekitup, ISP Skynet. Si no está en el markdown, decilo.`;

export type ChatConfig = {
  port: number;
  databaseUrl: string;
  chatMcpUrl: string;
  authIntrospectUrl: string;
  authRequiredProfile: string;
  openrouterApiKey: string;
  openrouterModel: string;
  corsOrigins: string[];
  corsAppDomain: string | null;
  chatSystemPrompt: string;
  chatPublicSystemPrompt: string;
  chatPublicEnabled: boolean;
  chatPublicSessionSecret: string;
  chatPublicMaxTurnsPerHour: number;
  contextTokenBudget: number;
  maxToolSteps: number;
};

const openrouterApiKey = requiredOpenRouterKey();
const databaseUrl = required('DATABASE_URL');

export const config: ChatConfig = {
  port: parsePort(process.env.PORT),
  databaseUrl,
  chatMcpUrl: required('CHAT_MCP_URL'),
  authIntrospectUrl: required('AUTH_INTROSPECT_URL'),
  authRequiredProfile: required('AUTH_REQUIRED_PROFILE'),
  openrouterApiKey,
  openrouterModel:
    process.env.OPENROUTER_MODEL?.trim() || 'openai/gpt-4.1-mini',
  corsOrigins: parseOrigins(required('CORS_ORIGIN')),
  corsAppDomain: process.env.CORS_APP_DOMAIN?.trim().toLowerCase() || null,
  chatSystemPrompt: process.env.CHAT_SYSTEM_PROMPT?.trim() || DEFAULT_STAFF_PROMPT,
  chatPublicSystemPrompt:
    process.env.CHAT_PUBLIC_SYSTEM_PROMPT?.trim() || DEFAULT_PUBLIC_PROMPT,
  chatPublicEnabled: parseBool(process.env.CHAT_PUBLIC_ENABLED, true),
  chatPublicSessionSecret: publicSessionSecret(databaseUrl, openrouterApiKey),
  chatPublicMaxTurnsPerHour: parsePositiveInt(
    process.env.CHAT_PUBLIC_MAX_TURNS_PER_HOUR,
    24,
  ),
  contextTokenBudget: parsePositiveInt(process.env.CHAT_CONTEXT_TOKENS, 10_000),
  maxToolSteps: parsePositiveInt(process.env.CHAT_MAX_TOOL_STEPS, 8),
};
