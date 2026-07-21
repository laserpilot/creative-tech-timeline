import { LAYER_ORDER, CATEGORY_ORDER } from './timelineConfig.js';

const MONO = "'IBM Plex Mono', ui-monospace, monospace";

// A year "slice": everything within ±1 year of the clicked year, grouped by
// layer (events) and category (tools). The centre year reads at full strength;
// the ±1 neighbours are dimmed so the window is legible without hiding context.
const WINDOW = 1;

function groupByKey(items, order, keyOf) {
  const byKey = new Map();
  for (const it of items) {
    const k = keyOf(it);
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k).push(it);
  }
  return order
    .filter((o) => byKey.has(o.key))
    .map((o) => ({ key: o.key, name: o.name, items: byKey.get(o.key) }));
}

export default function YearDetail({ year, events, tools, onClose, onSelectTool }) {
  const lo = year - WINDOW;
  const hi = year + WINDOW;
  const inWindow = (y) => y >= lo && y <= hi;

  const evIn = events
    .filter((e) => inWindow(e.parsedDate.getFullYear()))
    .sort((a, b) => a.parsedDate - b.parsedDate);
  const toolIn = tools
    .filter((t) => inWindow(t.startYear))
    .sort((a, b) => a.startYear - b.startYear);

  const eventGroups = groupByKey(evIn, LAYER_ORDER, (e) => e.layer);
  const toolGroups = groupByKey(toolIn, CATEGORY_ORDER, (t) => t.category);
  const empty = evIn.length === 0 && toolIn.length === 0;

  return (
    <aside style={{ flex: 'none', width: 320, height: '100%', overflowY: 'auto', background: '#fff', borderLeft: '1px solid #e7e3dd', boxSizing: 'border-box', boxShadow: '-12px 0 32px -20px rgba(40,34,30,0.25)' }}>
      <div style={{ padding: '16px 18px', borderBottom: '1px solid #ece8e1', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 1, background: '#fff' }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a49a8d', marginBottom: 2 }}>Year slice</div>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#2c2822', lineHeight: 1 }}>{year}</div>
          <div style={{ fontFamily: MONO, fontSize: 10.5, color: '#b4a99b', marginTop: 4 }}>
            {lo}–{hi} · {evIn.length} event{evIn.length === 1 ? '' : 's'} · {toolIn.length} tool{toolIn.length === 1 ? '' : 's'}
          </div>
        </div>
        <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#a49a8d', fontSize: 18, lineHeight: 1 }}>×</button>
      </div>

      <div style={{ padding: '16px 18px' }}>
        {empty && (
          <div style={{ fontSize: 12.5, color: '#8a8175', lineHeight: 1.5 }}>Nothing recorded near {year}.</div>
        )}

        {eventGroups.map((g) => (
          <Section key={`e-${g.key}`} title={g.items[0].layerName}>
            {g.items.map((e) => {
              const y = e.parsedDate.getFullYear();
              return (
                <Row key={e.id} color={e.color} dim={y !== year}>
                  <div style={{ fontSize: 12.5, color: '#3a352e' }}>
                    {e.title}{' '}
                    <span style={{ fontFamily: MONO, fontSize: 10.5, color: '#b4a99b' }}>{y}</span>
                    {e.link && (
                      <a href={e.link} target="_blank" rel="noopener noreferrer" style={{ color: '#b4a99b', marginLeft: 5, textDecoration: 'none' }}>↗</a>
                    )}
                  </div>
                  {e.description && <div style={{ fontSize: 11.5, color: '#8a8175', lineHeight: 1.4, marginTop: 1 }}>{e.description}</div>}
                </Row>
              );
            })}
          </Section>
        ))}

        {toolGroups.length > 0 && (
          <div style={{ marginTop: eventGroups.length ? 18 : 0, paddingTop: eventGroups.length ? 14 : 0, borderTop: eventGroups.length ? '1px solid #ece8e1' : 'none' }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a49a8d', marginBottom: 10 }}>Tools introduced</div>
            {toolGroups.map((g) => (
              <Section key={`t-${g.key}`} title={g.items[0].categoryName}>
                {g.items.map((t) => (
                  <Row key={t.name} color={t.color} dim={t.startYear !== year} onClick={() => onSelectTool(t)}>
                    <div style={{ fontSize: 12.5, color: '#3a352e' }}>
                      {t.name}{' '}
                      <span style={{ fontFamily: MONO, fontSize: 10.5, color: '#b4a99b' }}>{t.startYear}</span>
                    </div>
                  </Row>
                ))}
              </Section>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6b6459', marginBottom: 7 }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ color, dim, onClick, children }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', gap: 10, marginBottom: 9,
        opacity: dim ? 0.6 : 1, cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', flex: 'none', background: color, marginTop: 5 }} />
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}
