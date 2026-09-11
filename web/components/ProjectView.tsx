'use client';

import Link from 'next/link';
import { ChatBubble } from '@/components/ChatBubble';
import { ProjectCover } from '@/components/ProjectCover';
import type { Project } from '@/lib/work';
import styles from '@/components/project.module.css';

export function ProjectView({ project }: { project: Project }) {
  const prefix = `Estoy en la ficha de ${project.name}. Usá get_help con topic ${project.slug} antes de responder.`;

  return (
    <>
      <article className={styles.doc}>
        <Link href="/#work" className={styles.back}>
          ← Volver a proyectos
        </Link>
        <p className={styles.kind}>
          {project.kind === 'propio' ? 'Proyecto propio' : 'Asignado'}
        </p>
        <h1>{project.name}</h1>
        <p className={styles.tag}>{project.tagline}</p>
        <p>
          <a href={project.href} rel="noreferrer" target="_blank">
            {project.href.replace(/^https?:\/\//, '')}
          </a>
        </p>
        <ProjectCover slug={project.slug} kind={project.kind} className={styles.heroBox} />
        <h2>Sobre el proyecto</h2>
        <p>{project.about}</p>
        <h2>Rol</h2>
        <p>{project.role}</p>
        <h2>Tecnologías</h2>
        <ul className={styles.stack}>
          {project.stack.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h2>Qué construí</h2>
        <ul>
          {project.built.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h2>Arquitectura</h2>
        <pre className={styles.arch}>{project.architecture}</pre>
      </article>
      <ChatBubble
        title="Preguntame por este proyecto"
        placeholder="Preguntame lo que quieras…"
        suggestions={project.questions}
        prefixWire={prefix}
        pageProjectSlug={project.slug}
      />
    </>
  );
}
