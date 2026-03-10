import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { getActiveToken } from './token-manager.js';

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

export default app;
