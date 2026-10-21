import storage from '@system.storage';
import {
    createCompletedSessionTestRecord,
    readCompletedSession,
    saveCompletedSession,
    verifyCompletedSession
} from '../../storage/session-storage-flow.js';

export default {
    data: {
        title: 'SESSION STORAGE',
        keyLabel: 'TEST-001',
        lastOperation: 'NOT_RUN',
        lastResult: 'NOT_RUN',
        lastError: 'NONE',
        startupRead: 'PENDING',
        detailSchema: '-',
        detailDuration: '-',
        detailSets: '-',
        detailGames: '-',
        pageMode: 'STATUS'
    },

    onInit() {
        this.expectedRecord = createCompletedSessionTestRecord();
        this.lastReadRecord = null;
        this.readOnStartup();
    },

    applyOperationResult(result) {
        this.lastOperation = result.operation;
        this.lastResult = result.result;
        this.lastError = result.error;
    },

    readOnStartup() {
        const page = this;
        readCompletedSession(storage, this.expectedRecord, function(result) {
            page.applyOperationResult({
                operation: 'STARTUP_READ',
                result: result.result,
                error: result.error
            });
            page.startupRead = result.result === 'PASS'
                ? 'FOUND'
                : result.result === 'MISSING' ? 'MISSING' : 'FAIL';
            if (result.result === 'PASS') {
                page.lastReadRecord = result.record;
                page.applyRecordDetails(result.record);
            }
        });
    },

    onShowOperations() {
        this.pageMode = 'OPERATIONS';
    },

    onShowStatus() {
        this.pageMode = 'STATUS';
    },

    onSave() {
        const page = this;
        saveCompletedSession(storage, this.expectedRecord, function(result) {
            page.applyOperationResult(result);
        });
    },

    onRead() {
        const page = this;
        readCompletedSession(storage, this.expectedRecord, function(result) {
            page.applyOperationResult(result);
            if (result.result === 'PASS') {
                page.lastReadRecord = result.record;
                page.applyRecordDetails(result.record);
                page.pageMode = 'RESULT';
            }
        });
    },

    onVerify() {
        if (this.lastReadRecord === null) {
            this.applyOperationResult({ operation: 'VERIFY', result: 'FAIL', error: 'NO_READ' });
            return;
        }
        const verification = verifyCompletedSession(this.expectedRecord, this.lastReadRecord);
        this.applyOperationResult({
            operation: 'VERIFY',
            result: verification.result,
            error: verification.mismatch || 'NONE'
        });
    },

    applyRecordDetails(record) {
        this.detailSchema = record.schemaVersion;
        this.detailDuration = String(Math.floor(record.activeDurationMs / 1000)) + 's';
        this.detailSets = String(record.score.playerSets) + '-' + String(record.score.opponentSets);
        this.detailGames = String(record.score.playerGames) + '-' + String(record.score.opponentGames);
    }
};
