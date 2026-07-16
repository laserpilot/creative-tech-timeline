import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { CATEGORY_ORDER, LAYER_ORDER } from '../src/v2/timelineConfig.js';

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);

const checks = [
  ['public/events.json', 'schemas/events.schema.json'],
  ['public/creative-code-data.json', 'schemas/tools.schema.json'],
];

let failed = false;
for (const [dataPath, schemaPath] of checks) {
  const data = JSON.parse(readFileSync(dataPath, 'utf8'));
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
  const validate = ajv.compile(schema);
  if (validate(data)) {
    console.log(`ok  ${dataPath}`);
  } else {
    failed = true;
    console.error(`FAIL ${dataPath}`);
    for (const err of validate.errors) {
      console.error(`  ${err.instancePath} ${err.message}`);
    }
  }
}

// Schema validity isn't enough: the timeline only draws categories/layers listed
// in timelineConfig.js, and anything else is silently dropped from the view.
// Catch that here — a lane that doesn't exist should break the build, not vanish.
function checkRenderable(label, used, known, configName) {
  const unknown = [...used.keys()].filter((k) => !known.has(k)).sort();
  if (unknown.length === 0) {
    console.log(`ok  every ${label} is rendered`);
    return false;
  }
  console.error(`FAIL unrendered ${label}(s): ${unknown.join(', ')}`);
  console.error(`  Nothing using them will appear. Add them to ${configName} in src/v2/timelineConfig.js.`);
  for (const key of unknown) {
    const names = used.get(key);
    console.error(`  - ${key}: ${names.slice(0, 4).join(', ')}${names.length > 4 ? ` (+${names.length - 4} more)` : ''}`);
  }
  return true;
}

// Map each used key -> the names relying on it, so failures name real records.
const groupBy = (items, keyOf, nameOf) => {
  const m = new Map();
  for (const it of items) {
    const k = keyOf(it);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(nameOf(it));
  }
  return m;
};

const toolsFile = JSON.parse(readFileSync('public/creative-code-data.json', 'utf8'));
const eventsFile = JSON.parse(readFileSync('public/events.json', 'utf8'));

const usedCats = groupBy(Object.entries(toolsFile.tools || {}), ([, v]) => v.category, ([name]) => name);
const usedLayers = groupBy(eventsFile.events || [], (e) => e.layer, (e) => e.title);

if (checkRenderable('tool category', usedCats, new Set(CATEGORY_ORDER.map((c) => c.key)), 'CATEGORY_ORDER')) failed = true;
if (checkRenderable('event layer', usedLayers, new Set(LAYER_ORDER.map((l) => l.key)), 'LAYER_ORDER')) failed = true;

if (failed) process.exit(1);
