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
        if (this.timerHandle === null) {
            return;
        }
        clearInterval(this.timerHandle);
        this.timerHandle = null;
    }
};
