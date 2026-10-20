export const SCORE_EVENTS = Object.freeze({
    PLAYER_POINT: 'PLAYER_POINT',
    OPPONENT_POINT: 'OPPONENT_POINT'
});

const POINT_LABELS = ['0', '15', '30', '40'];
const MAX_POINT_INDEX = POINT_LABELS.length - 1;

export function createPointScore() {
    return {
        playerPointIndex: 0,
        opponentPointIndex: 0
    };
}

export function dispatchScoreEvent(score, event) {
    switch (event) {
        case SCORE_EVENTS.PLAYER_POINT:
            return {
                ...score,
                playerPointIndex: Math.min(MAX_POINT_INDEX, score.playerPointIndex + 1)
            };
        case SCORE_EVENTS.OPPONENT_POINT:
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
