'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { IconGitHub, IconLinkedIn, IconWhatsApp } from '@/components/BrandIcons';
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

function ProjectCard({ slug, appear }: { slug: string; appear?: boolean }) {
  const project = PROJECTS.find((item) => item.slug === slug);
  if (!project) {
    return null;
  }
  return (
    <article className={`${styles.card} ${appear ? styles.paintIn : ''}`}>
      <Link href={`/work/${project.slug}`} className={styles.cardHit}>
        <ProjectCover slug={slug} kind={project.kind} className={styles.cover} />
        <div className={styles.cardBody}>
          <h3>{project.name}</h3>
          <p>{project.tagline}</p>
        </div>
      </Link>
      <div className={styles.cardLinks}>
        <Link href={`/work/${project.slug}`}>Ficha</Link>
        <a href={project.href} target="_blank" rel="noreferrer">
          {project.kind === 'repos' ? 'GitHub' : 'Sitio'}
        </a>
      </div>
    </article>
  );
}

function ProjectRail({
  slugs,
  progressive,
}: {
  slugs: string[];
  progressive?: boolean;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(progressive ? 0 : slugs.length);

  useEffect(() => {
    setShown(progressive ? 0 : slugs.length);
  }, [progressive, slugs.join('|')]);

  useEffect(() => {
    if (!progressive || shown >= slugs.length) {
      return;
    }
    const timer = window.setTimeout(() => {
      setShown((value) => value + 1);
    }, shown === 0 ? 80 : 170);
    return () => window.clearTimeout(timer);
  }, [progressive, shown, slugs.length]);

  function scrollByCard(direction: -1 | 1): void {
    const node = railRef.current;
    if (!node) {
      return;
    }
    const card = node.querySelector<HTMLElement>('article');
    const step = (card?.offsetWidth ?? 240) + 12;
    node.scrollBy({ left: direction * step, behavior: 'smooth' });
  }

  const visible = slugs.slice(0, shown);

  if (slugs.length <= 1) {
    return (
      <div className={styles.rail}>
        {visible.map((slug) => (
          <ProjectCard key={slug} slug={slug} appear={progressive} />
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
        {visible.map((slug) => (
          <ProjectCard key={slug} slug={slug} appear={progressive} />
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

function paintStyle(index: number, progressive?: boolean): { animationDelay: string } | undefined {
  if (!progressive) {
    return undefined;
  }
  return { animationDelay: `${index * 120}ms` };
}

export function ChatWidgets({
  widgets,
  progressive,
}: {
  widgets: ChatWidget[];
  progressive?: boolean;
}) {
  return (
    <>
      {widgets.map((widget, index) => {
        const paint = progressive ? styles.paintIn : '';
        if (widget.type === 'projects') {
          return (
            <ProjectRail
              key={`projects-${index}`}
              slugs={widget.slugs}
              progressive={progressive}
            />
          );
        }
        if (widget.type === 'project') {
          return (
            <ProjectRail
              key={`project-${widget.slug}-${index}`}
              slugs={[widget.slug]}
              progressive={progressive}
            />
          );
        }
        if (widget.type === 'skills') {
          return (
            <div key={`skills-${index}`} className={styles.skills}>
              {skillGroups().map(([group, items], groupIndex) => (
                <div
                  key={group}
                  className={paint}
                  style={paintStyle(groupIndex, progressive)}
                >
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
              {EXPERIENCE.map((item, jobIndex) => (
                <li
                  key={item.org}
                  className={paint}
                  style={paintStyle(jobIndex, progressive)}
                >
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
        const rows = [
          <span key="loc">{CONTACT.location}</span>,
          <a key="wa" href={CONTACT.whatsappHref} target="_blank" rel="noreferrer">
            <IconWhatsApp />
            WhatsApp
          </a>,
          <a key="tel" href={CONTACT.phoneHref}>
            Llamar · {CONTACT.phone}
          </a>,
          <a key="mail" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>,
          <a key="in" href={CONTACT.linkedin} target="_blank" rel="noreferrer">
            <IconLinkedIn />
            LinkedIn
          </a>,
          <a key="gh" href={CONTACT.github} target="_blank" rel="noreferrer">
            <IconGitHub />
            GitHub
          </a>,
          <a key="cal" href={CONTACT.calendar} target="_blank" rel="noreferrer">
            Agendar reunión
          </a>,
        ];
        return (
          <div key={`contact-${index}`} className={styles.contact}>
            <p className={paint} style={paintStyle(0, progressive)}>
              Contacto
            </p>
            {rows.map((row, rowIndex) => (
              <span
                key={row.key}
                className={paint}
                style={paintStyle(rowIndex + 1, progressive)}
              >
                {row}
              </span>
            ))}
          </div>
        );
      })}
    </>
  );
}
