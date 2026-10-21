import assert from 'node:assert/strict';
import {
    RECORD_STATUSES,
    SCORE_STATUSES,
    SESSION_RECORD_SCHEMA_VERSION,
    createScoreSnapshot,
    createSessionRecord,
    createSessionRecordWithIdFactory,
    deserializeSessionRecord,
    serializeSessionRecord,
    toRuntimeScoreSnapshot,
    validateSessionRecord
} from '../entry/src/main/js/MainAbility/state/session-record.js';
import {
    POINT_MODES,
    SCORE_EVENTS,
    applyScoreEventWithHistory,
    createPointScore,
    createScoreHistory,
    getScoreDisplay,
    undoLastScoreEvent
} from '../entry/src/main/js/MainAbility/state/tennis-score.js';
import { WORKOUT_STATES } from '../entry/src/main/js/MainAbility/state/workout-state.js';

const startedAt = 1735689600000;
const endedAt = startedAt + 5000;

function makeRecord(overrides = {}) {
    return createSessionRecord({
        sessionId: 'watch-001',
        startedAt: startedAt,
        endedAt: null,
        activeDurationMs: 0,
        pausedDurationMs: 0,
        lifecycleStatus: WORKOUT_STATES.ACTIVE_WORKOUT,
        recordStatus: RECORD_STATUSES.IN_PROGRESS,
        runtimeScore: createPointScore(),
        mockHeartRate: 128,
        mockSwingCount: 36,
        syncStatus: 'NOT_READY',
        revision: 0,
        ...overrides
    });
}

const created = makeRecord();
assert.equal(created.schemaVersion, SESSION_RECORD_SCHEMA_VERSION);
assert.equal(created.sessionId, 'watch-001');
assert.equal(created.startedAt, startedAt);
assert.equal(created.endedAt, null);
assert.equal(created.activeDurationMs, 0);
assert.equal(created.pausedDurationMs, 0);
assert.equal(created.score.scoreStatus, SCORE_STATUSES.NORMAL);
assert.equal(created.mockHeartRate.source, 'MOCK');
assert.equal(created.mockSwingCount.source, 'MOCK');
assert.equal(created.syncStatus, 'NOT_READY');
assert.equal(created.revision, 0);
assert.equal(validateSessionRecord(created).valid, true);

const fromFactory = createSessionRecordWithIdFactory({
    startedAt: startedAt,
    activeDurationMs: 0,
    pausedDurationMs: 0,
    lifecycleStatus: WORKOUT_STATES.PAUSED,
    recordStatus: RECORD_STATUSES.IN_PROGRESS,
    runtimeScore: createPointScore(),
    mockHeartRate: 128,
    mockSwingCount: 36,
    syncStatus: 'NOT_READY',
    revision: 0
}, () => 'injected-id-001');
assert.equal(fromFactory.sessionId, 'injected-id-001');

const paused = makeRecord({
    lifecycleStatus: WORKOUT_STATES.PAUSED,
    activeDurationMs: 2400,
    pausedDurationMs: 900
});
assert.equal(paused.activeDurationMs, 2400);
assert.equal(paused.pausedDurationMs, 900);

const interrupted = makeRecord({
    lifecycleStatus: WORKOUT_STATES.PAUSED,
    recordStatus: RECORD_STATUSES.INTERRUPTED,
    activeDurationMs: 2400,
    pausedDurationMs: 900
});
assert.equal(interrupted.recordStatus, RECORD_STATUSES.INTERRUPTED);
assert.equal(validateSessionRecord(interrupted).valid, true);

const shortCompleted = makeRecord({
    lifecycleStatus: WORKOUT_STATES.QUICK_RESULT,
    recordStatus: RECORD_STATUSES.COMPLETED,
    endedAt: endedAt,
    activeDurationMs: 1
});
assert.equal(deserializeSessionRecord(serializeSessionRecord(shortCompleted)).activeDurationMs, 1);

let score = createPointScore();
let scoreHistory = createScoreHistory();
let result = applyScoreEventWithHistory(score, scoreHistory, SCORE_EVENTS.PLAYER_POINT);
score = result.score;
scoreHistory = result.scoreHistory;
result = applyScoreEventWithHistory(score, scoreHistory, SCORE_EVENTS.PLAYER_POINT);
score = result.score;
scoreHistory = result.scoreHistory;
result = applyScoreEventWithHistory(score, scoreHistory, SCORE_EVENTS.OPPONENT_POINT);
score = result.score;
scoreHistory = result.scoreHistory;

const scoreRecord = makeRecord({
    runtimeScore: { ...score, scoreHistory: scoreHistory }
});
const restoredScore = toRuntimeScoreSnapshot(scoreRecord);
assert.equal(getScoreDisplay(restoredScore), '30 - 15');
result = undoLastScoreEvent(restoredScore, restoredScore.scoreHistory);
assert.equal(getScoreDisplay(result.score), '30 - 0');

const deuceSnapshot = createScoreSnapshot({
    ...createPointScore(),
    playerPointIndex: 3,
    opponentPointIndex: 3,
    pointMode: POINT_MODES.DEUCE,
    scoreHistory: []
});
assert.equal(deuceSnapshot.scoreStatus, SCORE_STATUSES.DEUCE);

const tiebreakSnapshot = createScoreSnapshot({
    ...createPointScore(),
    playerGames: 6,
    opponentGames: 6,
    tiebreakPending: true,
    scoreHistory: []
});
assert.equal(tiebreakSnapshot.scoreStatus, SCORE_STATUSES.TB_PENDING);

assert.equal(validateSessionRecord({ ...created, schemaVersion: '0' }).code, 'UNSUPPORTED_SCHEMA_VERSION');
assert.equal(validateSessionRecord({ ...created, startedAt: -1 }).code, 'INVALID_TIMESTAMP');
assert.equal(validateSessionRecord({ ...created, activeDurationMs: -1 }).code, 'INVALID_DURATION');
assert.equal(validateSessionRecord({ ...created, score: { ...created.score, scoreStatus: SCORE_STATUSES.DEUCE } }).code, 'INVALID_SCORE_STATUS');
assert.equal(validateSessionRecord({ ...created, score: { ...created.score, playerPointIndex: '3' } }).code, 'INVALID_SCORE');
assert.equal(validateSessionRecord({ ...shortCompleted, endedAt: null }).code, 'MISSING_END_TIME');
assert.throws(() => deserializeSessionRecord('{'), /INVALID_JSON/);
assert.throws(() => deserializeSessionRecord(JSON.stringify({ schemaVersion: '999' })), /UNSUPPORTED_SCHEMA_VERSION/);
assert.throws(() => createSessionRecord({ sessionId: 'not-enough-fields' }), /MISSING_FIELD/);

console.log('P4-002 session record model: PASS');
