import { useState } from 'react';

export default function BeforeStrip({ events, layers }) {
  const [expandedId, setExpandedId] = useState(null);
  if (!events || events.length === 0) return null;

  return (
    <div className="border-b border-stone-200 bg-stone-100/60">
      <div className="max-w-[1800px] mx-auto px-4 py-2 flex flex-wrap items-start gap-x-4 gap-y-2 text-xs">
        <div className="text-stone-500 uppercase tracking-wide font-mono text-[10px] pt-1 shrink-0">
          Before 1990
        </div>
        <div className="flex flex-wrap items-start gap-x-3 gap-y-2 flex-1 min-w-0">
          {events.map((e) => {
            const expanded = expandedId === e.id;
            return (
              <div key={e.id} className="max-w-md">
                <button
                  onClick={() => setExpandedId(expanded ? null : e.id)}
                  className={`flex items-baseline gap-1.5 text-left rounded px-1.5 -mx-1.5 py-0.5 hover:bg-stone-200/60 ${
                    expanded ? 'bg-stone-200/60' : ''
                  }`}
                >
                  <span
                    className="self-center w-2 h-2 rounded-full shrink-0"
                    style={{ background: e.color }}
                  />
                  <span className="font-mono text-stone-400">{e.date.slice(0, 4)}</span>
                  <span className="text-stone-900 font-medium">{e.title}</span>
                </button>
                {expanded && (
                  <div className="mt-1 pl-5 max-w-md">
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
                          >
                            source ↗
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
