import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { getActiveToken } from './token-manager.js';
import { sheetsGet, sheetsUpdate } from './google-sheets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CRM_STORE  = path.join(__dirname, 'crm-data.json');
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
  'statusPipeline','motivoPerda','valor',
];

function parseCrmSheet(values) {
  if (!values || values.length < 2) return [];
  const [header, ...rows] = values;
  return rows.map(row => {
    const obj = {};
    CRM_HEADERS.forEach((k, i) => { obj[k] = row[i] ?? ''; });
    obj.conversionNum = parseInt(obj.conversionNum, 10) || 1;
    return obj;
  });
}

async function loadCrmLeads() {
  const now = Date.now();
  if (crmCache && now - crmCacheAt < CRM_CACHE_TTL) return crmCache;

  // Try local JSON first (fastest)
  try {
    const raw   = fs.readFileSync(CRM_STORE, 'utf8');
    const store = JSON.parse(raw);
    // New format: { lastSync, crm: {...}, history: {...} }
    // Legacy format: { lastSync, leads: [...] } — migrate on the fly
    const data = store.crm
      ? { lastSync: store.lastSync, ...store.crm }
      : { lastSync: store.lastSync, leads: store.leads, totalLeads: store.leads?.length, uniqueLeads: store.uniqueLeads };
    crmCache   = data;
    crmCacheAt = now;
    return data;
  } catch {}

  // Fall back to Google Sheets
  const resp  = await sheetsGet(CRM_SHEET_ID, `${CRM_PAINEL_TAB}!A:W`);
  const leads = parseCrmSheet(resp.values);
  crmCache   = { lastSync: null, leads, totalLeads: leads.length, uniqueLeads: new Set(leads.map(l => l.leadId)).size };
  crmCacheAt = now;
  return crmCache;
}

async function patchCrmRowInSheet(rowId, fields) {
  // Find the row in the sheet by scanning column A
  const resp = await sheetsGet(CRM_SHEET_ID, `${CRM_PAINEL_TAB}!A:A`);
  const col  = resp.values || [];
  const rowIndex = col.findIndex(r => r[0] === rowId);
  if (rowIndex < 1) return; // 0 = header, not found

  const sheetRow = rowIndex + 1; // 1-indexed
  // S=statusPipeline, T=motivoPerda, U=valor  (cols 19,20,21 = S,T,U)
  const range  = `${CRM_PAINEL_TAB}!T${sheetRow}:W${sheetRow}`;
  const values = [[fields.estagio ?? '', fields.statusPipeline ?? '', fields.motivoPerda ?? '', fields.valor ?? '']];
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
    let history = null;
    try {
      const raw   = fs.readFileSync(CRM_STORE, 'utf8');
      const store = JSON.parse(raw);
      history = store.history || null;
    } catch {}

    if (!history) {
      return res.status(503).json({ error: 'Histórico não disponível. Execute crm-sync primeiro.' });
    }
    res.json({ lastSync: null, ...history });
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
    // Update local JSON
    let store;
    try {
      store = JSON.parse(fs.readFileSync(CRM_STORE, 'utf8'));
    } catch {
      return res.status(503).json({ error: 'CRM store not found. Run crm-sync first.' });
    }

    const leads = store.crm ? store.crm.leads : store.leads;
    const lead = leads.find(l => l.rowId === rowId);
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

    fs.writeFileSync(CRM_STORE, JSON.stringify(store, null, 2));

    // Invalidate cache
    crmCache   = null;
    crmCacheAt = 0;

    // Update Google Sheets (fire and forget, don't block response)
    patchCrmRowInSheet(rowId, { estagio, statusPipeline, motivoPerda, valor }).catch(e =>
      console.error('[crm] Sheets patch error:', e.message)
    );

    res.json({ ok: true, lead });
  } catch (err) {
    console.error('[crm] PATCH error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/crm/sync — trigger manual sync (local only)
app.post('/api/crm/sync', (req, res) => {
  const syncScript = path.join(__dirname, '..', '..', 'scripts', 'crm-sync.js');
  if (!fs.existsSync(syncScript)) {
    return res.status(404).json({ error: 'Sync script not found' });
  }

  execFile('node', [syncScript], { cwd: path.dirname(syncScript) }, (err, stdout, stderr) => {
    // Invalidate cache after sync
    crmCache   = null;
    crmCacheAt = 0;

    if (err) {
      console.error('[crm] Sync error:', stderr);
      return res.status(500).json({ error: stderr || err.message });
    }
    console.log('[crm] Sync output:', stdout);
    res.json({ ok: true, output: stdout });
  });
});

export default app;
