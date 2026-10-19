import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import page from '../entry/src/main/js/MainAbility/pages/index/index.js';

const root = new URL('..', import.meta.url);
const pageScript = readFileSync(
    new URL('entry/src/main/js/MainAbility/pages/index/index.js', root),
    'utf8'
);
const pageMarkup = readFileSync(
    new URL('entry/src/main/js/MainAbility/pages/index/index.hml', root),
    'utf8'
);

assert.match(pageScript, /import \{ createWorkoutSession, formatElapsedTime \} from '\.\.\/\.\.\/state\/workout-session\.js';/);
assert.match(pageScript, /this\.elapsedTime\s*=\s*formatElapsedTime\(0\);/);
assert.doesNotMatch(pageScript, /Date\.now|setInterval|setTimeout|clearInterval|getElapsedActiveMs/);
assert.match(pageMarkup, /elapsedTime/);

const pageInstance = { ...page.data, ...page };
pageInstance.onInit();
assert.equal(pageInstance.elapsedTime, '00:00');

console.log('P2-005 one-time elapsed formatting contract: PASS');
