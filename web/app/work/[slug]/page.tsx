import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ProjectView } from '@/components/ProjectView';
import { projectBySlug, PROJECTS } from '@/lib/work';

export function generateStaticParams(): { slug: string }[] {
  return PROJECTS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) {
    return { title: 'Luciano Mocchegiani' };
  }
  return {
    title: `${project.name} — Luciano Mocchegiani`,
    description: project.tagline,
  };
}

export default async function WorkSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) {
    notFound();
  }
  return <ProjectView project={project} />;
}
