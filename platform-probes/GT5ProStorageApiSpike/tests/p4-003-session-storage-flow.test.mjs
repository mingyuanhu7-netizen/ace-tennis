import assert from 'node:assert/strict';
import {
    COMPLETED_SESSION_STORAGE_KEY,
    createCompletedSessionTestRecord,
    readCompletedSession,
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
