import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { jsonResult } from '../slim.js';

function helpDir(): string {
  return join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'help');
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
        'Artículo del portfolio (español). Topics: about, experience, skills, contact, projects, y un archivo por proyecto (kuatia, faciliter, bax, quarkid, servicios-ba, aubilities, seekitup, ipskynet). Sin topic lista los temas. No inventes lo que no esté en el markdown.',
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
      const key = topic?.trim().toLowerCase();
      if (!key) {
        return jsonResult({
          topics,
          hint: 'Pasá topic con uno de esos valores.',
        });
      }
      if (!topics.includes(key)) {
        return jsonResult({
          error: 'topic desconocido',
          topics,
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
