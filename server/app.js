import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getActiveToken } from './token-manager.js';
import { sheetsGet, sheetsUpdate } from './google-sheets.js';
import { runSync } from './crm-sync.js';
import { gadsQuery, gadsQueryAll, listClientIds, CUSTOMER_ID as GADS_CUSTOMER_ID } from './google-ads.js';
import { readLeadsBeHonest } from './leads-be-honest.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// On Vercel the deployed FS is read-only; use /tmp for writes.
// Reads fall back from /tmp → deployed file.
const CRM_STORE_WRITE = '/tmp/crm-data.json';
const CRM_STORE_READ  = path.join(__dirname, 'crm-data.json');

const CRM_SHEET_ID   = '1yK70fNR8dYbehKPLSOEv3SPSPZKp01PNgMZa11M_TKQ';
const CRM_PAINEL_TAB = 'CRM_PAINEL';

// In-memory cache for CRM data (TTL: 5 min)
let crmCache = null;
let crmCacheAt = 0;
const CRM_CACHE_TTL = 5 * 60 * 1000;

const app = express();
const ACCOUNT_ID = process.env.META_ACCOUNT_ID;
const META_BASE = 'https://graph.facebook.com/v19.0';

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://painel-growth.vercel.app',
    /\.vercel\.app$/,
  ],
}));
app.use(express.json());

function metaUrl(path) {
  return `${META_BASE}${path}`;
}

function tokenParam() {
  return { access_token: getActiveToken() };
}

// Builds the date portion for account-level insight requests
function accountDateParams(req) {
  const { date_preset, since, until } = req.query;
  if (since && until) {
    return { time_range: JSON.stringify({ since, until }) };
  }
  return { date_preset: date_preset || 'last_30d' };
}

// Builds the inline insights field for campaign/adset/ad requests
function insightsField(req, fields) {
  const { date_preset, since, until } = req.query;
  if (since && until) {
    return `insights.time_range({"since":"${since}","until":"${until}"}){${fields}}`;
  }
  return `insights.date_preset(${date_preset || 'last_30d'}){${fields}}`;
}

const INSIGHT_FIELDS = 'impressions,clicks,spend,reach,cpm,cpc,ctr';

// GET /api/gads/ping — health check
app.get('/api/gads/ping', async (req, res) => {
  try {
    const { getGoogleToken } = await import('./google-sheets.js');
    const { resetClients } = await import('./google-ads.js');

    const token = await getGoogleToken();
    const ti = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);

    resetClients();
    const clientIds = await listClientIds();

    res.json({
      ok: true,
      email:     ti.data.email,
      scopes:    ti.data.scope,
      mccId:     GADS_CUSTOMER_ID,
      clientIds,
    });
  } catch (err) {
    console.error('[gads/ping]', err.response?.data ?? err.message);
    res.status(500).json({ error: err.response?.data ?? err.message });
  }
});

// GET /api/meta/overview
app.get('/api/meta/overview', async (req, res) => {
  try {
    const { data } = await axios.get(metaUrl(`/${ACCOUNT_ID}/insights`), {
      params: {
        ...tokenParam(),
        ...accountDateParams(req),
        time_increment: 1,
        fields: 'impressions,clicks,spend,reach,cpm,cpc,ctr,date_start,date_stop',
        limit: 90,
      },
    });
    res.json(data);
  } catch (err) {
    const error = err.response?.data || err.message;
    console.error('[overview error]', error);
    res.status(err.response?.status || 500).json({ error });
  }
});

// GET /api/meta/campaigns
app.get('/api/meta/campaigns', async (req, res) => {
  try {
    const { data } = await axios.get(metaUrl(`/${ACCOUNT_ID}/campaigns`), {
      params: {
        ...tokenParam(),
        fields: `id,name,status,effective_status,objective,${insightsField(req, INSIGHT_FIELDS)}`,
        limit: 100,
      },
    });
    res.json(data);
  } catch (err) {
    const error = err.response?.data || err.message;
    console.error('[campaigns error]', error);
    res.status(err.response?.status || 500).json({ error });
  }
});

// GET /api/meta/campaigns/:id/adsets
app.get('/api/meta/campaigns/:id/adsets', async (req, res) => {
  const { id } = req.params;
  try {
    const { data } = await axios.get(metaUrl(`/${id}/adsets`), {
      params: {
        ...tokenParam(),
        fields: `id,name,campaign_id,status,effective_status,${insightsField(req, INSIGHT_FIELDS)}`,
        limit: 100,
      },
    });
    res.json(data);
  } catch (err) {
    const error = err.response?.data || err.message;
    console.error('[adsets error]', error);
    res.status(err.response?.status || 500).json({ error });
  }
});

