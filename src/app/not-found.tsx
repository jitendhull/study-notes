import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', gap: 12, textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{ fontSize: '3rem', lineHeight: 1 }}>📭</div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        Note not found
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 320 }}>
        This note doesn't exist or may have been moved.
      </p>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <Link href="/" className="tag-pill" style={{ fontSize: '0.875rem' }}>← Home</Link>
        <Link href="/search" className="tag-pill" style={{ fontSize: '0.875rem' }}>Search notes</Link>
      </div>
    </div>
  );
}
