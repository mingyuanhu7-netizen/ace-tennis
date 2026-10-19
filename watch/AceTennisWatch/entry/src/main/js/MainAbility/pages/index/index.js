import { WORKOUT_EVENTS, WORKOUT_STATES } from '../../state/workout-state.js';
import '../../state/workout-session.js';

export default {
    data: {
        currentScreen: WORKOUT_STATES.READY,
        lastEvent: null
    },
    onStart() {
        this.lastEvent = WORKOUT_EVENTS.START;
        this.currentScreen = WORKOUT_STATES.ACTIVE_WORKOUT;
    }
};