// GET /api/meta/adsets/:id/ads
app.get('/api/meta/adsets/:id/ads', async (req, res) => {
  const { id } = req.params;
  try {
    const { data } = await axios.get(metaUrl(`/${id}/ads`), {
      params: {
        ...tokenParam(),
        fields: `id,name,adset_id,campaign_id,status,effective_status,creative{id,name,title,body,thumbnail_url},${insightsField(req, INSIGHT_FIELDS)}`,
        limit: 100,
      },
    });
    res.json(data);
  } catch (err) {
    const error = err.response?.data || err.message;
    console.error('[ads error]', error);
    res.status(err.response?.status || 500).json({ error });
  }
});

// GET /api/meta/adsets-all
app.get('/api/meta/adsets-all', async (req, res) => {
  try {
    const { data } = await axios.get(metaUrl(`/${ACCOUNT_ID}/adsets`), {
      params: {
        ...tokenParam(),
        fields: `id,name,campaign_id,status,effective_status,${insightsField(req, INSIGHT_FIELDS)}`,
        limit: 200,
      },
    });
    res.json(data);
  } catch (err) {
    const error = err.response?.data || err.message;
    console.error('[adsets-all error]', error);
    res.status(err.response?.status || 500).json({ error });
  }
});

// GET /api/meta/ads
app.get('/api/meta/ads', async (req, res) => {
  try {
    const { data } = await axios.get(metaUrl(`/${ACCOUNT_ID}/ads`), {
      params: {
        ...tokenParam(),
        fields: `id,name,status,effective_status,adset_id,campaign_id,creative{id,name,thumbnail_url},${insightsField(req, INSIGHT_FIELDS)}`,
        limit: 200,
      },
    });
    res.json(data);
  } catch (err) {
    const error = err.response?.data || err.message;
    console.error('[ads-all error]', error);
    res.status(err.response?.status || 500).json({ error });
  }
});

// ── Google Ads helpers ─────────────────────────────────────────────────────

/** Convert Meta-style date_preset / since+until into a GAQL WHERE date clause */
function gadsDateClause(req) {
  const { date_preset, since, until } = req.query;
  const MAP = {
    'last_7d':    'LAST_7_DAYS',
    'last_14d':   'LAST_14_DAYS',
    'last_30d':   'LAST_30_DAYS',
    'today':      'TODAY',
    'this_month': 'THIS_MONTH',
    'last_month': 'LAST_MONTH',
  };
  if (since && until) return `segments.date BETWEEN '${since}' AND '${until}'`;
  return `segments.date DURING ${MAP[date_preset] || 'LAST_30_DAYS'}`;
}

/** Normalize Google Ads metrics (micros → BRL, decimal CTR → %, etc.) */
function normMetrics(m = {}) {
  const cost = Number(m.costMicros || 0) / 1_000_000;
  const imp  = Number(m.impressions || 0);
  const clk  = Number(m.clicks || 0);
  const conv = Number(m.conversions || 0);
  // Use API-provided averages when available; fall back to computed values
  const ctr  = m.ctr               != null ? Number(m.ctr) * 100              : (imp > 0 ? clk / imp * 100 : 0);
  const cpm  = m.averageCpm        != null ? Number(m.averageCpm) / 1_000_000 : (imp > 0 ? cost / imp * 1000 : 0);
  const cpc  = m.averageCpc        != null ? Number(m.averageCpc) / 1_000_000 : (clk > 0 ? cost / clk : 0);
  const cpcv = m.costPerConversion != null ? Number(m.costPerConversion) / 1_000_000 : (conv > 0 ? cost / conv : 0);
  const cvr  = m.conversionRate    != null ? Number(m.conversionRate) * 100    : (clk > 0 ? conv / clk * 100 : 0);
  return {
    spend:             cost.toFixed(2),
    impressions:       String(imp),
    clicks:            String(clk),
    ctr:               ctr.toFixed(4),
    cpm:               cpm.toFixed(2),
    cpc:               cpc.toFixed(2),
    conversions:       conv.toFixed(2),
    costPerConversion: cpcv.toFixed(2),
    conversionRate:    cvr.toFixed(4),
  };
}

