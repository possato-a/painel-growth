/**
 * Google Ads API v19 client (GAQL via REST).
 * Supports Manager Accounts (MCC): uses login-customer-id header
 * and auto-discovers client sub-accounts.
 */

import axios from 'axios';
import { getGoogleToken } from './google-sheets.js';

const GADS_BASE = 'https://googleads.googleapis.com/v20';
const DEV_TOKEN = (process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '').trim();
const MCC_ID    = (process.env.GOOGLE_ADS_CUSTOMER_ID    || '').trim();

export const CUSTOMER_ID = MCC_ID;

// Cached list of direct non-manager client IDs under the MCC.
let _clientIds = null;

/**
 * Build auth headers for Google Ads API.
 * Always includes login-customer-id pointing to the MCC.
 */
async function authHeaders() {
  const token = await getGoogleToken();
  return {
    'Authorization':     `Bearer ${token}`,
    'developer-token':   DEV_TOKEN,
    'login-customer-id': MCC_ID,
    'Content-Type':      'application/json',
  };
}

/**
 * List all direct non-manager client account IDs under the MCC.
 * Cached per process lifetime; call resetClients() to force refresh.
 */
export async function listClientIds() {
  if (_clientIds) return _clientIds;

  const headers = await authHeaders();
  let results = [];

  try {
    const { data } = await axios.post(
      `${GADS_BASE}/customers/${MCC_ID}/googleAds:search`,
      {
        query: `SELECT customer_client.id, customer_client.manager, customer_client.level,
                       customer_client.descriptive_name, customer_client.status
                FROM customer_client
                WHERE customer_client.level = 1 AND customer_client.manager = false`,
      },
      { headers }
    );
    results = data.results || [];
  } catch (e) {
    console.error('[gads] customerClient query failed:', e.response?.data ?? e.message);
  }

  const ids = results
    .map(r => String(r.customerClient?.id))
    .filter(id => id && id !== 'undefined');

  // Fallback: if no clients found, try querying the MCC itself directly
  _clientIds = ids.length > 0 ? ids : [MCC_ID];
  console.log('[gads] Using client IDs:', _clientIds);
  return _clientIds;
}

export function resetClients() { _clientIds = null; }

/**
 * Execute GAQL against a specific customer account.
 * @param {string} gaql  - The GAQL query string
 * @param {string} [cid] - Customer ID to query (defaults to first discovered client)
 */
export async function gadsQuery(gaql, cid = null) {
  const headers = await authHeaders();
  const clientIds = await listClientIds();
  const targetId = cid || clientIds[0];

  const { data } = await axios.post(
    `${GADS_BASE}/customers/${targetId}/googleAds:search`,
    { query: gaql },
    { headers }
  );
  return data.results || [];
}

/**
 * Execute GAQL against ALL client accounts and merge results.
 * Each row is tagged with _cid (client ID) for disambiguation.
 */
export async function gadsQueryAll(gaql) {
  const clientIds = await listClientIds();
  const allResults = await Promise.all(
    clientIds.map(async (cid) => {
      try {
        const rows = await gadsQuery(gaql, cid);
        return rows.map(r => ({ ...r, _cid: cid }));
      } catch (e) {
        console.error(`[gads] Query failed for client ${cid}:`, e.response?.data ?? e.message);
        return [];
      }
    })
  );
  return allResults.flat();
}
