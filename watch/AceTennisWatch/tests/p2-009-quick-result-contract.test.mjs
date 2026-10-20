import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import page from '../entry/src/main/js/MainAbility/pages/index/index.js';
import { WORKOUT_STATES } from '../entry/src/main/js/MainAbility/state/workout-state.js';

const root = new URL('..', import.meta.url);
const markup = readFileSync(
    new URL('entry/src/main/js/MainAbility/pages/index/index.hml', root),
    'utf8'
);

assert.match(markup, /onclick="onConfirmFinish"/);
assert.match(markup, /SESSION COMPLETE/);
assert.match(markup, /Duration/);
assert.equal(typeof page.onConfirmFinish, 'function');

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

    const activePage = createPageInstance();
    activePage.onStart();
    now = 6000;
    activePage.onRequestFinish();
    assert.equal(activePage.currentScreen, WORKOUT_STATES.FINISH_CONFIRMATION);
    assert.equal(activePage.elapsedTime, '00:05');
    assert.equal(activeTimers.size, 0);

    now = 9000;
    activePage.onConfirmFinish();
    assert.equal(activePage.currentScreen, WORKOUT_STATES.QUICK_RESULT);
    assert.equal(activePage.elapsedTime, '00:05');
    assert.equal(activePage.quickHeartRate, '128 BPM');
    assert.equal(activePage.quickSwingCount, '36 SWINGS');
    assert.equal(activePage.quickScore, '0 - 0');
    assert.equal(activeTimers.size, 0);

    now = 15000;
    activePage.refreshElapsedTime();
    assert.equal(activePage.elapsedTime, '00:05');

    now = 20000;
    const pausedPage = createPageInstance();
    pausedPage.onStart();
    now = 25000;
    pausedPage.onPause();
    assert.equal(pausedPage.elapsedTime, '00:05');
    now = 26000;
    pausedPage.onRequestFinish();
    now = 30000;
    pausedPage.onConfirmFinish();
    assert.equal(pausedPage.currentScreen, WORKOUT_STATES.QUICK_RESULT);
    assert.equal(pausedPage.elapsedTime, '00:05');
    assert.equal(activeTimers.size, 0);
} finally {
    Date.now = originalDateNow;
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
}

console.log('P2-009 quick result contract: PASS');
