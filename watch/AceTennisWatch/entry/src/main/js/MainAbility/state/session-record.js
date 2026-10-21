import { POINT_MODES, SCORE_HISTORY_LIMIT } from './tennis-score.js';
import { WORKOUT_STATES } from './workout-state.js';

// Local Watch record schema. It is intentionally not a transport payload.
// Timestamps are caller-supplied UTC epoch milliseconds; shared contract
// timestamp representation remains proposed until DATA_CONTRACT is approved.
export const SESSION_RECORD_SCHEMA_VERSION = '1';

export const RECORD_STATUSES = Object.freeze({
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    INTERRUPTED: 'INTERRUPTED'
});

export const SCORE_STATUSES = Object.freeze({
    NORMAL: 'NORMAL',
    DEUCE: 'DEUCE',
    ADVANTAGE_PLAYER: 'ADVANTAGE_PLAYER',
    ADVANTAGE_OPPONENT: 'ADVANTAGE_OPPONENT',
    TB_PENDING: 'TB_PENDING'
});

const MAX_SAFE_INTEGER = 9007199254740991;
const SYNC_STATUSES = ['NOT_READY', 'PENDING', 'SYNCING', 'SYNCED', 'FAILED'];
const RECORD_STATUS_VALUES = [
    RECORD_STATUSES.IN_PROGRESS,
    RECORD_STATUSES.COMPLETED,
    RECORD_STATUSES.INTERRUPTED
];
const POINT_MODE_VALUES = [
    POINT_MODES.NORMAL,
    POINT_MODES.DEUCE,
    POINT_MODES.ADVANTAGE_PLAYER,
    POINT_MODES.ADVANTAGE_OPPONENT
];
const LIFECYCLE_STATUSES = [
    WORKOUT_STATES.ACTIVE_WORKOUT,
    WORKOUT_STATES.PAUSED,
    WORKOUT_STATES.FINISH_CONFIRMATION,
    WORKOUT_STATES.QUICK_RESULT,
    WORKOUT_STATES.COMPLETE
];
const SCORE_FIELDS = [
    'playerPointIndex',
    'opponentPointIndex',
    'playerSets',
    'opponentSets',
    'playerGames',
    'opponentGames',
    'pointMode',
    'tiebreakPending'
];

export class SessionRecordError extends Error {
    constructor(code) {
        super(code);
        this.name = 'SessionRecordError';
        this.code = code;
    }
}

export function createSessionRecord(input) {
    if (!isObject(input)) {
        throw new SessionRecordError('INVALID_RECORD');
    }

    const record = {
        schemaVersion: SESSION_RECORD_SCHEMA_VERSION,
        sessionId: input.sessionId,
        startedAt: input.startedAt,
        endedAt: input.endedAt === undefined ? null : input.endedAt,
        activeDurationMs: input.activeDurationMs,
        pausedDurationMs: input.pausedDurationMs,
        lifecycleStatus: input.lifecycleStatus,
        recordStatus: input.recordStatus,
        score: createScoreSnapshot(input.runtimeScore),
        mockHeartRate: createMockMetric(input.mockHeartRate),
        mockSwingCount: createMockMetric(input.mockSwingCount),
        syncStatus: input.syncStatus,
        revision: input.revision
    };

    assertValidSessionRecord(record);
    return record;
}

// ID allocation is an injected boundary: P4-002 neither uses a device random
// source nor treats a timestamp as globally unique.
export function createSessionRecordWithIdFactory(input, idFactory) {
    if (typeof idFactory !== 'function') {
        throw new SessionRecordError('INVALID_ID_FACTORY');
    }
    return createSessionRecord({
        ...input,
        sessionId: idFactory()
    });
}

export function createScoreSnapshot(runtimeScore) {
    if (!isObject(runtimeScore)) {
        throw new SessionRecordError('MISSING_FIELD');
    }
    const snapshot = copyCoreScore(runtimeScore);
    snapshot.scoreStatus = deriveScoreStatus(snapshot);
    snapshot.scoreHistory = createScoreHistorySnapshot(runtimeScore.scoreHistory);
    validateScoreSnapshot(snapshot);
    return snapshot;
}

