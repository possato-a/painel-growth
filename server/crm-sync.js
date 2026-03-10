/**
 * CRM Sync — server-side ESM module.
 * Ports the logic from scripts/crm-sync.js so it can run inline on Vercel
 * (no child processes, no local FS writes). Uses google-sheets.js for all
 * Sheets I/O and returns the processed store object.
 */

import { sheetsGet, sheetsUpdate, getGoogleToken } from './google-sheets.js';
import https from 'https';

// ── Sheet IDs ──────────────────────────────────────────────────
const LEADS_SHEET_ID = '1f-dvv2zLKbey__rug-T5gJn-NkNmf7EWcQv3Tb9IvM8';
const CRM_SHEET_ID   = '1yK70fNR8dYbehKPLSOEv3SPSPZKp01PNgMZa11M_TKQ';
const CRM_PAINEL_TAB = 'CRM_PAINEL';

// ── Cidades na Praça ────────────────────────────────────────────
const PRACA_CITIES = [
  'Belo Horizonte','Betim','Contagem','Nova Lima','Poços de Caldas',
  'Pouso Alegre','Governador Valadares','Ipatinga','Sabará','Sarzedo',
  'Ibirité','Igarapé','Pedro Leopoldo','Vespasiano','Ribeirão das Neves',
  'Divinópolis','Itabirito','Brumadinho','Patos de Minas','Santa Luzia',
  'Juiz de Fora','Pará de Minas','Esmeraldas','Barbacena','Bom Despacho',
  'Paracatu','Varginha','Raposos',
  'Anápolis','Aparecida de Goiânia','Goiânia',
  'Brasília',
];

function norm(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}
const PRACA_NORMALIZED = PRACA_CITIES.map(norm);

function isInPraca(cidade, estado) {
  const c = norm(cidade);
  const e = norm(estado);
  if (e.includes('distrito federal') || e === 'df' || c.includes('brasilia') || c === 'distrito federal') return true;
  return PRACA_NORMALIZED.includes(c);
}

function hasCapital(disponibilidade) {
  const d = (disponibilidade || '').toLowerCase().trim();
  if (!d) return false;
  if (d.includes('não tenho') || d.includes('nao tenho')) return false;
  return true;
}

// ── Exclusions ──────────────────────────────────────────────────
const EXCLUDED_NAMES = [
  'francisco possato','carlos fernandes','joão gabriel dos santos dos anjos',
];

function isExcluded(nome, email) {
  const n = (nome  || '').toLowerCase();
  const e = (email || '').toLowerCase();
  if (EXCLUDED_NAMES.some(x => n.includes(x))) return true;
  if (['teste', 'test', '@test'].some(x => e.includes(x) || n.includes(x))) return true;
  return false;
}

// ── Page classification ─────────────────────────────────────────
function classifyPage(page) {
  if (!page) return { foco: 'CAPTAÇÃO FUNDO', canal: 'LP Meta Ads' };
  const p = page.toLowerCase().trim();
  if (p.startsWith('{') || p.includes('native-form') || p === 'forms nativo')
    return { foco: 'CAPTAÇÃO FUNDO', canal: 'Forms Nativo' };
  if (p.includes('simulador-financeiro'))  return { foco: 'CAPTAÇÃO MEIO', canal: 'Simulador Financeiro' };
  if (p.includes('/comunidade'))           return { foco: 'CAPTAÇÃO MEIO', canal: 'Grupo Empreenda / Comunidade' };
  if (p.includes('webinar'))               return { foco: 'CAPTAÇÃO MEIO', canal: 'Webinar' };
  if (p === '/')                           return { foco: 'CAPTAÇÃO MEIO', canal: 'Webinar' };
  if (p.includes('operacao-behonest'))     return { foco: 'ESPECIAL', canal: 'Operação Be Honest' };
  if (p.includes('aulao-grupo'))           return { foco: 'ESPECIAL', canal: 'Aulão Grupo' };
  if (p.includes('google'))               return { foco: 'CAPTAÇÃO FUNDO', canal: 'LP Google Ads' };
  if (p.includes('fazer-negocio') || p.includes('negocio-escalavel') ||
      p.includes('negocio-geol')  || p.includes('negocio-operador'))
    return { foco: 'CAPTAÇÃO FUNDO', canal: 'LP Meta Ads' };
  return { foco: 'CAPTAÇÃO FUNDO', canal: 'LP Meta Ads' };
}

