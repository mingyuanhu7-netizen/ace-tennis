import storage from '@system.storage';
import {
    createCompletedSessionTestRecord,
    readCompletedSession,
    runWriteDiagnostic,
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
        diagnosticA: 'NOT_RUN',
        diagnosticB: 'NOT_RUN',
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

    onShowDiagnostic() {
        this.pageMode = 'DIAGNOSTIC';
    },

    onRunDiagnostic() {
        const page = this;
        runWriteDiagnostic(storage, this.expectedRecord, function(result) {
            page.diagnosticA = formatDiagnosticStep(result.steps[0]);
            page.diagnosticB = formatDiagnosticStep(result.steps[1]);
            page.lastOperation = 'A_THEN_B';
            page.lastResult = result.result;
            page.lastError = result.result === 'PASS' ? 'NONE' : 'SEE_A_B';
        });
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

function formatDiagnosticStep(step) {
    if (!step) {
        return 'NOT_RUN';
    }
    return step.result + ' ' + step.error + ' ' + step.valueType + ' ' + String(step.byteLength) + 'B';
}
