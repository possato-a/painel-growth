import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getActiveToken } from './token-manager.js';
import { sheetsGet, sheetsUpdate } from './google-sheets.js';
import { runSync } from './crm-sync.js';

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

export default app;
