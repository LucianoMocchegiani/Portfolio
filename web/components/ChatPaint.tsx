'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ProjectCover } from '@/components/ProjectCover';
import { CONTACT, EXPERIENCE, PROJECTS } from '@/lib/work';
import { skillGroups, type ChatWidget } from '@/lib/chat-paint';
import styles from '@/components/paint.module.css';

const MD_SPLIT = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|https?:\/\/[^\s)]+)/g;

function isSafeHttp(href: string): boolean {
  try {
    const url = new URL(href);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function Inline({ text }: { text: string }) {
  const chunks = text.split(MD_SPLIT);
  return (
    <>
      {chunks.map((part, index) => {
        const md = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (md && isSafeHttp(md[2])) {
          return (
            <a key={index} href={md[2]} target="_blank" rel="noreferrer">
              {md[1]}
            </a>
          );
        }
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (/^https?:\/\//.test(part) && isSafeHttp(part.replace(/[.,;]+$/, ''))) {
          const clean = part.replace(/[.,;]+$/, '');
          const tail = part.slice(clean.length);
          return (
            <span key={index}>
              <a href={clean} target="_blank" rel="noreferrer">
                {clean.replace(/^https?:\/\//, '')}
              </a>
              {tail}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export function RichText({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: string[][] = [];
  let bucket: string[] = [];
  let list: string[] | null = null;

  function flushList(): void {
    if (list && list.length > 0) {
      blocks.push(['ul', ...list]);
    }
    list = null;
  }

  function flushP(): void {
    if (bucket.length > 0) {
      blocks.push(['p', bucket.join('\n')]);
      bucket = [];
    }
  }

  for (const line of lines) {
    const bullet = line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/);
    if (bullet) {
      flushP();
      if (!list) {
        list = [];
      }
      list.push(bullet[1]);
      continue;
    }
    flushList();
    if (line.trim() === '') {
      flushP();
      continue;
    }
    bucket.push(line);
  }
  flushList();
  flushP();

  return (
    <div className={styles.md}>
      {blocks.map((block, index) => {
        if (block[0] === 'ul') {
          return (
            <ul key={index}>
              {block.slice(1).map((item, itemIndex) => (
                <li key={itemIndex}>
                  <Inline text={item} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index}>
            <Inline text={block[1] ?? ''} />
          </p>
        );
      })}
    </div>
  );
}

function ProjectCard({ slug }: { slug: string }) {
  const project = PROJECTS.find((item) => item.slug === slug);
  if (!project) {
    return null;
  }
  return (
    <article className={styles.card}>
      <ProjectCover slug={slug} kind={project.kind} className={styles.cover} />
      <div className={styles.cardBody}>
        <h3>{project.name}</h3>
        <p>{project.tagline}</p>
        <div className={styles.cardLinks}>
          <Link href={`/work/${project.slug}`}>Ficha</Link>
          <a href={project.href} target="_blank" rel="noreferrer">
            Sitio
          </a>
        </div>
      </div>
    </article>
  );
}

function ProjectRail({ slugs }: { slugs: string[] }) {
  const railRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: -1 | 1): void {
    const node = railRef.current;
    if (!node) {
      return;
    }
    const card = node.querySelector<HTMLElement>('article');
    const step = (card?.offsetWidth ?? 240) + 12;
    node.scrollBy({ left: direction * step, behavior: 'smooth' });
  }

  if (slugs.length <= 1) {
    return (
      <div className={styles.rail}>
        {slugs.map((slug) => (
          <ProjectCard key={slug} slug={slug} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.carousel}>
      <button
        type="button"
        className={styles.nav}
        onClick={() => scrollByCard(-1)}
        aria-label="Proyectos anteriores"
      >
        ←
      </button>
      <div className={styles.rail} ref={railRef}>
        {slugs.map((slug) => (
          <ProjectCard key={slug} slug={slug} />
        ))}
      </div>
      <button
        type="button"
        className={styles.nav}
        onClick={() => scrollByCard(1)}
        aria-label="Proyectos siguientes"
      >
        →
      </button>
    </div>
  );
}

export function ChatWidgets({ widgets }: { widgets: ChatWidget[] }) {
  return (
    <>
      {widgets.map((widget, index) => {
        if (widget.type === 'projects') {
          return <ProjectRail key={`projects-${index}`} slugs={widget.slugs} />;
        }
        if (widget.type === 'project') {
          return <ProjectRail key={`project-${widget.slug}-${index}`} slugs={[widget.slug]} />;
        }
        if (widget.type === 'skills') {
          return (
            <div key={`skills-${index}`} className={styles.skills}>
              {skillGroups().map(([group, items]) => (
                <div key={group}>
                  <p className={styles.skillGroup}>{group}</p>
                  <div className={styles.pills}>
                    {items.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        }
        if (widget.type === 'experience') {
          return (
            <ol key={`exp-${index}`} className={styles.jobs}>
              {EXPERIENCE.map((item) => (
                <li key={item.org}>
                  <strong>{item.org}</strong>
                  <span>
                    {item.role} · {item.dates}
                  </span>
                  <em>{item.detail}</em>
                  {item.impact ? <em>{item.impact}</em> : null}
                </li>
              ))}
            </ol>
          );
        }
        return (
          <div key={`contact-${index}`} className={styles.contact}>
            <p>Contacto</p>
            <span>{CONTACT.location}</span>
            <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <a href={CONTACT.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href={CONTACT.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={CONTACT.calendar} target="_blank" rel="noreferrer">
              Agendar reunión
            </a>
          </div>
        );
      })}
    </>
  );
}
