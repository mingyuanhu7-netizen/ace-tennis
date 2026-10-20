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

export function createPointScore() {
    return {
        playerPointIndex: 0,
        opponentPointIndex: 0,
        playerGames: 0,
        opponentGames: 0,
        pointMode: POINT_MODES.NORMAL
    };
}

export function dispatchScoreEvent(score, event) {
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
    return {
        ...score,
        playerPointIndex: 0,
        opponentPointIndex: 0,
        playerGames: score.playerGames + 1,
        pointMode: POINT_MODES.NORMAL
    };
}

function awardOpponentGame(score) {
    return {
        ...score,
        playerPointIndex: 0,
        opponentPointIndex: 0,
        opponentGames: score.opponentGames + 1,
        pointMode: POINT_MODES.NORMAL
    };
}
