const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];
const SHORT_MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function monthIndex(token) {
  const t = token.toLowerCase();
  let i = SHORT_MONTHS.indexOf(t.slice(0, 3));
  if (i !== -1) return i;
  i = MONTH_NAMES.indexOf(t);
  return i === -1 ? null : i;
}

export function parseLooseDate(input) {
  if (!input) return null;
  const s = String(input).trim();

  // ISO-ish: 2023, 2023-04, 2023-04-06
  const iso = s.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/);
  if (iso) {
    const [, y, m, d] = iso;
    return new Date(Number(y), m ? Number(m) - 1 : 0, d ? Number(d) : 1);
  }

  const parts = s.split(/[\s,]+/).filter(Boolean);
  if (parts.length === 3) {
    // "24 Nov 2008"
    const day = parseInt(parts[0], 10);
    const month = monthIndex(parts[1]);
    const year = parseInt(parts[2], 10);
    if (!Number.isNaN(day) && month !== null && !Number.isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  if (parts.length === 2) {
    // "November 2008"
    const month = monthIndex(parts[0]);
    const year = parseInt(parts[1], 10);
    if (month !== null && !Number.isNaN(year)) return new Date(year, month, 1);
  }
  if (parts.length === 1) {
    const year = parseInt(parts[0], 10);
    if (!Number.isNaN(year)) return new Date(year, 0, 1);
  }
  return null;
}

export function processTools(rawTools, categories) {
  const tools = [];
  for (const [name, def] of Object.entries(rawTools || {})) {
    const releases = (def.releases || [])
      .map((r) => ({ ...r, date: parseLooseDate(r.dateString) }))
      .filter((r) => r.date)
      .sort((a, b) => a.date - b.date);

    if (releases.length === 0) continue;

    const first = releases[0].date;
    const last = releases[releases.length - 1].date;
    const category = def.category || 'other';
    const color = categories?.[category]?.color || '#7f7f7f';

    tools.push({
      name,
      category,
      color,
      description: def.description || '',
      discontinued: def.discontinued ? parseLooseDate(def.discontinued) : null,
      releases,
      firstDate: first,
      latestDate: last,
    });
  }
  return tools.sort((a, b) => a.firstDate - b.firstDate);
}

export function processEvents(rawEvents, layers) {
  return (rawEvents || [])
    .map((e) => ({
      ...e,
      parsedDate: parseLooseDate(e.date),
      color: layers?.[e.layer]?.color || '#7f7f7f',
    }))
    .filter((e) => e.parsedDate)
    .sort((a, b) => a.parsedDate - b.parsedDate);
}
