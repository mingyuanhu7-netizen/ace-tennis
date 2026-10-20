import assert from 'node:assert/strict';
import page from '../entry/src/main/js/MainAbility/pages/index/index.js';
import {
    SCORE_EVENTS,
    createPointScore,
    dispatchScoreEvent,
    getGameDisplay,
    getScoreDisplay
} from '../entry/src/main/js/MainAbility/state/tennis-score.js';
import { WORKOUT_STATES } from '../entry/src/main/js/MainAbility/state/workout-state.js';

function playerPoint(score) {
    return dispatchScoreEvent(score, SCORE_EVENTS.PLAYER_POINT);
}

function opponentPoint(score) {
    return dispatchScoreEvent(score, SCORE_EVENTS.OPPONENT_POINT);
}

let score = createPointScore();
assert.equal(getGameDisplay(score), '0 - 0');
assert.equal(getScoreDisplay(score), '0 - 0');

score = playerPoint(score);
assert.equal(getScoreDisplay(score), '15 - 0');
score = playerPoint(score);
assert.equal(getScoreDisplay(score), '30 - 0');
score = playerPoint(score);
assert.equal(getScoreDisplay(score), '40 - 0');
score = playerPoint(score);
assert.equal(getGameDisplay(score), '1 - 0');
assert.equal(getScoreDisplay(score), '0 - 0');

score = opponentPoint(score);
score = opponentPoint(score);
score = opponentPoint(score);
assert.equal(getScoreDisplay(score), '0 - 40');
score = opponentPoint(score);
assert.equal(getGameDisplay(score), '1 - 1');
assert.equal(getScoreDisplay(score), '0 - 0');

score = playerPoint(score);
score = playerPoint(score);
score = playerPoint(score);
score = opponentPoint(score);
score = opponentPoint(score);
score = opponentPoint(score);
assert.equal(getScoreDisplay(score), '40 - 40');
score = playerPoint(score);
assert.equal(getGameDisplay(score), '1 - 1');
assert.equal(getScoreDisplay(score), '40 - 40');
score = opponentPoint(score);
assert.equal(getGameDisplay(score), '1 - 1');
assert.equal(getScoreDisplay(score), '40 - 40');

const originalDateNow = Date.now;
const originalSetInterval = globalThis.setInterval;
const originalClearInterval = globalThis.clearInterval;
let now = 1000;
const timers = new Map();

try {
    Date.now = () => now;
    globalThis.setInterval = (callback) => {
        timers.set(1, callback);
        return 1;
    };
    globalThis.clearInterval = (handle) => timers.delete(handle);

    const pageInstance = { ...page.data, ...page };
    pageInstance.onInit();
    pageInstance.onStart();
    pageInstance.onPlayerPoint();
    pageInstance.onPlayerPoint();
    pageInstance.onPlayerPoint();
    pageInstance.onPlayerPoint();
    assert.equal(pageInstance.gameDisplay, '1 - 0');
    assert.equal(pageInstance.scoreDisplay, '0 - 0');

    now = 5000;
    pageInstance.onRequestFinish();
    pageInstance.onConfirmFinish();
    assert.equal(pageInstance.currentScreen, WORKOUT_STATES.QUICK_RESULT);
    assert.equal(pageInstance.quickGameScore, '1 - 0');
    assert.equal(pageInstance.quickScore, '0 - 0');

    pageInstance.onDone();
    assert.equal(pageInstance.currentScreen, WORKOUT_STATES.READY);
    assert.equal(pageInstance.gameDisplay, '0 - 0');
    assert.equal(pageInstance.scoreDisplay, '0 - 0');
} finally {
    Date.now = originalDateNow;
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
}

console.log('P3-003 basic game logic contract: PASS');
