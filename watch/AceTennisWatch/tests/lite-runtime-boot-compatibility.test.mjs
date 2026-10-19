import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const sessionSource = readFileSync(
    new URL('entry/src/main/js/MainAbility/state/workout-session.js', root),
    'utf8'
);

assert.doesNotMatch(
    sessionSource,
    /\.padStart\(/,
    'Initial Ready rendering must not rely on String.prototype.padStart, which is not guaranteed by the Lite Wearable runtime.'
);

console.log('lite runtime boot compatibility: PASS');
