import { X } from 'lucide-react';

const fmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export default function ToolDetail({ tool, category, onClose }) {
  if (!tool) return null;
  return (
    <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white border-l border-stone-200 shadow-2xl z-50 flex flex-col">
      <div className="p-4 border-b border-stone-200 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-stone-500 font-mono">
            <span className="w-2 h-2 rounded-full" style={{ background: tool.color }} />
            {category?.name || tool.category}
          </div>
          <h2 className="text-xl font-semibold mt-1">{tool.name}</h2>
          {tool.description && (
            <p className="text-sm text-stone-600 mt-1 leading-snug">{tool.description}</p>
          )}
          <div className="text-xs text-stone-400 mt-2 font-mono">
            {fmt.format(tool.firstDate)} → {tool.discontinued ? fmt.format(tool.discontinued) : 'present'}
            <span className="mx-2">·</span>
            {tool.releases.length} release{tool.releases.length === 1 ? '' : 's'}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-stone-900 p-1 -mr-1 -mt-1"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-stone-50 text-[10px] uppercase tracking-wide text-stone-500 font-mono">
            <tr>
              <th className="text-left px-4 py-2 font-normal">Date</th>
              <th className="text-left px-4 py-2 font-normal">Version</th>
              <th className="text-left px-4 py-2 font-normal">Notes</th>
            </tr>
          </thead>
          <tbody>
            {[...tool.releases].reverse().map((r, i) => (
              <tr key={i} className="border-t border-stone-100 hover:bg-stone-50">
                <td className="px-4 py-2 text-stone-700 font-mono text-xs whitespace-nowrap">
                  {r.dateString}
                </td>
                <td className="px-4 py-2 text-stone-900 whitespace-nowrap">{r.version || '—'}</td>
                <td className="px-4 py-2 text-stone-600 text-xs">
                  {r.notes || ''}
                  {r.link && (
                    <a
                      href={r.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-400 hover:text-stone-900 ml-1"
                    >
                      ↗
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
