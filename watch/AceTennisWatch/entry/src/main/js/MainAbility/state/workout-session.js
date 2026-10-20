import { WORKOUT_EVENTS, WORKOUT_STATES } from './workout-state.js';

export { WORKOUT_EVENTS, WORKOUT_STATES };

const MOCK_HEART_RATE = 128;
const MOCK_SWING_COUNT = 36;
const MOCK_SCORE_DISPLAY = '30 - 15';

export function createWorkoutSession() {
    return {
        sessionId: null,
        state: WORKOUT_STATES.READY,
        startedAt: null,
        accumulatedActiveMs: 0,
        activeSegmentStartedAt: null,
        playerPointIndex: 0,
        opponentPointIndex: 0,
        playerGames: 0,
        opponentGames: 0,
        mockHeartRate: MOCK_HEART_RATE,
        mockSwingCount: MOCK_SWING_COUNT,
        mockScoreDisplay: MOCK_SCORE_DISPLAY,
        finishReturnState: null
    };
}

export function resetWorkoutSession() {
    return createWorkoutSession();
}

export function dispatchWorkoutEvent(session, event, now = Date.now()) {
    switch (event) {
        case WORKOUT_EVENTS.START:
            if (session.state !== WORKOUT_STATES.READY) {
                return session;
            }
            return {
                ...session,
                sessionId: `mock-session-${now}`,
                state: WORKOUT_STATES.ACTIVE_WORKOUT,
                startedAt: now,
                activeSegmentStartedAt: now
            };
        case WORKOUT_EVENTS.PAUSE:
            if (session.state !== WORKOUT_STATES.ACTIVE_WORKOUT) {
                return session;
            }
            return {
                ...settleActiveSegment(session, now),
                state: WORKOUT_STATES.PAUSED
            };
        case WORKOUT_EVENTS.RESUME:
            if (session.state !== WORKOUT_STATES.PAUSED) {
                return session;
            }
            return {
                ...session,
                state: WORKOUT_STATES.ACTIVE_WORKOUT,
                activeSegmentStartedAt: now
            };
        case WORKOUT_EVENTS.REQUEST_FINISH:
            if (session.state !== WORKOUT_STATES.ACTIVE_WORKOUT && session.state !== WORKOUT_STATES.PAUSED) {
                return session;
            }
            return {
                ...(session.state === WORKOUT_STATES.ACTIVE_WORKOUT ? settleActiveSegment(session, now) : session),
                state: WORKOUT_STATES.FINISH_CONFIRMATION,
                finishReturnState: session.state
            };
        case WORKOUT_EVENTS.CANCEL_FINISH:
            if (session.state !== WORKOUT_STATES.FINISH_CONFIRMATION) {
                return session;
            }
            if (session.finishReturnState === WORKOUT_STATES.ACTIVE_WORKOUT) {
                return {
                    ...session,
                    state: WORKOUT_STATES.ACTIVE_WORKOUT,
                    activeSegmentStartedAt: now,
                    finishReturnState: null
                };
            }
            return {
                ...session,
                state: WORKOUT_STATES.PAUSED,
                finishReturnState: null
            };
        case WORKOUT_EVENTS.CONFIRM_FINISH:
            if (session.state !== WORKOUT_STATES.FINISH_CONFIRMATION) {
                return session;
            }
            return {
                ...session,
                state: WORKOUT_STATES.QUICK_RESULT,
                finishReturnState: null
            };
        case WORKOUT_EVENTS.DONE:
            if (session.state !== WORKOUT_STATES.QUICK_RESULT) {
                return session;
            }
            return {
                ...session,
                state: WORKOUT_STATES.COMPLETE
            };
        default:
            return session;
    }
}

export function getElapsedActiveMs(session, now = Date.now()) {
    if (session.state !== WORKOUT_STATES.ACTIVE_WORKOUT || session.activeSegmentStartedAt === null) {
        return session.accumulatedActiveMs;
    }
    return session.accumulatedActiveMs + Math.max(0, now - session.activeSegmentStartedAt);
}

export function formatElapsedTime(elapsedMs) {
    const totalSeconds = Math.floor(Math.max(0, elapsedMs) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const paddedSeconds = padTwo(seconds);
    if (hours > 0) {
        return `${hours}:${padTwo(minutes)}:${paddedSeconds}`;
    }
    return `${padTwo(minutes)}:${paddedSeconds}`;
}

function padTwo(value) {
    return value < 10 ? `0${value}` : String(value);
}

function settleActiveSegment(session, now) {
    return {
        ...session,
        accumulatedActiveMs: getElapsedActiveMs(session, now),
        activeSegmentStartedAt: null
    };
}