export function toRuntimeScoreSnapshot(record) {
    assertValidSessionRecord(record);
    const runtimeScore = copyCoreScore(record.score);
    runtimeScore.scoreHistory = copyScoreHistory(record.score.scoreHistory);
    return runtimeScore;
}

export function validateSessionRecord(record) {
    try {
        assertValidSessionRecord(record);
        return { valid: true, code: null };
    } catch (error) {
        if (error instanceof SessionRecordError) {
            return { valid: false, code: error.code };
        }
        return { valid: false, code: 'INVALID_RECORD' };
    }
}

export function assertValidSessionRecord(record) {
    if (!isObject(record)) {
        throw new SessionRecordError('INVALID_RECORD');
    }
    if (record.schemaVersion !== SESSION_RECORD_SCHEMA_VERSION) {
        throw new SessionRecordError('UNSUPPORTED_SCHEMA_VERSION');
    }
    requireNonEmptyString(record.sessionId, 'MISSING_FIELD');
    requireEpochMs(record.startedAt, 'INVALID_TIMESTAMP');
    if (record.endedAt !== null) {
        requireEpochMs(record.endedAt, 'INVALID_TIMESTAMP');
        if (record.endedAt < record.startedAt) {
            throw new SessionRecordError('INVALID_TIMESTAMP');
        }
    }
    requireNonNegativeInteger(record.activeDurationMs, 'INVALID_DURATION');
    requireNonNegativeInteger(record.pausedDurationMs, 'INVALID_DURATION');
    requireOneOf(record.lifecycleStatus, LIFECYCLE_STATUSES, 'INVALID_LIFECYCLE_STATUS');
    requireOneOf(record.recordStatus, RECORD_STATUS_VALUES, 'INVALID_RECORD_STATUS');
    validateRecordLifecycle(record);
    validateScoreSnapshot(record.score);
    validateMockMetric(record.mockHeartRate);
    validateMockMetric(record.mockSwingCount);
    requireOneOf(record.syncStatus, SYNC_STATUSES, 'INVALID_SYNC_STATUS');
    requireNonNegativeInteger(record.revision, 'INVALID_REVISION');
    return record;
}

export function serializeSessionRecord(record) {
    assertValidSessionRecord(record);
    return JSON.stringify(record);
}

export function deserializeSessionRecord(serializedRecord) {
    if (typeof serializedRecord !== 'string') {
        throw new SessionRecordError('INVALID_SERIALIZED_RECORD');
    }
    let parsed;
    try {
        parsed = JSON.parse(serializedRecord);
    } catch (error) {
        throw new SessionRecordError('INVALID_JSON');
    }
    assertValidSessionRecord(parsed);
    return parsed;
}

function createMockMetric(value) {
    return {
        value: value,
        source: 'MOCK'
    };
}

function validateMockMetric(metric) {
    if (!isObject(metric) || !isNonNegativeInteger(metric.value) || metric.source !== 'MOCK') {
        throw new SessionRecordError('INVALID_MOCK_METRIC');
    }
}

function validateRecordLifecycle(record) {
    if (record.recordStatus === RECORD_STATUSES.COMPLETED) {
        if (record.endedAt === null) {
            throw new SessionRecordError('MISSING_END_TIME');
        }
        if (record.lifecycleStatus !== WORKOUT_STATES.QUICK_RESULT && record.lifecycleStatus !== WORKOUT_STATES.COMPLETE) {
            throw new SessionRecordError('INVALID_LIFECYCLE_STATUS');
        }
    }
    if (record.recordStatus === RECORD_STATUSES.IN_PROGRESS && record.endedAt !== null) {
        throw new SessionRecordError('INVALID_END_TIME');
    }
}

function validateScoreSnapshot(score) {
    if (!isObject(score)) {
        throw new SessionRecordError('INVALID_SCORE');
    }
    validateCoreScore(score);
    if (score.scoreStatus !== deriveScoreStatus(score)) {
        throw new SessionRecordError('INVALID_SCORE_STATUS');
    }
    if (!Array.isArray(score.scoreHistory) || score.scoreHistory.length > SCORE_HISTORY_LIMIT) {
        throw new SessionRecordError('INVALID_SCORE_HISTORY');
    }
    for (let index = 0; index < score.scoreHistory.length; index += 1) {
        validateCoreScore(score.scoreHistory[index]);
    }
}