// ── Stage helpers ───────────────────────────────────────────────
const COMMERCIAL_STAGES = [
  'CONEXÃO','REUNIÃO FINANCEIRA','SQL',
  'APRESENTAÇÃO MODELO AGENDADA','REUNIÃO MODELO REALIZADA','REUNIÃO COM FUNDADOR',
];

function normalizeEstagio(mqStatus, crmEstagio) {
  if (crmEstagio) {
    const s = crmEstagio.trim();
    if (s.toUpperCase() === 'PRÉ MQL') return 'PRÉ-MQL';
    return s;
  }
  const m = (mqStatus || '').trim().toUpperCase();
  if (m === 'PRÉ-MQL' || m === 'PRE-MQL') return 'PRÉ-MQL';
  if (m === 'MQL')          return 'MQL';
  if (m === 'MQL RECUSADO') return 'MQL RECUSADO';
  if (m === 'LEAD PERDIDO') return 'LEAD PERDIDO';
  return 'LEAD';
}

const STAGE_RANK = {
  'LEAD PERDIDO': -1, 'MQL RECUSADO': -1,
  'LEAD': 0, 'PRÉ-MQL': 1, 'MQL': 2,
  'CONEXÃO': 3, 'REUNIÃO FINANCEIRA': 4, 'SQL': 5,
  'APRESENTAÇÃO MODELO AGENDADA': 6, 'REUNIÃO MODELO REALIZADA': 7,
  'REUNIÃO COM FUNDADOR': 8,
};

function autoEvolve(crmLeads) {
  const groups = {};
  for (const lead of crmLeads) {
    const email = lead.email.toLowerCase().trim();
    if (!groups[email]) groups[email] = [];
    groups[email].push(lead);
  }
  for (const leads of Object.values(groups)) {
    const anyLevantada  = leads.some(l => l.focoCaptacao === 'CAPTAÇÃO FUNDO');
    const anyHasCapital = leads.some(l => hasCapital(l.disponibilidade));
    const anyInPraca    = leads.some(l => isInPraca(l.cidade, l.estado));
    for (const lead of leads) {
      if (COMMERCIAL_STAGES.includes(lead.estagio)) continue;
      if (['MQL RECUSADO','LEAD PERDIDO'].includes(lead.estagio) && lead.statusPipeline) continue;
      const inPraca = isInPraca(lead.cidade, lead.estado) || anyInPraca;
      const capital = hasCapital(lead.disponibilidade) || anyHasCapital;
      let newStage = lead.estagio;
      if (lead.focoCaptacao === 'CAPTAÇÃO FUNDO') {
        newStage = (inPraca && capital) ? 'MQL' : 'MQL RECUSADO';
      } else if (lead.focoCaptacao === 'CAPTAÇÃO MEIO') {
        if (!inPraca)                    newStage = 'LEAD PERDIDO';
        else if (capital && anyLevantada) newStage = 'MQL';
        else if (capital)                newStage = 'PRÉ-MQL';
        else                             newStage = 'LEAD';
      }
      const oldRank = STAGE_RANK[lead.estagio] ?? 0;
      const newRank = STAGE_RANK[newStage] ?? 0;
      if (newRank > oldRank || lead.estagio === 'LEAD') lead.estagio = newStage;
    }
  }
}

// ── Sheets helpers (raw, using token directly) ──────────────────
function sheetsRaw(token, path_, method, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'sheets.googleapis.com',
      path: path_,
      method: method || 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
        ...(bodyStr ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({}); } });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function sheetsPut(token, sheetId, range, values) {
  const body = { values, majorDimension: 'ROWS' };
  return sheetsRaw(token, `/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`, 'PUT', body);
}

async function sheetsClear(token, sheetId, range) {
  return sheetsRaw(token, `/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}:clear`, 'POST', {});
}

