'use client';

import { useState } from 'react';
import {
  projectBySlug,
  projectCoverSources,
  projectDiscTone,
  projectLook,
  workKindLabel,
  type WorkKind,
} from '@/lib/work';
import styles from '@/components/cover.module.css';

type Props = {
  slug: string;
  kind: WorkKind;
  className: string;
  markClassName?: string;
  kindClassName?: string;
};

/**
 * Portada: icono en un disco del color de la marca.
 */
export function ProjectCover({
  slug,
  kind,
  className,
  markClassName,
  kindClassName,
}: Props) {
  const project = projectBySlug(slug);
  const look = projectLook(slug);
  const sources = projectCoverSources(slug, project?.href);
  const [index, setIndex] = useState(0);
  const src = sources[index];
  const broken = !src;
  const tone = projectDiscTone(slug);

  return (
    <div className={className}>
      <span className={`${styles.disc} ${tone === 'black' ? styles.black : styles.white}`}>
        {!broken ? (
          <img src={src} alt="" onError={() => setIndex((value) => value + 1)} />
        ) : (
          <span className={`${styles.discMark} ${markClassName ?? ''}`}>{look.mark}</span>
        )}
      </span>
      <em className={kindClassName}>{workKindLabel(kind)}</em>
    </div>
  );
}
