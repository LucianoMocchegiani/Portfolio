'use client';

import Link from 'next/link';
import { AskPanel } from '@/components/AskPanel';
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
      <section className={styles.hero}>
        <p className={styles.mark}>LM</p>
        <h1>Luciano Mocchegiani</h1>
        <p className={styles.role}>Software Engineer</p>
        <h2 className={styles.askTitle}>¿Qué querés saber?</h2>
        <AskPanel
          chat={chat}
          title=""
          placeholder="Preguntame cualquier cosa sobre mi trabajo…"
          suggestions={HOME_QUESTIONS}
        />
      </section>

      <section className={styles.block} id="work">
        <h2>Proyectos</h2>
        <ul className={styles.grid}>
          {featured.map((item) => (
            <li key={item.slug}>
              <Link href={`/work/${item.slug}`} className={styles.card}>
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
        <p>
          <a href={CONTACT.linkedin}>LinkedIn</a>
          {' · '}
          <a href={CONTACT.github}>GitHub</a>
          {' · '}
          <a href={CONTACT.calendar} target="_blank" rel="noreferrer">
            Agendar reunión
          </a>
        </p>
      </section>
    </div>
  );
}
