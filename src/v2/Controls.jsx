export default function Controls({
  layers,
  enabledLayers,
  onToggleLayer,
  categories,
  highlightedCategory,
  onHighlightCategory,
  toolCount,
  eventCount,
}) {
  return (
    <div className="sticky top-[57px] z-30 bg-stone-50/95 backdrop-blur border-b border-stone-200">
      <div className="max-w-[1800px] mx-auto px-4 py-2.5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
        <div className="flex items-center gap-1.5 text-stone-500">
          <span className="font-mono">{toolCount}</span> tools
          <span className="text-stone-300">·</span>
          <span className="font-mono">{eventCount}</span> events
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-stone-500 mr-1">Layers:</span>
          {Object.entries(layers).map(([key, layer]) => {
            const on = enabledLayers.has(key);
            return (
              <button
                key={key}
                onClick={() => onToggleLayer(key)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition ${
                  on
                    ? 'bg-stone-900 text-stone-50 border-stone-900'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: on ? layer.color : '#d6d3d1' }}
                />
                {layer.name}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-stone-500 mr-1">Highlight:</span>
          <button
            onClick={() => onHighlightCategory(null)}
            className={`px-2 py-0.5 rounded-full border ${
              highlightedCategory === null
                ? 'bg-stone-900 text-stone-50 border-stone-900'
                : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
            }`}
          >
            All
          </button>
          {Object.entries(categories).map(([key, cat]) => {
            const active = highlightedCategory === key;
            return (
              <button
                key={key}
                onClick={() => onHighlightCategory(active ? null : key)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
                  active
                    ? 'bg-stone-900 text-stone-50 border-stone-900'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: cat.color }}
                />
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
