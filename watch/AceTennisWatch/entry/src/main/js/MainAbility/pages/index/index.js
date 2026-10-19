const WORKOUT_STATES = Object.freeze({
    READY: 'READY',
    ACTIVE_WORKOUT: 'ACTIVE_WORKOUT',
    PAUSED: 'PAUSED',
    FINISH_CONFIRMATION: 'FINISH_CONFIRMATION',
    QUICK_RESULT: 'QUICK_RESULT',
    COMPLETE: 'COMPLETE'
});

export default {
    data: {
        currentScreen: WORKOUT_STATES.READY,
        nextScreen: null
    },
    onStart() {
        this.currentScreen = 'STARTED';
        this.nextScreen = WORKOUT_STATES.ACTIVE_WORKOUT;
    }
};
