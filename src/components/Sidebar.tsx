import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart2,
  Users,
  Layers,
  FileSpreadsheet,
  TrendingUp,
  Filter,
  Image,
  type LucideProps,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Badge } from './ui/Badge';

type LucideIcon = React.ForwardRefExoticComponent<
  Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
>;

interface SubNavItem {
  label: string;
  icon: LucideIcon;
  to: string;
}

const metaSubNav: SubNavItem[] = [
  { label: 'Geral', icon: BarChart2, to: '/meta-ads/geral' },
  { label: 'Por Funil', icon: Filter, to: '/meta-ads/funil' },
  { label: 'Meio de Funil', icon: Layers, to: '/meta-ads/meio-funil' },
  { label: 'Criativos', icon: Image, to: '/meta-ads/criativos' },
];

interface SoonItem {
  label: string;
  icon: LucideIcon;
}

const soonItems: SoonItem[] = [
  { label: 'Leads', icon: Users },
  { label: 'CRM', icon: FileSpreadsheet },
];

export function Sidebar() {
  const location = useLocation();
  const isMetaActive = location.pathname.startsWith('/meta-ads');

  return (
    <aside className="w-60 flex-shrink-0 bg-notion-bg-primary border-r border-notion-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-notion-border">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-notion-primary rounded flex items-center justify-center flex-shrink-0">
            <TrendingUp size={14} className="text-white" />
          </div>
          <span className="text-base font-semibold text-notion-text-primary tracking-tight">
            Painel Growth
          </span>
        </div>
        <p className="text-xs text-notion-text-tertiary mt-1 pl-8">Be Honest Franquia</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-medium text-notion-text-tertiary uppercase tracking-wider px-2 mb-2 mt-1">
          Módulos
        </p>

        {/* Meta Ads parent */}
        <div
          className={cn(
            'flex items-center gap-2.5 px-2 py-1.5 rounded select-none transition-colors duration-[120ms]',
            isMetaActive
              ? 'bg-notion-bg-tertiary text-notion-text-primary'
              : 'text-notion-text-secondary hover:bg-notion-bg-tertiary hover:text-notion-text-primary'
          )}
        >
          <BarChart2
            size={14}
            className={cn(
              'flex-shrink-0',
              isMetaActive ? 'text-notion-primary' : 'text-notion-text-secondary'
            )}
          />
          <span className="text-sm font-medium flex-1">Meta Ads</span>
          {isMetaActive && (
            <div className="w-1.5 h-1.5 rounded-full bg-notion-primary flex-shrink-0" />
          )}
        </div>

        {/* Sub-nav — always visible since Meta Ads is the main section */}
        <div className="pl-4 space-y-0.5 mt-0.5">
          {metaSubNav.map((item) => (
            <MetaSubLink key={item.to} item={item} />
          ))}
        </div>

        {/* Spacer */}
        <div className="pt-2" />

        {/* Soon items */}
        {soonItems.map((item) => (
          <SoonNavItem key={item.label} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-notion-border">
        <p className="text-xs text-notion-text-tertiary">v0.2.0 · 2025</p>
      </div>
    </aside>
  );
}

function MetaSubLink({ item }: { item: SubNavItem }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 py-1 px-2 rounded text-[12px] transition-colors duration-[120ms] select-none',
          isActive
            ? 'text-notion-primary bg-[#E7F3FF] border-l-2 border-notion-primary pl-[6px]'
            : 'text-[#787774] hover:bg-[#EFEEEB] hover:text-notion-text-primary border-l-2 border-transparent pl-[6px]'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={12} className={isActive ? 'text-notion-primary flex-shrink-0' : 'text-[#787774] flex-shrink-0'} />
          <span className="flex-1">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

function SoonNavItem({ item }: { item: SoonItem }) {
  const Icon = item.icon;
  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5 rounded cursor-default select-none">
      <Icon size={14} className="text-notion-text-tertiary flex-shrink-0" />
      <span className="text-sm text-notion-text-tertiary flex-1">{item.label}</span>
      <Badge variant="soon" className="text-[10px] py-0 px-1.5">
        em breve
      </Badge>
    </div>
  );
}
