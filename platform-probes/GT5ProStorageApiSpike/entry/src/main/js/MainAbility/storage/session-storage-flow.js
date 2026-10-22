import {
    RECORD_STATUSES,
    createSessionRecord as createModelSessionRecord,
    deserializeSessionRecord,
    serializeSessionRecord,
    validateSessionRecord
} from '../../../../../../../../watch/AceTennisWatch/entry/src/main/js/MainAbility/state/session-record.js';
import { WORKOUT_STATES } from '../../../../../../../../watch/AceTennisWatch/entry/src/main/js/MainAbility/state/workout-state.js';
import { createPointScore } from '../../../../../../../../watch/AceTennisWatch/entry/src/main/js/MainAbility/state/tennis-score.js';

export const COMPLETED_SESSION_STORAGE_KEY = 'at_p4_session_001';
export const MISSING_SESSION_VALUE = '__P4_003_MISSING__';
export const SIMPLE_DIAGNOSTIC_VALUE = '{"probe":"P4-003-R02","value":"SIMPLE"}';

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

export function runWriteDiagnostic(storage, record, onComplete) {
    const steps = [];
    const simpleValue = SIMPLE_DIAGNOSTIC_VALUE;
    const sessionValue = serializeSessionRecord(record);

    function finish() {
        const passed = steps.length === 2 && steps[0].result === 'PASS' && steps[1].result === 'PASS';
        onComplete({ result: passed ? 'PASS' : 'FAIL', steps: steps });
    }

    function writeSessionValue() {
        const modelValidation = validateSessionRecord(record);
        let jsonValid = false;
        try {
            JSON.parse(sessionValue);
            jsonValid = true;
        } catch (error) {
            jsonValid = false;
        }
        if (modelValidation.valid !== true || jsonValid !== true) {
            steps.push(diagnosticFailure('B_SESSION_RECORD', sessionValue, jsonValid, modelValidation.valid === true, 'PREWRITE_VALIDATION'));
            finish();
            return;
        }
        storage.set({
            key: COMPLETED_SESSION_STORAGE_KEY,
            value: sessionValue,
            success: function() {
                steps.push(diagnosticSuccess('B_SESSION_RECORD', sessionValue, true, true));
                finish();
            },
            fail: function(data, code) {
                steps.push(diagnosticFailure('B_SESSION_RECORD', sessionValue, true, true, formatStorageError(data, code)));
                finish();
            }
        });
    }

    let simpleJsonValid = false;
    try {
        JSON.parse(simpleValue);
        simpleJsonValid = true;
    } catch (error) {
        simpleJsonValid = false;
    }
    if (simpleJsonValid !== true) {
        steps.push(diagnosticFailure('A_SIMPLE_JSON', simpleValue, false, null, 'PREWRITE_JSON'));
        writeSessionValue();
        return;
    }
    storage.set({
        key: COMPLETED_SESSION_STORAGE_KEY,
        value: simpleValue,
        success: function() {
            steps.push(diagnosticSuccess('A_SIMPLE_JSON', simpleValue, true, null));
            writeSessionValue();
        },
        fail: function(data, code) {
            steps.push(diagnosticFailure('A_SIMPLE_JSON', simpleValue, true, null, formatStorageError(data, code)));
            writeSessionValue();
        }
    });
}

export function createSizeDiagnosticCases(record) {
    return [
        sizeCase('A_39B_SIMPLE', 'at_p4_size_a', SIMPLE_DIAGNOSTIC_VALUE, null),
        sizeCase('B_128B', 'at_p4_size_b', createPaddedJson(128), null),
        sizeCase('C_256B', 'at_p4_size_c', createPaddedJson(256), null),
        sizeCase('D_384B', 'at_p4_size_d', createPaddedJson(384), null),
        sizeCase('E_548B', 'at_p4_size_e', createPaddedJson(548), null),
        sizeCase('F_SESSION_RECORD', 'at_p4_size_f', serializeSessionRecord(record), record)
    ];
}

export function runSizeDiagnostic(storage, record, onComplete) {
    const cases = createSizeDiagnosticCases(record);
    const steps = [];

    function writeAt(index) {
        if (index >= cases.length) {
            onComplete({ result: steps.every((step) => step.result === 'PASS') ? 'PASS' : 'FAIL', steps: steps });
            return;
        }
        const item = cases[index];
        let jsonValid = false;
        try {
            JSON.parse(item.value);
            jsonValid = true;
        } catch (error) {
            jsonValid = false;
        }
        if (jsonValid !== true || (item.record !== null && validateSessionRecord(item.record).valid !== true)) {
            steps.push(diagnosticFailure(item.label, item.value, jsonValid, item.record === null ? null : false, 'PREWRITE_VALIDATION'));
            writeAt(index + 1);
            return;
        }
        storage.set({
            key: item.key,
            value: item.value,
            success: function() {
                steps.push(diagnosticSuccess(item.label, item.value, true, item.record === null ? null : true));
                writeAt(index + 1);
            },
            fail: function(data, code) {
                steps.push(diagnosticFailure(item.label, item.value, true, item.record === null ? null : true, formatStorageError(data, code)));
                writeAt(index + 1);
            }
        });
    }

    writeAt(0);
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

function diagnosticSuccess(label, value, jsonValid, modelValid) {
    return {
        label: label,
        result: 'PASS',
        error: 'NONE',
        valueType: typeof value,
        byteLength: utf8ByteLength(value),
        jsonValid: jsonValid,
        modelValid: modelValid
    };
}

function diagnosticFailure(label, value, jsonValid, modelValid, error) {
    return {
        label: label,
        result: 'FAIL',
        error: error || 'UNKNOWN',
        valueType: typeof value,
        byteLength: utf8ByteLength(value),
        jsonValid: jsonValid,
        modelValid: modelValid
    };
}

function sizeCase(label, key, value, record) {
    return {
        label: label,
        key: key,
        value: value,
        valueType: typeof value,
        byteLength: utf8ByteLength(value),
        jsonValid: isJson(value),
        record: record
    };
}

function createPaddedJson(targetBytes) {
    let payload = '';
    let value = JSON.stringify({ probe: 'P4-003-R03', payload: payload });
    while (utf8ByteLength(value) < targetBytes) {
        payload += 'x';
        value = JSON.stringify({ probe: 'P4-003-R03', payload: payload });
    }
    return value;
}

function isJson(value) {
    try {
        JSON.parse(value);
        return true;
    } catch (error) {
        return false;
    }
}

function utf8ByteLength(value) {
    let length = 0;
    for (let index = 0; index < value.length; index += 1) {
        const code = value.charCodeAt(index);
        if (code < 0x80) {
            length += 1;
        } else if (code < 0x800) {
            length += 2;
        } else if (code >= 0xD800 && code <= 0xDBFF && index + 1 < value.length) {
            length += 4;
            index += 1;
        } else {
            length += 3;
        }
    }
    return length;
}
