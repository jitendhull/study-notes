'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

/**
 * Controls the mobile navigation drawer exposed by the server-rendered page shell.
 * The root attribute keeps the drawer CSS-only while this island owns interaction,
 * focus semantics, Escape handling, and scroll locking.
 */
export function MobileMenuToggle() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const root = document.getElementById('layout-root');
    if (!root) return;

    root.toggleAttribute('data-sidebar-open', isOpen);
    document.body.classList.toggle('mobile-nav-open', isOpen);

    return () => {
      root.removeAttribute('data-sidebar-open');
      document.body.classList.remove('mobile-nav-open');
    };
  }, [isOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <button
      type="button"
      onClick={() => setIsOpen(open => !open)}
      aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
      aria-controls="sidebar"
      aria-expanded={isOpen}
      className="icon-btn mobile-only mobile-menu-toggle"
    >
      {isOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
    </button>
  );
}
