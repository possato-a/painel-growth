import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, TrendingUp, X, ArrowLeft } from 'lucide-react';
import { ALL_DOC_PAGES } from './nav-config';

function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const results = query.length > 0
    ? ALL_DOC_PAGES.filter((p) =>
        p.label.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_DOC_PAGES;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[16vh]"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[540px] mx-4 bg-notion-bg-primary rounded-xl shadow-2xl border border-notion-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-notion-border">
          <Search size={14} className="text-notion-text-tertiary flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar na documentação..."
            className="flex-1 bg-transparent text-[14px] text-notion-text-primary placeholder:text-notion-text-tertiary outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-0.5">
              <X size={12} className="text-notion-text-tertiary hover:text-notion-text-primary" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="py-1.5 max-h-72 overflow-y-auto">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-[13px] text-notion-text-tertiary">
              Nenhum resultado para "{query}"
            </p>
          ) : (
            results.map((page) => (
              <button
                key={page.path}
                onClick={() => handleSelect(page.path)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-notion-bg-secondary transition-colors text-left"
              >
                <Search size={12} className="text-notion-text-tertiary flex-shrink-0" />
                <span className="text-[13px] text-notion-text-primary">{page.label}</span>
                <span className="ml-auto text-[11px] text-notion-text-tertiary font-mono">{page.path}</span>
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-notion-border bg-notion-bg-secondary">
          <span className="text-[11px] text-notion-text-tertiary">
            <kbd className="font-mono bg-notion-bg-primary border border-notion-border px-1.5 py-0.5 rounded text-[10px] mr-1">↵</kbd>
            Selecionar
          </span>
          <span className="text-[11px] text-notion-text-tertiary">
            <kbd className="font-mono bg-notion-bg-primary border border-notion-border px-1.5 py-0.5 rounded text-[10px] mr-1">Esc</kbd>
            Fechar
          </span>
        </div>
      </div>
    </div>
  );
}

export function DocsTopbar() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <header className="h-14 flex-shrink-0 bg-notion-bg-primary border-b border-notion-border flex items-center px-6 gap-4 z-20">
        {/* Logo */}
        <Link to="/docs/overview" className="flex items-center gap-2.5 flex-shrink-0 mr-2">
          <div className="w-7 h-7 bg-notion-primary rounded-md flex items-center justify-center">
            <TrendingUp size={14} className="text-white" />
          </div>
          <span className="text-[14px] font-semibold text-notion-text-primary leading-none">
            Painel Growth
          </span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-notion-border bg-notion-bg-secondary text-notion-text-tertiary leading-none">
            docs
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xs">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg border border-notion-border bg-notion-bg-secondary hover:border-notion-text-tertiary text-notion-text-tertiary text-[12px] transition-colors group"
          >
            <Search size={12} className="flex-shrink-0" />
            <span className="flex-1 text-left">Buscar...</span>
            <kbd className="text-[10px] font-mono bg-notion-bg-primary border border-notion-border px-1.5 py-0.5 rounded hidden sm:inline">
              Ctrl K
            </kbd>
          </button>
        </div>

        <div className="flex-1" />

        {/* Back to app */}
        <Link
          to="/meta-ads/geral"
          className="flex items-center gap-1.5 text-[12px] text-notion-text-secondary hover:text-notion-text-primary transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Voltar ao painel</span>
        </Link>
      </header>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
