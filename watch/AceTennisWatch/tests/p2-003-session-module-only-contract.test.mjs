import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import page from '../entry/src/main/js/MainAbility/pages/index/index.js';
import { WORKOUT_STATES } from '../entry/src/main/js/MainAbility/state/workout-state.js';

const root = new URL('..', import.meta.url);
const pageScript = readFileSync(
    new URL('entry/src/main/js/MainAbility/pages/index/index.js', root),
    'utf8'
);

assert.match(pageScript, /import '\.\.\/\.\.\/state\/workout-session\.js';/);
assert.doesNotMatch(pageScript, /createWorkoutSession\(|resetWorkoutSession\(|dispatchWorkoutEvent\(|formatElapsedTime\(|getElapsedActiveMs\(|setInterval|clearInterval|Date\.now/);

const pageInstance = { ...page.data, ...page };
assert.equal(pageInstance.currentScreen, WORKOUT_STATES.READY);
pageInstance.onStart();
assert.equal(pageInstance.currentScreen, WORKOUT_STATES.ACTIVE_WORKOUT);

console.log('P2-003 session-module-only contract: PASS');
