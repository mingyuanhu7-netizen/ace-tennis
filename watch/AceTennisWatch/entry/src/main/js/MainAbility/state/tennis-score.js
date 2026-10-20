export const SCORE_EVENTS = Object.freeze({
    PLAYER_POINT: 'PLAYER_POINT',
    OPPONENT_POINT: 'OPPONENT_POINT'
});

const POINT_LABELS = ['0', '15', '30', '40'];
const MAX_POINT_INDEX = POINT_LABELS.length - 1;

export function createPointScore() {
    return {
        playerPointIndex: 0,
        opponentPointIndex: 0,
        playerGames: 0,
        opponentGames: 0
    };
}

export function dispatchScoreEvent(score, event) {
    switch (event) {
        case SCORE_EVENTS.PLAYER_POINT:
            if (score.playerPointIndex === MAX_POINT_INDEX && score.opponentPointIndex < MAX_POINT_INDEX) {
                return {
                    ...score,
                    playerPointIndex: 0,
                    opponentPointIndex: 0,
                    playerGames: score.playerGames + 1
                };
            }
            return {
                ...score,
                playerPointIndex: Math.min(MAX_POINT_INDEX, score.playerPointIndex + 1)
            };
        case SCORE_EVENTS.OPPONENT_POINT:
            if (score.opponentPointIndex === MAX_POINT_INDEX && score.playerPointIndex < MAX_POINT_INDEX) {
                return {
                    ...score,
                    playerPointIndex: 0,
                    opponentPointIndex: 0,
                    opponentGames: score.opponentGames + 1
                };
            }
            return {
                ...score,
                opponentPointIndex: Math.min(MAX_POINT_INDEX, score.opponentPointIndex + 1)
            };
        default:
            return score;
    }
}

export function getScoreDisplay(score) {
    return `${POINT_LABELS[score.playerPointIndex]} - ${POINT_LABELS[score.opponentPointIndex]}`;
}

export function getGameDisplay(score) {
    return `${score.playerGames} - ${score.opponentGames}`;
}