// GET /api/gads/overview — daily account-level metrics (all client accounts)
app.get('/api/gads/overview', async (req, res) => {
  try {
    const dateClause = gadsDateClause(req);
    const rows = await gadsQueryAll(`
      SELECT
        segments.date,
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions
      FROM campaign
      WHERE ${dateClause}
      ORDER BY segments.date ASC
    `);

    // Group by date, aggregate across all campaigns and clients
    const byDate = {};
    for (const row of rows) {
      const d = row.segments?.date;
      if (!d) continue;
      if (!byDate[d]) byDate[d] = { costMicros: 0, impressions: 0, clicks: 0, conversions: 0 };
      byDate[d].costMicros   += Number(row.metrics?.costMicros   || 0);
      byDate[d].impressions  += Number(row.metrics?.impressions  || 0);
      byDate[d].clicks       += Number(row.metrics?.clicks       || 0);
      byDate[d].conversions  += Number(row.metrics?.conversions  || 0);
    }

    const data = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, m]) => ({ date_start: date, ...normMetrics(m) }));

    res.json({ data });
  } catch (err) {
    const error = err.response?.data || err.message;
    console.error('[gads/overview]', error);
    res.status(err.response?.status || 500).json({ error });
  }
});

// GET /api/gads/campaigns — all campaigns across all client accounts
app.get('/api/gads/campaigns', async (req, res) => {
  try {
    const dateClause = gadsDateClause(req);
    const rows = await gadsQueryAll(`
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpm,
        metrics.average_cpc,
        metrics.conversions,
        metrics.cost_per_conversion
      FROM campaign
      WHERE ${dateClause}
      ORDER BY metrics.cost_micros DESC
    `);

    // Use composite ID "{clientId}:{campaignId}" so adgroups endpoint knows which client to query
    const data = rows.map((r) => ({
      id:          `${r._cid}:${r.campaign?.id || ''}`,
      name:        r.campaign?.name        || '',
      status:      r.campaign?.status      || 'UNKNOWN',
      channelType: r.campaign?.advertisingChannelType || '',
      metrics:     normMetrics(r.metrics),
    }));

    // Sort by spend descending (already sorted per-client, now merge-sort)
    data.sort((a, b) => Number(b.metrics.spend) - Number(a.metrics.spend));

    res.json({ data });
  } catch (err) {
    const error = err.response?.data || err.message;
    console.error('[gads/campaigns]', error);
    res.status(err.response?.status || 500).json({ error });
  }
});

// GET /api/gads/campaigns/:id/adgroups — ad groups for a campaign
// :id is a composite "{clientId}:{campaignId}" from the campaigns endpoint
app.get('/api/gads/campaigns/:id/adgroups', async (req, res) => {
  const raw = req.params.id;
  const [clientId, campaignId] = raw.includes(':') ? raw.split(':') : [null, raw];
  try {
    const dateClause = gadsDateClause(req);
    const rows = await gadsQuery(`
      SELECT
        ad_group.id,
        ad_group.name,
        ad_group.status,
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpm,
        metrics.average_cpc,
        metrics.conversions,
        metrics.cost_per_conversion
      FROM ad_group
      WHERE campaign.id = '${campaignId}'
      AND ${dateClause}
      ORDER BY metrics.cost_micros DESC
    `, clientId);

    const data = rows.map((r) => ({
      id:      `${clientId}:${r.adGroup?.id || ''}`,
      name:    r.adGroup?.name   || '',
      status:  r.adGroup?.status || 'UNKNOWN',
      metrics: normMetrics(r.metrics),
    }));

    res.json({ data });
  } catch (err) {
    const error = err.response?.data || err.message;
    console.error('[gads/adgroups]', error);
    res.status(err.response?.status || 500).json({ error });
  }
});

// GET /api/gads/adgroups/:id/ads — ads for an ad group
// :id is a composite "{clientId}:{adGroupId}" from the adgroups endpoint
app.get('/api/gads/adgroups/:id/ads', async (req, res) => {
  const raw = req.params.id;
  const [clientId, adGroupId] = raw.includes(':') ? raw.split(':') : [null, raw];
  try {
    const dateClause = gadsDateClause(req);
    const rows = await gadsQuery(`
      SELECT
        ad_group_ad.ad.id,
        ad_group_ad.ad.name,
        ad_group_ad.ad.type,
        ad_group_ad.status,
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.conversions
      FROM ad_group_ad
      WHERE ad_group.id = '${adGroupId}'
      AND ${dateClause}
      ORDER BY metrics.cost_micros DESC
    `, clientId);

    const data = rows.map((r) => {
      const m = normMetrics(r.metrics);
      return {
        id:     r.adGroupAd?.ad?.id   || '',
        name:   r.adGroupAd?.ad?.name || '',
        type:   r.adGroupAd?.ad?.type || '',
        status: r.adGroupAd?.status   || 'UNKNOWN',
        metrics: {
          spend:       m.spend,
          impressions: m.impressions,
          clicks:      m.clicks,
          ctr:         m.ctr,
          cpc:         m.cpc,
          conversions: m.conversions,
        },
      };
    });

    res.json({ data });
  } catch (err) {
    const error = err.response?.data || err.message;
    console.error('[gads/ads]', error);
    res.status(err.response?.status || 500).json({ error });
  }
});

