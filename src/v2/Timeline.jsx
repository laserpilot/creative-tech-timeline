import { useMemo, useState } from 'react';
import { useTimelineData } from './useTimelineData.js';
import Sidebar from './Sidebar.jsx';
import ToolDetail from './ToolDetail.jsx';
import {
  YMIN, YMAX, NOW, GUTTER, ROW, LANE_HEADER, EVH, EVR, TIME_WIDTH,
  CATEGORY_ORDER, LAYER_ORDER, DECADES, x, xDate, yearFrac, decadeOf,
} from './timelineConfig.js';

const BG = '#f7f6f4';
const MONO = "'IBM Plex Mono', ui-monospace, monospace";

function toggleIn(set, key) {
  const next = new Set(set);
  next.has(key) ? next.delete(key) : next.add(key);
  return next;
}

export default function Timeline() {
  const { loading, error, data } = useTimelineData();

  const [cats, setCats] = useState(null); // null = all on
  const [layers, setLayers] = useState(null);
  const [decades, setDecades] = useState(null);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(() => new Set(['programming', 'audio-visual']));
  const [selected, setSelected] = useState(null);
  const [hoverEvent, setHoverEvent] = useState(null);

  // Normalize display tools/events to the config ordering + palette.
  const prepared = useMemo(() => {
    if (!data) return null;
    const catColor = Object.fromEntries(CATEGORY_ORDER.map((c) => [c.key, c.color]));
    const catName = Object.fromEntries(CATEGORY_ORDER.map((c) => [c.key, c.name]));
    const layColor = Object.fromEntries(LAYER_ORDER.map((l) => [l.key, l.color]));
    const layName = Object.fromEntries(LAYER_ORDER.map((l) => [l.key, l.name]));
    const tools = data.tools
      .filter((t) => catColor[t.category])
      .map((t) => ({ ...t, color: catColor[t.category], categoryName: catName[t.category], startYear: t.firstDate.getFullYear() }));
    const events = data.events
      .filter((e) => layColor[e.layer])
      .map((e) => ({ ...e, color: layColor[e.layer], layerName: layName[e.layer] }))
      .sort((a, b) => a.parsedDate - b.parsedDate);
    return { tools, events };
  }, [data]);

  if (loading) return <div style={{ padding: 32, color: '#8a8175', fontSize: 13 }}>Loading timeline…</div>;
  if (error) return <div style={{ padding: 32, color: '#b23', fontSize: 13 }}>Error loading data: {error}</div>;
  if (!data || !prepared) return null;

  const { tools, events } = prepared;
  const catsOn = cats || new Set(CATEGORY_ORDER.map((c) => c.key));
  const layersOn = layers || new Set(LAYER_ORDER.map((l) => l.key));
  const decadesOn = decades || new Set(DECADES);
  const q = query.trim().toLowerCase();

  const toolDimmed = (t) =>
    !decadesOn.has(decadeOf(t.startYear)) || (q && !t.name.toLowerCase().includes(q));

  const catCount = Object.fromEntries(
    CATEGORY_ORDER.map((c) => [c.key, tools.filter((t) => t.category === c.key).length])
  );
  const layCount = Object.fromEntries(
    LAYER_ORDER.map((l) => [l.key, events.filter((e) => e.layer === l.key).length])
  );
  const shownTools = tools.filter((t) => catsOn.has(t.category) && !toolDimmed(t)).length;

  const activeLayers = LAYER_ORDER.filter((l) => layersOn.has(l.key));
  const activeRow = Object.fromEntries(activeLayers.map((l, i) => [l.key, i]));
  const visEvents = events.filter((e) => layersOn.has(e.layer));
  const eventsExpanded = expanded.has('events');

  const innerWidth = GUTTER + TIME_WIDTH;
  const nowLeft = x(NOW);

  // ---- year axis + gridlines ----
  const ticks = [];
  for (let yr = YMIN; yr <= YMAX; yr++) {
    if (yr % 5 !== 0) continue;
    ticks.push({ yr, left: x(yr), decade: yr % 10 === 0 });
  }

  const gridlines = ticks.map((t) => (
    <div
      key={`grid-${t.yr}`}
      style={{
        position: 'absolute', top: 0, bottom: 0, width: 1,
        left: GUTTER + t.left, background: t.decade ? '#e7e2da' : '#f0ece5', zIndex: 0,
      }}
    />
  ));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: BG, color: '#3a352e' }}>
      <header style={{ flex: 'none', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, padding: '14px 20px', borderBottom: '1px solid #e7e3dd', background: BG }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', color: '#2c2822', margin: 0 }}>Creative Coding Timeline</h1>
          <p style={{ fontSize: 12.5, color: '#8a8175', margin: 0 }}>Tools, in the context of the hardware, standards, AI, art &amp; communities around them.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 'none' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: '#a49a8d' }}>{YMIN}</span>
          <span style={{ width: 60, height: 1, background: '#d8d2ca' }} />
          <span style={{ fontFamily: MONO, fontSize: 11, color: '#a49a8d' }}>{Math.floor(NOW)}</span>
        </div>
      </header>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
      <Sidebar
        query={query}
        onSearch={setQuery}
        categories={CATEGORY_ORDER.map((c) => ({
          ...c, count: catCount[c.key], on: catsOn.has(c.key),
          toggle: () => setCats(toggleIn(catsOn, c.key)),
        }))}
        onResetCats={() => setCats(null)}
        layers={LAYER_ORDER.map((l) => ({
          ...l, count: layCount[l.key], on: layersOn.has(l.key),
          toggle: () => setLayers(toggleIn(layersOn, l.key)),
        }))}
        allLayersOn={layersOn.size === LAYER_ORDER.length}
        onToggleAllLayers={() =>
          setLayers(layersOn.size === LAYER_ORDER.length ? new Set() : null)}
        decades={DECADES.map((d) => ({
          label: d, on: decadesOn.has(d), toggle: () => setDecades(toggleIn(decadesOn, d)),
        }))}
        showingLabel={`${shownTools} of ${tools.length} tools`}
        onReset={() => { setCats(null); setLayers(null); setDecades(null); setQuery(''); setSelected(null); }}
      />

      {/* Scrollable timeline */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <div style={{ position: 'relative', minWidth: innerWidth }}>
          {gridlines}
          {/* now line */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, width: 0, left: GUTTER + nowLeft, borderLeft: '1px dashed #c3baac', zIndex: 1 }} />

          {/* Year axis (sticky top) */}
          <div style={{ position: 'sticky', top: 0, zIndex: 5, display: 'flex', height: 40, background: BG, borderBottom: '1px solid #e7e3dd' }}>
            <div style={{ position: 'sticky', left: 0, zIndex: 6, flex: 'none', width: GUTTER, background: BG, borderRight: '1px solid #e7e3dd' }} />
            <div style={{ position: 'relative', flex: 'none', width: TIME_WIDTH }}>
              {ticks.map((t) => (
                <span key={`tick-${t.yr}`} style={{
                  position: 'absolute', top: 13, left: t.left, transform: 'translateX(-50%)',
                  fontFamily: MONO, fontSize: 11, whiteSpace: 'nowrap',
                  color: t.decade ? '#4a443c' : '#b4a99b', fontWeight: t.decade ? 500 : 400,
                }}>{t.yr}</span>
              ))}
              <span style={{ position: 'absolute', top: 13, left: nowLeft + 5, fontFamily: MONO, fontSize: 10, color: '#a49a8d' }}>now</span>
            </div>
          </div>

          {/* Context & events lane */}
          <EventsLane
            expanded={eventsExpanded}
            onToggle={() => setExpanded(toggleIn(expanded, 'events'))}
            count={visEvents.length}
            activeLayers={activeLayers}
            activeRow={activeRow}
            visEvents={visEvents}
            hoverEvent={hoverEvent}
            setHoverEvent={setHoverEvent}
          />

          {/* Category lanes */}
          {CATEGORY_ORDER.filter((c) => catsOn.has(c.key)).map((c) => {
            const laneTools = tools
              .filter((t) => t.category === c.key)
              .sort((a, b) => a.firstDate - b.firstDate);
            return (
              <Lane
                key={c.key}
                cat={c}
                tools={laneTools}
                expanded={expanded.has(c.key)}
                onToggle={() => setExpanded(toggleIn(expanded, c.key))}
                toolDimmed={toolDimmed}
                onSelect={setSelected}
                selected={selected}
              />
            );
          })}
        </div>
      </div>

      <ToolDetail tool={selected} onClose={() => setSelected(null)} />
      </div>
    </div>
  );
}

