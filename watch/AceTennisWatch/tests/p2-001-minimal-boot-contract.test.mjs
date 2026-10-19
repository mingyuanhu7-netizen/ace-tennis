import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const pageScript = readFileSync(
    new URL('entry/src/main/js/MainAbility/pages/index/index.js', root),
    'utf8'
);
const pageMarkup = readFileSync(
    new URL('entry/src/main/js/MainAbility/pages/index/index.hml', root),
    'utf8'
);

assert.doesNotMatch(pageScript, /workout-state|workout-session/);
assert.doesNotMatch(pageScript, /createWorkoutSession|renderRuntime|setInterval|Date\.now/);
assert.match(pageScript, /currentScreen:\s*WORKOUT_STATES\.READY/);
assert.match(pageScript, /this\.currentScreen\s*=\s*'STARTED'/);
assert.match(pageMarkup, /AceTennis/);
assert.match(pageMarkup, /currentScreen/);
assert.match(pageMarkup, /onclick="onStart"/);

console.log('P2-001 minimal boot contract: PASS');
