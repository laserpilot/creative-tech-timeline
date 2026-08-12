import { useEffect, useMemo, useRef, useState } from 'react';
import { useTimelineData } from './useTimelineData.js';
import { useIsMobile } from './useIsMobile.js';
import Sidebar from './Sidebar.jsx';
import ToolDetail from './ToolDetail.jsx';
import YearDetail from './YearDetail.jsx';
import Disclaimer from './Disclaimer.jsx';
import About from './About.jsx';
import {
  YMIN, YMAX, NOW, VIEW_START, GUTTER, ROW, LANE_HEADER, EVH, EVR,
  CATEGORY_ORDER, LAYER_ORDER, DECADES, yearFrac, decadeOf,
  createScale, clampZoom, DEFAULT_PXY, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP,
} from './timelineConfig.js';

const BG = '#f7f6f4';
const MONO = "'IBM Plex Mono', ui-monospace, monospace";

function toggleIn(set, key) {
  const next = new Set(set);
  next.has(key) ? next.delete(key) : next.add(key);
  return next;
}

// On phones the desktop three-column layout collapses: the sidebar and detail
// panel become overlays, the label gutter narrows, and the timeline opens
// zoomed into a lively slice (the 2000s) rather than the whole 1960→now span.
const MOBILE_GUTTER = 118;
const MOBILE_PXY = 46;
const MOBILE_START_YEAR = 2003;

// Search-result event labels: widest a label may get, and the width below which
// it is dropped rather than shown as an ellipsis with a character or two.
const LABEL_MAX = 260;
const LABEL_MIN = 34;

// Does `needle` appear in `hay` in order, allowing gaps? Catches abbreviations
// and dropped letters that a plain substring test misses. Order-sensitive, so
// transposed letters ("touchdesginer") still miss.
function isSubsequence(needle, hay) {
  let i = 0;
  for (let j = 0; j < hay.length && i < needle.length; j++) if (hay[j] === needle[i]) i++;
  return i === needle.length;
}

// Punctuation-insensitive matching, so "artnet" finds "Art-Net", "p5js" finds
// "P5.js" and "maxmsp" finds "Max/MSP". Names in this field are full of
// hyphens, dots and slashes that nobody types in a search box.
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

// Search looks at the description and category label as well as the name, so a
// query lands on neighbours too: "vj" reaches Resolume and Modul8, "media
// server" reaches disguise and Pixera.
function matchesQuery(t, q) {
  if (!q) return true;
  const hay = `${t.name} ${t.description || ''} ${t.categoryName || ''}`;
  if (norm(hay).includes(norm(q))) return true;
  // Typo tolerance on the name only ("tuchdesigner" -> TouchDesigner). Gated to
  // longer queries, since short ones subsequence-match almost anything.
  return q.length >= 5 && isSubsequence(norm(q), norm(t.name));
}

// Events use the same normalized substring rule, but deliberately WITHOUT the
// subsequence fallback: event titles are long enough that scattered-letter
// matching drags in unrelated entries ("dante" pulling in "Radical Networks").
function eventMatches(e, q) {
  if (!q) return true;
  const hay = `${e.title} ${e.description || ''} ${e.layerName || ''}`;
  return norm(hay).includes(norm(q));
}

