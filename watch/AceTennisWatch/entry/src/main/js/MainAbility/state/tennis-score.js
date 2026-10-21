export const SCORE_EVENTS = Object.freeze({
    PLAYER_POINT: 'PLAYER_POINT',
    OPPONENT_POINT: 'OPPONENT_POINT'
});

export const POINT_MODES = Object.freeze({
    NORMAL: 'NORMAL',
    DEUCE: 'DEUCE',
    ADVANTAGE_PLAYER: 'ADVANTAGE_PLAYER',
    ADVANTAGE_OPPONENT: 'ADVANTAGE_OPPONENT'
});

const POINT_LABELS = ['0', '15', '30', '40'];
const MAX_POINT_INDEX = POINT_LABELS.length - 1;
const SCORE_SNAPSHOT_FIELDS = [
    'playerPointIndex',
    'opponentPointIndex',
    'playerSets',
    'opponentSets',
    'playerGames',
    'opponentGames',
    'pointMode',
    'tiebreakPending'
];

export const SCORE_HISTORY_LIMIT = 64;

export function createPointScore() {
    return {
        playerPointIndex: 0,
        opponentPointIndex: 0,
        playerSets: 0,
        opponentSets: 0,
        playerGames: 0,
        opponentGames: 0,
        pointMode: POINT_MODES.NORMAL,
        tiebreakPending: false
    };
}

export function dispatchScoreEvent(score, event) {
    if (isScoreAwardBlocked(score)) {
        return score;
    }
    switch (event) {
        case SCORE_EVENTS.PLAYER_POINT:
            return handlePlayerPoint(score);
        case SCORE_EVENTS.OPPONENT_POINT:
            return handleOpponentPoint(score);
        default:
            return score;
    }
}

export function getScoreDisplay(score) {
    if (score.tiebreakPending) {
        return 'TB PENDING';
    }
    if (score.pointMode === POINT_MODES.DEUCE) {
        return 'DEUCE';
    }
    if (score.pointMode === POINT_MODES.ADVANTAGE_PLAYER) {
        return 'ADV YOU';
    }
    if (score.pointMode === POINT_MODES.ADVANTAGE_OPPONENT) {
        return 'ADV OPP';
    }
    return `${POINT_LABELS[score.playerPointIndex]} - ${POINT_LABELS[score.opponentPointIndex]}`;
}

export function getGameDisplay(score) {
    return `${score.playerGames} - ${score.opponentGames}`;
}

export function getSetDisplay(score) {
    return `${score.playerSets} - ${score.opponentSets}`;
}

export function isScoreAwardBlocked(score) {
    return score.tiebreakPending === true;
}

export function createScoreHistory() {
    return [];
}

export function applyScoreEventWithHistory(score, scoreHistory, event) {
    const nextScore = dispatchScoreEvent(score, event);
    if (!hasScoreChanged(score, nextScore)) {
        return {
            score: nextScore,
            scoreHistory,
            eventApplied: false
        };
    }
    return {
        score: nextScore,
        scoreHistory: appendScoreSnapshot(scoreHistory, createScoreSnapshot(score)),
        eventApplied: true
    };
}

export function undoLastScoreEvent(score, scoreHistory) {
    if (scoreHistory.length === 0) {
        return {
            score,
            scoreHistory,
            didUndo: false
        };
    }
    const nextHistory = scoreHistory.slice(0, scoreHistory.length - 1);
    return {
        score: restoreScoreSnapshot(score, scoreHistory[scoreHistory.length - 1]),
        scoreHistory: nextHistory,
        didUndo: true
    };
}

function handlePlayerPoint(score) {
    if (score.pointMode === POINT_MODES.DEUCE) {
        return { ...score, pointMode: POINT_MODES.ADVANTAGE_PLAYER };
    }
    if (score.pointMode === POINT_MODES.ADVANTAGE_PLAYER) {
        return awardPlayerGame(score);
    }
    if (score.pointMode === POINT_MODES.ADVANTAGE_OPPONENT) {
        return { ...score, pointMode: POINT_MODES.DEUCE };
    }
    if (score.playerPointIndex === MAX_POINT_INDEX && score.opponentPointIndex < MAX_POINT_INDEX) {
        return awardPlayerGame(score);
    }
    return advanceNormalPoint(score, 'playerPointIndex');
}

