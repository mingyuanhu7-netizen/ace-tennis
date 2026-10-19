import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import page from '../entry/src/main/js/MainAbility/pages/index/index.js';
import { WORKOUT_STATES } from '../entry/src/main/js/MainAbility/state/workout-session.js';

const root = new URL('..', import.meta.url);
const pageScript = readFileSync(new URL('entry/src/main/js/MainAbility/pages/index/index.js', root), 'utf8');
const pageMarkup = readFileSync(new URL('entry/src/main/js/MainAbility/pages/index/index.hml', root), 'utf8');
const pageStyles = readFileSync(new URL('entry/src/main/js/MainAbility/pages/index/index.css', root), 'utf8');

assert.match(pageScript, /workoutState/);
assert.match(pageMarkup, /AceTennis/);
assert.match(pageMarkup, /Start/);
assert.match(pageMarkup, /onclick="onStart"/);
assert.match(pageMarkup, /ACTIVE_WORKOUT/);
assert.match(pageMarkup, /PAUSED/);
assert.match(pageMarkup, /FINISH_CONFIRMATION/);
assert.match(pageMarkup, /QUICK_RESULT/);
assert.match(pageMarkup, /onclick="onPause"/);
assert.match(pageMarkup, /onclick="onResume"/);
assert.match(pageMarkup, /onclick="onRequestFinish"/);
assert.match(pageMarkup, /onclick="onConfirmFinish"/);
assert.match(pageMarkup, /onclick="onDone"/);
assert.match(pageStyles, /\.container\s*\{[^}]*flex-direction:\s*column/s);
assert.match(pageStyles, /\.primary-action,\s*\.secondary-action,\s*\.finish-action\s*\{[^}]*height:\s*52px/s);
assert.match(pageStyles, /\.primary-action\s*\{[^}]*background-color:/s);

const pageInstance = { ...page.data, ...page };
pageInstance.onInit();
assert.equal(pageInstance.workoutState, WORKOUT_STATES.READY);
pageInstance.onStart();
assert.equal(pageInstance.workoutState, WORKOUT_STATES.ACTIVE_WORKOUT);
pageInstance.onPause();
assert.equal(pageInstance.workoutState, WORKOUT_STATES.PAUSED);
pageInstance.onResume();
assert.equal(pageInstance.workoutState, WORKOUT_STATES.ACTIVE_WORKOUT);
pageInstance.onRequestFinish();
assert.equal(pageInstance.workoutState, WORKOUT_STATES.FINISH_CONFIRMATION);
pageInstance.onConfirmFinish();
assert.equal(pageInstance.workoutState, WORKOUT_STATES.QUICK_RESULT);
pageInstance.onDone();
assert.equal(pageInstance.workoutState, WORKOUT_STATES.READY);
pageInstance.onDestroy();

console.log('watch shell contract: PASS');