export default function Timeline() {
  const { loading, error, data } = useTimelineData();
  const isMobile = useIsMobile();
  const gutter = isMobile ? MOBILE_GUTTER : GUTTER;
  const startYear = isMobile ? MOBILE_START_YEAR : VIEW_START;
  const defaultPxy = isMobile ? MOBILE_PXY : DEFAULT_PXY;

  const [cats, setCats] = useState(null); // null = all on
  const [layers, setLayers] = useState(null);
  const [decades, setDecades] = useState(null);
  const [query, setQuery] = useState('');
  // 'events' opens twirled out: the context layers are the point of the piece,
  // not an optional extra. The desktop events pane is capped at 58% height so
  // the tool lanes stay on screen alongside it.
  const [expanded, setExpanded] = useState(() => new Set(['events', 'programming', 'audio-visual']));
  const [selected, setSelected] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [hoverEvent, setHoverEvent] = useState(null);
  const [pxy, setPxy] = useState(defaultPxy);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Driven off live `isMobile` (not latched at first render) so the hint still
  // appears if the mobile breakpoint resolves a beat after mount.
  const [hintDismissed, setHintDismissed] = useState(false);
  // Playhead: pointer X within the time region (px, gutter-relative), or null
  // when the cursor is over the label gutter or off the timeline.
  const [playhead, setPlayhead] = useState(null);
  // Desktop only: the events pane's height before the tool lanes. null = auto,
  // fitting the events content (so it grows when you expand the events lane);
  // dragging the divider pins it to a fixed pixel height.
  const [eventsPaneH, setEventsPaneH] = useState(null);
  const scrollRef = useRef(null); // events pane (also the sole scroller on mobile)
  const botRef = useRef(null);    // tools pane (desktop split)
  const splitRef = useRef(null);  // the two-pane column, for clamping the drag
  const syncingScroll = useRef(false);

  const scale = useMemo(() => createScale(pxy), [pxy]);

  // Open scrolled to VIEW_START rather than the far-left edge of the domain:
  // the 1970s–80s are context, but the story really starts around 1990.
  const didInitScroll = useRef(false);
  useEffect(() => {
    if (didInitScroll.current || !scrollRef.current) return;
    const x = (startYear - YMIN) * pxy;
    scrollRef.current.scrollLeft = x;
    if (botRef.current) botRef.current.scrollLeft = x;
    didInitScroll.current = true;
  });

  // The mobile "swipe to explore" hint fades on its own after a few seconds
  // (it also dismisses on the first touch of the timeline; see onPointerDown).
  // The mobile "swipe to explore" hint fades on its own after a few seconds
  // (it also dismisses on the first touch of the timeline; see onPointerDown).
  useEffect(() => {
    if (!isMobile || hintDismissed) return;
    const t = setTimeout(() => setHintDismissed(true), 5000);
    return () => clearTimeout(t);
  }, [isMobile, hintDismissed]);

  // Zoom about the horizontal centre of the viewport so the year under the
  // middle of the screen stays put.
  const zoomBy = (factor) => {
    const next = clampZoom(pxy * factor);
    if (next === pxy) return;
    const el = scrollRef.current;
    if (!el) { setPxy(next); return; }
    const centerYear = YMIN + (el.scrollLeft + el.clientWidth / 2 - gutter) / pxy;
    setPxy(next);
    requestAnimationFrame(() => {
      el.scrollLeft = (centerYear - YMIN) * next - el.clientWidth / 2 + gutter;
    });
  };

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

    // A category/layer the config doesn't know is dropped from the view. That
    // has bitten twice, so complain rather than quietly rendering less data.
    const badTools = data.tools.filter((t) => !catColor[t.category]);
    const badEvents = data.events.filter((e) => !layColor[e.layer]);
    if (badTools.length || badEvents.length) {
      console.warn(
        `[timeline] ${badTools.length} tool(s) and ${badEvents.length} event(s) are not rendered ` +
        `because their category/layer is missing from timelineConfig.js:`,
        { tools: badTools.map((t) => `${t.name} (${t.category})`), events: badEvents.map((e) => `${e.title} (${e.layer})`) }
      );
    }

    return { tools, events };
  }, [data]);

  // Filtering the lanes solves the vertical half of "find my match"; this solves
  // the horizontal half. A surviving tool can still sit far off the current
  // viewport along the time axis, so scroll the matched span into view. Held
  // back while the query still matches everything, and debounced so the
  // viewport settles rather than lurching on every keystroke.
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q || !prepared) return;
    const toolHits = prepared.tools.filter((t) => matchesQuery(t, q));
    const eventHits = prepared.events.filter((e) => eventMatches(e, q));
    const xs = toolHits.map((t) => scale.xDate(t.firstDate))
      .concat(eventHits.map((e) => scale.xDate(e.parsedDate)));
    if (!xs.length) return;
    if (toolHits.length === prepared.tools.length && eventHits.length === prepared.events.length) return;
    const timer = setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      const earliest = Math.min(...xs);
      // Leave a quarter-viewport of lead-in so the match reads in context
      // instead of pinned against the left edge.
      const target = Math.max(0, earliest - el.clientWidth * 0.25);
      el.scrollLeft = target;
      if (botRef.current) botRef.current.scrollLeft = target;
    }, 200);
    return () => clearTimeout(timer);
  }, [query, prepared, scale]);

  if (loading) return <div style={{ padding: 32, color: '#8a8175', fontSize: 13 }}>Loading timeline…</div>;
  if (error) return <div style={{ padding: 32, color: '#b23', fontSize: 13 }}>Error loading data: {error}</div>;
  if (!data || !prepared) return null;

  const { tools, events } = prepared;
  const catsOn = cats || new Set(CATEGORY_ORDER.map((c) => c.key));
  const layersOn = layers || new Set(LAYER_ORDER.map((l) => l.key));
  const decadesOn = decades || new Set(DECADES);
  const q = query.trim().toLowerCase();

  // Search removes non-matching rows rather than fading them: with 80+ tools a
  // dimmed hit is still buried in a wall of faded neighbours. Decade filtering
  // keeps dimming, which reads correctly as "outside the window you picked".
  const toolMatches = (t) => matchesQuery(t, q);
  const toolDimmed = (t) => !decadesOn.has(decadeOf(t.startYear));

  const catCount = Object.fromEntries(
    CATEGORY_ORDER.map((c) => [c.key, tools.filter((t) => t.category === c.key).length])
  );
  const layCount = Object.fromEntries(
    LAYER_ORDER.map((l) => [l.key, events.filter((e) => e.layer === l.key).length])
  );
  const shownTools = tools.filter((t) => catsOn.has(t.category) && toolMatches(t) && !toolDimmed(t)).length;

  const activeLayers = LAYER_ORDER.filter((l) => layersOn.has(l.key));
  const activeRow = Object.fromEntries(activeLayers.map((l, i) => [l.key, i]));
  // The context layers stay whole while searching. They are the backdrop the
  // tools are read against, so filtering them away defeats the point of the
  // piece. A query highlights and names the events it hits and fades the rest,
  // rather than removing them.
  const visEvents = events.filter((e) => layersOn.has(e.layer));
  const eventHits = q ? new Set(visEvents.filter((e) => eventMatches(e, q)).map((e) => e.id)) : null;
  // Fading the whole lane when nothing in it matches ghosts the backdrop without
  // saying anything. Leave the events at full strength in that case and let the
  // notice below carry the message.
  const matchedEvents = eventHits && eventHits.size ? eventHits : null;
  const noEventMatch = !!q && eventHits.size === 0;
  const eventsExpanded = expanded.has('events');
  const toolHits = tools.filter((t) => catsOn.has(t.category) && toolMatches(t)).length;

  const innerWidth = gutter + scale.timeWidth;
  const nowLeft = scale.x(NOW);

  // Track the pointer across the time region to drive the year playhead.
  const onTimelineMove = (e) => {
    const el = scrollRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const timePx = e.clientX - rect.left + el.scrollLeft - gutter;
    setPlayhead(timePx >= 0 && timePx <= scale.timeWidth ? timePx : null);
  };
  const playheadYear = playhead != null ? Math.floor(scale.yearAt(playhead)) : null;

  // Desktop split: the events and tools panes scroll vertically on their own but
  // must stay horizontally locked. Mirror scrollLeft between them; the guard (only
  // armed when we actually change a value) keeps the echo from looping.
  const mirrorScroll = (from, to) => {
    const a = from.current, b = to.current;
    if (syncingScroll.current) { syncingScroll.current = false; return; }
    if (!a || !b || a.scrollLeft === b.scrollLeft) return;
    syncingScroll.current = true;
    b.scrollLeft = a.scrollLeft;
  };
  const onTopScroll = () => mirrorScroll(scrollRef, botRef);
  const onBotScroll = () => mirrorScroll(botRef, scrollRef);

  // Drag the divider to trade height between the events pane and the tools below.
  const onDividerDown = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    // From auto height, start the drag at whatever the events pane renders now.
    const startH = eventsPaneH ?? scrollRef.current?.clientHeight ?? 248;
    const move = (ev) => {
      const max = (splitRef.current?.clientHeight ?? 800) - 140;
      setEventsPaneH(Math.max(96, Math.min(max, startH + (ev.clientY - startY))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  // The right panel shows one thing at a time — a tool OR a year slice.
  // Opening either clears the other so there's never a fight over the panel.
  const openTool = (t) => { setSelected(t); setSelectedYear(null); };
  const openYear = (yr) => { setSelectedYear(yr); setSelected(null); };
  const closePanel = () => { setSelected(null); setSelectedYear(null); };
  // Clicking an event opens the year slice it belongs to — the panel already
  // lists that event (un-dimmed) with its description, source, and neighbours,
  // and unlike the hover popover its text is selectable.
  const openEvent = (e) => openYear(Math.floor(yearFrac(e.parsedDate)));

  // ---- year axis + gridlines ----
  // At low zoom the 5-year labels crowd, so fall back to decades only.
  const tickStep = pxy < 22 ? 10 : 5;
  const ticks = [];
  for (let yr = YMIN; yr <= YMAX; yr++) {
    if (yr % tickStep !== 0) continue;
    ticks.push({ yr, left: scale.x(yr), decade: yr % 10 === 0 });
  }

  const gridlines = ticks.map((t) => (
    <div
      key={`grid-${t.yr}`}
      style={{
        position: 'absolute', top: 0, bottom: 0, width: 1,
        left: gutter + t.left, background: t.decade ? '#e7e2da' : '#f0ece5', zIndex: 0,
      }}
    />
  ));

  // Full-height vertical guides (now-line, pinned year slice, cursor playhead).
  // Rendered inside each scroll pane so they stay continuous across the split.
  const guides = (
    <>
      <div style={{ position: 'absolute', top: 0, bottom: 0, width: 0, left: gutter + nowLeft, borderLeft: '1px dashed #c3baac', zIndex: 1 }} />
      {selectedYear != null && (
        <>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: gutter + scale.x(selectedYear - 1), width: 3 * pxy, background: 'rgba(58,53,46,0.05)', zIndex: 2, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, width: 2, left: gutter + scale.x(selectedYear + 0.5) - 1, background: '#3a352e', opacity: 0.5, zIndex: 4, pointerEvents: 'none' }} />
        </>
      )}
      {playhead != null && (
        <div style={{ position: 'absolute', top: 0, bottom: 0, width: 1, left: gutter + playhead, background: '#3a352e', opacity: 0.3, zIndex: 4, pointerEvents: 'none' }} />
      )}
    </>
  );

  const yearAxis = (
    <div style={{ position: 'sticky', top: 0, zIndex: 5, display: 'flex', height: 40, background: BG, borderBottom: '1px solid #e7e3dd' }}>
      <div style={{ position: 'sticky', left: 0, zIndex: 6, flex: 'none', width: gutter, background: BG, borderRight: '1px solid #e7e3dd' }} />
      <div
        title="Click to inspect this year"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const yr = Math.floor(scale.yearAt(e.clientX - rect.left));
          if (yr >= YMIN && yr <= YMAX) openYear(yr);
        }}
        style={{ position: 'relative', flex: 'none', width: scale.timeWidth, height: '100%', cursor: 'pointer' }}
      >
        {ticks.map((t) => (
          <span key={`tick-${t.yr}`} style={{
            position: 'absolute', top: 13, left: t.left, transform: 'translateX(-50%)',
            fontFamily: MONO, fontSize: 11, whiteSpace: 'nowrap',
            color: t.decade ? '#4a443c' : '#b4a99b', fontWeight: t.decade ? 500 : 400,
          }}>{t.yr}</span>
        ))}
        <span style={{ position: 'absolute', top: 13, left: nowLeft + 5, fontFamily: MONO, fontSize: 10, color: '#a49a8d' }}>now</span>
        {playhead != null && (
          <span style={{
            position: 'absolute', top: 6, left: playhead, transform: 'translateX(-50%)',
            fontFamily: MONO, fontSize: 11, fontWeight: 600, color: '#fff', background: '#3a352e',
            borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 7,
          }}>{playheadYear}</span>
        )}
      </div>
    </div>
  );

  const eventsLaneEl = (
    <EventsLane
      expanded={eventsExpanded}
      // Twirling the lane open/closed releases any dragged height back to
      // auto-fit, so the divider snaps to the new content instead of leaving a
      // pinned pane stranded with empty space.
      onToggle={() => { setExpanded(toggleIn(expanded, 'events')); setEventsPaneH(null); }}
      count={visEvents.length}
      activeLayers={activeLayers}
      activeRow={activeRow}
      visEvents={visEvents}
      hoverEvent={hoverEvent}
      setHoverEvent={setHoverEvent}
      onSelectEvent={openEvent}
      scale={scale}
      gutter={gutter}
      matched={matchedEvents}
      noEventMatch={noEventMatch}
      query={query.trim()}
    />
  );

  const toolLanesEl = CATEGORY_ORDER.filter((c) => catsOn.has(c.key)).map((c) => {
    const laneTools = tools
      .filter((t) => t.category === c.key && toolMatches(t))
      .sort((a, b) => a.firstDate - b.firstDate);
    // A lane with nothing left to show is noise while searching, and a match
    // inside a collapsed lane may as well not exist, so open every lane that
    // survives the query.
    if (q && !laneTools.length) return null;
    return (
      <Lane
        key={c.key}
        cat={c}
        tools={laneTools}
        expanded={q ? true : expanded.has(c.key)}
        onToggle={() => setExpanded(toggleIn(expanded, c.key))}
        toolDimmed={toolDimmed}
        onSelect={openTool}
        selected={selected}
        scale={scale}
        gutter={gutter}
      />
    );
  });

  // Filtering means a query with no hits empties the pane entirely, which reads
  // as a broken page rather than an empty result. Say so instead — including the
  // half-empty case where events matched but no tool did, which otherwise leaves
  // this pane silently blank.
  const laneNotice = !q || toolHits > 0 ? null
    : eventHits.size
      ? `No tools match “${query.trim()}” — ${eventHits.size} matching event${eventHits.size === 1 ? '' : 's'} highlighted above.`
      : `No tools or events match “${query.trim()}”.`;

  const laneContent = laneNotice ? (
    // Sticky, because this sits inside the horizontally scrolled track: pinned
    // at the left edge it stays on screen wherever the timeline is panned to,
    // rather than sitting off-screen at x=0 of a 2000px-wide row.
    <div style={{
      position: 'sticky', left: 0, width: 'fit-content', maxWidth: '100%',
      padding: '28px 20px', fontSize: 12.5, color: '#8a8175', zIndex: 3,
    }}>
      {laneNotice}
    </div>
  ) : toolLanesEl;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: BG, color: '#3a352e' }}>
      <Disclaimer isMobile={isMobile} />
      <header style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: isMobile ? 8 : 16, padding: isMobile ? '8px 12px' : '14px 20px', borderBottom: '1px solid #e7e3dd', background: BG }}>
        <div style={{ display: 'flex', alignItems: isMobile ? 'center' : 'baseline', gap: isMobile ? 8 : 12, flexWrap: 'wrap', minWidth: 0 }}>
          {isMobile && (
            <button
              onClick={() => setFiltersOpen(true)}
              aria-label="Open filters"
              style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#6b6459', background: 'none', border: '1px solid #e0dbd3', borderRadius: 6, padding: '4px 9px', cursor: 'pointer' }}
            ><span style={{ fontSize: 13, lineHeight: 1 }}>☰</span> Filters</button>
          )}
          <h1 style={{ fontSize: isMobile ? 14 : 17, fontWeight: 600, letterSpacing: '-0.01em', color: '#2c2822', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isMobile ? 'Creative Tech Timeline' : 'Creative Technology Timeline'}</h1>
          {!isMobile && <p style={{ fontSize: 12.5, color: '#8a8175', margin: 0 }}>Tools, in the context of the hardware, standards, AI, art &amp; communities around them.</p>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14, flex: 'none' }}>
          <button
            onClick={() => setAboutOpen(true)}
            style={{ fontSize: 12.5, color: '#6b6459', background: 'none', border: '1px solid #e0dbd3', borderRadius: 6, padding: '3px 11px', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f1ede5'; e.currentTarget.style.color = '#2c2822'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b6459'; }}
          >About</button>
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: '#a49a8d' }}>{YMIN}</span>
              <span style={{ width: 60, height: 1, background: '#d8d2ca' }} />
              <span style={{ fontFamily: MONO, fontSize: 11, color: '#a49a8d' }}>{Math.floor(NOW)}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ZoomButton label="−" title="Zoom out" disabled={pxy <= ZOOM_MIN} onClick={() => zoomBy(1 / ZOOM_STEP)} />
            <ZoomButton label="+" title="Zoom in" disabled={pxy >= ZOOM_MAX} onClick={() => zoomBy(ZOOM_STEP)} />
            <button
              onClick={() => {
                setPxy(defaultPxy);
                requestAnimationFrame(() => {
                  if (scrollRef.current) scrollRef.current.scrollLeft = (startYear - YMIN) * defaultPxy;
                });
              }}
              title="Reset zoom and view"
              style={{ fontFamily: MONO, fontSize: 10.5, color: '#a49a8d', background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}
            >reset</button>
          </div>
        </div>
      </header>
      <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
      {/* Sidebar: an inline column on desktop; a slide-in drawer on mobile. */}
      {isMobile && filtersOpen && (
        <div
          onClick={() => setFiltersOpen(false)}
          style={{ position: 'absolute', inset: 0, background: 'rgba(40,34,30,0.35)', zIndex: 40 }}
        />
      )}
      {(!isMobile || filtersOpen) && (
      <Sidebar
        mobile={isMobile}
        onClose={isMobile ? () => setFiltersOpen(false) : null}
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
        onReset={() => { setCats(null); setLayers(null); setDecades(null); setQuery(''); closePanel(); }}
      />
      )}

      {/* Scrollable timeline. Mobile: one scroller. Desktop: two horizontally
          locked panes (events / tools) with a draggable divider so you can trade
          vertical space between them. */}
      {isMobile ? (
        <div
          ref={scrollRef}
          onMouseMove={onTimelineMove}
          onMouseLeave={() => setPlayhead(null)}
          onPointerDown={() => { if (!hintDismissed) setHintDismissed(true); }}
          style={{ flex: 1, overflow: 'auto', position: 'relative' }}
        >
          <div style={{ position: 'relative', minWidth: innerWidth }}>
            {gridlines}
            {guides}
            {yearAxis}
            {eventsLaneEl}
            {laneContent}
          </div>
        </div>
      ) : (
        <div ref={splitRef} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Events pane */}
          <div
            ref={scrollRef}
            onScroll={onTopScroll}
            onMouseMove={onTimelineMove}
            onMouseLeave={() => setPlayhead(null)}
            style={{ flex: 'none', height: eventsPaneH ?? 'auto', maxHeight: eventsPaneH == null ? '58%' : undefined, overflow: 'auto', position: 'relative' }}
          >
            <div style={{ position: 'relative', minWidth: innerWidth }}>
              {gridlines}
              {guides}
              {yearAxis}
              {eventsLaneEl}
            </div>
          </div>

          {/* Draggable divider */}
          <div
            onPointerDown={onDividerDown}
            title="Drag to give the events or the tools more room"
            style={{
              flex: 'none', height: 9, cursor: 'ns-resize', display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: '#efeae3', borderTop: '1px solid #e0dbd3', borderBottom: '1px solid #e0dbd3',
            }}
          >
            <div style={{ width: 38, height: 3, borderRadius: 2, background: '#cfc7bb' }} />
          </div>

          {/* Tools pane */}
          <div
            ref={botRef}
            onScroll={onBotScroll}
            onMouseMove={onTimelineMove}
            onMouseLeave={() => setPlayhead(null)}
            style={{ flex: 1, minHeight: 80, overflow: 'auto', position: 'relative' }}
          >
            <div style={{ position: 'relative', minWidth: innerWidth }}>
              {gridlines}
              {guides}
              {laneContent}
            </div>
          </div>
        </div>
      )}

      {/* Detail panel: an inline column on desktop; a bottom sheet on mobile. */}
      {isMobile && (selected || selectedYear != null) && (
        <div onClick={closePanel} style={{ position: 'absolute', inset: 0, background: 'rgba(40,34,30,0.35)', zIndex: 45 }} />
      )}
      {selected
        ? <ToolDetail mobile={isMobile} tool={selected} onClose={closePanel} />
        : selectedYear != null
          ? <YearDetail mobile={isMobile} year={selectedYear} events={events} tools={tools} onClose={closePanel} onSelectTool={openTool} />
          : null}

      {isMobile && !hintDismissed && !filtersOpen && !selected && selectedYear == null && (
        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 30,
          display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'none',
          background: 'rgba(38,34,30,0.9)', color: '#f7f6f4', fontFamily: MONO, fontSize: 11,
          padding: '6px 13px', borderRadius: 20, boxShadow: '0 6px 20px -8px rgba(40,34,30,0.6)', whiteSpace: 'nowrap',
        }}>← drag to explore the timeline →</div>
      )}
      </div>
      {aboutOpen && <About onClose={() => setAboutOpen(false)} />}
    </div>
  );
}

