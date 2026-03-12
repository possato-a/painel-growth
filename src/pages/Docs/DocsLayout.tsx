import { Outlet } from 'react-router-dom';
import { DocsTopbar } from './DocsTopbar';
import { DocsSidebar } from './DocsSidebar';

export function DocsLayout() {
  return (
    <div className="flex flex-col h-screen bg-notion-bg-primary overflow-hidden">
      <DocsTopbar />

      <div className="flex flex-1 min-h-0">
        <DocsSidebar />

        {/* The scroll container — Outlet renders page content here */}
        <main className="flex-1 overflow-y-auto bg-notion-bg-primary">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
