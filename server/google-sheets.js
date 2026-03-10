/**
 * Minimal Google Sheets helper for the Express server (ESM).
 * Uses the Google OAuth token from the scripts store (local) or
 * GOOGLE_REFRESH_TOKEN env var (Vercel).
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TOKEN_STORE = path.join(__dirname, '..', '..', 'scripts', 'google-token-store.json');
const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID     || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const FIVE_MIN_MS   = 5 * 60 * 1000;

function loadStore() {
  if (process.env.GOOGLE_ACCESS_TOKEN) {
    return {
      access_token:  process.env.GOOGLE_ACCESS_TOKEN,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      expires_at:    Date.now() - 1, // force refresh if env var is static
    };
  }
  try {
    return JSON.parse(fs.readFileSync(TOKEN_STORE, 'utf8'));
  } catch {
    throw new Error('[google-sheets] Token store não encontrado e GOOGLE_ACCESS_TOKEN não definido.');
  }
}

function saveStore(data) {
  if (!process.env.GOOGLE_ACCESS_TOKEN) {
    try { fs.writeFileSync(TOKEN_STORE, JSON.stringify(data, null, 2)); } catch {}
  }
}

function refreshToken(refreshToken) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }).toString();

    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const json = JSON.parse(d);
        if (json.access_token) resolve(json);
        else reject(new Error(JSON.stringify(json)));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

export async function getGoogleToken() {
  const store = loadStore();
  const now   = Date.now();
  if (!store.expires_at || store.expires_at - now < FIVE_MIN_MS) {
    const result  = await refreshToken(store.refresh_token);
    const updated = { access_token: result.access_token, refresh_token: store.refresh_token, expires_at: now + result.expires_in * 1000 };
    saveStore(updated);
    return updated.access_token;
  }
  return store.access_token;
}

function sheetsRequest(token, path_, method, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'sheets.googleapis.com',
      path: path_,
      method,
      headers: {
        Authorization: 'Bearer ' + token,
        ...(bodyStr ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve({}); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

export async function sheetsGet(sheetId, range) {
  const token = await getGoogleToken();
  return sheetsRequest(token, `/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}`, 'GET', null);
}

export async function sheetsUpdate(sheetId, range, values) {
  const token = await getGoogleToken();
  return sheetsRequest(
    token,
    `/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    'PUT',
    { values, majorDimension: 'ROWS' }
  );
}
