'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Keyboard, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const SHORTCUTS = [
  { keys: ['⌘', 'K'], label: 'Search every note' },
  { keys: ['↑', '↓'], label: 'Move through search results' },
  { keys: ['Enter'], label: 'Open the selected result' },
  { keys: ['Esc'], label: 'Close search or navigation' },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.matches('input, textarea, select, [contenteditable]');
      if (event.key === '?' && !isTyping) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className="icon-btn keyboard-shortcuts-trigger" aria-label="Show keyboard shortcuts" title="Keyboard shortcuts">
          <Keyboard size={17} aria-hidden="true" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="keyboard-shortcuts-overlay" />
        <Dialog.Content className="keyboard-shortcuts-dialog" aria-describedby="keyboard-shortcuts-description">
          <div className="keyboard-shortcuts-heading">
            <div>
              <Dialog.Title>Keyboard shortcuts</Dialog.Title>
              <Dialog.Description id="keyboard-shortcuts-description">Use these keys to move through your study library faster.</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button type="button" className="icon-btn" aria-label="Close keyboard shortcuts"><X size={18} /></button>
            </Dialog.Close>
          </div>
          <dl className="keyboard-shortcuts-list">
            {SHORTCUTS.map(shortcut => (
              <div key={shortcut.label} className="keyboard-shortcuts-row">
                <dt>{shortcut.label}</dt>
                <dd>{shortcut.keys.map(key => <kbd key={key}>{key}</kbd>)}</dd>
              </div>
            ))}
          </dl>
          <p className="keyboard-shortcuts-hint">Press <kbd>?</kbd> any time outside a text field to open this guide.</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
