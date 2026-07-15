#!/usr/bin/env node
// Fetch release histories for living, repo-backed creative-coding tools and
// merge them into public/creative-code-data.json.
//
// Sources are declared in scripts/release-sources.json. Data comes from the
// GitHub Releases API (version + exact date + permalink), which matches the
// gold-standard provenance the original Processing rows already used.
//
// Usage:
//   node scripts/fetch-releases.mjs                 # dry run -> staging file + summary
//   node scripts/fetch-releases.mjs --write         # merge into the canonical JSON
//   node scripts/fetch-releases.mjs --only=Three.js,P5.js
//   node scripts/fetch-releases.mjs --max=40        # cap releases kept per tool (newest N)
//   node scripts/fetch-releases.mjs --include-prereleases
//
// Auth: reads GITHUB_TOKEN / GH_TOKEN from the environment to lift rate limits.
//   GITHUB_TOKEN=$(gh auth token) node scripts/fetch-releases.mjs
//
// Merge contract (idempotent & non-destructive):
//   - Fetched releases are tagged `"auto": true`. Re-running --write drops the
//     old auto entries and re-adds fresh ones, so hand-curated releases (those
//     WITHOUT `auto: true`) are never touched.
//   - Dedup is by normalized version; a manual entry always wins over a fetched
//     one with the same version, preserving curated notes.
//   NOTE: `auto` is an extra field on release objects. The schema allows it
//   (additionalProperties) and the renderer ignores unknown fields, but it is a
//   provenance addition worth flagging to whoever owns the render port.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_PATH = resolve(ROOT, 'public/creative-code-data.json');
const SOURCES_PATH = resolve(ROOT, 'scripts/release-sources.json');
const STAGING_PATH = resolve(ROOT, 'scripts/.release-staging.json');

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const INCLUDE_PRE = args.includes('--include-prereleases');
const onlyArg = args.find(a => a.startsWith('--only='));
const ONLY = onlyArg ? onlyArg.split('=')[1].split(',').map(s => s.trim()) : null;
const maxArg = args.find(a => a.startsWith('--max='));
const MAX = maxArg ? parseInt(maxArg.split('=')[1], 10) : null;
const thinArg = args.find(a => a.startsWith('--thin='));
const THIN = thinArg ? thinArg.split('=')[1] : 'year'; // year | none

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const GH_HEADERS = {
  'Accept': 'application/vnd.github+json',
  'User-Agent': 'creative-code-timeline-fetcher',
  ...(TOKEN ? { 'Authorization': `Bearer ${TOKEN}` } : {}),
};

// Rolling / non-version tags that should never become timeline dots.
const ROLLING = /^(nightly|latest|continuous|stable|dev|edge|tip|head|unstable|snapshot)$/i;

const MONTHS = { jan:1, feb:2, mar:3, apr:4, may:5, jun:6, jul:7, aug:8, sep:9, oct:10, nov:11, dec:12 };
// Sortable YYYYMMDD key from any accepted format (ISO, "24 Nov 2008",
// "November 2008", bare year). Mixed manual/ISO dates must sort chronologically,
// not lexically — otherwise curated human-dated releases get scrambled on merge.
function dateKey(s) {
  s = String(s).trim();
  let m;
  if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})/))) return m[1] + m[2] + m[3];
  if ((m = s.match(/^(\d{4})-(\d{2})$/)))        return m[1] + m[2] + '00';
  if ((m = s.match(/^(\d{4})$/)))                return m[1] + '0000';
  if ((m = s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/))) {
    const mo = MONTHS[m[2].slice(0, 3).toLowerCase()] || 0;
    return m[3] + String(mo).padStart(2, '0') + String(m[1]).padStart(2, '0');
  }
  if ((m = s.match(/^([A-Za-z]+)\s+(\d{4})/))) {
    const mo = MONTHS[m[1].slice(0, 3).toLowerCase()] || 0;
    return m[2] + String(mo).padStart(2, '0') + '00';
  }
  if ((m = s.match(/(\d{4})/))) return m[1] + '0000';
  return '00000000';
}

const normVersion = v => String(v).trim().replace(/^v/i, '').replace(/\s+/g, '').toLowerCase();
const isMajor = tag => /^v?\d+\.0(\.0)?$/.test(String(tag).trim());
const toISODate = ts => (ts ? String(ts).slice(0, 10) : null); // YYYY-MM-DD

