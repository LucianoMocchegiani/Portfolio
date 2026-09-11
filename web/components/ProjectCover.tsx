'use client';

import { useState } from 'react';
import { projectCoverSrc, projectLook, type WorkKind } from '@/lib/work';

type Props = {
  slug: string;
  kind: WorkKind;
  className: string;
  markClassName?: string;
  kindClassName?: string;
};

/**
 * Portada de proyecto: `/work/{slug}.jpg` o iniciales si el archivo no está.
 */
export function ProjectCover({
  slug,
  kind,
  className,
  markClassName,
  kindClassName,
}: Props) {
  const [broken, setBroken] = useState(false);
  const look = projectLook(slug);

  return (
    <div className={className}>
      {!broken ? (
        <img src={projectCoverSrc(slug)} alt="" onError={() => setBroken(true)} />
      ) : null}
      <span className={markClassName}>{look.mark}</span>
      <em className={kindClassName}>{kind === 'propio' ? 'Propio' : 'Asignado'}</em>
    </div>
  );
}
