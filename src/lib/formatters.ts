export const fmtCurrency = (v: string | number): string => {
  const num = Number(v);
  if (isNaN(num)) return '—';
  return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const fmtNumber = (v: string | number): string => {
  const num = Number(v);
  if (isNaN(num)) return '—';
  return num.toLocaleString('pt-BR');
};

// CTR from Meta comes already as percentage (e.g. "2.50" = 2.50%)
export const fmtPct = (v: string | number): string => {
  const num = Number(v);
  if (isNaN(num)) return '—';
  // If value is already a percentage string (> 0 and typical CTR range), display as-is
  return `${num.toFixed(2)}%`;
};

export const fmtCompact = (v: string | number): string => {
  const num = Number(v);
  if (isNaN(num)) return '—';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString('pt-BR');
};

export const fmtDate = (dateStr: string): string => {
  // dateStr format: "YYYY-MM-DD"
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}`;
};

export const fmtDateFull = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const DATE_PRESET_LABELS: Record<string, string> = {
  today: 'Hoje',
  last_7d: 'Últimos 7 dias',
  last_14d: 'Últimos 14 dias',
  last_30d: 'Últimos 30 dias',
  this_month: 'Este mês',
  last_month: 'Mês passado',
};

export const OBJECTIVE_LABELS: Record<string, string> = {
  OUTCOME_LEADS: 'Geração de Leads',
  OUTCOME_TRAFFIC: 'Tráfego',
  OUTCOME_AWARENESS: 'Reconhecimento',
  OUTCOME_ENGAGEMENT: 'Engajamento',
  OUTCOME_APP_PROMOTION: 'Promoção de App',
  OUTCOME_SALES: 'Vendas',
  LINK_CLICKS: 'Cliques no Link',
  CONVERSIONS: 'Conversões',
  REACH: 'Alcance',
  BRAND_AWARENESS: 'Reconhecimento de Marca',
  VIDEO_VIEWS: 'Visualizações de Vídeo',
  MESSAGES: 'Mensagens',
  PAGE_LIKES: 'Curtidas na Página',
  LOCAL_AWARENESS: 'Público Local',
  PRODUCT_CATALOG_SALES: 'Vendas por Catálogo',
  STORE_VISITS: 'Visitas à Loja',
  EVENT_RESPONSES: 'Respostas ao Evento',
  APP_INSTALLS: 'Instalações de App',
};

export function getObjectiveLabel(objective: string): string {
  return OBJECTIVE_LABELS[objective] ?? objective;
}
