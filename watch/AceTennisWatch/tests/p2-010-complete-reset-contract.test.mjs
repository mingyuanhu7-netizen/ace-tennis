import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import page from '../entry/src/main/js/MainAbility/pages/index/index.js';
import { WORKOUT_STATES } from '../entry/src/main/js/MainAbility/state/workout-state.js';

const root = new URL('..', import.meta.url);
const markup = readFileSync(
    new URL('entry/src/main/js/MainAbility/pages/index/index.hml', root),
    'utf8'
);

assert.match(markup, /onclick="onDone"/);
assert.equal(typeof page.onDone, 'function');

const originalDateNow = Date.now;
const originalSetInterval = globalThis.setInterval;
const originalClearInterval = globalThis.clearInterval;
let now = 1000;
let nextHandle = 1;
const activeTimers = new Map();

function createPageInstance() {
    const pageInstance = { ...page.data, ...page };
    pageInstance.onInit();
    return pageInstance;
}

try {
    Date.now = () => now;
    globalThis.setInterval = (callback, intervalMs) => {
        assert.equal(intervalMs, 1000);
        const handle = nextHandle;
        nextHandle += 1;
        activeTimers.set(handle, callback);
        return handle;
    };
    globalThis.clearInterval = (handle) => {
        activeTimers.delete(handle);
    };

    const pageInstance = createPageInstance();
    pageInstance.onStart();
    now = 6000;
    pageInstance.onRequestFinish();
    now = 7000;
    pageInstance.onConfirmFinish();
    assert.equal(pageInstance.currentScreen, WORKOUT_STATES.QUICK_RESULT);
    assert.equal(pageInstance.elapsedTime, '00:05');
    assert.equal(activeTimers.size, 0);

    now = 8000;
    pageInstance.onDone();
    assert.equal(pageInstance.currentScreen, WORKOUT_STATES.READY);
    assert.equal(pageInstance.runtimeSession.state, WORKOUT_STATES.READY);
    assert.equal(pageInstance.runtimeSession.sessionId, null);
    assert.equal(pageInstance.runtimeSession.startedAt, null);
    assert.equal(pageInstance.runtimeSession.accumulatedActiveMs, 0);
    assert.equal(pageInstance.runtimeSession.activeSegmentStartedAt, null);
    assert.equal(pageInstance.runtimeSession.finishReturnState, null);
    assert.equal(pageInstance.elapsedTime, '00:00');
    assert.equal(pageInstance.timerHandle, null);
    assert.equal(activeTimers.size, 0);

    now = 9000;
    pageInstance.onStart();
    assert.equal(pageInstance.currentScreen, WORKOUT_STATES.ACTIVE_WORKOUT);
    assert.equal(pageInstance.elapsedTime, '00:00');
    assert.equal(activeTimers.size, 1);

    now = 11000;
    for (const callback of activeTimers.values()) {
        callback();
    }
    assert.equal(pageInstance.elapsedTime, '00:02');
    assert.equal(activeTimers.size, 1);
    pageInstance.onDestroy();
    assert.equal(activeTimers.size, 0);
} finally {
    Date.now = originalDateNow;
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
}

console.log('P2-010 complete/reset contract: PASS');
