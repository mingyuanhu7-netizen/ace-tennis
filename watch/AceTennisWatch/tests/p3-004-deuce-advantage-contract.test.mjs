import assert from 'node:assert/strict';
import page from '../entry/src/main/js/MainAbility/pages/index/index.js';
import {
    POINT_MODES,
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

function deuceScore() {
    let score = createPointScore();
    score = playerPoint(score);
    score = playerPoint(score);
    score = playerPoint(score);
    score = opponentPoint(score);
    score = opponentPoint(score);
    score = opponentPoint(score);
    return score;
}

let score = deuceScore();
assert.equal(score.pointMode, POINT_MODES.DEUCE);
assert.equal(getScoreDisplay(score), 'DEUCE');

score = playerPoint(score);
assert.equal(score.pointMode, POINT_MODES.ADVANTAGE_PLAYER);
assert.equal(getScoreDisplay(score), 'ADV YOU');
score = opponentPoint(score);
assert.equal(score.pointMode, POINT_MODES.DEUCE);
assert.equal(getScoreDisplay(score), 'DEUCE');

score = opponentPoint(score);
assert.equal(score.pointMode, POINT_MODES.ADVANTAGE_OPPONENT);
assert.equal(getScoreDisplay(score), 'ADV OPP');
score = playerPoint(score);
assert.equal(score.pointMode, POINT_MODES.DEUCE);

score = playerPoint(score);
score = playerPoint(score);
assert.equal(getGameDisplay(score), '1 - 0');
assert.equal(getScoreDisplay(score), '0 - 0');
assert.equal(score.pointMode, POINT_MODES.NORMAL);

score = deuceScore();
score = opponentPoint(score);
score = opponentPoint(score);
assert.equal(getGameDisplay(score), '0 - 1');
assert.equal(getScoreDisplay(score), '0 - 0');
assert.equal(score.pointMode, POINT_MODES.NORMAL);

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
    pageInstance.onOpponentPoint();
    pageInstance.onOpponentPoint();
    pageInstance.onOpponentPoint();
    assert.equal(pageInstance.scoreDisplay, 'DEUCE');

    now = 5000;
    pageInstance.onRequestFinish();
    pageInstance.onConfirmFinish();
    assert.equal(pageInstance.currentScreen, WORKOUT_STATES.QUICK_RESULT);
    assert.equal(pageInstance.quickScore, 'DEUCE');

    pageInstance.onDone();
    assert.equal(pageInstance.scoreDisplay, '0 - 0');
    assert.equal(pageInstance.gameDisplay, '0 - 0');
    assert.equal(pageInstance.runtimeSession.pointMode, POINT_MODES.NORMAL);
} finally {
    Date.now = originalDateNow;
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
}

console.log('P3-004 deuce/advantage contract: PASS');
