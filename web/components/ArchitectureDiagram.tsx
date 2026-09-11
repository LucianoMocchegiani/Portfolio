'use client';

import { useEffect, useId, useRef, useState } from 'react';

/**
 * Renderiza un diagrama Mermaid y sigue el tema claro/oscuro.
 */
export function ArchitectureDiagram({
  chart,
  className,
}: {
  chart: string;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const renderId = useId().replace(/:/g, '');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const root = document.documentElement;
    function sync(): void {
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    }
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) {
      return;
    }
    let cancelled = false;
    node.setAttribute('aria-busy', 'true');
    void (async () => {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: theme === 'dark' ? 'dark' : 'neutral',
        fontFamily: 'IBM Plex Sans, sans-serif',
      });
      try {
        const { svg } = await mermaid.render(`arch-${renderId}`, chart);
        if (!cancelled) {
          node.innerHTML = svg;
        }
      } catch {
        if (!cancelled) {
          node.textContent = 'No se pudo dibujar el diagrama.';
        }
      } finally {
        if (!cancelled) {
          node.removeAttribute('aria-busy');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, theme, renderId]);

  return <div ref={hostRef} className={className} />;
}
