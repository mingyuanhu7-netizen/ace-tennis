import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import page from '../entry/src/main/js/MainAbility/pages/index/index.js';
import {
    POINT_MODES,
    SCORE_EVENTS,
    createPointScore,
    dispatchScoreEvent,
    getGameDisplay,
    getScoreDisplay,
    getSetDisplay,
    isScoreAwardBlocked
} from '../entry/src/main/js/MainAbility/state/tennis-score.js';
import { WORKOUT_STATES } from '../entry/src/main/js/MainAbility/state/workout-state.js';

function playerPoint(score) {
    return dispatchScoreEvent(score, SCORE_EVENTS.PLAYER_POINT);
}

function opponentPoint(score) {
    return dispatchScoreEvent(score, SCORE_EVENTS.OPPONENT_POINT);
}

function playerGameFrom(score) {
    let result = score;
    result = playerPoint(result);
    result = playerPoint(result);
    result = playerPoint(result);
    return playerPoint(result);
}

function opponentGameFrom(score) {
    let result = score;
    result = opponentPoint(result);
    result = opponentPoint(result);
    result = opponentPoint(result);
    return opponentPoint(result);
}

function scoreAtGames(playerGames, opponentGames) {
    return {
        ...createPointScore(),
        playerGames,
        opponentGames
    };
}

function deuceAtGames(playerGames, opponentGames) {
    return {
        ...scoreAtGames(playerGames, opponentGames),
        playerPointIndex: 3,
        opponentPointIndex: 3,
        pointMode: POINT_MODES.DEUCE
    };
}

let score = createPointScore();
assert.equal(getSetDisplay(score), '0 - 0');
assert.equal(getGameDisplay(score), '0 - 0');
assert.equal(getScoreDisplay(score), '0 - 0');
assert.equal(score.tiebreakPending, false);

score = playerGameFrom(scoreAtGames(5, 0));
assert.equal(getSetDisplay(score), '1 - 0');
assert.equal(getGameDisplay(score), '0 - 0');
assert.equal(getScoreDisplay(score), '0 - 0');

score = playerGameFrom(scoreAtGames(5, 4));
assert.equal(getSetDisplay(score), '1 - 0');
assert.equal(getGameDisplay(score), '0 - 0');

score = playerGameFrom(scoreAtGames(5, 5));
assert.equal(getSetDisplay(score), '0 - 0');
assert.equal(getGameDisplay(score), '6 - 5');
assert.equal(score.tiebreakPending, false);

score = playerGameFrom(scoreAtGames(6, 5));
assert.equal(getSetDisplay(score), '1 - 0');
assert.equal(getGameDisplay(score), '0 - 0');

score = opponentGameFrom(scoreAtGames(6, 5));
assert.equal(getSetDisplay(score), '0 - 0');
assert.equal(getGameDisplay(score), '6 - 6');
assert.equal(getScoreDisplay(score), 'TB PENDING');
assert.equal(score.tiebreakPending, true);
assert.equal(isScoreAwardBlocked(score), true);
const frozenScore = playerPoint(score);
assert.deepEqual(frozenScore, score);

score = opponentGameFrom(scoreAtGames(0, 5));
assert.equal(getSetDisplay(score), '0 - 1');
assert.equal(getGameDisplay(score), '0 - 0');

score = opponentGameFrom(scoreAtGames(4, 5));
assert.equal(getSetDisplay(score), '0 - 1');
assert.equal(getGameDisplay(score), '0 - 0');

score = opponentGameFrom(scoreAtGames(5, 5));
assert.equal(getSetDisplay(score), '0 - 0');
assert.equal(getGameDisplay(score), '5 - 6');

score = opponentGameFrom(scoreAtGames(5, 6));
assert.equal(getSetDisplay(score), '0 - 1');
assert.equal(getGameDisplay(score), '0 - 0');

score = deuceAtGames(5, 0);
score = playerPoint(score);
score = playerPoint(score);
assert.equal(getSetDisplay(score), '1 - 0');
assert.equal(getGameDisplay(score), '0 - 0');

const originalDateNow = Date.now;
const originalSetInterval = globalThis.setInterval;
const originalClearInterval = globalThis.clearInterval;
let now = 1000;
try {
    Date.now = () => now;
    globalThis.setInterval = () => 1;
    globalThis.clearInterval = () => {};

    const pageInstance = { ...page.data, ...page };
    pageInstance.onInit();
    pageInstance.onStart();
    pageInstance.runtimeSession = {
        ...pageInstance.runtimeSession,
        ...scoreAtGames(5, 0)
    };
    pageInstance.refreshScoreDisplays();
    pageInstance.onPlayerPoint();
    pageInstance.onPlayerPoint();
    pageInstance.onPlayerPoint();
    pageInstance.onPlayerPoint();
    assert.equal(pageInstance.setDisplay, '1 - 0');
    now = 5000;
    pageInstance.onRequestFinish();
    pageInstance.onConfirmFinish();
    assert.equal(pageInstance.currentScreen, WORKOUT_STATES.QUICK_RESULT);
    assert.equal(pageInstance.quickSetScore, '1 - 0');
    assert.equal(pageInstance.quickGameScore, '0 - 0');
    pageInstance.onDone();
    assert.equal(pageInstance.setDisplay, '0 - 0');
    assert.equal(pageInstance.gameDisplay, '0 - 0');
    assert.equal(pageInstance.scoreDisplay, '0 - 0');
    assert.equal(pageInstance.scoreAwardBlocked, false);

    const pausedPage = { ...page.data, ...page };
    pausedPage.onInit();
    pausedPage.onStart();
    pausedPage.runtimeSession = {
        ...pausedPage.runtimeSession,
        ...scoreAtGames(5, 4),
        playerSets: 1
    };
    pausedPage.refreshScoreDisplays();
    pausedPage.onPause();
    pausedPage.onRequestFinish();
    pausedPage.onConfirmFinish();
    assert.equal(pausedPage.quickSetScore, '1 - 0');
    assert.equal(pausedPage.quickGameScore, '5 - 4');
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
assert.match(markup, /Sets/);
assert.match(markup, /\{\{ scoreDisplay \}\}/);
assert.match(markup, /score-control-disabled/);

console.log('P3-005 basic set contract: PASS');
