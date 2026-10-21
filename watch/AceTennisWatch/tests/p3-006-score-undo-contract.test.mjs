import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import page from '../entry/src/main/js/MainAbility/pages/index/index.js';
import {
    POINT_MODES,
    SCORE_EVENTS,
    SCORE_HISTORY_LIMIT,
    applyScoreEventWithHistory,
    createPointScore,
    createScoreHistory,
    getGameDisplay,
    getScoreDisplay,
    getSetDisplay,
    isScoreAwardBlocked,
    undoLastScoreEvent
} from '../entry/src/main/js/MainAbility/state/tennis-score.js';
import { WORKOUT_STATES } from '../entry/src/main/js/MainAbility/state/workout-state.js';

function apply(score, scoreHistory, event) {
    return applyScoreEventWithHistory(score, scoreHistory, event);
}

function playerPoint(score, scoreHistory) {
    return apply(score, scoreHistory, SCORE_EVENTS.PLAYER_POINT);
}

function opponentPoint(score, scoreHistory) {
    return apply(score, scoreHistory, SCORE_EVENTS.OPPONENT_POINT);
}

function playerGame(score, scoreHistory) {
    let result = { score, scoreHistory };
    result = playerPoint(result.score, result.scoreHistory);
    result = playerPoint(result.score, result.scoreHistory);
    result = playerPoint(result.score, result.scoreHistory);
    return playerPoint(result.score, result.scoreHistory);
}

function opponentGame(score, scoreHistory) {
    let result = { score, scoreHistory };
    result = opponentPoint(result.score, result.scoreHistory);
    result = opponentPoint(result.score, result.scoreHistory);
    result = opponentPoint(result.score, result.scoreHistory);
    return opponentPoint(result.score, result.scoreHistory);
}

function scoreAt(playerGames, opponentGames, playerSets = 0, opponentSets = 0) {
    return {
        ...createPointScore(),
        playerGames,
        opponentGames,
        playerSets,
        opponentSets
    };
}

function deuceAt(playerGames = 0, opponentGames = 0) {
    return {
        ...scoreAt(playerGames, opponentGames),
        playerPointIndex: 3,
        opponentPointIndex: 3,
        pointMode: POINT_MODES.DEUCE
    };
}

let score = createPointScore();
let scoreHistory = createScoreHistory();
assert.equal(scoreHistory.length, 0);

let result = playerPoint(score, scoreHistory);
assert.equal(getScoreDisplay(result.score), '15 - 0');
assert.equal(result.scoreHistory.length, 1);
result = undoLastScoreEvent(result.score, result.scoreHistory);
assert.equal(getScoreDisplay(result.score), '0 - 0');
assert.equal(result.scoreHistory.length, 0);
assert.equal(result.didUndo, true);

score = createPointScore();
scoreHistory = createScoreHistory();
result = playerPoint(score, scoreHistory);
result = playerPoint(result.score, result.scoreHistory);
result = opponentPoint(result.score, result.scoreHistory);
assert.equal(getScoreDisplay(result.score), '30 - 15');
result = undoLastScoreEvent(result.score, result.scoreHistory);
assert.equal(getScoreDisplay(result.score), '30 - 0');
result = undoLastScoreEvent(result.score, result.scoreHistory);
assert.equal(getScoreDisplay(result.score), '15 - 0');
result = undoLastScoreEvent(result.score, result.scoreHistory);
assert.equal(getScoreDisplay(result.score), '0 - 0');
result = undoLastScoreEvent(result.score, result.scoreHistory);
assert.equal(result.didUndo, false);
assert.equal(getScoreDisplay(result.score), '0 - 0');

for (const event of [SCORE_EVENTS.PLAYER_POINT, SCORE_EVENTS.OPPONENT_POINT]) {
    score = deuceAt();
    scoreHistory = createScoreHistory();
    result = apply(score, scoreHistory, event);
    assert.match(getScoreDisplay(result.score), /^ADV /);
    result = undoLastScoreEvent(result.score, result.scoreHistory);
    assert.equal(getScoreDisplay(result.score), 'DEUCE');
    assert.equal(result.score.pointMode, POINT_MODES.DEUCE);
}

score = { ...deuceAt(), pointMode: POINT_MODES.ADVANTAGE_PLAYER };
result = opponentPoint(score, createScoreHistory());
assert.equal(getScoreDisplay(result.score), 'DEUCE');
result = undoLastScoreEvent(result.score, result.scoreHistory);
assert.equal(getScoreDisplay(result.score), 'ADV YOU');

score = { ...deuceAt(), pointMode: POINT_MODES.ADVANTAGE_OPPONENT };
result = playerPoint(score, createScoreHistory());
assert.equal(getScoreDisplay(result.score), 'DEUCE');
result = undoLastScoreEvent(result.score, result.scoreHistory);
assert.equal(getScoreDisplay(result.score), 'ADV OPP');

score = {
    ...scoreAt(2, 1),
    playerPointIndex: 3,
    opponentPointIndex: 1
};
result = playerPoint(score, createScoreHistory());
assert.equal(getGameDisplay(result.score), '3 - 1');
result = undoLastScoreEvent(result.score, result.scoreHistory);
assert.equal(getGameDisplay(result.score), '2 - 1');
assert.equal(getScoreDisplay(result.score), '40 - 15');

