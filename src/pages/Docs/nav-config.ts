export interface DocNavItem {
  label: string;
  path: string;
}

export interface DocNavSection {
  id: string;
  label: string;
  items: DocNavItem[];
}

export const DOCS_NAV: DocNavSection[] = [
  {
    id: 'getting-started',
    label: 'Getting started',
    items: [
      { label: 'Visão Geral',            path: '/docs/overview'            },
      { label: 'Como o painel funciona', path: '/docs/como-funciona'       },
    ],
  },
  {
    id: 'crm-conceitos',
    label: 'CRM Conceitos',
    items: [
      { label: 'Classificação de Leads', path: '/docs/classificacao-leads' },
      { label: 'Auto-Evolução',          path: '/docs/auto-evolucao'       },
      { label: 'Sincronização do CRM',   path: '/docs/sincronizacao'       },
    ],
  },
  {
    id: 'fontes',
    label: 'Fontes de Dados',
    items: [
      { label: 'Planilhas Google',       path: '/docs/fontes-dados'        },
      { label: 'Páginas & Canal',        path: '/docs/paginas-canal'       },
    ],
  },
  {
    id: 'referencia',
    label: 'Referência',
    items: [
      { label: 'Regras de ID',           path: '/docs/regras-id'           },
      { label: 'Exclusões',              path: '/docs/exclusoes'           },
      { label: 'Cidades de Operação',    path: '/docs/cidades'             },
    ],
  },
  {
    id: 'apis',
    label: 'APIs & Integrações',
    items: [
      { label: 'Google Ads API',         path: '/docs/google-ads'          },
    ],
  },
];

export const ALL_DOC_PAGES = DOCS_NAV.flatMap((s) => s.items);

export function getPrevNext(currentPath: string) {
  const idx = ALL_DOC_PAGES.findIndex((p) => p.path === currentPath);
  return {
    prev: idx > 0 ? ALL_DOC_PAGES[idx - 1] : null,
    next: idx < ALL_DOC_PAGES.length - 1 ? ALL_DOC_PAGES[idx + 1] : null,
  };
}

export function getBreadcrumb(currentPath: string): { section: string; page: string } | null {
  for (const section of DOCS_NAV) {
    const item = section.items.find((i) => i.path === currentPath);
    if (item) return { section: section.label, page: item.label };
  }
  return null;
}
