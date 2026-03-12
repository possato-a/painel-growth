import { NavLink, useLocation } from 'react-router-dom';
import { DOCS_NAV } from './nav-config';
import { cn } from '@/lib/cn';

export function DocsSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="w-60 flex-shrink-0 h-full overflow-y-auto border-r border-notion-border bg-notion-bg-primary">
      <nav className="px-3 py-6 space-y-6">
        {DOCS_NAV.map((section) => (
          <div key={section.id}>
            {/* Section label */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-notion-text-tertiary px-2 mb-1.5">
              {section.label}
            </p>

            {/* Items */}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end
                      className={cn(
                        'flex items-center py-1.5 px-2 rounded-md text-[13px] transition-colors duration-100 select-none border-l-2 pl-[6px]',
                        isActive
                          ? 'bg-[#EBF4FF] text-notion-primary font-medium border-notion-primary'
                          : 'text-notion-text-secondary hover:bg-notion-bg-secondary hover:text-notion-text-primary border-transparent'
                      )}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sidebar footer */}
      <div className="px-5 py-4 border-t border-notion-border mt-2">
        <p className="text-[11px] text-notion-text-tertiary">v0.2.0 · 2026</p>
      </div>
    </aside>
  );
}
