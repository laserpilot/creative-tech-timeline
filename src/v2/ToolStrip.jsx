export default function ToolStrip({ tools, scrollDate, onJumpTo }) {
  return (
    <div className="sticky top-[97px] z-20 bg-stone-50/95 backdrop-blur border-b border-stone-200">
      <div className="max-w-[1800px] mx-auto px-4 py-2 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs whitespace-nowrap">
          <span className="text-stone-500 uppercase tracking-wide font-mono text-[10px] shrink-0">
            Tools
          </span>
          {tools.map((t) => {
            const active = scrollDate && t.firstDate <= scrollDate;
            return (
              <button
                key={t.name}
                onClick={() => onJumpTo(t)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-opacity ${
                  active
                    ? 'opacity-100 border-stone-300 bg-white hover:bg-stone-100'
                    : 'opacity-30 hover:opacity-70 border-stone-200 bg-white'
                }`}
                title={`Jump to ${t.name} (${t.firstDate.getFullYear()})`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: t.color }}
                />
                <span className="text-stone-700">{t.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