// ---------- Events lane ----------
function EventsLane({ expanded, onToggle, count, activeLayers, activeRow, visEvents, hoverEvent, setHoverEvent }) {
  const height = expanded ? EVH + activeLayers.length * EVR + 10 : 38;
  const hovered = hoverEvent != null ? visEvents[hoverEvent] : null;

  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #ece8e1', background: 'rgba(247,246,244,0.4)' }}>
      <div style={{ position: 'sticky', left: 0, zIndex: 3, flex: 'none', width: GUTTER, background: BG, borderRight: '1px solid #e7e3dd' }}>
        <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 12px 0 14px', cursor: 'pointer' }}>
          <span style={{ display: 'inline-block', color: '#b4a99b', fontSize: 14, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>›</span>
          <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#6b6459' }}>Context &amp; events</span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: '#b4a99b' }}>{count}</span>
        </div>
        {expanded && activeLayers.map((l) => (
          <div key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 8, height: EVR, padding: '0 12px 0 34px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', flex: 'none', background: l.color }} />
            <span style={{ fontSize: 11.5, color: '#6b6459', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name}</span>
          </div>
        ))}
      </div>

      <div style={{ position: 'relative', flex: 'none', width: TIME_WIDTH, height }}>
        {/* ticks (always) */}
        {visEvents.map((e, i) => (
          <div
            key={`t-${e.id}`}
            onMouseEnter={() => setHoverEvent(i)}
            onMouseLeave={() => setHoverEvent(null)}
            style={{
              position: 'absolute', top: 9, height: 20, width: 3, left: xDate(e.parsedDate) - 1,
              background: e.color, borderRadius: 2, opacity: hoverEvent === i ? 1 : 0.68, cursor: 'pointer',
            }}
          />
        ))}
        {/* dots per layer row (expanded) */}
        {expanded && visEvents.map((e, i) => {
          const size = hoverEvent === i ? 12 : 9;
          const top = EVH + activeRow[e.layer] * EVR + (EVR - size) / 2;
          return (
            <div
              key={`d-${e.id}`}
              onMouseEnter={() => setHoverEvent(i)}
              onMouseLeave={() => setHoverEvent(null)}
              style={{
                position: 'absolute', top, left: xDate(e.parsedDate) - size / 2, width: size, height: size,
                borderRadius: '50%', background: e.color, boxShadow: '0 0 0 2px #f7f6f4', cursor: 'pointer',
              }}
            />
          );
        })}
        {/* hover popover */}
        {hovered && (
          <div style={{
            position: 'absolute',
            top: expanded ? EVH + activeRow[hovered.layer] * EVR + 22 : 34,
            left: xDate(hovered.parsedDate) - 10, zIndex: 50, width: 220,
            background: '#fff', border: '1px solid #e7e3dd', borderLeft: `3px solid ${hovered.color}`,
            borderRadius: 8, boxShadow: '0 12px 32px -14px rgba(40,34,30,0.4)', padding: '9px 12px', pointerEvents: 'none',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#2c2822', marginBottom: 3 }}>{hovered.title}</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: '#a49a8d', marginBottom: 5 }}>
              {hovered.layerName} · {Math.floor(yearFrac(hovered.parsedDate))}
            </div>
            {hovered.description && <div style={{ fontSize: 11.5, color: '#6b6459', lineHeight: 1.45 }}>{hovered.description}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Category lane ----------
function Lane({ cat, tools, expanded, onToggle, toolDimmed, onSelect, selected }) {
  const height = expanded ? LANE_HEADER + tools.length * ROW + 8 : 44;

  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #ece8e1' }}>
      {/* gutter */}
      <div style={{ position: 'sticky', left: 0, zIndex: 3, flex: 'none', width: GUTTER, background: '#fbfaf8', borderRight: '1px solid #e7e3dd' }}>
        <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 8, height: LANE_HEADER, padding: '0 12px 0 14px', cursor: 'pointer' }}>
          <span style={{ display: 'inline-block', color: '#b4a99b', fontSize: 14, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>›</span>
          <span style={{ width: 10, height: 10, borderRadius: 3, flex: 'none', background: cat.color }} />
          <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: '#3a352e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: '#b4a99b' }}>{tools.length}</span>
        </div>
        {expanded && tools.map((t) => {
          const dimmed = toolDimmed(t);
          return (
            <div
              key={t.name}
              onClick={() => onSelect(t)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
                height: ROW, padding: '0 12px 0 34px', cursor: 'pointer', opacity: dimmed ? 0.35 : 1,
              }}
            >
              <span style={{ fontSize: 12.5, color: '#3a352e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: '#b4a99b', flex: 'none' }}>{t.releases.length > 1 ? `${t.releases.length} rel` : '·'}</span>
            </div>
          );
        })}
      </div>

      {/* time region */}
      <div style={{ position: 'relative', flex: 'none', width: TIME_WIDTH, height }}>
        {expanded
          ? tools.map((t, i) => {
              const dimmed = toolDimmed(t);
              const startX = xDate(t.firstDate);
              const endX = t.discontinued ? xDate(t.discontinued) : x(NOW);
              const isSel = selected && selected.name === t.name;
              return (
                <div
                  key={t.name}
                  onClick={() => onSelect(t)}
                  style={{ position: 'absolute', left: 0, top: LANE_HEADER + i * ROW, height: ROW, width: TIME_WIDTH, cursor: 'pointer', opacity: dimmed ? 0.22 : 1 }}
                >
                  <div style={{ position: 'absolute', top: ROW / 2 - 2, left: startX, width: Math.max(6, endX - startX), height: 4, borderRadius: 3, background: cat.color, opacity: isSel ? 0.85 : 0.5 }} />
                  {t.releases.map((r, di) => {
                    const size = di === 0 ? 9 : 6;
                    return (
                      <div key={di} style={{ position: 'absolute', top: ROW / 2 - size / 2, left: xDate(r.date) - size / 2, width: size, height: size, borderRadius: '50%', background: cat.color, boxShadow: '0 0 0 2px #f7f6f4' }} />
                    );
                  })}
                </div>
              );
            })
          : tools.map((t) => {
              const dimmed = toolDimmed(t);
              return (
                <div
                  key={t.name}
                  title={`${t.name} · ${t.startYear}`}
                  style={{ position: 'absolute', top: 19, left: xDate(t.firstDate) - 3, width: 6, height: 6, borderRadius: '50%', background: cat.color, opacity: dimmed ? 0.2 : 0.62 }}
                />
              );
            })}
      </div>
    </div>
  );
}
