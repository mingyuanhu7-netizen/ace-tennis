import {
    RECORD_STATUSES,
    createSessionRecord as createModelSessionRecord,
    deserializeSessionRecord,
    serializeSessionRecord,
    validateSessionRecord
} from '../../../../../../../../watch/AceTennisWatch/entry/src/main/js/MainAbility/state/session-record.js';
import { WORKOUT_STATES } from '../../../../../../../../watch/AceTennisWatch/entry/src/main/js/MainAbility/state/workout-state.js';
import { createPointScore } from '../../../../../../../../watch/AceTennisWatch/entry/src/main/js/MainAbility/state/tennis-score.js';

export const COMPLETED_SESSION_STORAGE_KEY = 'acetennis:p4:session:test:001';
export const MISSING_SESSION_VALUE = '__P4_003_MISSING__';

const TEST_RECORD_STARTED_AT = 1735689600000;
const TEST_RECORD_ENDED_AT = 1735689740000;

export function createCompletedSessionTestRecord() {
    const score = createPointScore();
    score.playerSets = 1;
    score.playerGames = 3;
    score.opponentGames = 2;
    score.playerPointIndex = 2;
    score.opponentPointIndex = 1;
    score.scoreHistory = [];

    return createSessionRecord({
        sessionId: 'P4-003-TEST-001',
        startedAt: TEST_RECORD_STARTED_AT,
        endedAt: TEST_RECORD_ENDED_AT,
        activeDurationMs: 125000,
        pausedDurationMs: 15000,
        lifecycleStatus: WORKOUT_STATES.QUICK_RESULT,
        recordStatus: RECORD_STATUSES.COMPLETED,
        runtimeScore: score,
        mockHeartRate: 128,
        mockSwingCount: 36,
        syncStatus: 'NOT_READY',
        revision: 0
    });
}

export function createSessionRecord(input) {
    return createModelSessionRecord({
        sessionId: input.sessionId,
        startedAt: input.startedAt,
        endedAt: input.endedAt,
        activeDurationMs: input.activeDurationMs,
        pausedDurationMs: input.pausedDurationMs,
        lifecycleStatus: input.lifecycleStatus,
        recordStatus: input.recordStatus,
        runtimeScore: input.runtimeScore,
        mockHeartRate: input.mockHeartRate,
        mockSwingCount: input.mockSwingCount,
        syncStatus: input.syncStatus,
        revision: input.revision
    });
}

export function saveCompletedSession(storage, record, onResult) {
    let serialized;
    try {
        serialized = serializeSessionRecord(record);
    } catch (error) {
        onResult(failure('SAVE', error.code || 'RECORD_INVALID', error.message));
        return;
    }

    storage.set({
        key: COMPLETED_SESSION_STORAGE_KEY,
        value: serialized,
        success: function() {
            onResult(success('SAVE', record));
        },
        fail: function(data, code) {
            onResult(failure('SAVE', 'STORAGE_SET_FAILED', formatStorageError(data, code)));
        }
    });
}

export function readCompletedSession(storage, expectedRecord, onResult) {
    storage.get({
        key: COMPLETED_SESSION_STORAGE_KEY,
        default: MISSING_SESSION_VALUE,
        success: function(data) {
            if (data === MISSING_SESSION_VALUE || data === '') {
                onResult({ operation: 'READ', result: 'MISSING', code: 'MISSING_RECORD', error: 'NONE' });
                return;
            }

            let record;
            try {
                record = deserializeSessionRecord(data);
            } catch (error) {
                onResult(failure('READ', error.code || 'INVALID_RECORD', error.message));
                return;
            }

            const verification = verifyCompletedSession(expectedRecord, record);
            if (verification.result !== 'PASS') {
                onResult(failure('READ', verification.code, verification.mismatch));
                return;
            }
            onResult(success('READ', record));
        },
        fail: function(data, code) {
            onResult(failure('READ', 'STORAGE_GET_FAILED', formatStorageError(data, code)));
        }
    });
}

export function verifyCompletedSession(expectedRecord, actualRecord) {
    const expectedValidation = validateSessionRecord(expectedRecord);
    const actualValidation = validateSessionRecord(actualRecord);
    if (expectedValidation.valid !== true || actualValidation.valid !== true) {
        return { result: 'FAIL', code: 'INVALID_RECORD', mismatch: 'RECORD_VALIDATION' };
    }

    const comparisons = [
        ['schemaVersion', expectedRecord.schemaVersion, actualRecord.schemaVersion],
        ['sessionId', expectedRecord.sessionId, actualRecord.sessionId],
        ['recordStatus', expectedRecord.recordStatus, actualRecord.recordStatus],
        ['startedAt', expectedRecord.startedAt, actualRecord.startedAt],
        ['endedAt', expectedRecord.endedAt, actualRecord.endedAt],
        ['activeDurationMs', expectedRecord.activeDurationMs, actualRecord.activeDurationMs],
        ['pausedDurationMs', expectedRecord.pausedDurationMs, actualRecord.pausedDurationMs],
        ['playerSets', expectedRecord.score.playerSets, actualRecord.score.playerSets],
        ['opponentSets', expectedRecord.score.opponentSets, actualRecord.score.opponentSets],
        ['playerGames', expectedRecord.score.playerGames, actualRecord.score.playerGames],
        ['opponentGames', expectedRecord.score.opponentGames, actualRecord.score.opponentGames],
        ['playerPointIndex', expectedRecord.score.playerPointIndex, actualRecord.score.playerPointIndex],
        ['opponentPointIndex', expectedRecord.score.opponentPointIndex, actualRecord.score.opponentPointIndex],
        ['heartRateSource', expectedRecord.mockHeartRate.source, actualRecord.mockHeartRate.source],
        ['swingSource', expectedRecord.mockSwingCount.source, actualRecord.mockSwingCount.source],
        ['syncStatus', expectedRecord.syncStatus, actualRecord.syncStatus]
    ];

    for (let index = 0; index < comparisons.length; index += 1) {
        if (comparisons[index][1] !== comparisons[index][2]) {
            return { result: 'FAIL', code: 'FIELD_MISMATCH', mismatch: comparisons[index][0] };
        }
    }
    return { result: 'PASS', code: null, mismatch: null };
}

function success(operation, record) {
    return {
        operation: operation,
        result: 'PASS',
        code: null,
        error: 'NONE',
        record: record
    };
}

function failure(operation, code, error) {
    return {
        operation: operation,
        result: 'FAIL',
        code: code,
        error: error || 'UNKNOWN',
        record: null
    };
}

function formatStorageError(data, code) {
    if (code === undefined || code === null) {
        return data ? String(data) : 'UNKNOWN';
    }
    return String(code) + ': ' + (data ? String(data) : 'UNKNOWN');
}
