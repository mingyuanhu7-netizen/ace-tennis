import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import page from '../entry/src/main/js/MainAbility/pages/index/index.js';
import {
    SCORE_EVENTS,
    createPointScore,
    dispatchScoreEvent,
    getScoreDisplay
} from '../entry/src/main/js/MainAbility/state/tennis-score.js';
import { WORKOUT_STATES } from '../entry/src/main/js/MainAbility/state/workout-state.js';

const root = new URL('..', import.meta.url);
const markup = readFileSync(
    new URL('entry/src/main/js/MainAbility/pages/index/index.hml', root),
    'utf8'
);

assert.match(markup, /Points/);
assert.match(markup, /onclick="onPlayerPoint"/);
assert.match(markup, /onclick="onOpponentPoint"/);
assert.equal(typeof page.onPlayerPoint, 'function');
assert.equal(typeof page.onOpponentPoint, 'function');

let score = createPointScore();
assert.equal(score.playerPointIndex, 0);
assert.equal(score.opponentPointIndex, 0);
assert.equal(getScoreDisplay(score), '0 - 0');

score = dispatchScoreEvent(score, SCORE_EVENTS.PLAYER_POINT);
assert.equal(getScoreDisplay(score), '15 - 0');
score = dispatchScoreEvent(score, SCORE_EVENTS.PLAYER_POINT);
assert.equal(getScoreDisplay(score), '30 - 0');
score = dispatchScoreEvent(score, SCORE_EVENTS.PLAYER_POINT);
assert.equal(getScoreDisplay(score), '40 - 0');
score = dispatchScoreEvent(score, SCORE_EVENTS.OPPONENT_POINT);
assert.equal(getScoreDisplay(score), '40 - 15');
score = dispatchScoreEvent(score, SCORE_EVENTS.OPPONENT_POINT);
assert.equal(getScoreDisplay(score), '40 - 30');
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
    globalThis.setInterval = (callback) => {
        const handle = nextHandle;
        nextHandle += 1;
        activeTimers.set(handle, callback);
        return handle;
    };
    globalThis.clearInterval = (handle) => activeTimers.delete(handle);

    const pageInstance = createPageInstance();
    assert.equal(pageInstance.scoreDisplay, '0 - 0');
    pageInstance.onStart();
    pageInstance.onPlayerPoint();
    pageInstance.onPlayerPoint();
    pageInstance.onOpponentPoint();
    assert.equal(pageInstance.currentScreen, WORKOUT_STATES.ACTIVE_WORKOUT);
    assert.equal(pageInstance.scoreDisplay, '30 - 15');

    now = 5000;
    pageInstance.onRequestFinish();
    pageInstance.onConfirmFinish();
    assert.equal(pageInstance.currentScreen, WORKOUT_STATES.QUICK_RESULT);
    assert.equal(pageInstance.quickScore, '30 - 15');

    pageInstance.onDone();
    assert.equal(pageInstance.currentScreen, WORKOUT_STATES.READY);
    assert.equal(pageInstance.scoreDisplay, '0 - 0');
    assert.equal(pageInstance.runtimeSession.playerPointIndex, 0);
    assert.equal(pageInstance.runtimeSession.opponentPointIndex, 0);
} finally {
    Date.now = originalDateNow;
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
}

console.log('P3-001 point-score contract: PASS');
