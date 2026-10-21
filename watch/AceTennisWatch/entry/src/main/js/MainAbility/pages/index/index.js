import { WORKOUT_EVENTS, WORKOUT_STATES } from '../../state/workout-state.js';
import {
    createWorkoutSession,
    dispatchWorkoutEvent,
    formatElapsedTime,
    getElapsedActiveMs,
    resetWorkoutSession
} from '../../state/workout-session.js';
import {
    SCORE_EVENTS,
    applyScoreEventWithHistory,
    getGameDisplay,
    getScoreDisplay,
    getSetDisplay,
    isScoreAwardBlocked,
    undoLastScoreEvent
} from '../../state/tennis-score.js';

export default {
    data: {
        currentScreen: WORKOUT_STATES.READY,
        lastEvent: null,
        sessionStatus: '',
        elapsedTime: '',
        setDisplay: '',
        gameDisplay: '',
        scoreDisplay: '',
        scoreAwardBlocked: false,
        correctionOpen: false,
        undoAvailable: false,
        quickHeartRate: '',
        quickSwingCount: '',
        quickSetScore: '',
        quickGameScore: '',
        quickScore: ''
    },
    onInit() {
        this.runtimeSession = createWorkoutSession();
        this.sessionStatus = this.runtimeSession.state === WORKOUT_STATES.READY
            ? 'SESSION OK'
            : 'SESSION ERROR';
        this.elapsedTime = formatElapsedTime(0);
        this.refreshScoreDisplays();
        this.quickHeartRate = '';
        this.quickSwingCount = '';
        this.quickSetScore = '';
        this.quickGameScore = '';
        this.quickScore = '';
        this.correctionOpen = false;
        this.undoAvailable = false;
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
        this.correctionOpen = false;
    },
    onPlayerPoint() {
        this.applyScoreEvent(SCORE_EVENTS.PLAYER_POINT);
    },
    onOpponentPoint() {
        this.applyScoreEvent(SCORE_EVENTS.OPPONENT_POINT);
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
        this.correctionOpen = false;
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
        this.correctionOpen = false;
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
            this.quickSetScore = this.setDisplay;
            this.quickGameScore = this.gameDisplay;
            this.quickScore = this.scoreDisplay;
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
        this.refreshScoreDisplays();
        this.quickHeartRate = '';
        this.quickSwingCount = '';
        this.quickSetScore = '';
        this.quickGameScore = '';
        this.quickScore = '';
        this.correctionOpen = false;
        this.undoAvailable = false;
    },
    refreshElapsedTime() {
        this.elapsedTime = formatElapsedTime(
            getElapsedActiveMs(this.runtimeSession, Date.now())
        );
    },
    applyScoreEvent(event) {
        if (this.runtimeSession.state !== WORKOUT_STATES.ACTIVE_WORKOUT) {
            return;
        }
        const result = applyScoreEventWithHistory(
            this.runtimeSession,
            this.runtimeSession.scoreHistory,
            event
        );
        this.runtimeSession = {
            ...result.score,
            scoreHistory: result.scoreHistory
        };
        this.refreshScoreDisplays();
    },
    onOpenCorrection() {
        if (this.runtimeSession.state !== WORKOUT_STATES.ACTIVE_WORKOUT && this.runtimeSession.state !== WORKOUT_STATES.PAUSED) {
            return;
        }
        this.correctionOpen = true;
        this.refreshScoreDisplays();
    },
    onCloseCorrection() {
        this.correctionOpen = false;
    },
    onUndoScore() {
        if (this.runtimeSession.state !== WORKOUT_STATES.ACTIVE_WORKOUT && this.runtimeSession.state !== WORKOUT_STATES.PAUSED) {
            return;
        }
        const result = undoLastScoreEvent(
            this.runtimeSession,
            this.runtimeSession.scoreHistory
        );
        this.runtimeSession = {
            ...result.score,
            scoreHistory: result.scoreHistory
        };
        this.refreshScoreDisplays();
    },
    refreshScoreDisplays() {
        this.setDisplay = getSetDisplay(this.runtimeSession);
        this.gameDisplay = getGameDisplay(this.runtimeSession);
        this.scoreDisplay = getScoreDisplay(this.runtimeSession);
        this.scoreAwardBlocked = isScoreAwardBlocked(this.runtimeSession);
        this.undoAvailable = this.runtimeSession.scoreHistory.length > 0;
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
