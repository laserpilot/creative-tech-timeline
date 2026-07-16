# Creative Technology Timeline

An interactive timeline of the tools of creative coding and creative technology —
languages, frameworks, libraries, and authoring environments — set against the
hardware, web standards, AI, landmark artworks, publications, and communities that
shaped how they were used.

**Live:** https://laserpilot.github.io/creative-tech-timeline/

It is deliberately partial, and that is part of the point: a starting point for a
conversation rather than an authoritative record. Much of the site was built with the
help of AI and the research gathered with AI tools, so **community validation matters**
— corrections and additions are genuinely welcome.

## Contributing

The timeline is only as good as its data, and the data lives in two plain JSON files:

- [`public/creative-code-data.json`](public/creative-code-data.json) — tools, grouped by
  category, each with a list of dated releases.
- [`public/events.json`](public/events.json) — context events, grouped by layer.

To add or fix something:

1. Edit those files. Quickest path with no local setup: on the GitHub repo page press
   <kbd>.</kbd> to open the in-browser editor (github.dev), make your change, and open a
   pull request. Or clone and edit locally.
2. Keep to the existing shape (see [`schemas/`](schemas/)) and, if working locally, run
   `npm run validate`.
3. Open a pull request. Even rough contributions are useful — a wrong date, a missing
   tool, a better source link.

A few things worth knowing so your data actually shows up:

- **Categories and layers are a fixed set** defined in
  [`src/v2/timelineConfig.js`](src/v2/timelineConfig.js) (tool categories like
  `programming`, `audio-visual`, `multimedia-authoring`; event layers like `hardware`,
  `ai-ml`, `publications`). Data using a category or layer that isn't listed there is
  **not rendered** — and `npm run validate` will fail loudly rather than drop it
  silently. Adding a genuinely new category/layer means a small code change too; flag it
  in your PR.
- Every tool needs at least one release with a parseable date. Dates accept ISO
  (`2008`, `2008-11`, `2008-11-24`), `24 Nov 2008`, `November 2008`, or a bare year.
- Events may include an optional `end` date to draw a lifespan span.

## Development

```sh
npm install
npm run dev        # http://localhost:3000
npm run build      # production build to dist/
npm run validate   # check the data against the schemas + renderability
```

Built with Vite + React. The timeline reads the JSON at runtime; there is no database.
Pushing to `main` builds and deploys to GitHub Pages via the workflow in
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## Roadmap / ideas

- **In-browser edit mode.** A gated editing UI (e.g. via `?edit`) to add and correct
  tools and events in place and export updated JSON, to make contributing easier for
  non-developers. A lossy version existed in an earlier design; bringing it back means
  editing the current, richer release schema rather than the old simplified model.
- Deep-linking to a specific tool or year.

## Related

- [Creative Tech Taxonomy](https://laserpilot.github.io/Creative_Tech_Taxonomy/) — an
  interactive map of the fields, tools, and disciplines within creative technology.
- [“A History of Creative Coding” (2018)](https://laserpilot.medium.com/a-history-of-creative-coding-8771524b9775)
  — the original writeup on why a shared history of this field is worth preserving.
