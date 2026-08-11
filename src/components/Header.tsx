'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [q, setQ] = useState('');
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const pref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(stored ?? pref);
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <header style={{
      height: 56,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '0 1rem',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-primary)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      {/* Mobile hamburger */}
      <button
        aria-label="Toggle sidebar"
        onClick={onMenuToggle}
        style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        className="mobile-menu-btn"
      >
        <span style={{ fontSize: 20, color: 'var(--text-primary)' }}>☰</span>
      </button>

      {/* Logo */}
      <Link href="/" style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
        📚 Study Notes
      </Link>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480 }}>
        <input
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search notes…"
          aria-label="Search notes"
          style={{
            width: '100%',
            padding: '6px 12px',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            outline: 'none',
          }}
        />
      </form>

      {/* Dark mode toggle */}
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </header>
  );
}