async function ensureTab(token, sheetId, tabName) {
  const meta = await sheetsRaw(token, `/v4/spreadsheets/${sheetId}?fields=sheets.properties`, 'GET', null);
  if (meta.sheets?.some(s => s.properties.title === tabName)) return;
  await sheetsRaw(token, `/v4/spreadsheets/${sheetId}:batchUpdate`, 'POST', {
    requests: [{ addSheet: { properties: { title: tabName } } }],
  });
  console.log(`[crm-sync] Aba "${tabName}" criada.`);
}

// ── CRM_PAINEL columns (A–X, 24 cols) ──────────────────────────
// stageHistory stored as JSON string in col X so it survives cold starts
const CRM_HEADERS = [
  'rowId','leadId','conversionNum','data','hora',
  'nome','email','celular','cidade','estado',
  'disponibilidade','mqStatus','page','source','campaign',
  'conjunto','criativo','focoCaptacao','canalTipo','estagio',
  'statusPipeline','motivoPerda','valor','stageHistory',
];
function rowToArray(r) {
  return CRM_HEADERS.map(k => {
    if (k === 'stageHistory') return JSON.stringify(r[k] || []);
    return String(r[k] ?? '');
  });
}

// ── Date helpers ────────────────────────────────────────────────
function parseDate(ddmmyyyy) {
  const parts = (ddmmyyyy || '').split('/');
  if (parts.length !== 3) return '';
  return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
}
const CRM_START_DATE = '2026-02-01';
function isFromFeb2026(data) { return parseDate(data) >= CRM_START_DATE; }

// ── BASE_CRM append ─────────────────────────────────────────────
function parseDateShort(ddmm) {
  const p = (ddmm || '').trim().split('/');
  if (p.length < 2) return '';
  const year = p.length === 3 ? p[2] : '2026';
  return `${year}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`;
}
function formatDateShort(ddmmyyyy) {
  const p = (ddmmyyyy || '').split('/');
  return p.length === 3 ? `${p[0]}/${p[1]}` : ddmmyyyy;
}
function formatCanal(canalTipo) {
  if (!canalTipo) return 'Meta Ads';
  if (canalTipo.includes('Google')) return 'Google Ads';
  return 'Meta Ads';
}
function formatPaginaLabel(page) {
  if (!page || page.startsWith('{')) return 'Forms Nativo';
  const p = page.toLowerCase();
  if (p.includes('simulador-financeiro')) return 'Simulador Financeiro';
  if (p.includes('/comunidade'))          return 'Comunidade';
  if (p === '/')                          return 'Webinar';
  if (p.includes('operacao-behonest'))    return 'Operação Be Honest';
  if (p.includes('aulao-grupo'))          return 'Aulão Grupo';
  if (p.includes('google'))              return 'LP Google';
  if (p.includes('fazer-negocio') || p.includes('negocio-operador') ||
      p.includes('negocio-escalavel'))   return 'LP Franquia';
  if (p.includes('meta'))               return 'LP Meta';
  return page;
}
function leadToBaseCrmRow(lead, seqId) {
  return [
    String(seqId), formatDateShort(lead.data), lead.hora, lead.nome, lead.email,
    lead.celular, lead.cidade, lead.estado, formatCanal(lead.canalTipo),
    formatPaginaLabel(lead.page), lead.source, lead.campaign, lead.conjunto,
    lead.criativo, lead.estagio, lead.disponibilidade, '', '', '', lead.focoCaptacao,
  ];
}

