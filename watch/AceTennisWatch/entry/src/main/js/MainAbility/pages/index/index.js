import { WORKOUT_EVENTS, WORKOUT_STATES } from '../../state/workout-state.js';
import { createWorkoutSession, formatElapsedTime } from '../../state/workout-session.js';

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
    },
    onStart() {
        this.lastEvent = WORKOUT_EVENTS.START;
        this.currentScreen = WORKOUT_STATES.ACTIVE_WORKOUT;
    }
};
