import { useState } from 'react';
import Timeline from './v2/Timeline.jsx';
import LegacyTimeline from './legacy/CreativeCodeTimeline.jsx';

export default function App() {
  const [view, setView] = useState('v2');

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-stone-50/90 backdrop-blur border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-baseline justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Creative Coding Timeline</h1>
            <p className="text-xs text-stone-500">Tools, in the context of the hardware, standards, AI, art, and communities around them.</p>
          </div>
          <nav className="flex gap-1 text-xs">
            <button
              onClick={() => setView('v2')}
              className={`px-2 py-1 rounded ${view === 'v2' ? 'bg-stone-900 text-stone-50' : 'text-stone-600 hover:text-stone-900'}`}
            >
              Timeline
            </button>
            <button
              onClick={() => setView('legacy')}
              className={`px-2 py-1 rounded ${view === 'legacy' ? 'bg-stone-900 text-stone-50' : 'text-stone-600 hover:text-stone-900'}`}
            >
              Legacy view
            </button>
          </nav>
        </div>
      </header>
      <main>
        {view === 'v2' ? <Timeline /> : <LegacyTimeline />}
      </main>
    </div>
  );
}
