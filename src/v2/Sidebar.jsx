const MONO = "'IBM Plex Mono', ui-monospace, monospace";

function SectionLabel({ children, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 0 6px' }}>
      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a49a8d' }}>{children}</span>
      {action}
    </div>
  );
}

function LinkButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{ fontFamily: MONO, fontSize: 10.5, color: '#a49a8d', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      onMouseEnter={(e) => (e.currentTarget.style.color = '#6b6459')}
      onMouseLeave={(e) => (e.currentTarget.style.color = '#a49a8d')}
    >
      {children}
    </button>
  );
}

function Row({ swatch, name, count, on, toggle }) {
  return (
    <div
      onClick={toggle}
      style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 8px', borderRadius: 7, cursor: 'pointer', opacity: on ? 1 : 0.4 }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#f1ede5')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {swatch}
      <span style={{ flex: 1, fontSize: 13, color: '#3a352e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
      <span style={{ fontFamily: MONO, fontSize: 11, color: '#b4a99b' }}>{count}</span>
      <span style={{ width: 14, textAlign: 'center', fontSize: 11, fontWeight: 600, color: on ? '#3a352e' : 'transparent' }}>✓</span>
    </div>
  );
}

export default function Sidebar({
  query, onSearch, categories, onResetCats,
  layers, allLayersOn, onToggleAllLayers, decades, showingLabel, onReset,
}) {
  return (
    <aside style={{ flex: 'none', width: 256, height: '100%', overflowY: 'auto', background: '#faf8f5', borderRight: '1px solid #e7e3dd', padding: 16, boxSizing: 'border-box' }}>
      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', background: '#fff', border: '1px solid #e4dfd7', borderRadius: 8, marginBottom: 18 }}>
        <span style={{ color: '#b4a99b', fontSize: 13 }}>⌕</span>
        <input
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search tools…"
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#3a352e' }}
        />
        {query && <button onClick={() => onSearch('')} style={{ border: 'none', background: 'none', color: '#b4a99b', cursor: 'pointer', fontSize: 13 }}>×</button>}
      </div>

      {/* Categories */}
      <div style={{ marginBottom: 18 }}>
        <SectionLabel action={<LinkButton onClick={onResetCats}>reset</LinkButton>}>Tool categories</SectionLabel>
        {categories.map((c) => (
          <Row
            key={c.key}
            name={c.name}
            count={c.count}
            on={c.on}
            toggle={c.toggle}
            swatch={<span style={{ width: 10, height: 10, borderRadius: 3, flex: 'none', background: c.color }} />}
          />
        ))}
      </div>

      {/* Context layers */}
      <div style={{ marginBottom: 18 }}>
        <SectionLabel action={<LinkButton onClick={onToggleAllLayers}>{allLayersOn ? 'hide all' : 'show all'}</LinkButton>}>Context layers</SectionLabel>
        {layers.map((l) => (
          <Row
            key={l.key}
            name={l.name}
            count={l.count}
            on={l.on}
            toggle={l.toggle}
            swatch={<span style={{ width: 9, height: 9, borderRadius: '50%', flex: 'none', background: l.color }} />}
          />
        ))}
      </div>

      {/* Decades */}
      <div style={{ marginBottom: 18 }}>
        <SectionLabel>Decade</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {decades.map((d) => (
            <button
              key={d.label}
              onClick={d.toggle}
              style={{
                cursor: 'pointer', fontFamily: MONO, fontSize: 11, padding: '5px 11px', borderRadius: 20,
                border: d.on ? '1px solid #26221e' : '1px solid #e0dbd3',
                background: d.on ? '#26221e' : '#fff', color: d.on ? '#f7f6f4' : '#a49a8d',
              }}
            >{d.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingTop: 4, borderTop: '1px solid #ece8e1' }}>
        <span style={{ fontFamily: MONO, fontSize: 11, color: '#a49a8d' }}>{showingLabel}</span>
        <LinkButton onClick={onReset}>reset all</LinkButton>
      </div>
    </aside>
  );
}
