// Layout + palette for the horizontal lane timeline.
// Ported from the design reference (design/reference.html). The display palette
// and category/layer ordering live here so the look is stable regardless of the
// colors stored in the source JSON.

export const YMIN = 1970;
export const YMAX = 2027;
export const NOW = 2026.5;

// The domain reaches back to 1970 for early/seminal context, but most of the
// activity starts around 1990 — so the view opens scrolled to here.
export const VIEW_START = 1990;

// Horizontal zoom: pixels per year. The scale is built at render time from the
// current zoom level (see createScale), so PXY is not a fixed constant.
export const DEFAULT_PXY = 32;
export const ZOOM_MIN = 14;
export const ZOOM_MAX = 72;
export const ZOOM_STEP = 1.3; // multiplicative per click

export const GUTTER = 176; // left label gutter width
export const ROW = 28; // tool row height
export const LANE_HEADER = 44; // header height inside the time region
export const EVH = 38; // events-lane header height
export const EVR = 24; // events-lane layer-row height

export const clampZoom = (pxy) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, pxy));

// Category display order + palette (keys match creative-code-data.json categories).
export const CATEGORY_ORDER = [
  { key: 'programming', name: 'Programming Tools', color: 'oklch(0.52 0.13 265)' },
  { key: 'web', name: 'Web-Based Tools', color: 'oklch(0.58 0.09 215)' },
  { key: 'audio-visual', name: 'Audio-Visual', color: 'oklch(0.63 0.14 30)' },
  { key: 'multimedia-authoring', name: 'Multimedia Authoring', color: 'oklch(0.63 0.16 358)' },
  { key: 'creative-libraries', name: 'Creative Libraries', color: 'oklch(0.72 0.13 75)' },
  { key: 'physical-computing', name: 'Physical Computing', color: 'oklch(0.60 0.11 150)' },
  { key: 'data-visualization', name: 'Data Visualization', color: 'oklch(0.55 0.14 305)' },
];

// Context-layer display order + palette (keys match events.json layers).
export const LAYER_ORDER = [
  { key: 'hardware', name: 'Hardware', color: '#e8833a' },
  { key: 'web-standards', name: 'Web Standards', color: '#3a7ae8' },
  { key: 'ai-ml', name: 'AI / ML', color: '#9b5de5' },
  { key: 'artworks', name: 'Landmark Artworks', color: '#e5476b' },
  { key: 'institutions', name: 'Institutions', color: '#2ea36b' },
];

export const DECADES = ['1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];

// Fractional-year position of a Date, e.g. 2007-07-01 -> ~2007.5.
export function yearFrac(date) {
  if (!(date instanceof Date) || isNaN(date)) return YMIN;
  const y = date.getFullYear();
  const start = new Date(y, 0, 1).getTime();
  const end = new Date(y + 1, 0, 1).getTime();
  return y + (date.getTime() - start) / (end - start);
}

// Build the horizontal scale for a given zoom level (pixels per year).
// Returns the mapping helpers plus the total width of the time region.
export function createScale(pxy) {
  const x = (year) => (year - YMIN) * pxy;
  return {
    pxy,
    timeWidth: (YMAX - YMIN) * pxy,
    x,
    xDate: (date) => x(yearFrac(date)),
    // Inverse: x pixels within the time region -> fractional year.
    yearAt: (px) => YMIN + px / pxy,
  };
}

export function decadeOf(year) {
  return Math.floor(year / 10) * 10 + 's';
}
