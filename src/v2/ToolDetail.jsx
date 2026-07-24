import { useState } from 'react';

const MONO = "'IBM Plex Mono', ui-monospace, monospace";

const fmt = (d) =>
  d instanceof Date && !isNaN(d)
    ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

export default function ToolDetail({ tool, onClose, mobile }) {
  const [tab, setTab] = useState('releases');
  if (!tool) return null;

  const releases = [...tool.releases].sort((a, b) => a.date - b.date);
  const first = releases[0]?.date;
  const rangeStart = first ? first.getFullYear() : tool.startYear;
  const end = tool.discontinued ? tool.discontinued.getFullYear() : 'present';

  const asideStyle = mobile
    ? {
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 50,
        maxHeight: '75%', overflowY: 'auto', background: '#fff',
        borderTop: '1px solid #e7e3dd', borderRadius: '14px 14px 0 0',
        boxShadow: '0 -14px 34px -18px rgba(40,34,30,0.4)',
      }
    : { flex: 'none', width: 320, height: '100%', overflowY: 'auto', background: '#fff', borderLeft: '1px solid #e7e3dd', boxSizing: 'border-box', boxShadow: '-12px 0 32px -20px rgba(40,34,30,0.25)' };

  return (
    <aside style={asideStyle}>
      <div style={{ padding: '16px 18px', borderBottom: '1px solid #ece8e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 1, background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: tool.color }} />
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a49a8d' }}>{tool.categoryName}</span>
        </div>
        <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#a49a8d', fontSize: 18, lineHeight: 1 }}>×</button>
      </div>

      <div style={{ padding: '16px 18px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2c2822', margin: '0 0 6px' }}>{tool.name}</h2>
        {tool.description && <p style={{ fontSize: 13.5, color: '#6b6459', lineHeight: 1.5, margin: '0 0 12px' }}>{tool.description}</p>}
        <div style={{ fontFamily: MONO, fontSize: 11, color: '#8a8175', paddingBottom: 14, borderBottom: '1px solid #ece8e1' }}>
          {rangeStart} – {end} · {releases.length} tracked release{releases.length === 1 ? '' : 's'}
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 14, marginBottom: 4 }}>
          <Tab label={`Releases ${releases.length}`} active={tab === 'releases'} onClick={() => setTab('releases')} color={tool.color} />
          <Tab label="Projects" active={tab === 'projects'} onClick={() => setTab('projects')} color={tool.color} />
        </div>

        {tab === 'releases' ? <Releases releases={releases} color={tool.color} /> : <ProjectsPlaceholder tool={tool} />}
      </div>
    </aside>
  );
}

function Tab({ label, active, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.04em', textTransform: 'uppercase',
        padding: '6px 10px', borderRadius: 7, cursor: 'pointer',
        border: '1px solid ' + (active ? color : '#e7e3dd'),
        background: active ? color : '#fff',
        color: active ? '#fff' : '#8a8175',
      }}
    >
      {label}
    </button>
  );
}

function Releases({ releases, color }) {
  return (
    <div style={{ marginTop: 14 }}>
      {releases.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', flex: 'none', background: color, marginTop: 5 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, color: '#3a352e' }}>
              {r.version || `Release ${i + 1}`}{' '}
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: '#b4a99b' }}>{fmt(r.date)}</span>
              {r.link && (
                <a href={r.link} target="_blank" rel="noopener noreferrer" style={{ color: '#b4a99b', marginLeft: 5, textDecoration: 'none' }}>↗</a>
              )}
            </div>
            {r.notes && <div style={{ fontSize: 11.5, color: '#8a8175', lineHeight: 1.4 }}>{r.notes}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// Placeholder for a future hand-curated set of projects made with each tool.
// Intentionally has no external data source — examples will be sourced and
// curated manually over time, with community suggestions welcome.
function ProjectsPlaceholder({ tool }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 13, color: '#6b6459', lineHeight: 1.55, marginBottom: 10 }}>
        Example projects made with {tool.name} are coming to this tab — a hand-curated
        set, added over time.
      </div>
      <div style={{ fontSize: 12.5, color: '#8a8175', lineHeight: 1.5 }}>
        Have a project that belongs here?{' '}
        <a
          href="https://github.com/laserpilot/creative-tech-timeline"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#8a4b2f', textDecoration: 'underline', textUnderlineOffset: 2 }}
        >
          Suggest one on GitHub
        </a>.
      </div>
    </div>
  );
}
