import assert from 'node:assert/strict';

let workout;
try {
  workout = await import('../entry/src/main/js/MainAbility/state/workout-session.js');
} catch {
  workout = {};
}

assert.equal(typeof workout.createWorkoutSession, 'function', 'Phase 2 requires a session runtime factory');
assert.equal(typeof workout.dispatchWorkoutEvent, 'function', 'Phase 2 requires one event dispatcher');

const {
  WORKOUT_STATES,
  WORKOUT_EVENTS,
  createWorkoutSession,
  dispatchWorkoutEvent,
  getElapsedActiveMs,
  formatElapsedTime,
  resetWorkoutSession
} = workout;

let session = createWorkoutSession();
assert.equal(session.state, WORKOUT_STATES.READY);

session = dispatchWorkoutEvent(session, WORKOUT_EVENTS.START, 1_000);
assert.equal(session.state, WORKOUT_STATES.ACTIVE_WORKOUT);
assert.equal(session.sessionId, 'mock-session-1000');
assert.equal(getElapsedActiveMs(session, 6_000), 5_000);
assert.equal(formatElapsedTime(65_000), '01:05');

session = dispatchWorkoutEvent(session, WORKOUT_EVENTS.PAUSE, 7_000);
assert.equal(session.state, WORKOUT_STATES.PAUSED);
assert.equal(getElapsedActiveMs(session, 20_000), 6_000, 'timer stops while paused');

session = dispatchWorkoutEvent(session, WORKOUT_EVENTS.RESUME, 21_000);
assert.equal(session.state, WORKOUT_STATES.ACTIVE_WORKOUT);
assert.equal(getElapsedActiveMs(session, 24_000), 9_000, 'timer resumes without resetting');

session = dispatchWorkoutEvent(session, WORKOUT_EVENTS.REQUEST_FINISH, 25_000);
assert.equal(session.state, WORKOUT_STATES.FINISH_CONFIRMATION);
assert.equal(session.finishReturnState, WORKOUT_STATES.ACTIVE_WORKOUT);
assert.equal(getElapsedActiveMs(session, 30_000), 10_000, 'timer is settled during finish confirmation');

session = dispatchWorkoutEvent(session, WORKOUT_EVENTS.CANCEL_FINISH, 31_000);
assert.equal(session.state, WORKOUT_STATES.ACTIVE_WORKOUT);
assert.equal(getElapsedActiveMs(session, 32_000), 11_000, 'active timing resumes after cancellation');

session = dispatchWorkoutEvent(session, WORKOUT_EVENTS.PAUSE, 33_000);
session = dispatchWorkoutEvent(session, WORKOUT_EVENTS.REQUEST_FINISH, 34_000);
assert.equal(session.state, WORKOUT_STATES.FINISH_CONFIRMATION);
assert.equal(session.finishReturnState, WORKOUT_STATES.PAUSED);

session = dispatchWorkoutEvent(session, WORKOUT_EVENTS.CANCEL_FINISH, 35_000);
assert.equal(session.state, WORKOUT_STATES.PAUSED);
assert.equal(getElapsedActiveMs(session, 40_000), 12_000, 'paused timer remains fixed after cancellation');

session = dispatchWorkoutEvent(session, WORKOUT_EVENTS.REQUEST_FINISH, 41_000);
session = dispatchWorkoutEvent(session, WORKOUT_EVENTS.CONFIRM_FINISH, 42_000);
assert.equal(session.state, WORKOUT_STATES.QUICK_RESULT);

session = dispatchWorkoutEvent(session, WORKOUT_EVENTS.DONE, 43_000);
assert.equal(session.state, WORKOUT_STATES.COMPLETE);
session = resetWorkoutSession();
assert.equal(session.state, WORKOUT_STATES.READY);
assert.equal(getElapsedActiveMs(session, 50_000), 0, 'timer resets only after completion lifecycle reset');

console.log('workout state machine: PASS');
