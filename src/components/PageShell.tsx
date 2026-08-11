'use client';
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import type { NoteTree } from '@/types';

export function PageShell({ tree, currentId, children }: {
  tree: NoteTree;
  currentId?: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <div className="layout-header">
        <Header onMenuToggle={() => setSidebarOpen(o => !o)} />
      </div>
      <div className={`layout-sidebar${sidebarOpen ? ' open' : ''}`}>
        <Sidebar tree={tree} currentId={currentId} />
      </div>
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
}
