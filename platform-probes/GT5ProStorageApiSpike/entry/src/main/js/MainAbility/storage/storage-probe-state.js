export const PROBE_KEY = 'at_p4_storage_v1';
export const MISSING_VALUE = '__MISSING__';
export const WRITE_VALUE = '{"probe":"P4-001","value":"WRITE"}';
export const OVERWRITE_VALUE = '{"probe":"P4-001","value":"OVERWRITE"}';

export function createProbeViewState() {
    return {
        lastOperation: 'NOT_RUN',
        lastResult: 'NOT_RUN',
        lastError: 'NONE'
    };
}

export function formatReadValue(value) {
    if (value === MISSING_VALUE || value === '') {
        return 'MISSING';
    }

    try {
        const parsed = JSON.parse(value);
        if (parsed && parsed.value) {
            return 'JSON: ' + parsed.value;
        }
    } catch (error) {
        return 'TEXT: ' + value;
    }

    return 'TEXT: ' + value;
}

export function formatFailure(data, code) {
    if (code === undefined || code === null) {
        return data ? String(data) : 'UNKNOWN';
    }

    return String(code) + ': ' + (data ? String(data) : 'UNKNOWN');
}

export function recordSuccess(state, operation, value) {
    return {
        ...state,
        lastOperation: operation,
        lastResult: value === undefined ? 'PASS' : formatReadValue(value),
        lastError: 'NONE'
    };
}

export function recordFailure(state, operation, data, code) {
    return {
        ...state,
        lastOperation: operation,
        lastResult: 'FAIL',
        lastError: formatFailure(data, code)
    };
}
