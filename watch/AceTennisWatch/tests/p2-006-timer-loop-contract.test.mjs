import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import page from '../entry/src/main/js/MainAbility/pages/index/index.js';
import { WORKOUT_STATES } from '../entry/src/main/js/MainAbility/state/workout-state.js';

const root = new URL('..', import.meta.url);
const pageScript = readFileSync(
    new URL('entry/src/main/js/MainAbility/pages/index/index.js', root),
    'utf8'
);

assert.match(pageScript, /dispatchWorkoutEvent/);
assert.match(pageScript, /setInterval\(function \(\)/);
assert.match(pageScript, /, 1000\)/);
assert.doesNotMatch(pageScript, /=>/);
assert.match(pageScript, /if \(this\.timerHandle !== null\)/);

const originalDateNow = Date.now;
const originalSetInterval = globalThis.setInterval;
const originalClearInterval = globalThis.clearInterval;
let now = 1000;
let scheduledCallback = null;
let intervalCalls = 0;

try {
    Date.now = () => now;
    globalThis.setInterval = (callback, intervalMs) => {
        intervalCalls += 1;
        assert.equal(intervalMs, 1000);
        scheduledCallback = callback;
        return 42;
    };
    globalThis.clearInterval = () => {};

    const pageInstance = { ...page.data, ...page };
    pageInstance.onInit();
    pageInstance.onStart();
    assert.equal(pageInstance.currentScreen, WORKOUT_STATES.ACTIVE_WORKOUT);
    assert.equal(intervalCalls, 1);
    assert.equal(pageInstance.timerHandle, 42);

    pageInstance.onStart();
    assert.equal(intervalCalls, 1);

    now = 3000;
    scheduledCallback();
    assert.equal(pageInstance.elapsedTime, '00:02');
    pageInstance.onDestroy();
    assert.equal(pageInstance.timerHandle, null);
} finally {
    Date.now = originalDateNow;
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
}

console.log('P2-006 periodic timer contract: PASS');
