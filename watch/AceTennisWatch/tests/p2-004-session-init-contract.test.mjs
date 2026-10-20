import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import page from '../entry/src/main/js/MainAbility/pages/index/index.js';
import { WORKOUT_STATES } from '../entry/src/main/js/MainAbility/state/workout-state.js';

const root = new URL('..', import.meta.url);
const pageScript = readFileSync(
    new URL('entry/src/main/js/MainAbility/pages/index/index.js', root),
    'utf8'
);

assert.match(pageScript, /createWorkoutSession/);
assert.match(pageScript, /onInit\(\)\s*\{\s*this\.runtimeSession\s*=\s*createWorkoutSession\(\);/s);

const pageInstance = { ...page.data, ...page };
pageInstance.onInit();
assert.equal(pageInstance.runtimeSession.state, WORKOUT_STATES.READY);
assert.equal(pageInstance.runtimeSession.sessionId, null);
assert.equal(pageInstance.sessionStatus, 'SESSION OK');
pageInstance.onStart();
assert.equal(pageInstance.currentScreen, WORKOUT_STATES.ACTIVE_WORKOUT);
pageInstance.onDestroy();

console.log('P2-004 session initialization contract: PASS');
