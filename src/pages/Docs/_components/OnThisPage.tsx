import { useState, useEffect } from 'react';

export interface TocItem {
  id: string;
  label: string;
}

function useActiveSection(ids: string[]): string {
  const [activeId, setActiveId] = useState(ids[0] ?? '');

  useEffect(() => {
    if (ids.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-8% 0% -82% 0%' },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}

export function OnThisPage({ items }: { items: TocItem[] }) {
  const activeId = useActiveSection(items.map((i) => i.id));

  if (items.length === 0) return null;

  return (
    <aside className="hidden xl:block w-52 flex-shrink-0 pl-4">
      <div className="sticky top-14 pt-8 pb-10 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-notion-text-tertiary mb-3 px-2">
          Nesta página
        </p>
        <ul className="space-y-0.5">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`flex items-center gap-2 text-[12px] py-1 px-2 rounded transition-colors duration-100 ${
                  activeId === item.id
                    ? 'text-notion-primary font-medium bg-[#EBF4FF]'
                    : 'text-notion-text-secondary hover:text-notion-text-primary hover:bg-notion-bg-secondary'
                }`}
              >
                {activeId === item.id && (
                  <span className="w-1 h-1 rounded-full bg-notion-primary flex-shrink-0" />
                )}
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
