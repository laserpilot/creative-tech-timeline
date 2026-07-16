import { useState } from 'react';

const MONO = "'IBM Plex Mono', ui-monospace, monospace";
const KEY = 'ccTimelineNoticeDismissed';

// Provisional-data notice. The timeline is published while the underlying
// dataset is still being checked, so say so plainly.
export default function Disclaimer() {
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
  });
  if (dismissed) return null;

  return (
    <div
      role="note"
      style={{
        flex: 'none', display: 'flex', alignItems: 'center', gap: 10,
        padding: '7px 14px', font: `12px/1.45 ${MONO}`, color: '#5b5348',
        background: '#fdf6e7', borderBottom: '1px solid #ecdfc2',
      }}
    >
      <span style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ color: '#8a4b2f', fontWeight: 600 }}>⚠ Work in progress</strong>
        {'. Dates and details are provisional and still being checked for accuracy. Please verify before citing.'}
      </span>
      <button
        onClick={() => {
          try { sessionStorage.setItem(KEY, '1'); } catch { /* non-fatal */ }
          setDismissed(true);
        }}
        style={{
          flex: 'none', cursor: 'pointer', border: '1px solid #e0d3b0', background: 'transparent',
          color: '#6b6459', font: 'inherit', padding: '2px 10px', borderRadius: 5,
        }}
      >Dismiss</button>
    </div>
  );
}
