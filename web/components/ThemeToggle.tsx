'use client';

import { useEffect, useState } from 'react';

const KEY = 'lm-theme';

function apply(theme: 'light' | 'dark'): void {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(KEY, theme);
}

/**
 * Alterna tema claro/oscuro invirtiendo fondo y tinta.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = document.documentElement.getAttribute('data-theme');
    setTheme(stored === 'dark' ? 'dark' : 'light');
  }, []);

  function toggle(): void {
    const next = theme === 'dark' ? 'light' : 'dark';
    apply(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      className="themeToggle"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Pasar a tema claro' : 'Pasar a tema oscuro'}
    >
      {theme === 'dark' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 14.5A8.5 8.5 0 1 1 9.5 4 7 7 0 0 0 20 14.5Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
