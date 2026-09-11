import { PROJECTS, SKILLS, type Project } from '@/lib/work';

export type ChatWidget =
  | { type: 'projects'; slugs: string[] }
  | { type: 'project'; slug: string }
  | { type: 'skills' }
  | { type: 'experience' }
  | { type: 'contact' };

const PROJECT_TOPICS = new Set(PROJECTS.map((item) => item.slug));

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

/**
 * Extrae el JSON que el MCP manda en `content[].text` o en el body plano.
 */
export function unwrapToolPayload(output: unknown): Record<string, unknown> | null {
  if (typeof output === 'string') {
    return asRecord(parseJson(output));
  }
  const rec = asRecord(output);
  if (!rec) {
    return null;
  }
  if (typeof rec.topic === 'string' || typeof rec.markdown === 'string') {
    return rec;
  }
  const content = rec.content;
  if (Array.isArray(content)) {
    for (const item of content) {
      const row = asRecord(item);
      if (row && row.type === 'text' && typeof row.text === 'string') {
        const inner = asRecord(parseJson(row.text));
        if (inner) {
          return inner;
        }
      }
    }
  }
  if (typeof rec.text === 'string') {
    return asRecord(parseJson(rec.text));
  }
  return rec;
}

export function widgetFromTopic(topic: string | undefined): ChatWidget | null {
  if (!topic) {
    return null;
  }
  if (topic === 'projects') {
    return { type: 'projects', slugs: PROJECTS.map((item) => item.slug) };
  }
  if (topic === 'skills') {
    return { type: 'skills' };
  }
  if (topic === 'experience') {
    return { type: 'experience' };
  }
  if (topic === 'contact') {
    return { type: 'contact' };
  }
  if (PROJECT_TOPICS.has(topic)) {
    return { type: 'project', slug: topic };
  }
  return null;
}

export function widgetFromToolOutput(output: unknown): ChatWidget | null {
  const payload = unwrapToolPayload(output);
  const fromJson = widgetFromTopic(
    typeof payload?.topic === 'string' ? payload.topic : undefined,
  );
  if (fromJson) {
    return fromJson;
  }
  const blob = typeof output === 'string' ? output : JSON.stringify(output ?? '');
  const match = blob.match(/"topic"\s*:\s*"([a-z0-9-]+)"/i);
  return widgetFromTopic(match?.[1]?.toLowerCase());
}

export function widgetsFromAssistantText(text: string): ChatWidget[] {
  const lower = text.toLowerCase();
  const hits = PROJECTS.filter((item) => {
    const name = item.name.toLowerCase();
    return lower.includes(name.toLowerCase()) || lower.includes(item.href);
  });
  if (hits.length >= 2) {
    return [{ type: 'projects', slugs: uniqueSlugs(hits) }];
  }
  if (hits.length === 1) {
    return [{ type: 'project', slug: hits[0].slug }];
  }
  return [];
}

function uniqueSlugs(items: Project[]): string[] {
  return [...new Set(items.map((item) => item.slug))];
}

export function mergeWidgets(
  fromTool: ChatWidget | null,
  fromText: ChatWidget[],
): ChatWidget[] {
  const out: ChatWidget[] = [];
  const seen = new Set<string>();
  for (const widget of [fromTool, ...fromText]) {
    if (!widget) {
      continue;
    }
    const key =
      widget.type === 'project'
        ? `project:${widget.slug}`
        : widget.type === 'projects'
          ? `projects:${widget.slugs.join(',')}`
          : widget.type;
    if (seen.has(key) || (widget.type === 'projects' && seen.has('projects'))) {
      continue;
    }
    if (widget.type === 'projects') {
      seen.add('projects');
    }
    seen.add(key);
    out.push(widget);
  }
  return out;
}

export function skillGroups(): [string, string[]][] {
  return Object.entries(SKILLS) as [string, string[]][];
}
