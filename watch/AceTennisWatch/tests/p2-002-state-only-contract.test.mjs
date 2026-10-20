import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import page from '../entry/src/main/js/MainAbility/pages/index/index.js';
import { WORKOUT_EVENTS, WORKOUT_STATES } from '../entry/src/main/js/MainAbility/state/workout-state.js';

const root = new URL('..', import.meta.url);
const pageScript = readFileSync(
    new URL('entry/src/main/js/MainAbility/pages/index/index.js', root),
    'utf8'
);

assert.match(pageScript, /from '\.\.\/\.\.\/state\/workout-state\.js'/);

const pageInstance = { ...page.data, ...page };
pageInstance.onInit();
assert.equal(pageInstance.currentScreen, WORKOUT_STATES.READY);
pageInstance.onStart();
assert.equal(pageInstance.currentScreen, WORKOUT_STATES.ACTIVE_WORKOUT);
assert.equal(pageInstance.lastEvent, WORKOUT_EVENTS.START);
pageInstance.onDestroy();

console.log('P2-002 state-only contract: PASS');
