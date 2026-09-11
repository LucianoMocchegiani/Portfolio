import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { jsonResult } from '../slim.js';

function helpDir(): string {
  return join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'help');
}

const ALIASES: Record<string, string> = {
  skynet: 'ipskynet',
  'isp-skynet': 'ipskynet',
  github: 'codigo',
  repos: 'codigo',
  repo: 'codigo',
  code: 'codigo',
  quark: 'quarkid',
  'quark-id': 'quarkid',
  serviciosba: 'servicios-ba',
  'find-my-couch': 'aubilities',
  findmycouch: 'aubilities',
  couch: 'aubilities',
  cv: 'about',
  bio: 'about',
};

function normalizeTopic(raw: string): string {
  return raw.trim().toLowerCase().replace(/[_ ]+/g, '-');
}

function resolveTopic(raw: string, topics: string[]): string | null {
  const key = normalizeTopic(raw);
  if (!key) {
    return null;
  }
  if (topics.includes(key)) {
    return key;
  }
  const aliased = ALIASES[key];
  if (aliased && topics.includes(aliased)) {
    return aliased;
  }
  if (key.length >= 4) {
    const hits = topics.filter(
      (topic) => topic === key || topic.endsWith(key) || topic.endsWith(`-${key}`),
    );
    if (hits.length === 1) {
      return hits[0];
    }
  }
  return null;
}

async function listTopics(): Promise<string[]> {
  const files = await readdir(helpDir());
  return files
    .filter((name) => name.endsWith('.md'))
    .map((name) => name.slice(0, -3))
    .sort();
}

/**
 * Artículos en `mcp/help/`. El chat público de chat-api solo permite `get_help`.
 */
export function registerHelpTools(server: McpServer): void {
  server.registerTool(
    'get_help',
    {
      title: 'CV Luciano',
      description:
        'Artículo del portfolio (español). Topics: about, experience, skills, contact, projects, kuatia, faciliter, bax, quarkid, servicios-ba, aubilities, seekitup, ipskynet, codigo. Alias: Skynet→ipskynet, GitHub→codigo. Sin topic lista los temas. Nunca menciones el nombre de esta tool ni el slug al usuario. No inventes lo que no esté en el markdown.',
      inputSchema: {
        topic: z
          .string()
          .optional()
          .describe('Tema fijo. Vacío lista los disponibles.'),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ topic }) => {
      const topics = await listTopics();
      const requested = topic?.trim();
      if (!requested) {
        return jsonResult({
          topics,
          hint: 'Pasá topic con uno de esos valores. Reintentá en silencio; no menciones slugs al usuario.',
        });
      }
      const key = resolveTopic(requested, topics);
      if (!key) {
        return jsonResult({
          error: 'topic desconocido',
          topics,
          hint: 'Reintentá get_help con un topic de la lista (Skynet → ipskynet). No menciones tools ni slugs al usuario.',
        });
      }
      try {
        const markdown = await readFile(join(helpDir(), `${key}.md`), 'utf8');
        return jsonResult({
          topic: key,
          markdown: markdown.trim(),
        });
      } catch {
        console.error(`help missing: ${key}`);
        return jsonResult({
          error: 'artículo no disponible',
          topics,
        });
      }
    },
  );
}