function validateCoreScore(score) {
    for (let index = 0; index < SCORE_FIELDS.length; index += 1) {
        if (score[SCORE_FIELDS[index]] === undefined) {
            throw new SessionRecordError('INVALID_SCORE');
        }
    }
    requireNonNegativeInteger(score.playerPointIndex, 'INVALID_SCORE');
    requireNonNegativeInteger(score.opponentPointIndex, 'INVALID_SCORE');
    if (score.playerPointIndex > 3 || score.opponentPointIndex > 3) {
        throw new SessionRecordError('INVALID_SCORE');
    }
    requireNonNegativeInteger(score.playerSets, 'INVALID_SCORE');
    requireNonNegativeInteger(score.opponentSets, 'INVALID_SCORE');
    requireNonNegativeInteger(score.playerGames, 'INVALID_SCORE');
    requireNonNegativeInteger(score.opponentGames, 'INVALID_SCORE');
    requireOneOf(score.pointMode, POINT_MODE_VALUES, 'INVALID_SCORE');
    if (typeof score.tiebreakPending !== 'boolean') {
        throw new SessionRecordError('INVALID_SCORE');
    }
    if (score.tiebreakPending && (score.playerGames !== 6 || score.opponentGames !== 6)) {
        throw new SessionRecordError('INVALID_SCORE');
    }
    if (score.pointMode !== POINT_MODES.NORMAL && (score.playerPointIndex !== 3 || score.opponentPointIndex !== 3)) {
        throw new SessionRecordError('INVALID_SCORE');
    }
}

function deriveScoreStatus(score) {
    if (score.tiebreakPending === true) {
        return SCORE_STATUSES.TB_PENDING;
    }
    if (score.pointMode === POINT_MODES.DEUCE) {
        return SCORE_STATUSES.DEUCE;
    }
    if (score.pointMode === POINT_MODES.ADVANTAGE_PLAYER) {
        return SCORE_STATUSES.ADVANTAGE_PLAYER;
    }
    if (score.pointMode === POINT_MODES.ADVANTAGE_OPPONENT) {
        return SCORE_STATUSES.ADVANTAGE_OPPONENT;
    }
    return SCORE_STATUSES.NORMAL;
}

function copyCoreScore(score) {
    const copy = {};
    for (let index = 0; index < SCORE_FIELDS.length; index += 1) {
        const field = SCORE_FIELDS[index];
        copy[field] = score[field];
    }
    return copy;
}

function createScoreHistorySnapshot(scoreHistory) {
    if (scoreHistory === undefined) {
        return [];
    }
    return copyScoreHistory(scoreHistory);
}

function copyScoreHistory(scoreHistory) {
    if (!Array.isArray(scoreHistory) || scoreHistory.length > SCORE_HISTORY_LIMIT) {
        throw new SessionRecordError('INVALID_SCORE_HISTORY');
    }
    const history = [];
    for (let index = 0; index < scoreHistory.length; index += 1) {
        const snapshot = copyCoreScore(scoreHistory[index]);
        validateCoreScore(snapshot);
        history.push(snapshot);
    }
    return history;
}

function requireNonEmptyString(value, code) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new SessionRecordError(code);
    }
}

function requireEpochMs(value, code) {
    if (!isNonNegativeInteger(value)) {
        throw new SessionRecordError(code);
    }
}

function requireNonNegativeInteger(value, code) {
    if (!isNonNegativeInteger(value)) {
        throw new SessionRecordError(code);
    }
}

function requireOneOf(value, values, code) {
    if (values.indexOf(value) === -1) {
        throw new SessionRecordError(code);
    }
}

function isNonNegativeInteger(value) {
    return typeof value === 'number'
        && isFinite(value)
        && Math.floor(value) === value
        && value >= 0
        && value <= MAX_SAFE_INTEGER;
}

function isObject(value) {
    return value !== null && typeof value === 'object' && Array.isArray(value) === false;
}