async function ghAllReleases(repo) {
  const out = [];
  for (let page = 1; page <= 20; page++) {
    const url = `https://api.github.com/repos/${repo}/releases?per_page=100&page=${page}`;
    const res = await fetch(url, { headers: GH_HEADERS });
    if (res.status === 404) throw new Error(`404 (repo not found: ${repo})`);
    if (res.status === 403) throw new Error(`403 (rate limited — set GITHUB_TOKEN)`);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const batch = await res.json();
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

function normalizeReleases(raw) {
  return raw
    .filter(r => !r.draft)
    .filter(r => INCLUDE_PRE || !r.prerelease)
    .filter(r => r.tag_name && !ROLLING.test(r.tag_name))
    .map(r => {
      const date = toISODate(r.published_at || r.created_at);
      return date && {
        version: String(r.tag_name).replace(/^v/i, ''),
        dateString: date,
        link: r.html_url,
        notes: '',
        ...(isMajor(r.tag_name) ? { major: true } : {}),
        auto: true,
      };
    })
    .filter(Boolean)
    // oldest -> newest
    .sort((a, b) => a.dateString.localeCompare(b.dateString));
}

// Thin a full (sorted-asc) fetch to one representative release per calendar
// year (the year's latest), always keeping any major (x.0). Bounds each
// lifeline to ~its active years so the timeline reads at even density.
function thinYearMajors(releases) {
  const byYear = new Map();
  for (const r of releases) byYear.set(r.dateString.slice(0, 4), r); // asc -> last wins
  const pool = [...byYear.values(), ...releases.filter(r => r.major)];
  const seen = new Set();
  const out = [];
  for (const r of pool.sort((a, b) => a.dateString.localeCompare(b.dateString))) {
    const k = normVersion(r.version);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}

function thin(releases) {
  return THIN === 'year' ? thinYearMajors(releases) : releases;
}

// Serialize matching the file's hand style: standard 2-space objects, but
// release entries stay one-per-line so merges produce reviewable diffs.
function serialize(data) {
  const relKeyOrder = ['version', 'dateString', 'link', 'notes', 'major', 'auto'];
  const relLine = r => {
    const parts = relKeyOrder
      .filter(k => k in r)
      .map(k => `${JSON.stringify(k)}: ${JSON.stringify(r[k])}`);
    return `        { ${parts.join(', ')} }`;
  };
  const toolBlock = (name, t) => {
    const L = [`    ${JSON.stringify(name)}: {`];
    for (const k of ['category', 'description', 'link', 'discontinued']) {
      if (k in t) L.push(`      ${JSON.stringify(k)}: ${JSON.stringify(t[k])},`);
    }
    if (t.releases && t.releases.length) {
      L.push('      "releases": [');
      L.push(t.releases.map(relLine).join(',\n'));
      L.push('      ]');
    } else {
      // drop trailing comma on the last scalar field if there are no releases
      L[L.length - 1] = L[L.length - 1].replace(/,$/, '');
    }
    L.push('    }');
    return L.join('\n');
  };
  const cats = Object.entries(data.categories)
    .map(([k, c]) => {
      const inner = ['name', 'color', 'description']
        .filter(f => f in c)
        .map(f => `      ${JSON.stringify(f)}: ${JSON.stringify(c[f])}`)
        .join(',\n');
      return `    ${JSON.stringify(k)}: {\n${inner}\n    }`;
    })
    .join(',\n');
  const tools = Object.entries(data.tools)
    .map(([n, t]) => toolBlock(n, t))
    .join(',\n');
  return `{\n  "categories": {\n${cats}\n  },\n  "tools": {\n${tools}\n  }\n}\n`;
}

function mergeReleases(existing = [], fetched = []) {
  const manual = existing.filter(r => !r.auto);            // keep hand-curated
  const manualKeys = new Set(manual.map(r => normVersion(r.version ?? '')));
  const fresh = fetched.filter(r => !manualKeys.has(normVersion(r.version)));
  const all = [...manual, ...fresh];
  // stable chronological sort across mixed date formats (JS sort is stable, so
  // already-ordered curated entries keep their relative order -> clean diffs)
  all.sort((a, b) => dateKey(a.dateString).localeCompare(dateKey(b.dateString)));
  return all;
}

async function main() {
  const sourcesDoc = JSON.parse(readFileSync(SOURCES_PATH, 'utf8'));
  const sources = sourcesDoc.sources;
  const data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));

  const names = Object.keys(sources).filter(n => !ONLY || ONLY.includes(n));
  const results = {};
  const summary = [];

  for (const name of names) {
    const src = sources[name];
    if (!src.github) { summary.push([name, 'skip', 'no github source']); continue; }
    if (!data.tools[name]) { summary.push([name, 'skip', `not in dataset`]); continue; }
    try {
      const raw = await ghAllReleases(src.github);
      const norm = normalizeReleases(raw);          // full history (archived to staging)
      let merged = thin(norm);                       // what actually gets merged
      if (MAX && merged.length > MAX) merged = merged.slice(merged.length - MAX);
      results[name] = { full: norm, merge: merged };
      const earliest = merged[0]?.dateString ?? '—';
      const latest = merged[merged.length - 1]?.dateString ?? '—';
      summary.push([name, `${norm.length}→${merged.length}`, `${earliest} → ${latest}  (${src.github})`]);
    } catch (e) {
      summary.push([name, 'ERROR', `${src.github}: ${e.message}`]);
    }
  }

  // ---- report ----
  console.log(`\nRelease fetch — ${WRITE ? 'WRITE' : 'dry run'}${TOKEN ? '' : '  [no token: 60 req/hr]'}\n`);
  const w = Math.max(...summary.map(s => s[0].length));
  for (const [n, status, detail] of summary) {
    console.log(`  ${n.padEnd(w)}  ${status.padEnd(7)}  ${detail}`);
  }

  // archive the FULL fetch (not merged) so granularity is never lost
  const archive = Object.fromEntries(Object.entries(results).map(([n, r]) => [n, r.full]));
  writeFileSync(STAGING_PATH, JSON.stringify(archive, null, 2));

  if (!WRITE) {
    console.log(`\nThinning: ${THIN}  (full → merged shown above)`);
    console.log(`Staged full history for ${Object.keys(results).length} tools -> ${STAGING_PATH.replace(ROOT + '/', '')}`);
    console.log('Review, then re-run with --write to merge the thinned set.\n');
    return;
  }

  // ---- merge ----
  let touched = 0;
  for (const [name, r] of Object.entries(results)) {
    const tool = data.tools[name];
    const before = (tool.releases || []).length;
    tool.releases = mergeReleases(tool.releases, r.merge);
    const added = tool.releases.length - before;
    touched++;
    console.log(`  merged ${name}: ${before} -> ${tool.releases.length} (${added >= 0 ? '+' : ''}${added})`);
  }
  writeFileSync(DATA_PATH, serialize(data));
  console.log(`\nWrote ${touched} tools into ${DATA_PATH.replace(ROOT + '/', '')}`);
  console.log('Run `npm run validate` next.\n');
}

main().catch(e => { console.error(e); process.exit(1); });
