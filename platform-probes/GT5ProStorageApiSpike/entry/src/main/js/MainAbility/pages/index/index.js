import storage from '@system.storage';
import {
    MISSING_VALUE,
    OVERWRITE_VALUE,
    PROBE_KEY,
    WRITE_VALUE,
    createProbeViewState,
    recordFailure,
    recordSuccess
} from '../../storage/storage-probe-state';

export default {
    data: {
        title: 'STORAGE SPIKE',
        keyLabel: PROBE_KEY,
        lastOperation: 'NOT_RUN',
        lastResult: 'NOT_RUN',
        lastError: 'NONE',
        startupRead: 'PENDING'
    },

    onInit() {
        this.applyViewState(createProbeViewState());
        this.readOnStartup();
    },

    applyViewState(state) {
        this.lastOperation = state.lastOperation;
        this.lastResult = state.lastResult;
        this.lastError = state.lastError;
    },

    readOnStartup() {
        const page = this;
        storage.get({
            key: PROBE_KEY,
            default: MISSING_VALUE,
            success: function(data) {
                page.startupRead = data === MISSING_VALUE ? 'MISSING' : 'FOUND: ' + data;
                page.applyViewState(recordSuccess(createProbeViewState(), 'STARTUP_READ', data));
            },
            fail: function(data, code) {
                page.startupRead = 'FAIL';
                page.applyViewState(recordFailure(createProbeViewState(), 'STARTUP_READ', data, code));
            }
        });
    },

    onWrite() {
        this.writeValue('WRITE', WRITE_VALUE);
    },

    onOverwrite() {
        this.writeValue('OVERWRITE', OVERWRITE_VALUE);
    },

    writeValue(operation, value) {
        const page = this;
        storage.set({
            key: PROBE_KEY,
            value: value,
            success: function() {
                page.applyViewState(recordSuccess(createProbeViewState(), operation));
            },
            fail: function(data, code) {
                page.applyViewState(recordFailure(createProbeViewState(), operation, data, code));
            }
        });
    },

    onRead() {
        const page = this;
        storage.get({
            key: PROBE_KEY,
            default: MISSING_VALUE,
            success: function(data) {
                page.applyViewState(recordSuccess(createProbeViewState(), 'READ', data));
            },
            fail: function(data, code) {
                page.applyViewState(recordFailure(createProbeViewState(), 'READ', data, code));
            }
        });
    },

    onDelete() {
        const page = this;
        storage.delete({
            key: PROBE_KEY,
            success: function() {
                page.applyViewState(recordSuccess(createProbeViewState(), 'DELETE'));
            },
            fail: function(data, code) {
                page.applyViewState(recordFailure(createProbeViewState(), 'DELETE', data, code));
            }
        });
    },

    onInvalidKey() {
        const page = this;
        storage.set({
            key: 'at_p4_storage_invalid_key_over_32_chars',
            value: 'X',
            success: function() {
                page.applyViewState(recordSuccess(createProbeViewState(), 'INVALID_KEY_UNEXPECTED'));
            },
            fail: function(data, code) {
                page.applyViewState(recordFailure(createProbeViewState(), 'INVALID_KEY', data, code));
            }
        });
    }
};
