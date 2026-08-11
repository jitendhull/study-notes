'use client';

import { useState } from 'react';

// CSS controls the sidebar visibility; this component exposes the same state to assistive technology.
export function MobileMenuToggle() {
  const [isOpen, setIsOpen] = useState(false);

  function toggle() {
    const root = document.getElementById('layout-root');
    if (!root) return;

    const nextOpen = !root.hasAttribute('data-sidebar-open');
    root.toggleAttribute('data-sidebar-open', nextOpen);
    setIsOpen(nextOpen);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
      aria-controls="sidebar"
      aria-expanded={isOpen}
      className="icon-btn mobile-only mobile-menu-toggle"
    >
      <span aria-hidden="true">{isOpen ? '×' : '☰'}</span>
    </button>
  );
}
