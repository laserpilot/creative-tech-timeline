# Contributing

This project is a community record of creative-coding tooling and the surrounding cultural / technical landscape. Contributions of new tools, new releases, and new context events are very welcome.

## Two kinds of data

- **Tools** (`public/creative-code-data.json`) — software, libraries, and hardware platforms used to make creative-coding work, plus their release history.
- **Events** (`public/events.json`) — landmark hardware launches, web-standards milestones, AI/ML releases, artworks, and institutions that shaped the field.

Both files are validated against JSON schemas in [`schemas/`](./schemas/).

## Adding a tool or release

Open `public/creative-code-data.json` and either:

- **New tool** — add an entry under `tools` keyed by the tool's display name. Required: `category` (must match one of the keys under `categories`). Optional: `description`, `link`, `discontinued`, `releases`.
- **New release** — append to the `releases` array of an existing tool. Required: `dateString` (any human-readable date the existing parser accepts, e.g. `"24 Nov 2008"`, `"November 2008"`, `"2008"`). Optional: `version`, `link`, `notes`, `major` (boolean — set true if this should be highlighted on the tool's lifeline).

## Adding an event

Open `public/events.json` and append to the `events` array. Required fields:

| Field | Notes |
|---|---|
| `id` | lowercase, hyphenated, unique (e.g. `webgpu-ships`) |
| `title` | short, descriptive |
| `date` | `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` |
| `layer` | must match a key under `layers` (`hardware`, `web-standards`, `ai-ml`, `artworks`, `institutions`) |

Optional: `description` (1–2 sentences of context), `link` (canonical source), `creators` (array of names, for artworks).

## What makes a good event

We're aiming for events that *materially shifted what creative-code work could be* — not a comprehensive product changelog. Some heuristics:

- A new piece of hardware that opened a new medium (Kinect, Vision Pro).
- A web standard that became a baseline assumption (WebGL, WebGPU).
- A model release that defined a new artistic territory (Stable Diffusion).
- A canonical artwork that other artists cite as influence.
- A school, festival, or community that shaped a generation of practice.

When in doubt, include a one-sentence "why this matters" in the `description` — that's the actual signal we want to surface.

## Submitting

- **PRs**: fork, edit JSON, open a PR. Schema validation runs in CI.
- **Issue templates**: if you'd rather just suggest an entry, use [Add a tool](.github/ISSUE_TEMPLATE/add-tool.yml) or [Add an event](.github/ISSUE_TEMPLATE/add-event.yml) and a maintainer will convert it to a PR.

Dates may be approximate, especially for earlier work — that's fine. Cite a source if you can.
