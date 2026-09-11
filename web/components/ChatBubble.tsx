'use client';

import { useEffect, useState } from 'react';
import { AskPanel } from '@/components/AskPanel';
import { usePublicChat } from '@/lib/use-public-chat';
import styles from '@/components/bubble.module.css';

export function ChatBubble({
  title,
  placeholder,
  suggestions,
  prefixWire,
  pageProjectSlug,
}: {
  title: string;
  placeholder: string;
  suggestions: string[];
  prefixWire?: string;
  pageProjectSlug?: string;
}) {
  const chat = usePublicChat();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {open ? (
        <div className={styles.panel} role="dialog" aria-label={title}>
          <header className={styles.head}>
            <p>{title}</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar">
              ×
            </button>
          </header>
          <AskPanel
            chat={chat}
            title=""
            placeholder={placeholder}
            suggestions={suggestions}
            prefixWire={prefixWire}
            pageProjectSlug={pageProjectSlug}
            variant="drawer"
            className={styles.askFill}
          />
        </div>
      ) : null}
      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Cerrar chat' : 'Abrir chat'}
        aria-expanded={open}
        hidden={open}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3v3M12 18v3M3 12h3M18 12h3M6.2 6.2l2.1 2.1M15.7 15.7l2.1 2.1M17.8 6.2l-2.1 2.1M8.3 15.7l-2.1 2.1"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      </button>
    </>
  );
}
