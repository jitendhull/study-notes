'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

function getPreferredTheme(): Theme {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle() {
  // Render the final control only after the browser preference is known.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const preferredTheme = getPreferredTheme();
    document.documentElement.setAttribute('data-theme', preferredTheme);
    setTheme(preferredTheme);
  }, []);

  function toggle() {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
    setTheme(nextTheme);
  }

  if (!theme) return <span className="theme-toggle-placeholder" aria-hidden="true" />;

  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      className="icon-btn theme-toggle"
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
    </button>
  );
}
