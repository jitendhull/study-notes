'use client';

// Toggles sidebar open/closed on mobile via data-attr on #layout-root.
// CSS does the actual show/hide — no JS state serialization.
export function MobileMenuToggle() {
  function toggle() {
    const root = document.getElementById('layout-root');
    if (root) root.toggleAttribute('data-sidebar-open');
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle navigation"
      aria-controls="sidebar"
      className="icon-btn mobile-only"
    >
      <span aria-hidden>☰</span>
    </button>
  );
}
