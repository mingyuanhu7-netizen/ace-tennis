import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import page from '../entry/src/main/js/MainAbility/pages/index/index.js';
import { WORKOUT_STATES } from '../entry/src/main/js/MainAbility/state/workout-state.js';

const root = new URL('..', import.meta.url);
const markup = readFileSync(
    new URL('entry/src/main/js/MainAbility/pages/index/index.hml', root),
    'utf8'
);

assert.match(markup, /onclick="onRequestFinish"/);
assert.match(markup, /onclick="onCancelFinish"/);
assert.match(markup, /Finish session\?/);
assert.equal(typeof page.onRequestFinish, 'function');
assert.equal(typeof page.onCancelFinish, 'function');

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

    now = 6000;
    pageInstance.onRequestFinish();
    assert.equal(pageInstance.currentScreen, WORKOUT_STATES.FINISH_CONFIRMATION);
    assert.equal(pageInstance.elapsedTime, '00:05');
    assert.equal(activeTimers.size, 0);

    now = 9000;
    pageInstance.onCancelFinish();
    assert.equal(pageInstance.currentScreen, WORKOUT_STATES.ACTIVE_WORKOUT);
    assert.equal(pageInstance.elapsedTime, '00:05');
    assert.equal(activeTimers.size, 1);

    now = 11000;
    for (const callback of activeTimers.values()) {
        callback();
    }
    assert.equal(pageInstance.elapsedTime, '00:07');

    now = 12000;
    pageInstance.onPause();
    assert.equal(pageInstance.currentScreen, WORKOUT_STATES.PAUSED);
    assert.equal(pageInstance.elapsedTime, '00:08');

    now = 13000;
    pageInstance.onRequestFinish();
    assert.equal(pageInstance.currentScreen, WORKOUT_STATES.FINISH_CONFIRMATION);
    assert.equal(pageInstance.elapsedTime, '00:08');
    assert.equal(activeTimers.size, 0);

    now = 15000;
    pageInstance.onCancelFinish();
    assert.equal(pageInstance.currentScreen, WORKOUT_STATES.PAUSED);
    assert.equal(pageInstance.elapsedTime, '00:08');
    assert.equal(activeTimers.size, 0);
} finally {
    Date.now = originalDateNow;
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
}

console.log('P2-008 finish confirmation contract: PASS');
