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

function looksLikeContact(text: string): boolean {
  return (
    /whatsapp|wa\.me|lucianomocchegiani@gmail|linkedin\.com\/in\/luciano|c[oó]mo te contacto|escribime|agendar reuni/i.test(
      text,
    )
  );
}

export function widgetsFromAssistantText(text: string): ChatWidget[] {
  const lower = text.toLowerCase();
  const out: ChatWidget[] = [];
  const hits = PROJECTS.filter((item) => projectMentionedInText(item, lower));
  if (hits.length >= 2) {
    out.push({ type: 'projects', slugs: uniqueSlugs(hits) });
  } else if (hits.length === 1) {
    out.push({ type: 'project', slug: hits[0].slug });
  }
  if (looksLikeContact(text)) {
    out.push({ type: 'contact' });
  }
  return out;
}

export function attachIntentWidgets(
  userText: string,
  widgets: ChatWidget[],
): ChatWidget[] {
  if (
    /(c[oó]mo te contacto|whatsapp|escribime|agendar|linkedin|e-?mail|tel[eé]fono)/i.test(
      userText,
    )
  ) {
    return mergeWidgets({ type: 'contact' }, widgets);
  }
  if (
    /(github|repositorios|d[oó]nde (est[aá]|veo) tu c[oó]digo)/i.test(
      userText,
    )
  ) {
    return mergeWidgets({ type: 'project', slug: 'codigo' }, widgets);
  }
  return widgets;
}

function uniqueSlugs(items: Project[]): string[] {
  return [...new Set(items.map((item) => item.slug))];
}

export function mergeWidgets(
  fromTool: ChatWidget | null,
  fromText: ChatWidget[],
): ChatWidget[] {
  const incoming = [fromTool, ...fromText].filter(
    (widget): widget is ChatWidget => widget != null,
  );
  let rail: string[] | null = null;
  const singles: string[] = [];
  const rest: ChatWidget[] = [];
  const seenRest = new Set<string>();

  for (const widget of incoming) {
    if (widget.type === 'projects') {
      rail = uniqueSlugs(
        [...(rail ?? []), ...widget.slugs]
          .map((slug) => PROJECTS.find((item) => item.slug === slug))
          .filter((item): item is Project => item != null),
      );
      continue;
    }
    if (widget.type === 'project') {
      singles.push(widget.slug);
      continue;
    }
    if (seenRest.has(widget.type)) {
      continue;
    }
    seenRest.add(widget.type);
    rest.push(widget);
  }

  const fromSingles = uniqueSlugs(
    singles
      .map((slug) => PROJECTS.find((item) => item.slug === slug))
      .filter((item): item is Project => item != null),
  );
  const out: ChatWidget[] = [];
  if (rail && rail.length > 0) {
    out.push({ type: 'projects', slugs: rail });
  } else if (fromSingles.length > 1) {
    out.push({ type: 'projects', slugs: fromSingles });
  } else if (fromSingles.length === 1) {
    out.push({ type: 'project', slug: fromSingles[0] });
  }
  out.push(...rest);
  return out;
}

function projectMentionedInText(item: Project, body: string): boolean {
  if (item.slug === 'codigo') {
    return (
      body.includes('github.com/lucianomocchegiani') ||
      body.includes('/work/codigo') ||
      /m[aá]s trabajos en github/.test(body)
    );
  }
  return (
    body.includes(item.name.toLowerCase()) || body.includes(item.href.toLowerCase())
  );
}

function lineMentionsProject(line: string): boolean {
  const body = line.toLowerCase();
  return PROJECTS.some(
    (item) => projectMentionedInText(item, body) || body.includes(item.slug),
  );
}

/**
 * Si ya hay carrusel, no repetimos la lista de proyectos en el texto.
 */
export function textWithoutPaintedProjects(
  text: string,
  widgets: ChatWidget[],
): string {
  const hasRail = widgets.some(
    (widget) =>
      widget.type === 'projects' ||
      (widget.type === 'project' && widgets.filter((item) => item.type === 'project').length > 1),
  );
  if (!hasRail) {
    return text;
  }
  const kept = text.split('\n').filter((line) => {
    if (!/^\s*(?:[-*]|\d+\.)\s+/.test(line)) {
      return true;
    }
    return !lineMentionsProject(line);
  });
  return kept.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function skillGroups(): [string, string[]][] {
  return Object.entries(SKILLS) as [string, string[]][];
}

function askedForProjectCard(userText: string): boolean {
  return /(ficha|tarjeta|\bcard\b|mostr(?:ame|á|a)\s+la\s+(?:ficha|card|tarjeta)|ver\s+(?:la\s+)?ficha)/i.test(
    userText,
  );
}

/**
 * En la ficha de un proyecto no repetimos su card, salvo que la pidan.
 */
export function filterWidgetsOnProjectPage(
  widgets: ChatWidget[],
  pageSlug: string | undefined,
  userText: string,
): ChatWidget[] {
  if (!pageSlug) {
    return widgets;
  }
  const keepSelf = askedForProjectCard(userText);
  const out: ChatWidget[] = [];
  for (const widget of widgets) {
    if (widget.type === 'project' && widget.slug === pageSlug && !keepSelf) {
      continue;
    }
    if (widget.type === 'projects') {
      const slugs = keepSelf
        ? widget.slugs
        : widget.slugs.filter((slug) => slug !== pageSlug);
      if (slugs.length === 0) {
        continue;
      }
      if (slugs.length === 1) {
        out.push({ type: 'project', slug: slugs[0] });
      } else {
        out.push({ type: 'projects', slugs });
      }
      continue;
    }
    out.push(widget);
  }
  return out;
}
