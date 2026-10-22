import storage from '@system.storage';
import {
    createCompletedSessionTestRecord,
    runSizeDiagnostic,
    runBoundaryDiagnostic,
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
        sizeA: 'NOT_RUN',
        sizeB: 'NOT_RUN',
        sizeC: 'NOT_RUN',
        sizeD: 'NOT_RUN',
        sizeE: 'NOT_RUN',
        sizeF: 'NOT_RUN',
        boundaryG: 'NOT_RUN',
        boundaryH: 'NOT_RUN',
        boundaryI: 'NOT_RUN',
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

    onShowSizeDiagnostic() {
        this.pageMode = 'SIZE';
    },

    onRunSizeDiagnostic() {
        const page = this;
        runSizeDiagnostic(storage, this.expectedRecord, function(result) {
            const steps = result.steps;
            page.sizeA = formatDiagnosticStep(steps[0]);
            page.sizeB = formatDiagnosticStep(steps[1]);
            page.sizeC = formatDiagnosticStep(steps[2]);
            page.sizeD = formatDiagnosticStep(steps[3]);
            page.sizeE = formatDiagnosticStep(steps[4]);
            page.sizeF = formatDiagnosticStep(steps[5]);
            page.lastOperation = 'SIZE_A_TO_F';
            page.lastResult = result.result;
            page.lastError = result.result === 'PASS' ? 'NONE' : 'SEE_CASES';
        });
    },

    onShowBoundaryDiagnostic() {
        this.pageMode = 'BOUNDARY';
    },

    onRunBoundaryDiagnostic() {
        const page = this;
        runBoundaryDiagnostic(storage, function(result) {
            const steps = result.steps;
            page.boundaryG = formatBoundaryStep(steps[0]);
            page.boundaryH = formatBoundaryStep(steps[1]);
            page.boundaryI = formatBoundaryStep(steps[2]);
            page.lastOperation = 'BOUNDARY_G_TO_I';
            page.lastResult = result.result;
            page.lastError = result.result === 'PASS' ? 'NONE' : 'SEE_CASES';
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

function formatBoundaryStep(step) {
    if (!step) {
        return 'NOT_RUN';
    }
    return String(step.byteLength) + 'B ' + step.setStatus + '/' + step.getStatus + '/' + step.match + ' ' + step.error;
}
