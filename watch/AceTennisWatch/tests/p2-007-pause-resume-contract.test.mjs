import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import page from '../entry/src/main/js/MainAbility/pages/index/index.js';
import { WORKOUT_STATES } from '../entry/src/main/js/MainAbility/state/workout-state.js';

const root = new URL('..', import.meta.url);
const markup = readFileSync(
    new URL('entry/src/main/js/MainAbility/pages/index/index.hml', root),
    'utf8'
);

assert.match(markup, /onclick="onPause"/);
assert.match(markup, /onclick="onResume"/);
assert.equal(typeof page.onPause, 'function');
assert.equal(typeof page.onResume, 'function');

const originalDateNow = Date.now;
const originalSetInterval = globalThis.setInterval;
const originalClearInterval = globalThis.clearInterval;
let now = 1000;
let nextHandle = 1;
const activeTimers = new Map();

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

    const pageInstance = { ...page.data, ...page };
    pageInstance.onInit();
    pageInstance.onStart();
    assert.equal(pageInstance.currentScreen, WORKOUT_STATES.ACTIVE_WORKOUT);
    assert.equal(activeTimers.size, 1);

    now = 7000;
    pageInstance.onPause();
    assert.equal(pageInstance.currentScreen, WORKOUT_STATES.PAUSED);
    assert.equal(pageInstance.elapsedTime, '00:06');
    assert.equal(activeTimers.size, 0);

    now = 12000;
    pageInstance.refreshElapsedTime();
    assert.equal(pageInstance.elapsedTime, '00:06');

    now = 13000;
    pageInstance.onResume();
    assert.equal(pageInstance.currentScreen, WORKOUT_STATES.ACTIVE_WORKOUT);
    assert.equal(pageInstance.elapsedTime, '00:06');
    assert.equal(activeTimers.size, 1);

    pageInstance.onResume();
    assert.equal(activeTimers.size, 1);

    now = 15000;
    for (const callback of activeTimers.values()) {
        callback();
    }
    assert.equal(pageInstance.elapsedTime, '00:08');
    pageInstance.onDestroy();
    assert.equal(activeTimers.size, 0);
} finally {
    Date.now = originalDateNow;
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
}

console.log('P2-007 pause/resume contract: PASS');