async function appendMissingToBaseCrm(token, crmLeads, existingCrmRows) {
  let maxDateIso = '0000-00-00';
  let lastSeqId  = 0;
  let dataRowCount = 0;
  for (const row of existingCrmRows) {
    if (!row || !row.some(c => c)) continue;
    dataRowCount++;
    const iso = parseDateShort((row[1] || '').trim());
    if (iso && iso > maxDateIso) maxDateIso = iso;
    const id = parseInt(row[0], 10);
    if (!isNaN(id) && id > lastSeqId) lastSeqId = id;
  }
  if (maxDateIso === '0000-00-00') {
    console.log('[crm-sync] BASE_CRM sem datas reconhecidas — pulando append');
    return;
  }
  console.log(`[crm-sync] BASE_CRM: última data=${maxDateIso}, último ID=${lastSeqId}, ${dataRowCount} linhas`);

  const missing = crmLeads
    .filter(lead => parseDate(lead.data) > maxDateIso)
    .sort((a, b) => {
      const da = parseDate(a.data) + (a.hora || '00:00');
      const db = parseDate(b.data) + (b.hora || '00:00');
      return da.localeCompare(db);
    });

  if (missing.length === 0) {
    console.log('[crm-sync] BASE_CRM já está atualizado — nenhum lead faltante');
    return;
  }
  const nextRow = dataRowCount + 2;
  const endRow  = nextRow + missing.length - 1;
  await sheetsPut(token, CRM_SHEET_ID, `BASE_CRM!A${nextRow}:T${endRow}`, missing.map((l, i) => leadToBaseCrmRow(l, lastSeqId + i + 1)));
  console.log(`[crm-sync] ${missing.length} leads adicionados ao BASE_CRM (linhas ${nextRow}–${endRow})`);
}

