// Layout + palette for the horizontal lane timeline.
// Ported from the design reference (design/reference.html). The display palette
// and category/layer ordering live here so the look is stable regardless of the
// colors stored in the source JSON.

export const YMIN = 1990;
export const YMAX = 2027;
export const NOW = 2026.5;
export const PXY = 32; // pixels per year
export const GUTTER = 176; // left label gutter width
export const ROW = 28; // tool row height
export const LANE_HEADER = 44; // header height inside the time region
export const EVH = 38; // events-lane header height
export const EVR = 24; // events-lane layer-row height

export const TIME_WIDTH = (YMAX - YMIN) * PXY;

// Category display order + palette (keys match creative-code-data.json categories).
export const CATEGORY_ORDER = [
  { key: 'programming', name: 'Programming Tools', color: 'oklch(0.52 0.13 265)' },
  { key: 'web', name: 'Web-Based Tools', color: 'oklch(0.58 0.09 215)' },
  { key: 'audio-visual', name: 'Audio-Visual', color: 'oklch(0.63 0.14 30)' },
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

export const DECADES = ['1990s', '2000s', '2010s', '2020s'];

// Fractional-year position of a Date, e.g. 2007-07-01 -> ~2007.5.
export function yearFrac(date) {
  if (!(date instanceof Date) || isNaN(date)) return YMIN;
  const y = date.getFullYear();
  const start = new Date(y, 0, 1).getTime();
  const end = new Date(y + 1, 0, 1).getTime();
  return y + (date.getTime() - start) / (end - start);
}

// Year (fractional or integer) -> x pixels within the time region.
export function x(year) {
  return (year - YMIN) * PXY;
}

// Convenience: Date -> x pixels.
export function xDate(date) {
  return x(yearFrac(date));
}

export function decadeOf(year) {
  return Math.floor(year / 10) * 10 + 's';
}
