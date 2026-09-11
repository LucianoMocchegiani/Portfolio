'use client';

import Link from 'next/link';
import { AskPanel } from '@/components/AskPanel';
import { IconGitHub, IconLinkedIn, IconWhatsApp } from '@/components/BrandIcons';
import { ProjectCover } from '@/components/ProjectCover';
import {
  CONTACT,
  EXPERIENCE,
  HOME_QUESTIONS,
  PROJECTS,
  SKILLS,
} from '@/lib/work';
import { usePublicChat } from '@/lib/use-public-chat';
import styles from '@/components/home.module.css';

export function HomePage() {
  const chat = usePublicChat();
  const featured = PROJECTS.filter((item) => item.featured);
  const rest = PROJECTS.filter((item) => !item.featured);

  return (
    <div className={styles.page}>
      <h1 className={styles.srOnly}>Luciano Mocchegiani</h1>
      <section className={styles.hero} aria-label="Chat">
        <AskPanel
          chat={chat}
          title=""
          placeholder="Preguntame cualquier cosa sobre mi trabajo…"
          suggestions={HOME_QUESTIONS}
          variant="home"
        />
      </section>

      <section className={styles.block} id="work">
        <h2>Proyectos</h2>
        <ul className={styles.grid}>
          {featured.map((item) => (
            <li key={item.slug}>
              <Link href={`/work/${item.slug}`} className={styles.card}>
                <ProjectCover slug={item.slug} kind={item.kind} className={styles.cardCover} />
                <span className={styles.cardName}>{item.name}</span>
                <span className={styles.cardTag}>{item.tagline}</span>
              </Link>
            </li>
          ))}
        </ul>
        <ul className={styles.gridQuiet}>
          {rest.map((item) => (
            <li key={item.slug}>
              <Link href={`/work/${item.slug}`}>{item.name}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.block} id="experience">
        <h2>Experiencia</h2>
        <ul className={styles.jobs}>
          {EXPERIENCE.map((item) => (
            <li key={item.org}>
              <p className={styles.jobOrg}>{item.org}</p>
              <p>
                {item.role} · {item.dates}
              </p>
              <p className={styles.muted}>{item.detail}</p>
              {item.impact ? <p className={styles.muted}>{item.impact}</p> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.block} id="skills">
        <h2>Habilidades</h2>
        {(Object.entries(SKILLS) as [string, string[]][]).map(([group, items]) => (
          <p key={group}>
            <span className={styles.skillKey}>{group}</span>
            {items.join(' · ')}
          </p>
        ))}
      </section>

      <section className={styles.block} id="contact">
        <h2>Contacto</h2>
        <p>
          {CONTACT.location}
          <br />
          <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
          {' · '}
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </p>
        <p className={styles.socials}>
          <a href={CONTACT.whatsappHref} target="_blank" rel="noreferrer">
            <IconWhatsApp />
            WhatsApp
          </a>
          <a href={CONTACT.linkedin} target="_blank" rel="noreferrer">
            <IconLinkedIn />
            LinkedIn
          </a>
          <a href={CONTACT.github} target="_blank" rel="noreferrer">
            <IconGitHub />
            GitHub
          </a>
          <a href={CONTACT.calendar} target="_blank" rel="noreferrer">
            Agendar reunión
          </a>
        </p>
      </section>
    </div>
  );
}