// ── Main sync function ──────────────────────────────────────────
export async function runSync(existingLeads = []) {
  console.log('[crm-sync] Iniciando sincronização inline...');
  const token = await getGoogleToken();

  // 1. Read source sheets
  const lfData    = await sheetsRaw(token, `/v4/spreadsheets/${LEADS_SHEET_ID}/values/${encodeURIComponent('Leads Franquia!A:O')}`, 'GET', null);
  const [, ...lfRows] = lfData.values || [];

  const crmData    = await sheetsRaw(token, `/v4/spreadsheets/${CRM_SHEET_ID}/values/${encodeURIComponent('BASE_CRM!A:T')}`, 'GET', null);
  const [, ...crmDataRows] = crmData.values || [];

  // 2. Build enrichment maps from BASE_CRM
  const enrichByEmailDate = {};
  const enrichByEmail     = {};
  for (const row of crmDataRows) {
    const email = (row[4] || '').toLowerCase().trim();
    const data  = (row[1] || '').trim();
    if (!email) continue;
    const entry = {
      estagio: row[14] || '', conjunto: row[12] || '', criativo: row[13] || '',
      statusPipeline: row[16] || '', motivoPerda: row[17] || '', valor: row[18] || '',
    };
    const key = `${email}__${data}`;
    if (!enrichByEmailDate[key]) enrichByEmailDate[key] = [];
    enrichByEmailDate[key].push(entry);
    if (!enrichByEmail[email]) enrichByEmail[email] = [];
    enrichByEmail[email].push(entry);
  }

  // 3. Filter
  const filteredRows = lfRows.filter(row => {
    const nome = row[2] || '', email = row[3] || '';
    return email && !isExcluded(nome, email);
  });
  console.log(`[crm-sync] ${lfRows.length} leads lidos → ${filteredRows.length} após filtros`);

  // 4. History (all leads)
  const historyLeads = filteredRows.map(row => ({
    data: row[0]||'', hora: row[1]||'', nome: row[2]||'', email: row[3]||'',
    celular: row[4]||'', cidade: row[5]||'', estado: row[6]||'',
    disponibilidade: row[7]||'', mqStatus: row[8]||'', page: row[9]||'',
    source: row[10]||'', medium: row[11]||'', campaign: row[12]||'',
    content: row[13]||'', term: row[14]||'',
  }));

  // 5. Assign IDs
  const emailOrder = [], seenEmails = new Set();
  for (const row of filteredRows) {
    const email = (row[3] || '').toLowerCase().trim();
    if (email && !seenEmails.has(email)) { seenEmails.add(email); emailOrder.push(email); }
  }
  const emailToId = {};
  emailOrder.forEach((email, i) => { emailToId[email] = 'L' + String(i + 1).padStart(4, '0'); });

  // 6. Build existing leads map (for stageHistory preservation)
  const existingByRowId = {};
  for (const lead of existingLeads) {
    if (lead.rowId) existingByRowId[lead.rowId] = lead;
  }

  // 7. Build CRM leads (≥ 01/02/2026)
  const conversionCount = {}, rowIdCounter = {}, crmLeads = [];
  for (const row of filteredRows) {
    const data = (row[0] || '').trim();
    if (!isFromFeb2026(data)) continue;
    const email = (row[3] || '').toLowerCase().trim();
    conversionCount[email] = (conversionCount[email] || 0) + 1;
    const rdKey = `${email}_${data}`;
    rowIdCounter[rdKey] = (rowIdCounter[rdKey] || 0) + 1;
    const rowId = `${email.replace(/[^a-z0-9]/g, '')}_${data.replace(/\//g, '')}_${rowIdCounter[rdKey]}`;
    const page = (row[9] || '').trim();
    const { foco, canal } = classifyPage(page);
    const enrichKey = `${email}__${data}`;
    const enrichArr = enrichByEmailDate[enrichKey] || enrichByEmail[email] || [];
    const enrich = enrichArr.reduce((best, e) => {
      const s = (e.estagio?1:0)+(e.statusPipeline?1:0)+(e.motivoPerda?1:0)+(e.valor?1:0);
      const b = (best.estagio?1:0)+(best.statusPipeline?1:0)+(best.motivoPerda?1:0)+(best.valor?1:0);
      return s > b ? e : best;
    }, {});

    const initialEstagio = normalizeEstagio(row[8]||'', enrich.estagio||'');
    const existing = existingByRowId[rowId];

    crmLeads.push({
      rowId, leadId: emailToId[email]||'', conversionNum: conversionCount[email],
      data, hora: (row[1]||'').trim(), nome: (row[2]||'').trim(),
      email: row[3]||'', celular: row[4]||'', cidade: row[5]||'', estado: row[6]||'',
      disponibilidade: row[7]||'', mqStatus: row[8]||'', page,
      source: row[10]||'', campaign: row[12]||'',
      conjunto: enrich.conjunto||'', criativo: enrich.criativo||'',
      focoCaptacao: foco, canalTipo: canal,
      estagio: initialEstagio,
      statusPipeline: enrich.statusPipeline||'', motivoPerda: enrich.motivoPerda||'', valor: enrich.valor||'',
      stageHistory: (existing?.stageHistory?.length > 0)
        ? existing.stageHistory
        : [{ stage: initialEstagio, at: data, by: 'sync', note: 'criado' }],
      _preEvolve: initialEstagio,
    });
  }

  // 8. Auto-evolve
  autoEvolve(crmLeads);

  // Record transitions
  const nowStr = new Date().toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  for (const lead of crmLeads) {
    if (lead.estagio !== lead._preEvolve) {
      const last = lead.stageHistory[lead.stageHistory.length - 1];
      if (!last || last.stage !== lead.estagio) {
        lead.stageHistory.push({ stage: lead.estagio, from: lead._preEvolve, at: nowStr, by: 'sync', note: 'auto-evolve' });
      }
    }
    delete lead._preEvolve;
  }

  const sc = {};
  crmLeads.forEach(l => { sc[l.estagio] = (sc[l.estagio]||0)+1; });
  console.log(`[crm-sync] ${historyLeads.length} histórico, ${crmLeads.length} CRM | Estágios:`, JSON.stringify(sc));

  // 9. Write CRM_PAINEL (A:X — 24 cols including stageHistory)
  await ensureTab(token, CRM_SHEET_ID, CRM_PAINEL_TAB);
  await sheetsClear(token, CRM_SHEET_ID, `${CRM_PAINEL_TAB}!A:X`);
  await sheetsPut(token, CRM_SHEET_ID, `${CRM_PAINEL_TAB}!A1`, [CRM_HEADERS, ...crmLeads.map(rowToArray)]);
  console.log(`[crm-sync] ${crmLeads.length} linhas escritas em "${CRM_PAINEL_TAB}"`);

  // 10. Append missing to BASE_CRM
  await appendMissingToBaseCrm(token, crmLeads, crmDataRows);

  const store = {
    lastSync: new Date().toISOString(),
    crm: {
      totalLeads: crmLeads.length,
      uniqueLeads: new Set(crmLeads.map(l => l.email.toLowerCase())).size,
      leads: crmLeads,
    },
    history: { totalLeads: historyLeads.length, leads: historyLeads },
  };

  console.log('[crm-sync] Sincronização concluída!');
  return store;
}