// ---------- Zoom button ----------
function ZoomButton({ label, title, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      style={{
        width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid #e0dbd3', borderRadius: 6, background: '#fff',
        color: disabled ? '#d8d2ca' : '#6b6459', cursor: disabled ? 'default' : 'pointer',
        fontSize: 13, lineHeight: 1, padding: 0,
      }}
    >{label}</button>
  );
}

// ---------- Events lane ----------
function EventsLane({ expanded, onToggle, count, activeLayers, activeRow, visEvents, hoverEvent, setHoverEvent, onSelectEvent, scale, gutter, matched, noEventMatch, query }) {
  const { xDate } = scale;
  const height = expanded ? EVH + activeLayers.length * EVR + 10 : 38;
  const hovered = hoverEvent != null ? visEvents[hoverEvent] : null;

  // How much horizontal room each label has before it would run into the next
  // matched dot on its own layer row. Clusters are the normal case on a timeline
  // — six Kinect events land within a few years of each other — and without this
  // their labels overlap into an unreadable smear. Clipping to the gap lets the
  // browser measure the text for us, so every match still gets named as far as
  // there is room for it.
  const labelRoom = {};
  if (matched) {
    const byRow = {};
    visEvents.forEach((e) => { if (matched.has(e.id)) (byRow[e.layer] ||= []).push(e); });
    Object.values(byRow).forEach((row) => {
      row.sort((a, b) => a.parsedDate - b.parsedDate);
      row.forEach((e, i) => {
        const next = row[i + 1];
        const room = next ? xDate(next.parsedDate) - xDate(e.parsedDate) - 13 : LABEL_MAX;
        labelRoom[e.id] = Math.min(LABEL_MAX, room);
      });
    });
  }

  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #ece8e1', background: 'rgba(247,246,244,0.4)' }}>
      <div style={{ position: 'sticky', left: 0, zIndex: 3, flex: 'none', width: gutter, background: BG, borderRight: '1px solid #e7e3dd' }}>
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

      <div style={{ position: 'relative', flex: 'none', width: scale.timeWidth, height }}>
        {/* ticks (always) */}
        {visEvents.map((e, i) => (
          <div
            key={`t-${e.id}`}
            onMouseEnter={() => setHoverEvent(i)}
            onMouseLeave={() => setHoverEvent(null)}
            onClick={() => onSelectEvent(e)}
            style={{
              position: 'absolute', top: 9, height: 20, width: 3, left: xDate(e.parsedDate) - 1,
              background: e.color, borderRadius: 2, cursor: 'pointer',
              opacity: matched && !matched.has(e.id) ? 0.15 : (hoverEvent === i ? 1 : 0.68),
            }}
          />
        ))}
        {/* lifespan bars for events with an end date (behind the dots) */}
        {expanded && visEvents.map((e, i) => {
          if (!e.endDate) return null;
          const startX = xDate(e.parsedDate);
          const endX = xDate(e.endDate);
          const top = EVH + activeRow[e.layer] * EVR;
          return (
            <div key={`s-${e.id}`}>
              <div
                onMouseEnter={() => setHoverEvent(i)}
                onMouseLeave={() => setHoverEvent(null)}
                onClick={() => onSelectEvent(e)}
                style={{
                  position: 'absolute', top: top + EVR - 5, left: startX,
                  width: Math.max(4, endX - startX), height: 3, borderRadius: 2,
                  background: e.color, opacity: hoverEvent === i ? 0.6 : 0.34, cursor: 'pointer',
                }}
              />
              {/* end cap: this one actually stopped */}
              <div style={{
                position: 'absolute', top: top + EVR - 8, left: endX - 1,
                width: 2, height: 6, background: e.color, opacity: 0.6,
              }} />
            </div>
          );
        })}

        {/* dots per layer row (expanded) */}
        {expanded && visEvents.map((e, i) => {
          const size = hoverEvent === i ? 12 : 9;
          const top = EVH + activeRow[e.layer] * EVR + (EVR - size) / 2;
          return (
            <div
              key={`d-${e.id}`}
              onMouseEnter={() => setHoverEvent(i)}
              onMouseLeave={() => setHoverEvent(null)}
              onClick={() => onSelectEvent(e)}
              style={{
                position: 'absolute', top, left: xDate(e.parsedDate) - size / 2, width: size, height: size,
                borderRadius: '50%', background: e.color, boxShadow: '0 0 0 2px #f7f6f4', cursor: 'pointer',
                opacity: matched && !matched.has(e.id) ? 0.18 : 1,
              }}
            />
          );
        })}
        {/* Names, while a search is running. Events are otherwise anonymous
            dots whose title only appears on hover, so a search that narrows to
            three dots still leaves you unable to tell which is which. Labels
            stay off when no query is active, where 170+ of them would collide. */}
        {expanded && matched && visEvents.map((e, i) => {
          if (!matched.has(e.id)) return null;
          // Too tight to read even truncated; the dot stays lit and hover names it.
          if (labelRoom[e.id] < LABEL_MIN) return null;
          const top = EVH + activeRow[e.layer] * EVR + (EVR - 9) / 2;
          return (
            <div
              key={`l-${e.id}`}
              title={e.title}
              onMouseEnter={() => setHoverEvent(i)}
              onMouseLeave={() => setHoverEvent(null)}
              onClick={() => onSelectEvent(e)}
              style={{
                position: 'absolute', top: top - 3, left: xDate(e.parsedDate) + 9,
                maxWidth: labelRoom[e.id], overflow: 'hidden', textOverflow: 'ellipsis',
                fontSize: 11, lineHeight: '15px', color: '#3a352e', whiteSpace: 'nowrap',
                background: 'rgba(247,246,244,0.92)', padding: '0 5px', borderRadius: 3,
                pointerEvents: 'auto', cursor: 'pointer', zIndex: 2,
              }}
            >
              {e.title}
            </div>
          );
        })}
        {/* Sticky for the same reason as the tool-lane notice: it has to survive
            being panned away from. Pinned at `gutter` rather than 0, since the
            layer-name column is itself sticky at the left edge and would
            otherwise be covered by this. */}
        {expanded && noEventMatch && (
          <div style={{
            position: 'sticky', left: gutter + 10, width: 'fit-content', marginTop: EVH - 2,
            padding: '0 8px', fontSize: 11.5, lineHeight: '18px', color: '#8a8175',
            background: BG, borderRadius: 3, zIndex: 2,
          }}>
            No events match “{query}”.
          </div>
        )}
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
              {hovered.endDate ? ` – ${Math.floor(yearFrac(hovered.endDate))}` : ''}
            </div>
            {hovered.description && <div style={{ fontSize: 11.5, color: '#6b6459', lineHeight: 1.45 }}>{hovered.description}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

const fmtDate = (d) =>
  d instanceof Date && !isNaN(d)
    ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

// ---------- Category lane ----------
function Lane({ cat, tools, expanded, onToggle, toolDimmed, onSelect, selected, scale, gutter }) {
  const { x, xDate } = scale;
  // Hovering a release dot describes that release; hovering the rest of the row
  // describes the tool. The dot wins while the pointer is actually over it.
  const [hoverTool, setHoverTool] = useState(null);
  const [hoverRel, setHoverRel] = useState(null);
  const height = expanded ? LANE_HEADER + tools.length * ROW + 8 : 44;
  const hovered = hoverRel || hoverTool;

  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #ece8e1' }}>
      {/* gutter */}
      <div style={{ position: 'sticky', left: 0, zIndex: 3, flex: 'none', width: gutter, background: '#fbfaf8', borderRight: '1px solid #e7e3dd' }}>
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
                display: 'flex', alignItems: 'center', gap: 6,
                height: ROW, padding: '0 12px 0 34px', cursor: 'pointer', opacity: dimmed ? 0.35 : 1,
              }}
            >
              <span style={{ fontSize: 11.5, color: '#3a352e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</span>
            </div>
          );
        })}
      </div>

      {/* time region */}
      <div style={{ position: 'relative', flex: 'none', width: scale.timeWidth, height }}>
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
                  onMouseEnter={() => setHoverTool({ t, i })}
                  onMouseLeave={() => { setHoverTool(null); setHoverRel(null); }}
                  style={{ position: 'absolute', left: 0, top: LANE_HEADER + i * ROW, height: ROW, width: scale.timeWidth, cursor: 'pointer', opacity: dimmed ? 0.22 : 1 }}
                >
                  <div style={{ position: 'absolute', top: ROW / 2 - 2, left: startX, width: Math.max(6, endX - startX), height: 4, borderRadius: 3, background: cat.color, opacity: isSel || hoverTool?.t === t ? 0.85 : 0.5 }} />
                  {t.releases.map((r, di) => {
                    const hot = hoverRel?.t === t && hoverRel?.di === di;
                    const size = hot ? 11 : di === 0 ? 9 : 6;
                    return (
                      <div
                        key={di}
                        onMouseEnter={() => setHoverRel({ t, i, r, di })}
                        onMouseLeave={() => setHoverRel(null)}
                        style={{ position: 'absolute', top: ROW / 2 - size / 2, left: xDate(r.date) - size / 2, width: size, height: size, borderRadius: '50%', background: cat.color, boxShadow: '0 0 0 2px #f7f6f4' }}
                      />
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

        {/* Hover card. Sits outside the tool rows so it doesn't inherit their
            dimmed opacity. */}
        {expanded && hovered && (
          <div style={{
            position: 'absolute',
            top: LANE_HEADER + hovered.i * ROW + ROW + 2,
            left: Math.max(0, (hoverRel ? xDate(hovered.r.date) : xDate(hovered.t.firstDate)) - 10),
            zIndex: 50, width: 220, background: '#fff', border: '1px solid #e7e3dd',
            borderLeft: `3px solid ${cat.color}`, borderRadius: 8,
            boxShadow: '0 12px 32px -14px rgba(40,34,30,0.4)', padding: '9px 12px', pointerEvents: 'none',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#2c2822', marginBottom: 3 }}>{hovered.t.name}</div>
            {hoverRel ? (
              <>
                <div style={{ fontFamily: MONO, fontSize: 10, color: '#a49a8d', marginBottom: hovered.r.notes ? 5 : 0 }}>
                  {hovered.r.version || `Release ${hovered.di + 1}`} · {fmtDate(hovered.r.date)}
                </div>
                {hovered.r.notes && <div style={{ fontSize: 11.5, color: '#6b6459', lineHeight: 1.45 }}>{hovered.r.notes}</div>}
              </>
            ) : (
              <>
                <div style={{ fontFamily: MONO, fontSize: 10, color: '#a49a8d', marginBottom: hovered.t.description ? 5 : 0 }}>
                  {hovered.t.startYear}–{hovered.t.discontinued ? hovered.t.discontinued.getFullYear() : 'present'}
                  {' · '}{hovered.t.releases.length} release{hovered.t.releases.length === 1 ? '' : 's'}
                </div>
                {hovered.t.description && <div style={{ fontSize: 11.5, color: '#6b6459', lineHeight: 1.45 }}>{hovered.t.description}</div>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
