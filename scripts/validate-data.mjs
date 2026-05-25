import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

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

if (failed) process.exit(1);
