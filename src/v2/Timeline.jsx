import { useMemo, useState } from 'react';
import { scaleTime } from 'd3-scale';
import { useTimelineData } from './useTimelineData.js';
import Controls from './Controls.jsx';
import ToolDetail from './ToolDetail.jsx';

const PIXELS_PER_YEAR = 56;
const AXIS_WIDTH = 64;
const EVENTS_WIDTH = 380;
const TOOL_COL_WIDTH = 30;
const TOOL_BAR_WIDTH = 4;
const TOP_PAD = 140;
const BOTTOM_PAD = 60;

export default function Timeline() {
  const { loading, error, data } = useTimelineData();
  const [enabledLayers, setEnabledLayers] = useState(null);
  const [highlightedCategory, setHighlightedCategory] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null);

  const effectiveLayers = useMemo(() => {
    if (enabledLayers) return enabledLayers;
    if (!data) return new Set();
    return new Set(Object.keys(data.layers));
  }, [enabledLayers, data]);

  const layout = useMemo(() => {
    if (!data) return null;
    const { tools, events } = data;

    const allDates = [
      ...tools.flatMap((t) => [t.firstDate, t.latestDate]),
      ...events.map((e) => e.parsedDate),
    ];
    const minYear = Math.min(...allDates.map((d) => d.getFullYear())) - 1;
    const maxYear = Math.max(
      ...allDates.map((d) => d.getFullYear()),
      new Date().getFullYear()
    );

    const domainMin = new Date(minYear, 0, 1);
    const domainMax = new Date(maxYear + 1, 0, 1);
    const span = maxYear + 1 - minYear;
    const totalHeight = span * PIXELS_PER_YEAR + TOP_PAD + BOTTOM_PAD;

    const y = scaleTime()
      .domain([domainMin, domainMax])
      .range([TOP_PAD, totalHeight - BOTTOM_PAD]);

    const years = [];
    for (let yr = minYear; yr <= maxYear + 1; yr++) years.push(yr);
    return { y, totalHeight, years };
  }, [data]);

  if (loading) return <div className="p-8 text-stone-500 text-sm">Loading timeline…</div>;
  if (error) return <div className="p-8 text-red-600 text-sm">Error loading data: {error}</div>;
  if (!data || !layout) return null;

  const { tools, events, layers, categories } = data;
  const { y, totalHeight, years } = layout;

  const visibleEvents = events.filter((e) => effectiveLayers.has(e.layer));

  // Greedy collision resolution: ensure event rows are spaced by MIN_GAP.
  const MIN_GAP = 22;
  let lastBottom = -Infinity;
  const positionedEvents = visibleEvents.map((e) => {
    const anchorY = y(e.parsedDate);
    const top = Math.max(anchorY, lastBottom + MIN_GAP);
    lastBottom = top;
    return { ...e, anchorY, top, shifted: top !== anchorY };
  });

  const toolsAreaLeft = AXIS_WIDTH + EVENTS_WIDTH;
  const toolsAreaWidth = tools.length * TOOL_COL_WIDTH;
  const totalWidth = toolsAreaLeft + toolsAreaWidth + 40;
  const now = new Date();
  const nowY = y(now);

  const toggleLayer = (key) => {
    const next = new Set(effectiveLayers);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setEnabledLayers(next);
  };

  const selectedCategoryDef = selectedTool ? categories[selectedTool.category] : null;

  return (
    <>
      <Controls
        layers={layers}
        enabledLayers={effectiveLayers}
        onToggleLayer={toggleLayer}
        categories={categories}
        highlightedCategory={highlightedCategory}
        onHighlightCategory={setHighlightedCategory}
        toolCount={tools.length}
        eventCount={visibleEvents.length}
      />

      <div className="w-full overflow-x-auto">
        <div
          className="relative mx-auto"
          style={{ width: totalWidth, height: totalHeight }}
        >
          {/* Full-width gridlines */}
          {years.map((year) => {
            const top = y(new Date(year, 0, 1));
            const isDecade = year % 10 === 0;
            if (!isDecade && year % 5 !== 0) return null;
            return (
              <div
                key={`grid-${year}`}
                className={isDecade ? 'border-t border-stone-200' : 'border-t border-stone-100'}
                style={{ position: 'absolute', top, left: AXIS_WIDTH, right: 0 }}
              />
            );
          })}

          {/* "Now" line */}
          <div
            className="absolute border-t border-dashed border-stone-400"
            style={{ top: nowY, left: AXIS_WIDTH, right: 0 }}
          />
          <div
            className="absolute text-[10px] font-mono text-stone-500 bg-stone-50 px-1"
            style={{ top: nowY - 7, left: AXIS_WIDTH + 4 }}
          >
            today
          </div>

          {/* Time axis (labels only — lines drawn above) */}
          <div
            className="absolute top-0"
            style={{ left: 0, width: AXIS_WIDTH, height: totalHeight }}
          >
            {years.map((year) => {
              const top = y(new Date(year, 0, 1));
              const isDecade = year % 10 === 0;
              const isHalf = year % 5 === 0;
              if (!isDecade && !isHalf) return null;
              return (
                <span
                  key={`label-${year}`}
                  className={`absolute left-2 -translate-y-1/2 text-xs font-mono ${
                    isDecade ? 'text-stone-900 font-semibold' : 'text-stone-400'
                  }`}
                  style={{ top }}
                >
                  {year}
                </span>
              );
            })}
          </div>

          {/* Events column */}
          <div
            className="absolute top-0"
            style={{ left: AXIS_WIDTH, width: EVENTS_WIDTH, height: totalHeight }}
          >
            {positionedEvents.map((e) => {
              const isExpanded = expandedEvent === e.id;
              return (
                <div key={e.id}>
                  {/* Anchor dot at exact date */}
                  <div
                    className="absolute w-2 h-2 rounded-full ring-2 ring-stone-50"
                    style={{
                      top: e.anchorY - 4,
                      left: 14,
                      background: e.color,
                    }}
                  />
                  {/* Leader line if shifted */}
                  {e.shifted && (
                    <div
                      className="absolute border-l border-dotted border-stone-300"
                      style={{
                        top: e.anchorY,
                        left: 18,
                        height: e.top - e.anchorY,
                      }}
                    />
                  )}
                  {/* Card */}
                  <div
                    className={`absolute cursor-pointer rounded px-2 -mx-1 hover:bg-stone-100 ${
                      isExpanded ? 'bg-stone-100' : ''
                    }`}
                    style={{ top: e.top - 8, left: 24, right: 16 }}
                    onClick={() => setExpandedEvent(isExpanded ? null : e.id)}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] text-stone-400 font-mono whitespace-nowrap">
                        {e.date}
                      </span>
                      <span className="text-sm text-stone-900 font-medium leading-tight">
                        {e.title}
                      </span>
                    </div>
                    {isExpanded && (
                      <div className="mt-1 mb-1 pl-1">
                        {e.description && (
                          <p className="text-xs text-stone-600 leading-snug">{e.description}</p>
                        )}
                        <div className="text-[10px] text-stone-400 uppercase tracking-wide font-mono mt-1">
                          {layers[e.layer]?.name || e.layer}
                          {e.link && (
                            <>
                              {' · '}
                              <a
                                href={e.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-stone-700"
                                onClick={(ev) => ev.stopPropagation()}
                              >
                                source ↗
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tools area */}
          <div
            className="absolute top-0"
            style={{ left: toolsAreaLeft, width: toolsAreaWidth, height: totalHeight }}
          >
            {tools.map((t, i) => {
              const colLeft = i * TOOL_COL_WIDTH;
              const lifelineTop = y(t.firstDate);
              const lifelineEnd = t.discontinued ? y(t.discontinued) : nowY;
              const lifelineHeight = Math.max(2, lifelineEnd - lifelineTop);

              const dimmed =
                highlightedCategory !== null && t.category !== highlightedCategory;
              const isSelected = selectedTool && selectedTool.name === t.name;

              return (
                <div
                  key={t.name}
                  className={`group absolute cursor-pointer transition-opacity ${
                    dimmed ? 'opacity-15 hover:opacity-60' : 'opacity-100'
                  }`}
                  style={{ left: colLeft, top: 0, width: TOOL_COL_WIDTH, height: '100%' }}
                  onClick={() => setSelectedTool(t)}
                >
                  <div
                    className={`absolute text-xs whitespace-nowrap font-medium ${
                      isSelected ? 'text-stone-900' : 'text-stone-600 group-hover:text-stone-900'
                    }`}
                    style={{
                      top: TOP_PAD - 12,
                      left: TOOL_COL_WIDTH / 2,
                      transform: 'rotate(-55deg)',
                      transformOrigin: 'left bottom',
                    }}
                  >
                    {t.name}
                  </div>

                  <div
                    className={`absolute rounded-sm transition-opacity ${
                      isSelected ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'
                    }`}
                    style={{
                      top: lifelineTop,
                      height: lifelineHeight,
                      left: (TOOL_COL_WIDTH - TOOL_BAR_WIDTH) / 2,
                      width: isSelected ? TOOL_BAR_WIDTH + 2 : TOOL_BAR_WIDTH,
                      background: t.color,
                    }}
                  />

                  {t.releases.map((r, idx) => {
                    const isMajor = r.major || idx === 0;
                    const size = isMajor ? 8 : 5;
                    return (
                      <div
                        key={idx}
                        className="absolute rounded-full ring-1 ring-stone-50 pointer-events-none"
                        style={{
                          top: y(r.date) - size / 2,
                          left: TOOL_COL_WIDTH / 2 - size / 2,
                          width: size,
                          height: size,
                          background: t.color,
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ToolDetail
        tool={selectedTool}
        category={selectedCategoryDef}
        onClose={() => setSelectedTool(null)}
      />
    </>
  );
}
