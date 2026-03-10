import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initTokenManager, getActiveToken } from './token-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const ACCOUNT_ID = process.env.META_ACCOUNT_ID;
const META_BASE = 'https://graph.facebook.com/v19.0';

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

function metaUrl(path) {
  return `${META_BASE}${path}`;
}

function tokenParam() {
  return { access_token: getActiveToken() };
}

// Initialize token manager before starting server
initTokenManager(
  process.env.META_ACCESS_TOKEN,
  process.env.META_APP_ID,
  process.env.META_APP_SECRET
).then(() => {
  app.listen(PORT, () => {
    console.log(`[server] Meta Ads proxy rodando em http://localhost:${PORT}`);
    console.log(`[server] Conta: ${ACCOUNT_ID}`);
  });
}).catch((err) => {
  console.error('[server] Erro ao inicializar token manager:', err);
  process.exit(1);
});

// GET /api/meta/overview?date_preset=last_30d
app.get('/api/meta/overview', async (req, res) => {
  const date_preset = req.query.date_preset || 'last_30d';
  try {
    const { data } = await axios.get(metaUrl(`/${ACCOUNT_ID}/insights`), {
      params: {
        ...tokenParam(),
        date_preset,
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

// GET /api/meta/campaigns?date_preset=last_30d
app.get('/api/meta/campaigns', async (req, res) => {
  const date_preset = req.query.date_preset || 'last_30d';
  try {
    const { data } = await axios.get(metaUrl(`/${ACCOUNT_ID}/campaigns`), {
      params: {
        ...tokenParam(),
        fields: `id,name,status,effective_status,objective,insights.date_preset(${date_preset}){impressions,clicks,spend,reach,cpm,cpc,ctr}`,
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

// GET /api/meta/campaigns/:id/adsets?date_preset=last_30d
app.get('/api/meta/campaigns/:id/adsets', async (req, res) => {
  const { id } = req.params;
  const date_preset = req.query.date_preset || 'last_30d';
  try {
    const { data } = await axios.get(metaUrl(`/${id}/adsets`), {
      params: {
        ...tokenParam(),
        fields: `id,name,campaign_id,status,effective_status,insights.date_preset(${date_preset}){impressions,clicks,spend,reach,cpm,cpc,ctr}`,
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

// GET /api/meta/adsets/:id/ads?date_preset=last_30d
app.get('/api/meta/adsets/:id/ads', async (req, res) => {
  const { id } = req.params;
  const date_preset = req.query.date_preset || 'last_30d';
  try {
    const { data } = await axios.get(metaUrl(`/${id}/ads`), {
      params: {
        ...tokenParam(),
        fields: `id,name,adset_id,campaign_id,status,effective_status,creative{id,name,title,body,thumbnail_url},insights.date_preset(${date_preset}){impressions,clicks,spend,reach,cpm,cpc,ctr}`,
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

// GET /api/meta/adsets-all?date_preset=last_30d
app.get('/api/meta/adsets-all', async (req, res) => {
  const date_preset = req.query.date_preset || 'last_30d';
  try {
    const { data } = await axios.get(metaUrl(`/${ACCOUNT_ID}/adsets`), {
      params: {
        ...tokenParam(),
        fields: `id,name,campaign_id,status,effective_status,insights.date_preset(${date_preset}){impressions,clicks,spend,reach,cpm,cpc,ctr}`,
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

// GET /api/meta/ads?date_preset=last_30d
app.get('/api/meta/ads', async (req, res) => {
  const date_preset = req.query.date_preset || 'last_30d';
  try {
    const { data } = await axios.get(metaUrl(`/${ACCOUNT_ID}/ads`), {
      params: {
        ...tokenParam(),
        fields: `id,name,status,effective_status,adset_id,campaign_id,creative{id,name,thumbnail_url},insights.date_preset(${date_preset}){impressions,clicks,spend,reach,cpm,cpc,ctr}`,
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
