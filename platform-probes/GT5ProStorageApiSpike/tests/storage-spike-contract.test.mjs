import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    MISSING_VALUE,
    PROBE_KEY,
    WRITE_VALUE,
    OVERWRITE_VALUE,
    createProbeViewState,
    formatFailure,
    formatReadValue,
    recordFailure,
    recordSuccess
} from '../entry/src/main/js/MainAbility/storage/storage-probe-state.js';

assert.equal(PROBE_KEY.length <= 32, true);
assert.equal(MISSING_VALUE, '__MISSING__');
assert.equal(formatReadValue(MISSING_VALUE), 'MISSING');
assert.equal(formatReadValue(WRITE_VALUE), 'JSON: WRITE');
assert.equal(formatReadValue(OVERWRITE_VALUE), 'JSON: OVERWRITE');
assert.equal(formatReadValue('not-json'), 'TEXT: not-json');

let state = createProbeViewState();
assert.equal(state.lastOperation, 'NOT_RUN');
assert.equal(state.lastResult, 'NOT_RUN');

state = recordSuccess(state, 'WRITE', WRITE_VALUE);
assert.equal(state.lastOperation, 'WRITE');
assert.equal(state.lastResult, 'JSON: WRITE');
assert.equal(state.lastError, 'NONE');

state = recordFailure(state, 'INVALID_KEY', 'bad key', 401);
assert.equal(state.lastOperation, 'INVALID_KEY');
assert.equal(state.lastResult, 'FAIL');
assert.equal(state.lastError, '401: bad key');
assert.equal(formatFailure(undefined, undefined), 'UNKNOWN');

console.log('P4-001 storage utility contract: PASS');

const hmlPath = new URL('../entry/src/main/js/MainAbility/pages/index/index.hml', import.meta.url);
const cssPath = new URL('../entry/src/main/js/MainAbility/pages/index/index.css', import.meta.url);
const pagePath = new URL('../entry/src/main/js/MainAbility/pages/index/index.js', import.meta.url);
const hml = readFileSync(hmlPath, 'utf8');
const css = readFileSync(cssPath, 'utf8');
const page = readFileSync(pagePath, 'utf8');

assert.match(hml, /pageMode === 'STATUS'/);
assert.match(hml, /pageMode === 'OPERATIONS'/);
assert.match(hml, /pageMode === 'RESULT'/);
for (const action of ['SAVE', 'READ', 'VERIFY']) {
    assert.match(hml, new RegExp('>' + action + '<'));
}
assert.match(page, /onShowOperations\(\)/);
assert.match(page, /onShowStatus\(\)/);
assert.match(page, /onSave\(\)/);
assert.match(page, /onRead\(\)/);
assert.match(page, /onVerify\(\)/);
assert.match(css, /\.container\s*\{[^}]*flex-direction:\s*column;/s);
assert.doesNotMatch(hml, /class="screen"/);
assert.doesNotMatch(css, /flex-wrap|overflow|font-weight|lines|line-height/);