// ── CRM helpers ───────────────────────────────────────────────
const CRM_HEADERS = [
  'rowId','leadId','conversionNum','data','hora',
  'nome','email','celular','cidade','estado',
  'disponibilidade','mqStatus','page','source','campaign',
  'conjunto','criativo','focoCaptacao','canalTipo','estagio',
  'statusPipeline','motivoPerda','valor','stageHistory',
];

function parseCrmSheet(values) {
  if (!values || values.length < 2) return [];
  const [, ...rows] = values;
  return rows.map(row => {
    const obj = {};
    CRM_HEADERS.forEach((k, i) => { obj[k] = row[i] ?? ''; });
    obj.conversionNum = parseInt(obj.conversionNum, 10) || 1;
    try { obj.stageHistory = JSON.parse(obj.stageHistory || '[]'); } catch { obj.stageHistory = []; }
    return obj;
  });
}

// Write history to /tmp so the history endpoint works after sync
function writeHistory(store) {
  try {
    fs.writeFileSync(CRM_STORE_WRITE, JSON.stringify({
      lastSync: store.lastSync,
      history:  store.history,
    }));
  } catch {}
}

// Read history from /tmp → committed file
function readHistory() {
  for (const p of [CRM_STORE_WRITE, CRM_STORE_READ]) {
    try {
      const s = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (s.history) return s;
    } catch {}
  }
  return null;
}

// CRM leads: Google Sheets (primary) → local file fallback
async function loadCrmLeads() {
  const now = Date.now();
  if (crmCache && now - crmCacheAt < CRM_CACHE_TTL) return crmCache;

  // 1. Try Google Sheets (persistent across Vercel containers)
  try {
    const resp = await sheetsGet(CRM_SHEET_ID, `${CRM_PAINEL_TAB}!A:X`);
    if (resp.values && resp.values.length > 1) {
      const leads = parseCrmSheet(resp.values);
      crmCache = {
        lastSync:    crmCache?.lastSync ?? null,
        leads,
        totalLeads:  leads.length,
        uniqueLeads: new Set(leads.map(l => l.leadId)).size,
      };
      crmCacheAt = now;
      return crmCache;
    }
  } catch (e) {
    console.error('[crm] Sheets read failed, trying local fallback:', e.message);
  }

  // 2. Fallback: local files (/tmp → deployed crm-data.json)
  for (const p of [CRM_STORE_WRITE, CRM_STORE_READ]) {
    try {
      const store = JSON.parse(fs.readFileSync(p, 'utf8'));
      const src   = store.crm || store;
      const leads = src.leads || [];
      const data  = {
        lastSync:    store.lastSync ?? null,
        leads,
        totalLeads:  leads.length,
        uniqueLeads: store.uniqueLeads ?? new Set(leads.map(l => l.leadId)).size,
      };
      crmCache   = data;
      crmCacheAt = now;
      return data;
    } catch {}
  }

  throw new Error('Não foi possível carregar os leads. Verifique as credenciais do Google.');
}

async function patchCrmRowInSheet(rowId, fields, stageHistory) {
  const resp = await sheetsGet(CRM_SHEET_ID, `${CRM_PAINEL_TAB}!A:A`);
  const col  = resp.values || [];
  const rowIndex = col.findIndex(r => r[0] === rowId);
  if (rowIndex < 1) return;

  const sheetRow = rowIndex + 1;
  // T=estagio, U=statusPipeline, V=motivoPerda, W=valor, X=stageHistory
  const range  = `${CRM_PAINEL_TAB}!T${sheetRow}:X${sheetRow}`;
  const values = [[
    fields.estagio        ?? '',
    fields.statusPipeline ?? '',
    fields.motivoPerda    ?? '',
    fields.valor          ?? '',
    JSON.stringify(stageHistory || []),
  ]];
  await sheetsUpdate(CRM_SHEET_ID, range, values);
}

