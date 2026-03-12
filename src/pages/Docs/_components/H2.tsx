interface H2Props {
  id: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/** Section heading with anchor link — use inside doc pages */
export function H2({ id, icon, children }: H2Props) {
  return (
    <h2
      id={id}
      className="group flex items-center gap-2.5 text-[18px] font-semibold text-notion-text-primary mt-10 mb-4 scroll-mt-16 pb-3 border-b border-notion-border"
    >
      {icon && <span className="text-notion-primary">{icon}</span>}
      <span className="flex-1">{children}</span>
      <a
        href={`#${id}`}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-[14px] text-notion-text-tertiary hover:text-notion-primary font-normal"
        aria-hidden="true"
      >
        #
      </a>
    </h2>
  );
}

/** Smaller sub-section heading (H3) */
export function H3({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h3
      id={id}
      className="text-[15px] font-semibold text-notion-text-primary mt-7 mb-3 scroll-mt-16"
    >
      {children}
    </h3>
  );
}
