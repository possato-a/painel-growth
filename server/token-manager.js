import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORE_PATH = join(__dirname, 'token-store.json');
const META_BASE = 'https://graph.facebook.com/v19.0';
const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24h

function loadStore() {
  if (!existsSync(STORE_PATH)) return null;
  try {
    return JSON.parse(readFileSync(STORE_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function saveStore(data) {
  writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

async function exchangeToken(token, appId, appSecret) {
  const { data } = await axios.get(`${META_BASE}/oauth/access_token`, {
    params: {
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: token,
    },
  });
  return data; // { access_token, token_type, expires_in }
}

// Singleton: current active token
let activeToken = null;

export function getActiveToken() {
  return activeToken;
}

export async function initTokenManager(envToken, appId, appSecret) {
  const store = loadStore();
  const now = Date.now();

  const needsRefresh =
    !store ||
    !store.access_token ||
    !store.expires_at ||
    store.expires_at - now < TEN_DAYS_MS;

  if (needsRefresh) {
    console.log('[token] Trocando por long-lived token (60 dias)...');
    try {
      // Use stored token if available, otherwise use the env token
      const tokenToExchange = store?.access_token || envToken;
      const result = await exchangeToken(tokenToExchange, appId, appSecret);
      const expiresAt = now + result.expires_in * 1000;
      saveStore({
        access_token: result.access_token,
        expires_at: expiresAt,
        refreshed_at: new Date().toISOString(),
      });
      activeToken = result.access_token;
      const days = Math.round(result.expires_in / 86400);
      console.log(`[token] Long-lived token salvo — expira em ${days} dias`);
    } catch (err) {
      console.error('[token] Falha ao trocar token:', err.response?.data || err.message);
      console.log('[token] Usando token do .env como fallback');
      activeToken = envToken;
    }
  } else {
    const daysLeft = Math.round((store.expires_at - now) / (24 * 60 * 60 * 1000));
    console.log(`[token] Token armazenado válido — expira em ${daysLeft} dias`);
    activeToken = store.access_token;
  }

  // Schedule daily check
  setInterval(async () => {
    const current = loadStore();
    if (!current) return;
    const remaining = current.expires_at - Date.now();
    if (remaining < TEN_DAYS_MS) {
      const daysLeft = Math.round(remaining / (24 * 60 * 60 * 1000));
      console.log(`[token] Auto-refresh — faltam ${daysLeft} dias para expirar...`);
      try {
        const result = await exchangeToken(current.access_token, appId, appSecret);
        const updated = {
          access_token: result.access_token,
          expires_at: Date.now() + result.expires_in * 1000,
          refreshed_at: new Date().toISOString(),
        };
        saveStore(updated);
        activeToken = updated.access_token;
        const days = Math.round(result.expires_in / 86400);
        console.log(`[token] Token renovado automaticamente — expira em ${days} dias`);
      } catch (err) {
        console.error('[token] Auto-refresh falhou:', err.response?.data || err.message);
      }
    }
  }, CHECK_INTERVAL_MS);

  return activeToken;
}
