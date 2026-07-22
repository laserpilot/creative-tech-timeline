import { useEffect, useState } from 'react';

// True when the viewport is at or below `breakpoint` px wide. Used to switch
// the layout from the desktop three-column view (sidebar · timeline · panel)
// to a mobile one where the sidebar and detail panel become overlays.
export function useIsMobile(breakpoint = 768) {
  const query = `(max-width: ${breakpoint}px)`;
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return isMobile;
}
