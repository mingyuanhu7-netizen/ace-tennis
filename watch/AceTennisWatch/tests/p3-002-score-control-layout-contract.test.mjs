import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const markup = readFileSync(
    new URL('entry/src/main/js/MainAbility/pages/index/index.hml', root),
    'utf8'
);
const styles = readFileSync(
    new URL('entry/src/main/js/MainAbility/pages/index/index.css', root),
    'utf8'
);

assert.match(markup, /onclick="onPlayerPoint"/);
assert.match(markup, /onclick="onOpponentPoint"/);
assert.match(markup, /You \+/);
assert.match(markup, /Opp \+/);

assert.match(styles, /\.control-row\s*\{[^}]*height:\s*52px[^}]*flex-direction:\s*row/s);
assert.match(styles, /\.score-control\s*\{[^}]*height:\s*52px[^}]*background-color:/s);
assert.match(styles, /\.control-label\s*\{[^}]*height:\s*52px[^}]*font-size:\s*16px/s);
assert.doesNotMatch(styles, /flex-shrink|line-height/);

console.log('P3-002 score-control layout contract: PASS');
