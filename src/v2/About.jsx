import { useEffect } from 'react';

const MONO = "'IBM Plex Mono', ui-monospace, monospace";

function P({ children }) {
  return <p style={{ fontSize: 14, lineHeight: 1.6, color: '#4a443c', margin: '0 0 14px' }}>{children}</p>;
}

function A({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ color: '#8a4b2f', textDecoration: 'underline', textUnderlineOffset: 2 }}>
      {children}
    </a>
  );
}

function Kbd({ children }) {
  return (
    <span style={{ fontFamily: MONO, fontSize: 12, background: '#efeae3', border: '1px solid #e0dad1', borderRadius: 4, padding: '1px 5px', color: '#5a5349' }}>
      {children}
    </span>
  );
}

// About / context modal. Explains what the timeline is and, drawing on the
// 2018 writeup, that it is deliberately partial: a starting point, not an
// authority.
export default function About({ onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(40,34,30,0.44)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="About this timeline"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative', width: 'min(620px, 100%)', maxHeight: '86vh', overflowY: 'auto',
          background: '#faf8f5', border: '1px solid #e7e3dd', borderRadius: 12,
          boxShadow: '0 24px 60px -24px rgba(40,34,30,0.5)', padding: '26px 30px',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ position: 'absolute', top: 16, right: 18, border: 'none', background: 'none', cursor: 'pointer', color: '#a49a8d', fontSize: 22, lineHeight: 1 }}
        >×</button>

        <h2 style={{ fontSize: 21, fontWeight: 600, color: '#2c2822', margin: '0 0 4px' }}>Creative Technology Timeline</h2>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#a49a8d', marginBottom: 18 }}>
          What this is
        </div>

        <P>
          A timeline of the tools of creative coding and creative technology: languages, frameworks,
          libraries, and authoring environments, set against the hardware, web standards, AI, landmark
          artworks, publications, and communities that shaped how they were used.
        </P>

        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#a49a8d', margin: '4px 0 12px' }}>
          On bias &amp; incompleteness
        </div>
        <P>
          This is deliberately partial, and that is part of the point. Any single account of this field is
          shaped by who assembles it. It reflects one primary perspective, and plenty of important work is
          missing, mis-dated, or not yet here. Much of this history is also actively disappearing: artist
          sites go dark, software goes obsolete, documentation vanishes.
        </P>
        <P>
          The aim isn&apos;t to be the authoritative record. It&apos;s to be concrete enough to argue with:
          a starting point for a conversation, where the more perspectives that get added, the better it
          gets. Corrections and additions are welcome.
        </P>

        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#a49a8d', margin: '4px 0 12px' }}>
          How this was made
        </div>
        <P>
          Much of this site was coded with the help of AI, and a lot of the underlying research was gathered
          using AI tools. That makes community validation essential. Dates, attributions, and what&apos;s
          included or left out all need checking by people who know this history firsthand. If something
          looks wrong, it may well be, so please help correct it.
        </P>

        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#a49a8d', margin: '4px 0 12px' }}>
          Contribute
        </div>
        <P>
          All the data is open on GitHub, and pull requests with additions or corrections are
          genuinely welcome: <A href="https://github.com/laserpilot/creative-tech-timeline">github.com/laserpilot/creative-tech-timeline</A>.
        </P>
        <P>
          Quickest way in: on the repo page press <Kbd>.</Kbd> to open GitHub&apos;s in-browser editor
          (github.dev), or press <Kbd>e</Kbd> on any file to edit it, then open a pull request. The
          timeline lives in <Kbd>public/creative-code-data.json</Kbd> (tools) and <Kbd>public/events.json</Kbd> (events).
        </P>

        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#a49a8d', margin: '4px 0 12px' }}>
          Related
        </div>
        <ul style={{ margin: '0 0 6px', padding: 0, listStyle: 'none' }}>
          <li style={{ marginBottom: 10 }}>
            <A href="https://laserpilot.github.io/Creative_Tech_Taxonomy/">Creative Tech Taxonomy</A>
            <span style={{ fontSize: 13, color: '#6b6459' }}>. An interactive map of the fields, tools, and disciplines within creative technology.</span>
          </li>
          <li>
            <A href="https://laserpilot.medium.com/a-history-of-creative-coding-8771524b9775">“A History of Creative Coding” (2018)</A>
            <span style={{ fontSize: 13, color: '#6b6459' }}>. The original writeup on why a shared history of this field is worth preserving.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
