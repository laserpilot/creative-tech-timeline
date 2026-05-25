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

  // Initialize enabledLayers once data arrives
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

  const toolsAreaLeft = AXIS_WIDTH + EVENTS_WIDTH;
  const toolsAreaWidth = tools.length * TOOL_COL_WIDTH;
  const totalWidth = toolsAreaLeft + toolsAreaWidth + 40;
  const now = new Date();

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
          {/* Time axis */}
          <div className="absolute top-0" style={{ left: 0, width: AXIS_WIDTH, height: totalHeight }}>
            {years.map((year) => {
              const top = y(new Date(year, 0, 1));
              const isDecade = year % 10 === 0;
              const isHalf = year % 5 === 0;
              return (
                <div key={year} style={{ position: 'absolute', top, left: 0, right: 0 }}>
                  <div
                    className={isDecade ? 'border-t border-stone-300' : 'border-t border-stone-100'}
                    style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
                  />
                  {(isDecade || isHalf) && (
                    <span
                      className={`absolute left-2 -translate-y-1/2 text-xs font-mono ${
                        isDecade ? 'text-stone-900 font-semibold' : 'text-stone-400'
                      }`}
                    >
                      {year}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Events column */}
          <div
            className="absolute top-0"
            style={{ left: AXIS_WIDTH, width: EVENTS_WIDTH, height: totalHeight }}
          >
            {visibleEvents.map((e) => {
              const top = y(e.parsedDate);
              return (
                <div
                  key={e.id}
                  style={{ position: 'absolute', top, left: 16, right: 16 }}
                  className="-translate-y-2"
                >
                  <div className="flex gap-3">
                    <div
                      className="mt-2 w-2.5 h-2.5 rounded-full ring-2 ring-stone-50 shrink-0"
                      style={{ background: e.color }}
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] text-stone-400 font-mono tracking-wide uppercase">
                        {e.date} · {layers[e.layer]?.name || e.layer}
                      </div>
                      <div className="text-sm text-stone-900 font-medium leading-tight">
                        {e.title}
                      </div>
                      {e.description && (
                        <div className="text-xs text-stone-600 mt-0.5 leading-snug">
                          {e.description}
                        </div>
                      )}
                      {e.link && (
                        <a
                          href={e.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-stone-400 hover:text-stone-700 mt-0.5 inline-block"
                        >
                          source →
                        </a>
                      )}
                    </div>
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
              const lifelineEnd = t.discontinued ? y(t.discontinued) : y(now);
              const lifelineHeight = Math.max(2, lifelineEnd - lifelineTop);

              const dimmed =
                highlightedCategory !== null && t.category !== highlightedCategory;
              const isSelected = selectedTool && selectedTool.name === t.name;

              return (
                <div
                  key={t.name}
                  className={`group absolute cursor-pointer transition-opacity ${
                    dimmed ? 'opacity-20 hover:opacity-60' : 'opacity-100'
                  }`}
                  style={{ left: colLeft, top: 0, width: TOOL_COL_WIDTH, height: '100%' }}
                  onClick={() => setSelectedTool(t)}
                >
                  {/* Rotated label */}
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

                  {/* Lifeline bar */}
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

                  {/* Release ticks */}
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