score = {
    ...scoreAt(1, 2),
    playerPointIndex: 1,
    opponentPointIndex: 3
};
result = opponentPoint(score, createScoreHistory());
assert.equal(getGameDisplay(result.score), '1 - 3');
result = undoLastScoreEvent(result.score, result.scoreHistory);
assert.equal(getGameDisplay(result.score), '1 - 2');
assert.equal(getScoreDisplay(result.score), '15 - 40');

score = { ...deuceAt(2, 1), pointMode: POINT_MODES.ADVANTAGE_PLAYER };
result = playerPoint(score, createScoreHistory());
assert.equal(getGameDisplay(result.score), '3 - 1');
result = undoLastScoreEvent(result.score, result.scoreHistory);
assert.equal(getScoreDisplay(result.score), 'ADV YOU');

score = { ...deuceAt(1, 2), pointMode: POINT_MODES.ADVANTAGE_OPPONENT };
result = opponentPoint(score, createScoreHistory());
assert.equal(getGameDisplay(result.score), '1 - 3');
result = undoLastScoreEvent(result.score, result.scoreHistory);
assert.equal(getScoreDisplay(result.score), 'ADV OPP');

score = {
    ...scoreAt(5, 3),
    playerPointIndex: 3,
    opponentPointIndex: 1
};
result = playerPoint(score, createScoreHistory());
assert.equal(getSetDisplay(result.score), '1 - 0');
assert.equal(getGameDisplay(result.score), '0 - 0');
result = undoLastScoreEvent(result.score, result.scoreHistory);
assert.equal(getSetDisplay(result.score), '0 - 0');
assert.equal(getGameDisplay(result.score), '5 - 3');
assert.equal(getScoreDisplay(result.score), '40 - 15');

score = {
    ...scoreAt(3, 5),
    playerPointIndex: 1,
    opponentPointIndex: 3
};
result = opponentPoint(score, createScoreHistory());
assert.equal(getSetDisplay(result.score), '0 - 1');
result = undoLastScoreEvent(result.score, result.scoreHistory);
assert.equal(getGameDisplay(result.score), '3 - 5');
assert.equal(getScoreDisplay(result.score), '15 - 40');

score = {
    ...scoreAt(6, 5, 1, 0),
    playerPointIndex: 3,
    opponentPointIndex: 1
};
result = playerPoint(score, createScoreHistory());
assert.equal(getSetDisplay(result.score), '2 - 0');
result = undoLastScoreEvent(result.score, result.scoreHistory);
assert.equal(getSetDisplay(result.score), '1 - 0');
assert.equal(getGameDisplay(result.score), '6 - 5');
assert.equal(getScoreDisplay(result.score), '40 - 15');

score = {
    ...scoreAt(6, 5),
    playerPointIndex: 0,
    opponentPointIndex: 3
};
result = opponentPoint(score, createScoreHistory());
assert.equal(isScoreAwardBlocked(result.score), true);
assert.equal(getScoreDisplay(result.score), 'TB PENDING');
const blockedResult = playerPoint(result.score, result.scoreHistory);
assert.equal(blockedResult.scoreHistory.length, result.scoreHistory.length);
assert.deepEqual(blockedResult.score, result.score);
result = undoLastScoreEvent(result.score, result.scoreHistory);
assert.equal(getGameDisplay(result.score), '6 - 5');
assert.equal(getScoreDisplay(result.score), '0 - 40');
assert.equal(isScoreAwardBlocked(result.score), false);

scoreHistory = createScoreHistory();
for (let index = 0; index < SCORE_HISTORY_LIMIT + 5; index += 1) {
    result = playerPoint(createPointScore(), scoreHistory);
    scoreHistory = result.scoreHistory;
}
assert.equal(scoreHistory.length, SCORE_HISTORY_LIMIT);

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
    assert.equal(pageInstance.runtimeSession.scoreHistory.length, 1);
    const activeElapsed = pageInstance.runtimeSession.activeSegmentStartedAt;
    pageInstance.onUndoScore();
    assert.equal(pageInstance.currentScreen, WORKOUT_STATES.ACTIVE_WORKOUT);
    assert.equal(pageInstance.runtimeSession.activeSegmentStartedAt, activeElapsed);
    assert.equal(pageInstance.scoreDisplay, '0 - 0');

    pageInstance.onPlayerPoint();
    now = 4000;
    pageInstance.onPause();
    const pausedElapsed = pageInstance.runtimeSession.accumulatedActiveMs;
    pageInstance.onUndoScore();
    assert.equal(pageInstance.currentScreen, WORKOUT_STATES.PAUSED);
    assert.equal(pageInstance.runtimeSession.accumulatedActiveMs, pausedElapsed);
    assert.equal(pageInstance.scoreDisplay, '0 - 0');

    const completePage = { ...page.data, ...page };
    completePage.onInit();
    completePage.onStart();
    completePage.onPlayerPoint();
    completePage.onRequestFinish();
    completePage.onConfirmFinish();
    completePage.onDone();
    assert.equal(completePage.runtimeSession.scoreHistory.length, 0);
    completePage.onStart();
    assert.equal(completePage.runtimeSession.scoreHistory.length, 0);
} finally {
    Date.now = originalDateNow;
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
}

const root = new URL('..', import.meta.url);
const markup = readFileSync(
    new URL('entry/src/main/js/MainAbility/pages/index/index.hml', root),
    'utf8'
);
assert.match(markup, /onclick="onOpenCorrection"/);
assert.match(markup, /onclick="onUndoScore"/);
assert.match(markup, /score-control-disabled/);
assert.match(markup, /onclick="onPause"/);
assert.match(markup, /onclick="onRequestFinish"/);

console.log('P3-006 score undo contract: PASS');
