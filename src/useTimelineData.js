import { useEffect, useState } from 'react';
import { processTools, processEvents } from './data.js';

export function useTimelineData() {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    let cancelled = false;
    // Base-relative so the app works both at the dev root and under the
    // GitHub Pages project subpath (/creative-tech-timeline/).
    const base = import.meta.env.BASE_URL;
    Promise.all([
      fetch(`${base}creative-code-data.json`).then((r) => r.json()),
      fetch(`${base}events.json`).then((r) => r.json()),
    ])
      .then(([toolsFile, eventsFile]) => {
        if (cancelled) return;
        const categories = toolsFile.categories || {};
        const layers = eventsFile.layers || {};
        const tools = processTools(toolsFile.tools, categories);
        const events = processEvents(eventsFile.events, layers);
        setState({
          loading: false,
          error: null,
          data: { tools, events, categories, layers },
        });
      })
      .catch((err) => {
        if (!cancelled) setState({ loading: false, error: err.message, data: null });
      });
    return () => { cancelled = true; };
  }, []);

  return state;
}
