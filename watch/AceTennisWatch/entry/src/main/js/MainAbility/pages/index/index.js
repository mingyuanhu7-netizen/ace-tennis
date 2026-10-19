import { WORKOUT_EVENTS, WORKOUT_STATES } from '../../state/workout-state.js';
import {
    createWorkoutSession,
    dispatchWorkoutEvent,
    formatElapsedTime,
    getElapsedActiveMs
} from '../../state/workout-session.js';

export default {
    data: {
        currentScreen: WORKOUT_STATES.READY,
        lastEvent: null,
        sessionStatus: '',
        elapsedTime: ''
    },
    onInit() {
        this.runtimeSession = createWorkoutSession();
        this.sessionStatus = this.runtimeSession.state === WORKOUT_STATES.READY
            ? 'SESSION OK'
            : 'SESSION ERROR';
        this.elapsedTime = formatElapsedTime(0);
        this.timerHandle = null;
    },
    onDestroy() {
        this.stopTimer();
    },
    onStart() {
        this.lastEvent = WORKOUT_EVENTS.START;
        this.runtimeSession = dispatchWorkoutEvent(
            this.runtimeSession,
            WORKOUT_EVENTS.START,
            Date.now()
        );
        this.currentScreen = this.runtimeSession.state;
        this.refreshElapsedTime();
        this.startTimer();
    },
    onPause() {
        this.lastEvent = WORKOUT_EVENTS.PAUSE;
        this.runtimeSession = dispatchWorkoutEvent(
            this.runtimeSession,
            WORKOUT_EVENTS.PAUSE,
            Date.now()
        );
        this.currentScreen = this.runtimeSession.state;
        this.refreshElapsedTime();
        this.stopTimer();
    },
    onResume() {
        this.lastEvent = WORKOUT_EVENTS.RESUME;
        this.runtimeSession = dispatchWorkoutEvent(
            this.runtimeSession,
            WORKOUT_EVENTS.RESUME,
            Date.now()
        );
        this.currentScreen = this.runtimeSession.state;
        this.refreshElapsedTime();
        this.startTimer();
    },
    onRequestFinish() {
        this.lastEvent = WORKOUT_EVENTS.REQUEST_FINISH;
        this.runtimeSession = dispatchWorkoutEvent(
            this.runtimeSession,
            WORKOUT_EVENTS.REQUEST_FINISH,
            Date.now()
        );
        this.currentScreen = this.runtimeSession.state;
        this.refreshElapsedTime();
        this.stopTimer();
    },
    onCancelFinish() {
        this.lastEvent = WORKOUT_EVENTS.CANCEL_FINISH;
        this.runtimeSession = dispatchWorkoutEvent(
            this.runtimeSession,
            WORKOUT_EVENTS.CANCEL_FINISH,
            Date.now()
        );
        this.currentScreen = this.runtimeSession.state;
        this.refreshElapsedTime();
        if (this.currentScreen === WORKOUT_STATES.ACTIVE_WORKOUT) {
            this.startTimer();
        } else {
            this.stopTimer();
        }
    },
    refreshElapsedTime() {
        this.elapsedTime = formatElapsedTime(
            getElapsedActiveMs(this.runtimeSession, Date.now())
        );
    },
    startTimer() {
        if (this.timerHandle !== null) {
            return;
        }
        const page = this;
        this.timerHandle = setInterval(function () {
            page.refreshElapsedTime();
        }, 1000);
    },
    stopTimer() {
        if (this.timerHandle === null || this.timerHandle === undefined) {
            return;
        }
        clearInterval(this.timerHandle);
        this.timerHandle = null;
    }
};
