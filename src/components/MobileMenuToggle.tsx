'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

const COMPACT_NAV_QUERY = '(max-width: 1023px)';
const EDGE_ACTIVATION_PX = 28;
const SWIPE_DISTANCE_PX = 72;
const SWIPE_DIRECTION_RATIO = 1.5;
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

type GestureStart = {
  x: number;
  y: number;
  origin: 'edge' | 'drawer';
} | null;

/**
 * Controls the compact navigation drawer. Button and keyboard behaviour remain
 * the primary controls; edge swipes provide a complementary touch shortcut.
 */
export function MobileMenuToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gestureStartRef = useRef<GestureStart>(null);
  const restoreFocusRef = useRef(false);

  const isCompactNavigation = useCallback(
    () => typeof window !== 'undefined' && window.matchMedia(COMPACT_NAV_QUERY).matches,
    [],
  );

  const closeDrawer = useCallback((restoreFocus = true) => {
    restoreFocusRef.current = restoreFocus;
    setIsOpen(false);
  }, []);

  const openDrawer = useCallback(() => {
    restoreFocusRef.current = false;
    setIsOpen(true);
  }, []);

  useEffect(() => {
    const root = document.getElementById('layout-root');
    const sidebar = document.getElementById('sidebar');
    const mediaQuery = window.matchMedia(COMPACT_NAV_QUERY);
    if (!root || !sidebar) return;

    const syncDrawerState = () => {
      const isCompact = mediaQuery.matches;
      const drawerIsOpen = isCompact && isOpen;

      root.toggleAttribute('data-sidebar-open', drawerIsOpen);
      document.body.classList.toggle('mobile-nav-open', drawerIsOpen);
      sidebar.toggleAttribute('inert', isCompact && !drawerIsOpen);

      if (isCompact) {
        sidebar.setAttribute('aria-hidden', String(!drawerIsOpen));
      } else {
        sidebar.removeAttribute('aria-hidden');
        sidebar.removeAttribute('inert');
      }

      if (!isCompact && isOpen) setIsOpen(false);
    };

    syncDrawerState();
    mediaQuery.addEventListener('change', syncDrawerState);

    return () => {
      mediaQuery.removeEventListener('change', syncDrawerState);
      root.removeAttribute('data-sidebar-open');
      document.body.classList.remove('mobile-nav-open');
      sidebar.removeAttribute('aria-hidden');
      sidebar.removeAttribute('inert');
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isCompactNavigation()) return;

    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const focusableElements = () => Array.from(
      sidebar.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter(element => !element.hasAttribute('disabled'));

    const focusFrame = window.requestAnimationFrame(() => {
      focusableElements()[0]?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDrawer();
        return;
      }

      if (event.key !== 'Tab') return;

      const elements = focusableElements();
      if (elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [closeDrawer, isCompactNavigation, isOpen]);

  useEffect(() => {
    const resetGesture = () => {
      gestureStartRef.current = null;
    };

    const isInteractiveTarget = (target: EventTarget | null) => (
      target instanceof Element
      && Boolean(target.closest('a, button, input, select, textarea, summary, [role="button"]'))
    );

    const onTouchStart = (event: TouchEvent) => {
      if (!isCompactNavigation()) return;

      const touch = event.touches[0];
      if (!touch) return;

      const sidebar = document.getElementById('sidebar');
      const trigger = triggerRef.current;
      const target = event.target instanceof Node ? event.target : null;
      const startedInDrawer = Boolean(target && sidebar?.contains(target));
      const startedOnTrigger = Boolean(target && trigger?.contains(target));

      if (isOpen && !startedInDrawer && !startedOnTrigger) {
        closeDrawer(false);
        return;
      }

      if (!isOpen && touch.clientX <= EDGE_ACTIVATION_PX) {
        gestureStartRef.current = { x: touch.clientX, y: touch.clientY, origin: 'edge' };
        return;
      }

      if (isOpen && startedInDrawer && !isInteractiveTarget(event.target)) {
        gestureStartRef.current = { x: touch.clientX, y: touch.clientY, origin: 'drawer' };
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      const gesture = gestureStartRef.current;
      resetGesture();
      if (!gesture) return;

      const touch = event.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - gesture.x;
      const deltaY = touch.clientY - gesture.y;
      const isDeliberateHorizontalSwipe = Math.abs(deltaX) >= SWIPE_DISTANCE_PX
        && Math.abs(deltaX) >= Math.abs(deltaY) * SWIPE_DIRECTION_RATIO;

      if (!isDeliberateHorizontalSwipe) return;

      if (gesture.origin === 'edge' && deltaX > 0) {
        openDrawer();
      } else if (gesture.origin === 'drawer' && deltaX < 0) {
        closeDrawer();
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', resetGesture, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', resetGesture);
    };
  }, [closeDrawer, isCompactNavigation, isOpen, openDrawer]);

  useEffect(() => {
    if (isOpen || !restoreFocusRef.current) return;

    restoreFocusRef.current = false;
    const focusFrame = window.requestAnimationFrame(() => triggerRef.current?.focus());
    return () => window.cancelAnimationFrame(focusFrame);
  }, [isOpen]);

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => (isOpen ? closeDrawer(false) : openDrawer())}
      aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
      aria-controls="sidebar"
      aria-expanded={isOpen}
      className="icon-btn mobile-only mobile-menu-toggle"
    >
      {isOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
    </button>
  );
}
