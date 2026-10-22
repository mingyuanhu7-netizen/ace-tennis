import assert from 'node:assert/strict';
import {
    COMPLETED_SESSION_STORAGE_KEY,
    createCompletedSessionTestRecord,
    createSizeDiagnosticCases,
    readCompletedSession,
    runWriteDiagnostic,
    runSizeDiagnostic,
    saveCompletedSession,
    verifyCompletedSession
} from '../entry/src/main/js/MainAbility/storage/session-storage-flow.js';

class FakeStorage {
    constructor() {
        this.values = new Map();
        this.nextSetFailure = null;
        this.nextGetFailure = null;
    }

    set(options) {
        if (this.nextSetFailure) {
            options.fail(this.nextSetFailure.data, this.nextSetFailure.code);
            this.nextSetFailure = null;
            return;
        }
        this.values.set(options.key, options.value);
        options.success();
    }

    get(options) {
        if (this.nextGetFailure) {
            options.fail(this.nextGetFailure.data, this.nextGetFailure.code);
            this.nextGetFailure = null;
            return;
        }
        options.success(this.values.has(options.key) ? this.values.get(options.key) : options.default);
    }
}

const storage = new FakeStorage();
const expected = createCompletedSessionTestRecord();

assert.equal(COMPLETED_SESSION_STORAGE_KEY, 'at_p4_session_001');
assert.equal(COMPLETED_SESSION_STORAGE_KEY.length <= 32, true);
assert.equal(expected.sessionId, 'P4-003-TEST-001');
assert.equal(expected.recordStatus, 'COMPLETED');
assert.equal(expected.activeDurationMs, 125000);
assert.equal(expected.pausedDurationMs, 15000);
assert.equal(expected.score.playerSets, 1);
assert.equal(expected.score.playerGames, 3);
assert.equal(expected.score.playerPointIndex, 2);
assert.equal(expected.score.opponentPointIndex, 1);

let result;
readCompletedSession(storage, expected, (value) => {
    result = value;
});
assert.equal(result.result, 'MISSING');
assert.equal(result.code, 'MISSING_RECORD');

result = null;
saveCompletedSession(storage, expected, (value) => {
    result = value;
});
assert.equal(result.result, 'PASS');
assert.equal(result.operation, 'SAVE');
assert.equal(storage.values.size, 1);

result = null;
readCompletedSession(storage, expected, (value) => {
    result = value;
});
assert.equal(result.result, 'PASS');
assert.equal(result.operation, 'READ');
assert.equal(result.record.sessionId, 'P4-003-TEST-001');
assert.equal(result.record.score.playerGames, 3);
assert.equal(result.record.mockHeartRate.source, 'MOCK');

const verification = verifyCompletedSession(expected, result.record);
assert.equal(verification.result, 'PASS');
assert.equal(verification.mismatch, null);

result = null;
saveCompletedSession(storage, expected, (value) => {
    result = value;
});
assert.equal(result.result, 'PASS');
assert.equal(storage.values.size, 1);

storage.nextSetFailure = { data: 'write denied', code: 901 };
saveCompletedSession(storage, expected, (value) => {
    result = value;
});
assert.equal(result.result, 'FAIL');
assert.equal(result.code, 'STORAGE_SET_FAILED');

storage.nextGetFailure = { data: 'read denied', code: 902 };
readCompletedSession(storage, expected, (value) => {
    result = value;
});
assert.equal(result.result, 'FAIL');
assert.equal(result.code, 'STORAGE_GET_FAILED');

storage.values.set(COMPLETED_SESSION_STORAGE_KEY, '{');
readCompletedSession(storage, expected, (value) => {
    result = value;
});
assert.equal(result.result, 'FAIL');
assert.equal(result.code, 'INVALID_JSON');

storage.values.set(COMPLETED_SESSION_STORAGE_KEY, JSON.stringify({ schemaVersion: '999' }));
readCompletedSession(storage, expected, (value) => {
    result = value;
});
assert.equal(result.result, 'FAIL');
assert.equal(result.code, 'UNSUPPORTED_SCHEMA_VERSION');

storage.values.set(COMPLETED_SESSION_STORAGE_KEY, JSON.stringify({ ...expected, sessionId: 'different' }));
readCompletedSession(storage, expected, (value) => {
    result = value;
});
assert.equal(result.result, 'FAIL');
assert.equal(result.code, 'FIELD_MISMATCH');

console.log('P4-003 completed session storage flow: PASS');

const diagnosticStorage = new FakeStorage();
let diagnosticResult;
runWriteDiagnostic(diagnosticStorage, expected, (value) => {
    diagnosticResult = value;
});
assert.equal(diagnosticResult.result, 'PASS');
assert.deepEqual(diagnosticResult.steps.map((step) => step.label), ['A_SIMPLE_JSON', 'B_SESSION_RECORD']);
assert.equal(diagnosticResult.steps[0].valueType, 'string');
assert.equal(diagnosticResult.steps[1].valueType, 'string');
assert.equal(diagnosticResult.steps[0].error, 'NONE');
assert.equal(diagnosticResult.steps[1].error, 'NONE');
assert.equal(diagnosticResult.steps[1].jsonValid, true);
assert.equal(diagnosticResult.steps[1].modelValid, true);
assert.equal(diagnosticResult.steps[0].byteLength > 0, true);
assert.equal(diagnosticResult.steps[1].byteLength > diagnosticResult.steps[0].byteLength, true);
console.log('P4-003 write A/B diagnostic: PASS');

const sizeCases = createSizeDiagnosticCases(expected);
assert.deepEqual(sizeCases.map((item) => item.label), ['A_39B_SIMPLE', 'B_128B', 'C_256B', 'D_384B', 'E_548B', 'F_SESSION_RECORD']);
assert.equal(sizeCases.every((item) => item.valueType === 'string' && item.jsonValid === true), true);
assert.equal(sizeCases[0].byteLength, 39);
assert.equal(sizeCases[1].byteLength, 128);
assert.equal(sizeCases[2].byteLength, 256);
assert.equal(sizeCases[3].byteLength, 384);
assert.equal(sizeCases[4].byteLength, 548);

let sizeDiagnosticResult;
runSizeDiagnostic(new FakeStorage(), expected, (value) => {
    sizeDiagnosticResult = value;
});
assert.equal(sizeDiagnosticResult.steps.length, 6);
assert.equal(sizeDiagnosticResult.steps.every((step) => step.result === 'PASS'), true);
assert.deepEqual(sizeDiagnosticResult.steps.map((step) => step.byteLength), [39, 128, 256, 384, 548, 548]);
console.log('P4-003 size A-F diagnostic: PASS');
