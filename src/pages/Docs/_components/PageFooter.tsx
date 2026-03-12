import { useState } from 'react';
import { ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DocNavItem } from '../nav-config';

interface PageFooterProps {
  prev?: DocNavItem | null;
  next?: DocNavItem | null;
}

export function PageFooter({ prev, next }: PageFooterProps) {
  const [voted, setVoted] = useState<'yes' | 'no' | null>(null);

  return (
    <div className="mt-16 pt-8 border-t border-notion-border space-y-8">
      {/* Was this helpful? */}
      <div className="flex items-center gap-4 flex-wrap">
        <p className="text-[13px] text-notion-text-secondary">Esta página foi útil?</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoted('yes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] border transition-all duration-100 ${
              voted === 'yes'
                ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#0F7B6C]'
                : 'bg-notion-bg-primary border-notion-border text-notion-text-secondary hover:border-notion-text-secondary'
            }`}
          >
            <ThumbsUp size={12} />
            Sim
          </button>
          <button
            onClick={() => setVoted('no')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] border transition-all duration-100 ${
              voted === 'no'
                ? 'bg-[#FFF5F5] border-[#FECACA] text-[#E03E3E]'
                : 'bg-notion-bg-primary border-notion-border text-notion-text-secondary hover:border-notion-text-secondary'
            }`}
          >
            <ThumbsDown size={12} />
            Não
          </button>
        </div>
        {voted && (
          <p className="text-[12px] text-notion-text-tertiary animate-pulse">
            Obrigado pelo feedback!
          </p>
        )}
      </div>

      {/* Prev / Next navigation */}
      {(prev || next) && (
        <div className="flex items-stretch justify-between gap-4">
          {prev ? (
            <Link
              to={prev.path}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg border border-notion-border hover:border-notion-primary hover:bg-[#EBF4FF] transition-all duration-150 min-w-0 flex-1 max-w-[48%]"
            >
              <ChevronLeft size={16} className="flex-shrink-0 text-notion-text-tertiary group-hover:text-notion-primary transition-colors group-hover:-translate-x-0.5 transition-transform" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-notion-text-tertiary mb-0.5">Anterior</p>
                <p className="text-[13px] font-medium text-notion-text-primary group-hover:text-notion-primary truncate">{prev.label}</p>
              </div>
            </Link>
          ) : <div className="flex-1" />}

          {next ? (
            <Link
              to={next.path}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg border border-notion-border hover:border-notion-primary hover:bg-[#EBF4FF] transition-all duration-150 min-w-0 flex-1 max-w-[48%] justify-end text-right"
            >
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-notion-text-tertiary mb-0.5">Próxima</p>
                <p className="text-[13px] font-medium text-notion-text-primary group-hover:text-notion-primary truncate">{next.label}</p>
              </div>
              <ChevronRight size={16} className="flex-shrink-0 text-notion-text-tertiary group-hover:text-notion-primary transition-colors group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : <div className="flex-1" />}
        </div>
      )}
    </div>
  );
}