function handleOpponentPoint(score) {
    if (score.pointMode === POINT_MODES.DEUCE) {
        return { ...score, pointMode: POINT_MODES.ADVANTAGE_OPPONENT };
    }
    if (score.pointMode === POINT_MODES.ADVANTAGE_OPPONENT) {
        return awardOpponentGame(score);
    }
    if (score.pointMode === POINT_MODES.ADVANTAGE_PLAYER) {
        return { ...score, pointMode: POINT_MODES.DEUCE };
    }
    if (score.opponentPointIndex === MAX_POINT_INDEX && score.playerPointIndex < MAX_POINT_INDEX) {
        return awardOpponentGame(score);
    }
    return advanceNormalPoint(score, 'opponentPointIndex');
}

function advanceNormalPoint(score, pointKey) {
    const nextScore = {
        ...score,
        [pointKey]: Math.min(MAX_POINT_INDEX, score[pointKey] + 1)
    };
    if (nextScore.playerPointIndex === MAX_POINT_INDEX && nextScore.opponentPointIndex === MAX_POINT_INDEX) {
        return { ...nextScore, pointMode: POINT_MODES.DEUCE };
    }
    return nextScore;
}

function awardPlayerGame(score) {
    return resolveSetOrTiebreak({
        ...score,
        playerPointIndex: 0,
        opponentPointIndex: 0,
        playerGames: score.playerGames + 1,
        pointMode: POINT_MODES.NORMAL
    });
}

function awardOpponentGame(score) {
    return resolveSetOrTiebreak({
        ...score,
        playerPointIndex: 0,
        opponentPointIndex: 0,
        opponentGames: score.opponentGames + 1,
        pointMode: POINT_MODES.NORMAL
    });
}

function resolveSetOrTiebreak(score) {
    if (score.playerGames >= 6 && score.playerGames - score.opponentGames >= 2) {
        return awardPlayerSet(score);
    }
    if (score.opponentGames >= 6 && score.opponentGames - score.playerGames >= 2) {
        return awardOpponentSet(score);
    }
    if (score.playerGames === 6 && score.opponentGames === 6) {
        return { ...score, tiebreakPending: true };
    }
    return score;
}

function awardPlayerSet(score) {
    return {
        ...score,
        playerSets: score.playerSets + 1,
        playerGames: 0,
        opponentGames: 0,
        playerPointIndex: 0,
        opponentPointIndex: 0,
        pointMode: POINT_MODES.NORMAL,
        tiebreakPending: false
    };
}

function awardOpponentSet(score) {
    return {
        ...score,
        opponentSets: score.opponentSets + 1,
        playerGames: 0,
        opponentGames: 0,
        playerPointIndex: 0,
        opponentPointIndex: 0,
        pointMode: POINT_MODES.NORMAL,
        tiebreakPending: false
    };
}

function createScoreSnapshot(score) {
    const snapshot = {};
    for (let index = 0; index < SCORE_SNAPSHOT_FIELDS.length; index += 1) {
        const field = SCORE_SNAPSHOT_FIELDS[index];
        snapshot[field] = score[field];
    }
    return snapshot;
}

function restoreScoreSnapshot(score, snapshot) {
    const restored = { ...score };
    for (let index = 0; index < SCORE_SNAPSHOT_FIELDS.length; index += 1) {
        const field = SCORE_SNAPSHOT_FIELDS[index];
        restored[field] = snapshot[field];
    }
    return restored;
}

function appendScoreSnapshot(scoreHistory, snapshot) {
    const nextHistory = scoreHistory.concat([snapshot]);
    if (nextHistory.length <= SCORE_HISTORY_LIMIT) {
        return nextHistory;
    }
    return nextHistory.slice(nextHistory.length - SCORE_HISTORY_LIMIT);
}

function hasScoreChanged(previousScore, nextScore) {
    for (let index = 0; index < SCORE_SNAPSHOT_FIELDS.length; index += 1) {
        const field = SCORE_SNAPSHOT_FIELDS[index];
        if (previousScore[field] !== nextScore[field]) {
            return true;
        }
    }
    return false;
}
