import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface NavCard {
  title: string;
  description: string;
  to: string;
  icon?: React.ReactNode;
}

interface NavCardsProps {
  cards: NavCard[];
  label?: string;
}

export function NavCards({ cards, label = 'Próximos passos' }: NavCardsProps) {
  return (
    <div className="my-10">
      <p className="text-[10px] font-bold uppercase tracking-widest text-notion-text-tertiary mb-3">
        {label}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="group flex items-start gap-3 p-4 rounded-lg border border-notion-border bg-notion-bg-primary hover:border-notion-primary hover:bg-[#EBF4FF] transition-all duration-150"
          >
            <div className="mt-0.5 text-notion-text-tertiary group-hover:text-notion-primary transition-colors flex-shrink-0">
              {card.icon ?? <ArrowRight size={14} />}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-notion-text-primary group-hover:text-notion-primary leading-snug">
                {card.title}
              </p>
              <p className="text-[12px] text-notion-text-secondary mt-0.5 leading-snug">
                {card.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
