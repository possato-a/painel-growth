import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  filename?: string;
  children: string;
}

export function CodeBlock({ language = 'shell', filename, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-notion-border overflow-hidden my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-notion-bg-secondary border-b border-notion-border">
        <span className="text-[11px] font-mono text-notion-text-tertiary">
          {filename ?? language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-notion-text-secondary hover:text-notion-text-primary transition-colors"
        >
          {copied
            ? <Check size={11} className="text-[#0F7B6C]" />
            : <Copy size={11} />}
          <span>{copied ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>
      <pre className="px-4 py-4 bg-[#1e1e2e] overflow-x-auto">
        <code className="text-[12.5px] font-mono text-[#cdd6f4] leading-relaxed whitespace-pre">
          {children.trim()}
        </code>
      </pre>
    </div>
  );
}

/** Inline code chip — use inside prose */
export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[12px] bg-notion-bg-secondary border border-notion-border px-1.5 py-0.5 rounded text-notion-text-primary">
      {children}
    </code>
  );
}
