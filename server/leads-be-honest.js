/**
 * leads-be-honest.js
 *
 * NOTE on UTM duplication: Meta sometimes tracks utm_campaign as two concatenated
 * copies of the same value separated by a space (e.g. "CAMP CAMP"). This appears
 * to be a pixel/URL encoding artefact. deduplicateUtm() strips the duplicate half.
 *
 *
 * Reads leads directly from the "Leads Be Honest" source spreadsheet
 * (ID: 1f-dvv2zLKbey__rug-T5gJn-NkNmf7EWcQv3Tb9IvM8, tab: "Leads Franquia").
 *
 * This is the source of truth for lead counts — NOT the CRM_PAINEL tab,
 * which is a processed subset (Feb 2026 onwards, deduped, enriched).
 *
 * Column layout (A–O):
 *   A  data          DD/MM/YYYY
 *   B  hora          HH:MM
 *   C  nome
 *   D  email
 *   E  celular
 *   F  cidade
 *   G  estado
 *   H  disponibilidade
 *   I  mqStatus
 *   J  page          landing page URL (utm source of truth)
 *   K  source        utm_source
 *   L  medium        utm_medium
 *   M  campaign      utm_campaign  ← Meta campaign ID or name
 *   N  content       utm_content
 *   O  term          utm_term
 */

import { sheetsGet } from './google-sheets.js';

/**
 * Strips the duplicate half from a doubled UTM value.
 * Meta's pixel sometimes writes utm_campaign as "X X" (the value concatenated
 * with itself, separated by a single space). This normalises it back to "X".
 */
function deduplicateUtm(val) {
  const s = (val || '').trim();
  const len = s.length;
  if (len < 3) return s;
  // "X X" always has odd total length (n + 1 + n = 2n+1)
  if (len % 2 === 0) return s;
  const half = (len - 1) / 2;
  if (s[half] === ' ' && s.slice(0, half) === s.slice(half + 1)) {
    return s.slice(0, half);
  }
  return s;
}

const LEADS_SHEET_ID = '1f-dvv2zLKbey__rug-T5gJn-NkNmf7EWcQv3Tb9IvM8';
const LEADS_TAB      = 'Leads Franquia';

const EXCLUDED_NAMES = ['francisco possato', 'carlos fernandes'];

function isExcluded(nome, email) {
  const n = (nome  || '').toLowerCase();
  const e = (email || '').toLowerCase();
  if (EXCLUDED_NAMES.some(x => n.includes(x))) return true;
  if (['teste', 'test', '@test'].some(x => e.includes(x) || n.includes(x))) return true;
  return false;
}

/** Converts DD/MM/YYYY → YYYY-MM-DD (returns '' if invalid). */
function parseDate(ddmmyyyy) {
  const p = (ddmmyyyy || '').trim().split('/');
  if (p.length !== 3 || !p[2]) return '';
  return `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
}

/**
 * Reads all leads from the source sheet and optionally filters by date range.
 *
 * @param {string|null} sinceDate  YYYY-MM-DD inclusive lower bound (null = no lower bound)
 * @param {string|null} untilDate  YYYY-MM-DD inclusive upper bound (null = no upper bound)
 * @returns {Promise<Array>}
 */
export async function readLeadsBeHonest(sinceDate = null, untilDate = null) {
  const resp = await sheetsGet(LEADS_SHEET_ID, `${LEADS_TAB}!A:O`);
  const rows = (resp.values || []).slice(1); // drop header row

  return rows
    .filter(row => {
      const email = (row[3] || '').trim();
      const nome  = (row[2] || '').trim();
      if (!email) return false;
      if (isExcluded(nome, email)) return false;

      if (sinceDate || untilDate) {
        const iso = parseDate(row[0] || '');
        if (!iso) return false;
        if (sinceDate && iso < sinceDate) return false;
        if (untilDate && iso > untilDate) return false;
      }
      return true;
    })
    .map(row => ({
      data:            (row[0]  || '').trim(),
      hora:            (row[1]  || '').trim(),
      nome:            (row[2]  || '').trim(),
      email:           (row[3]  || '').toLowerCase().trim(),
      celular:         (row[4]  || '').trim(),
      cidade:          (row[5]  || '').trim(),
      estado:          (row[6]  || '').trim(),
      disponibilidade: (row[7]  || '').trim(),
      mqStatus:        (row[8]  || '').trim(),
      page:            (row[9]  || '').trim(),
      source:          deduplicateUtm(row[10] || ''),
      medium:          deduplicateUtm(row[11] || ''),
      campaign:        deduplicateUtm(row[12] || ''),  // utm_campaign — may be Meta campaign ID or name
      content:         deduplicateUtm(row[13] || ''),
      term:            deduplicateUtm(row[14] || ''),
    }));
}