// GET /api/crm/leads
app.get('/api/crm/leads', async (req, res) => {
  try {
    const data = await loadCrmLeads();
    res.json(data);
  } catch (err) {
    console.error('[crm] GET error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/crm/history — full Leads Franquia history (all dates, original columns)
app.get('/api/crm/history', async (req, res) => {
  try {
    const store = readHistory();
    if (!store?.history) {
      return res.status(503).json({ error: 'Histórico não disponível. Execute crm-sync primeiro.' });
    }
    res.json({ lastSync: store.lastSync || null, ...store.history });
  } catch (err) {
    console.error('[crm] history error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/crm/leads/:rowId — update commercial fields
app.patch('/api/crm/leads/:rowId', async (req, res) => {
  const { rowId } = req.params;
  const { statusPipeline, motivoPerda, valor, estagio } = req.body;

  try {
    // Find lead in in-memory cache (avoids a round-trip to Sheets)
    const crmData = await loadCrmLeads();
    const lead = crmData.leads.find(l => l.rowId === rowId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    // Track stage changes in stageHistory
    if (estagio !== undefined && estagio !== lead.estagio) {
      const fromStage = lead.estagio;
      if (!Array.isArray(lead.stageHistory)) lead.stageHistory = [];
      const at = new Date().toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
      lead.stageHistory.push({ stage: estagio, from: fromStage, at, by: 'manual' });
      lead.estagio = estagio;
    } else if (estagio !== undefined) {
      lead.estagio = estagio;
    }
    if (statusPipeline !== undefined) lead.statusPipeline = statusPipeline;
    if (motivoPerda    !== undefined) lead.motivoPerda    = motivoPerda;
    if (valor          !== undefined) lead.valor          = valor;

    // Invalidate cache so next GET re-reads from Sheets with updated data
    crmCache   = null;
    crmCacheAt = 0;

    // Update Google Sheets — includes stageHistory in col X (fire and forget)
    patchCrmRowInSheet(
      rowId,
      { estagio, statusPipeline, motivoPerda, valor },
      lead.stageHistory
    ).catch(e => console.error('[crm] Sheets patch error:', e.message));

    res.json({ ok: true, lead });
  } catch (err) {
    console.error('[crm] PATCH error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/crm/sync — trigger manual sync (runs inline, works on Vercel)
app.post('/api/crm/sync', async (req, res) => {
  try {
    // Load existing leads from cache or Sheets to preserve stageHistory
    const existing = crmCache?.leads || (await loadCrmLeads()).leads || [];

    const store = await runSync(existing);

    // Write history to /tmp (history page reads from here or committed file)
    writeHistory(store);

    // Prime in-memory cache with fresh data — avoids extra Sheets read
    crmCache = {
      lastSync:    store.lastSync,
      leads:       store.crm.leads,
      totalLeads:  store.crm.totalLeads,
      uniqueLeads: store.crm.uniqueLeads,
    };
    crmCacheAt = Date.now();

    res.json({
      ok: true,
      totalLeads:  store.crm.totalLeads,
      uniqueLeads: store.crm.uniqueLeads,
      lastSync:    store.lastSync,
    });
  } catch (err) {
    console.error('[crm] Sync error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Conversões helpers ──────────────────────────────────────────
function parseDateDMY(ddmmyyyy) {
  const p = (ddmmyyyy || '').split('/');
  if (p.length !== 3) return '';
  return `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
}

function convPresetToRange(preset) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const pad = (n) => String(n).padStart(2, '0');
  switch (preset) {
    case 'today':      return { since: today, until: today };
    case 'last_7d':    { const d = new Date(now); d.setDate(d.getDate() - 7);  return { since: d.toISOString().split('T')[0], until: today }; }
    case 'last_14d':   { const d = new Date(now); d.setDate(d.getDate() - 14); return { since: d.toISOString().split('T')[0], until: today }; }
    case 'last_30d':   { const d = new Date(now); d.setDate(d.getDate() - 30); return { since: d.toISOString().split('T')[0], until: today }; }
    case 'this_month': return { since: `${now.getFullYear()}-${pad(now.getMonth()+1)}-01`, until: today };
    case 'last_month': {
      const y = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const m = now.getMonth() === 0 ? 12 : now.getMonth();
      const last = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      return { since: `${y}-${pad(m)}-01`, until: `${y}-${pad(m)}-${last}` };
    }
    default: { const d = new Date(now); d.setDate(d.getDate() - 30); return { since: d.toISOString().split('T')[0], until: today }; }
  }
}

function convPageLabel(page) {
  if (!page || page.startsWith('{')) return 'Forms Nativo';
  const p = page.toLowerCase();
  if (p.includes('simulador-financeiro'))  return 'Simulador Financeiro';
  if (p.includes('/comunidade'))           return 'Comunidade';
  if (p === '/')                           return 'Webinar';
  if (p.includes('operacao-behonest'))     return 'Operação Be Honest';
  if (p.includes('aulao-grupo'))           return 'Aulão Grupo';
  if (p.includes('google'))               return 'LP Google';
  if (p.includes('fazer-negocio') || p.includes('negocio-operador') || p.includes('negocio-escalavel') || p.includes('negocio-geol'))
    return 'LP Franquia';
  return page.replace(/https?:\/\/[^/]+/, '').replace(/\/$/, '') || page;
}

// Objectives that indicate a lead-generation campaign
const LEADS_OBJECTIVES = new Set(['OUTCOME_LEADS', 'LEAD_GENERATION']);

// GET /api/conversoes/debug — diagnostic: shows raw utm_campaign values from sheet
// vs Meta campaigns, to identify matching failures
app.get('/api/conversoes/debug', async (req, res) => {
  const { date_preset, since, until } = req.query;
  const { since: sinceDate, until: untilDate } = (since && until)
    ? { since, until }
    : convPresetToRange(date_preset || 'last_30d');

  try {
    // All Meta campaigns (ALL objectives — no filter) with their IDs, names, objectives
    const metaResp = await axios.get(metaUrl(`/${ACCOUNT_ID}/campaigns`), {
      params: { ...tokenParam(), fields: 'id,name,objective,effective_status', limit: 200 },
    });
    const allMetaCampaigns = (metaResp.data.data || []).map(c => ({
      id: c.id, name: c.name, objective: c.objective, status: c.effective_status,
      isLeadsCampaign: LEADS_OBJECTIVES.has(c.objective),
    }));

    // All leads from sheet in the period — show unique utm_campaign values
    const rawLeads = await readLeadsBeHonest(sinceDate, untilDate);
    const utmCounts = {};
    for (const l of rawLeads) {
      const v = l.campaign || '(vazio)';
      utmCounts[v] = (utmCounts[v] || 0) + 1;
    }
    const utmValues = Object.entries(utmCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([utm, count]) => {
        // utm is already deduped (deduplicateUtm runs inside readLeadsBeHonest)
        const mById   = allMetaCampaigns.find(c => c.id   === utm);
        const mByName = allMetaCampaigns.find(c => c.name.toLowerCase() === utm.toLowerCase());
        return { utm, count, matchedById: mById?.name || null, matchedByName: mByName?.name || null, matched: !!(mById || mByName) };
      });

    res.json({
      period: { since: sinceDate, until: untilDate },
      totalLeadsInSheet: rawLeads.length,
      utmValues,
      allMetaCampaigns,
    });
  } catch (err) {
    console.error('[conversoes/debug]', err.response?.data ?? err.message);
    res.status(500).json({ error: err.response?.data ?? err.message });
  }
});

// Strip query-string from a URL for normalised matching/display
function stripQS(url) {
  if (!url) return '';
  return url.split('?')[0].replace(/\/$/, '');
}

/**
 * Token-overlap score between two strings (used to disambiguate when multiple
 * campaigns share the same LP URL). Higher = better match.
 */
function tokenOverlap(a, b) {
  const tok = s => new Set(s.toLowerCase().split(/[\s[\]()\\-_,]+/).filter(Boolean));
  const tA = tok(a), tB = tok(b);
  let n = 0;
  for (const t of tA) if (tB.has(t)) n++;
  return n;
}

// GET /api/conversoes
// Data sources:
//   • Meta Ads API  — leads campaigns (objective filter), their spend/clicks,
//                     and LP URLs extracted from ad creatives
//   • Leads Be Honest sheet (source of truth) — read directly, NOT via CRM_PAINEL
// Matching:
//   • utm_campaign == Meta campaign ID  (exact)   OR
//   • utm_campaign == Meta campaign name (case-insensitive exact)
app.get('/api/conversoes', async (req, res) => {
  const { date_preset, since, until } = req.query;
  const { since: sinceDate, until: untilDate } = (since && until)
    ? { since, until }
    : convPresetToRange(date_preset || 'last_30d');

  try {
    // ── 1. Meta leads campaigns + insights ───────────────────────────────────
    const metaResp = await axios.get(metaUrl(`/${ACCOUNT_ID}/campaigns`), {
      params: {
        ...tokenParam(),
        fields: `id,name,objective,status,effective_status,${insightsField(req, INSIGHT_FIELDS)}`,
        limit: 200,
      },
    });

    const byId   = {};   // campaignId (string)   → meta campaign obj
    const byName = {};   // lc(campaign name)      → meta campaign obj
    for (const c of (metaResp.data.data || [])) {
      if (!LEADS_OBJECTIVES.has(c.objective)) continue;
      const ins = c.insights?.data?.[0] || {};
      const mc = {
        id:          c.id,
        name:        c.name,
        status:      c.effective_status,
        spend:       parseFloat(ins.spend       || 0),
        clicks:      parseInt(ins.clicks        || 0),
        impressions: parseInt(ins.impressions   || 0),
        ctr:         parseFloat(ins.ctr         || 0),
        cpc:         parseFloat(ins.cpc         || 0),
        cpm:         parseFloat(ins.cpm         || 0),
        lps:         [],   // filled in step 2
      };
      byId[c.id]                = mc;
      byName[c.name.toLowerCase()] = mc;
    }

    const leadsCampaignIds = new Set(Object.keys(byId));

    // ── 2. Get LP URLs per campaign directly from Meta ads creatives ──────────
    // Fetch all ads at account level; filter to leads campaigns; extract link_url.
    // We only care about the creative.link_url field (destination LP).
    const adsResp = await axios.get(metaUrl(`/${ACCOUNT_ID}/ads`), {
      params: {
        ...tokenParam(),
        fields: 'campaign_id,creative{link_url}',
        limit: 500,
      },
    });

    const campLpSet = {};  // campaignId → Set<normalised LP url>
    for (const ad of (adsResp.data.data || [])) {
      const campId = ad.campaign_id;
      if (!leadsCampaignIds.has(campId)) continue;
      const raw = ad.creative?.link_url || '';
      if (!raw) continue;
      // Exclude Facebook/Instagram own-property URLs (instant form confirmation, etc.)
      if (/facebook\.com|instagram\.com|fb\.me/i.test(raw)) continue;
      const normalised = stripQS(raw);
      if (!normalised) continue;
      if (!campLpSet[campId]) campLpSet[campId] = new Set();
      campLpSet[campId].add(normalised);
    }
    // Attach LP list to each campaign object
    for (const [campId, lpSet] of Object.entries(campLpSet)) {
      if (byId[campId]) byId[campId].lps = [...lpSet];
    }

    // ── 3. Read leads DIRECTLY from Leads Be Honest sheet ────────────────────
    const rawLeads = await readLeadsBeHonest(sinceDate, untilDate);

    // ── 4. Match each lead to a leads campaign ────────────────────────────────
    // Priority: (a) utm_campaign == campaign ID, (b) utm_campaign == campaign name
    // (c) lead.page (strip QS) matches a campaign's declared LP URL
    //
    // Build reverse map: normalised LP url → Set<campaignId>
    const lpToCamp = {};
    for (const [campId, lpSet] of Object.entries(campLpSet)) {
      for (const lp of lpSet) {
        if (!lpToCamp[lp]) lpToCamp[lp] = new Set();
        lpToCamp[lp].add(campId);
      }
    }

    const matchedLeads = [];
    for (const lead of rawLeads) {
      const utmVal = lead.campaign;
      let mc = byId[utmVal] || byName[(utmVal || '').toLowerCase()];

      // Fallback: match lead.page against Meta-declared LP URLs
      if (!mc) {
        const leadLp = stripQS(lead.page);
        if (leadLp) {
          const candidates = [...(lpToCamp[leadLp] || [])];
          if (candidates.length === 1) {
            mc = byId[candidates[0]];
          } else if (candidates.length > 1) {
            // Pick campaign whose name overlaps most with the UTM string
            let best = null, bestScore = -1;
            for (const cid of candidates) {
              const score = tokenOverlap(utmVal || '', byId[cid]?.name || '');
              if (score > bestScore) { bestScore = score; best = byId[cid]; }
            }
            mc = best;
          }
        }
      }

      if (!mc) continue;
      matchedLeads.push({ ...lead, _mc: mc });
    }

    // ── 5. Group matched leads by campaign ───────────────────────────────────
    const campMap = {};
    for (const lead of matchedLeads) {
      const id = lead._mc.id;
      if (!campMap[id]) {
        campMap[id] = {
          ...lead._mc,
          leads: 0,
          pagesFromLeads: new Set(),   // pages seen in matched leads
        };
      }
      campMap[id].leads++;
      const pg = stripQS(lead.page);
      if (pg) campMap[id].pagesFromLeads.add(pg);
    }

    const campList = Object.values(campMap).map(c => ({
      metaId:      c.id,
      metaName:    c.name,
      metaStatus:  c.status,
      spend:       c.spend,
      clicks:      c.clicks,
      impressions: c.impressions,
      ctr:         c.ctr,
      leads:       c.leads,
      // LPs: union of what Meta reports (from creatives) + what leads' page field says
      lps:         [...new Set([...c.lps, ...c.pagesFromLeads])],
      cpl:         c.spend > 0 && c.leads > 0 ? c.spend / c.leads : null,
      convRate:    c.clicks > 0 ? (c.leads / c.clicks) * 100 : null,
    })).sort((a, b) => b.leads - a.leads);

    // ── 6. Group by LP — only pages that received paid traffic ───────────────
    // The LP for a lead is stripQS(lead.page).
    // We augment: for campaigns that have Meta-declared LPs (from step 2) but
    // no leads yet, we still surface them in the page list with 0 leads and
    // the campaign's spend proportionally unallocated.
    const pageMap = {};

    // Seed with all Meta-declared LPs (so they appear even with 0 leads)
    for (const mc of Object.values(byId)) {
      for (const lp of mc.lps) {
        if (!pageMap[lp]) {
          pageMap[lp] = {
            page:      lp,
            label:     convPageLabel(lp),
            leads:     0,
            campaigns: new Set(),
            spend:     0,
            clicks:    0,
          };
        }
        pageMap[lp].campaigns.add(mc.id);
      }
    }

    // Count leads into page map
    for (const lead of matchedLeads) {
      const pKey = stripQS(lead.page) || '__sem_pagina__';
      if (!pageMap[pKey]) {
        pageMap[pKey] = {
          page:      pKey === '__sem_pagina__' ? '' : pKey,
          label:     convPageLabel(lead.page),
          leads:     0,
          campaigns: new Set(),
          spend:     0,
          clicks:    0,
        };
      }
      pageMap[pKey].leads++;
      pageMap[pKey].campaigns.add(lead._mc.id);
    }

    // ── 7. Allocate campaign spend/clicks to pages proportionally ────────────
    for (const camp of campList) {
      if (!camp.spend && !camp.clicks) continue;
      // Count leads per page for this campaign
      const pageCounts = {};
      let total = 0;
      for (const lead of matchedLeads) {
        if (lead._mc.id !== camp.metaId) continue;
        const pg = stripQS(lead.page) || '__sem_pagina__';
        pageCounts[pg] = (pageCounts[pg] || 0) + 1;
        total++;
      }
      if (!total) {
        // Campaign has no matched leads yet but has declared LPs → split evenly
        for (const lp of camp.lps) {
          const r = 1 / camp.lps.length;
          if (pageMap[lp]) {
            pageMap[lp].spend  += camp.spend  * r;
            pageMap[lp].clicks += camp.clicks * r;
          }
        }
        continue;
      }
      for (const [pKey, cnt] of Object.entries(pageCounts)) {
        const r = cnt / total;
        if (pageMap[pKey]) {
          pageMap[pKey].spend  += camp.spend  * r;
          pageMap[pKey].clicks += camp.clicks * r;
        }
      }
    }

    const pageList = Object.values(pageMap)
      .filter(p => p.page !== '__sem_pagina__' || p.leads > 0)
      .map(p => ({
        page:      p.page,
        label:     p.label,
        leads:     p.leads,
        campaigns: [...p.campaigns],
        spend:     p.spend,
        clicks:    p.clicks,
        cpl:       p.spend > 0 && p.leads > 0 ? p.spend / p.leads : null,
        convRate:  p.clicks > 0 ? (p.leads / p.clicks) * 100 : null,
      }))
      .sort((a, b) => b.leads - a.leads);

    // ── 8. Leads campaigns with no matched leads ──────────────────────────────
    const matchedIds = new Set(campList.map(c => c.metaId));
    const noLeads = Object.values(byId)
      .filter(mc => !matchedIds.has(mc.id))
      .map(mc => ({ id: mc.id, name: mc.name, status: mc.status, spend: mc.spend, clicks: mc.clicks, impressions: mc.impressions, ctr: mc.ctr, cpc: mc.cpc, cpm: mc.cpm, lps: mc.lps }));

    // ── 9. Totals ─────────────────────────────────────────────────────────────
    const totalLeads  = matchedLeads.length;
    const totalSpend  = campList.reduce((s, c) => s + c.spend, 0);
    const totalClicks = campList.reduce((s, c) => s + c.clicks, 0);

    res.json({
      period:      { since: sinceDate, until: untilDate },
      totals: {
        leads:    totalLeads,
        spend:    totalSpend,
        clicks:   totalClicks,
        cpl:      totalSpend > 0 && totalLeads > 0 ? totalSpend / totalLeads : null,
        convRate: totalClicks > 0 ? (totalLeads / totalClicks) * 100 : null,
      },
      byPage:      pageList,
      byCampaign:  campList,
      metaNoLeads: noLeads,
    });
  } catch (err) {
    console.error('[conversoes]', err.response?.data ?? err.message);
    res.status(err.response?.status || 500).json({ error: err.response?.data ?? err.message });
  }
});

export default app;
