import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="status-page">
      <div className="status-icon" aria-hidden="true">📭</div>
      <p className="page-eyebrow">Study notes</p>
      <h1 className="status-title">Note not found</h1>
      <p className="status-description">This note does not exist or may have been moved. Return home or search the study library.</p>
      <div className="status-actions">
        <Link href="/" className="status-link status-link-primary">Return home</Link>
        <Link href="/search" className="status-link">Search notes</Link>
      </div>
    </div>
  );
}
