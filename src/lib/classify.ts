import { Campaign, AdSet, Ad } from '../types/meta';

export type FunnelStage = 'topo' | 'meio' | 'fundo' | 'desconhecido';
export type MidFunnelType = 'webinar' | 'comunidade' | 'simulador' | 'outro';

export function classifyFunnelStage(campaign: Campaign): FunnelStage {
  const name = campaign.name.toUpperCase();
  const obj = campaign.objective || '';

  // Fundo indicators
  if (
    name.includes('RETARG') ||
    name.includes('FUNDO') ||
    name.includes('HOT ') ||
    name.includes('REMARKET') ||
    name.includes('ATIVACAO')
  )
    return 'fundo';

  // Topo indicators
  if (
    obj === 'OUTCOME_AWARENESS' ||
    obj === 'OUTCOME_REACH' ||
    obj === 'OUTCOME_VIDEO_VIEWS' ||
    obj === 'OUTCOME_TRAFFIC' ||
    name.includes('TOPO') ||
    name.includes('VISITA') ||
    name.includes('ALCANCE') ||
    name.includes('AWARENESS') ||
    name.includes('PERFIL') ||
    name.includes('RECONHEC') ||
    name.includes('INAUGURAC')
  )
    return 'topo';

  // Meio indicators (leads, webinar, comunidade, simulador)
  if (
    obj === 'OUTCOME_LEADS' ||
    name.includes('MEIO') ||
    name.includes('CADASTRO') ||
    name.includes('LEAD') ||
    name.includes('WEBINAR') ||
    name.includes('COMUNIDADE') ||
    name.includes('SIMULADOR') ||
    name.includes('FRANQUIA') ||
    name.includes('FR]')
  )
    return 'meio';

  return 'desconhecido';
}

export function classifyMidFunnelType(campaign: Campaign): MidFunnelType {
  const name = campaign.name.toUpperCase();
  if (name.includes('WEBINAR')) return 'webinar';
  if (
    name.includes('COMUNIDADE') ||
    name.includes('GRUPO') ||
    name.includes('EMPREENDA')
  )
    return 'comunidade';
  if (name.includes('SIMULADOR') || name.includes('SIMUL')) return 'simulador';
  return 'outro';
}

export function classifyAdSetMidFunnelType(adset: AdSet): MidFunnelType {
  const name = adset.name.toUpperCase();
  if (name.includes('WEBINAR')) return 'webinar';
  if (
    name.includes('COMUNIDADE') ||
    name.includes('GRUPO') ||
    name.includes('EMPREENDA')
  )
    return 'comunidade';
  if (
    name.includes('MODELO') ||
    name.includes('FINANCEIRO') ||
    name.includes('SIMULADOR') ||
    name.includes('SIMUL')
  )
    return 'simulador';
  return 'outro';
}

// Classifies an individual ad by name — used in Meio de Funil page
export function classifyAdMidFunnelType(ad: Ad): MidFunnelType {
  const name = ad.name.toUpperCase();
  if (name.includes('WEBINAR')) return 'webinar';
  if (
    name.includes('GRUPO') ||
    name.includes('EMPREENDA') ||
    name.includes('COMUNIDADE')
  )
    return 'comunidade';
  if (
    name.includes('MODELO') ||
    name.includes('FINANCEIRO') ||
    name.includes('SIMULADOR')
  )
    return 'simulador';
  return 'outro';
}

export const STAGE_LABELS: Record<FunnelStage, string> = {
  topo: 'Topo de Funil',
  meio: 'Meio de Funil',
  fundo: 'Fundo de Funil',
  desconhecido: 'Não Classificado',
};

export const MID_LABELS: Record<MidFunnelType, string> = {
  webinar: 'Webinar',
  comunidade: 'Grupo Empreenda / Comunidade',
  simulador: 'Modelo Financeiro',
  outro: 'Outros',
};
