import { WORKOUT_EVENTS, WORKOUT_STATES } from '../../state/workout-state.js';
import {
    createWorkoutSession,
    dispatchWorkoutEvent,
    formatElapsedTime,
    getElapsedActiveMs,
    resetWorkoutSession
} from '../../state/workout-session.js';

export default {
    data: {
        currentScreen: WORKOUT_STATES.READY,
        lastEvent: null,
        sessionStatus: '',
        elapsedTime: '',
        quickHeartRate: '',
        quickSwingCount: '',
        quickScore: ''
    },
    onInit() {
        this.runtimeSession = createWorkoutSession();
        this.sessionStatus = this.runtimeSession.state === WORKOUT_STATES.READY
            ? 'SESSION OK'
            : 'SESSION ERROR';
        this.elapsedTime = formatElapsedTime(0);
        this.quickHeartRate = '';
        this.quickSwingCount = '';
        this.quickScore = '';
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
    onConfirmFinish() {
        this.lastEvent = WORKOUT_EVENTS.CONFIRM_FINISH;
        this.runtimeSession = dispatchWorkoutEvent(
            this.runtimeSession,
            WORKOUT_EVENTS.CONFIRM_FINISH,
            Date.now()
        );
        this.currentScreen = this.runtimeSession.state;
        this.refreshElapsedTime();
        this.stopTimer();
        if (this.currentScreen === WORKOUT_STATES.QUICK_RESULT) {
            this.quickHeartRate = `${this.runtimeSession.mockHeartRate} BPM`;
            this.quickSwingCount = `${this.runtimeSession.mockSwingCount} SWINGS`;
            this.quickScore = this.runtimeSession.mockScoreDisplay;
        }
    },
    onDone() {
        if (this.runtimeSession.state !== WORKOUT_STATES.QUICK_RESULT) {
            return;
        }
        this.lastEvent = WORKOUT_EVENTS.DONE;
        this.runtimeSession = dispatchWorkoutEvent(
            this.runtimeSession,
            WORKOUT_EVENTS.DONE,
            Date.now()
        );
        this.stopTimer();
        this.runtimeSession = resetWorkoutSession();
        this.currentScreen = this.runtimeSession.state;
        this.sessionStatus = 'SESSION OK';
        this.elapsedTime = formatElapsedTime(0);
        this.quickHeartRate = '';
        this.quickSwingCount = '';
        this.quickScore = '';
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
