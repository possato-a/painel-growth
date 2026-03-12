import { useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getBreadcrumb, getPrevNext } from '../nav-config';
import { OnThisPage, type TocItem } from './OnThisPage';
import { PageFooter } from './PageFooter';

interface PageShellProps {
  badge?: string;
  title: string;
  description?: string;
  lastUpdated?: string;
  toc?: TocItem[];
  children: React.ReactNode;
}

export function PageShell({
  badge,
  title,
  description,
  lastUpdated = 'mar/2026',
  toc = [],
  children,
}: PageShellProps) {
  const { pathname } = useLocation();
  const breadcrumb = getBreadcrumb(pathname);
  const { prev, next } = getPrevNext(pathname);

  return (
    <div className="flex min-h-full">
      {/* Main content */}
      <div className="flex-1 min-w-0 px-8 py-8">
        <div className="max-w-[740px]">

          {/* Breadcrumb */}
          {breadcrumb && (
            <div className="flex items-center gap-1 text-[12px] text-notion-text-tertiary mb-5 flex-wrap">
              <span className="hover:text-notion-text-secondary cursor-default">Docs</span>
              <ChevronRight size={11} />
              <span className="hover:text-notion-text-secondary cursor-default">{breadcrumb.section}</span>
              <ChevronRight size={11} />
              <span className="text-notion-text-secondary">{breadcrumb.page}</span>
            </div>
          )}

          {/* Page header */}
          <div className="mb-8 pb-6 border-b border-notion-border">
            {badge && (
              <div className="mb-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#EBF4FF] text-[#2383E2] border border-[#BFDBFE]">
                  {badge}
                </span>
              </div>
            )}
            <h1 className="text-[26px] font-bold text-notion-text-primary leading-tight mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-[15px] text-notion-text-secondary leading-relaxed">
                {description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-[11px] text-notion-text-tertiary">Be Honest Franquia</span>
              <span className="text-notion-text-tertiary text-[10px]">·</span>
              <span className="text-[11px] text-notion-text-tertiary">Atualizado {lastUpdated}</span>
            </div>
          </div>

          {/* Page body */}
          {children}

          {/* Footer */}
          <PageFooter prev={prev} next={next} />
        </div>
      </div>

      {/* Right TOC */}
      {toc.length > 0 && <OnThisPage items={toc} />}
    </div>
  );
}
