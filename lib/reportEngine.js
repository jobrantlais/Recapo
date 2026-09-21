// Recapo core engine: numbers are computed in code, the AI only writes the narrative.
const ALIASES = {
  date: ['date', 'day', 'reporting starts'],
  campaign: ['campaign', 'campaign name'],
  spend: ['spend', 'cost', 'amount spent'],
  impressions: ['impressions', 'impr.'],
  clicks: ['clicks', 'link clicks'],
  conversions: ['conversions', 'results', 'purchases'],
  revenue: ['revenue', 'conversion value', 'purchase value', 'conv. value'],
};

function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(x => x.trim()));
}

const num = v => { const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, '')); return Number.isFinite(n) ? n : 0; };
const round = (n, d = 2) => (n === null ? null : Math.round(n * 10 ** d) / 10 ** d);
const div = (a, b) => (b > 0 ? a / b : null);

function mapColumns(headers) {
  const map = {};
  headers.forEach((h, i) => {
    const key = h.trim().toLowerCase();
    for (const [field, names] of Object.entries(ALIASES)) if (!(field in map) && names.includes(key)) map[field] = i;
  });
  return map;
}

function metrics(rows) {
  const s = k => rows.reduce((t, r) => t + r[k], 0);
  const spend = s('spend'), impressions = s('impressions'), clicks = s('clicks'), conversions = s('conversions'), revenue = s('revenue');
  return {
    spend: round(spend), impressions, clicks, conversions, revenue: round(revenue),
    ctr_pct: round(div(clicks, impressions) * 100), cpc: round(div(spend, clicks)),
    cpa: round(div(spend, conversions)), roas: round(div(revenue, spend)),
  };
}

const change = (cur, prev) => (cur == null || prev == null || prev === 0 ? null : round(((cur - prev) / Math.abs(prev)) * 100, 1));

function analyze(csvText) {
  const table = parseCSV(csvText);
  if (table.length < 2) throw new Error('The file is empty.');
  const col = mapColumns(table[0]);
  if (!('date' in col) || !('spend' in col)) throw new Error('CSV needs at least Date and Spend/Cost columns.');
  const rows = table.slice(1).map(r => {
    const d = new Date(r[col.date]);
    const o = { month: isNaN(d) ? null : d.toISOString().slice(0, 7), campaign: col.campaign != null ? r[col.campaign].trim() : 'All' };
    for (const k of ['spend', 'impressions', 'clicks', 'conversions', 'revenue']) o[k] = k in col ? num(r[col[k]]) : 0;
    return o;
  }).filter(r => r.month);
  const months = [...new Set(rows.map(r => r.month))].sort();
  if (!months.length) throw new Error('Could not read any dates.');
  const curM = months[months.length - 1], prevM = months[months.length - 2] || null;
  const cur = rows.filter(r => r.month === curM), prev = prevM ? rows.filter(r => r.month === prevM) : [];
  const current = metrics(cur), previous = prevM ? metrics(prev) : null;
  const changes = {};
  if (previous) for (const k of Object.keys(current)) changes[k] = change(current[k], previous[k]);
  const byCamp = {};
  cur.forEach(r => (byCamp[r.campaign] ||= []).push(r));
  const campaigns = Object.entries(byCamp).map(([name, rs]) => ({ name, ...metrics(rs) })).sort((a, b) => b.spend - a.spend).slice(0, 10);
  return { period: { current: curM, previous: prevM }, current, previous, changes_pct: changes, campaigns };
}

function buildPrompt(data, { clientName = 'the client', agencyName = 'our team', tone = 'professional and friendly' } = {}) {
  return `You are a senior performance marketer writing a monthly report for ${clientName} on behalf of ${agencyName}. Tone: ${tone}.
Use ONLY the numbers below. Never invent or recalculate figures. If a change is null, there is no comparison data.
Write: 1) Executive summary (3 sentences) 2) What worked 3) What needs attention 4) 3 concrete next-month actions. Plain language, no jargon, under 350 words.

DATA:
${JSON.stringify(data, null, 2)}`;
}

async function generateReport(csvText, opts, apiKey) {
  const data = analyze(csvText);
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-5', max_tokens: 1200, messages: [{ role: 'user', content: buildPrompt(data, opts) }] }),
  });
  if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
  const out = await res.json();
  return { data, narrative: out.content.filter(b => b.type === 'text').map(b => b.text).join('\n') };
}

module.exports = { parseCSV, analyze, buildPrompt, generateReport };
