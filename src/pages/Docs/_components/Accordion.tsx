import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export interface AccordionItem {
  question: string;
  answer: React.ReactNode;
}

function AccordionRow({ item }: { item: AccordionItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-notion-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3 bg-notion-bg-secondary hover:bg-notion-bg-tertiary text-left transition-colors duration-100"
      >
        <ChevronRight
          size={14}
          className={`flex-shrink-0 text-notion-text-secondary transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        />
        <span className="text-[13px] font-medium text-notion-text-primary">{item.question}</span>
      </button>
      {open && (
        <div className="px-4 py-4 border-t border-notion-border bg-notion-bg-primary text-[13px] text-notion-text-secondary leading-relaxed">
          {item.answer}
        </div>
      )}
    </div>
  );
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  return (
    <div className="space-y-2 my-4">
      {items.map((item, i) => (
        <AccordionRow key={i} item={item} />
      ))}
    </div>
  );
}
