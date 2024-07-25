import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import { ADDITIONAL_CALIBRATION_PART_1_DIRECTIONS, AUTO_DECREASE_AMOUNT, AUTO_DECREASE_RATE, EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION, MINIMUM_CALIBRATION_MEDIAN, NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS, NUM_CALIBRATION_WITH_FEEDBACK_TRIALS, TRIAL_DURATION, } from './constants';
import { countdownStep } from './countdown';
import { finishExperimentEarlyTrial } from './finish';
import { loadingBarTrial } from './loading-bar';
import { releaseKeysStep } from './release-keys';
import TaskPlugin from './task';
import { autoIncreaseAmount, calculateMedianTapCount, checkFlag, } from './utils';
export const createCalibrationTrial = ({ showThermometer, bounds, repetitions, calibrationPart, jsPsych, state, }) => {
    return {
        timeline: [
            countdownStep,
            {
                type: TaskPlugin,
                task: calibrationPart,
                duration: TRIAL_DURATION,
                showThermometer,
                bounds,
                autoIncreaseAmount: function () {
                    console.log('autoIncreaseAmount called with medianTapsPart1:', state.medianTapsPart1);
                    return autoIncreaseAmount(EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION, TRIAL_DURATION, AUTO_DECREASE_RATE, AUTO_DECREASE_AMOUNT, state.medianTapsPart1);
                },
                data: {
                    task: calibrationPart,
                    showThermometer,
                    bounds,
                },
                on_start: function (trial) {
                    const keyTappedEarlyFlag = checkFlag('countdown', 'keyTappedEarlyFlag', jsPsych);
                    // Update the trial parameters with keyTappedEarlyFlag
                    trial.keyTappedEarlyFlag = keyTappedEarlyFlag;
                },
                on_finish: function (data) {
                    if (!data.keysReleasedFlag && !data.keyTappedEarlyFlag) {
                        if (calibrationPart === 'calibrationPart1') {
                            state.calibrationPart1Successes++;
                            state.medianTapsPart1 = calculateMedianTapCount('calibrationPart1', NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS, jsPsych);
                            console.log(state.medianTapsPart1);
                            if (state.medianTapsPart1 >= MINIMUM_CALIBRATION_MEDIAN) {
                                state.calibrationPart1Failed = false;
                                console.log(`state.calibrationPart1Failed = ${state.calibrationPart1Failed}`);
                            }
                        }
                        else if (calibrationPart === 'calibrationPart2') {
                            state.calibrationPart2Successes++;
                            state.medianTaps = calculateMedianTapCount('calibrationPart2', NUM_CALIBRATION_WITH_FEEDBACK_TRIALS, jsPsych);
                            console.log(`state.medianTaps = ${state.medianTaps}`);
                            if (state.medianTaps >= MINIMUM_CALIBRATION_MEDIAN) {
                                state.calibrationPart2Failed = false;
                                console.log(`state.calibrationPart2Failed = ${state.calibrationPart2Failed}`);
                            }
                        }
                        console.log(`calibrationPart1Successes: ${state.calibrationPart1Successes}`);
                        console.log(`calibrationPart2Successes: ${state.calibrationPart2Successes}`);
                    }
                },
            },
            {
                timeline: [releaseKeysStep],
                conditional_function: function () {
                    return !checkFlag(calibrationPart, 'keysReleasedFlag', jsPsych);
                },
            },
            {
                timeline: [loadingBarTrial(true, jsPsych)],
            },
        ],
        repetitions: repetitions,
        loop_function: function () {
            const requiredSuccesses = calibrationPart === 'calibrationPart1'
                ? NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS
                : NUM_CALIBRATION_WITH_FEEDBACK_TRIALS;
            const currentSuccesses = calibrationPart === 'calibrationPart1'
                ? state.calibrationPart1Successes
                : state.calibrationPart2Successes;
            const remainingSuccesses = requiredSuccesses - currentSuccesses;
            console.log(`Remaining successes for ${calibrationPart}: ${remainingSuccesses}`);
            return (remainingSuccesses > 0); // Repeat the timeline if more successes are needed
        },
    };
};
/**
 * @function createConditionalCalibrationTrial
 * @description Create a conditional calibration trial
 * @param {ConditionalCalibrationTrialParams} params - The parameters for the conditional calibration trial
 * @returns {Object} - jsPsych trial object
 */
export const createConditionalCalibrationTrial = ({ calibrationPart, numTrials, jsPsych, state, }) => {
    return {
        timeline: [
            {
                type: HtmlKeyboardResponsePlugin,
                choices: ['enter'],
                stimulus: function () {
                    // Reset success counters
                    if (calibrationPart === 'calibrationPart1') {
                        state.calibrationPart1Successes = 0;
                    }
                    else {
                        state.calibrationPart2Successes = 0;
                    }
                    console.log(`Reset successes for ${calibrationPart}`);
                    return `<p>${ADDITIONAL_CALIBRATION_PART_1_DIRECTIONS}</p>`;
                },
            },
            createCalibrationTrial({
                showThermometer: calibrationPart === 'calibrationPart2',
                bounds: [
                    EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
                    EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
                ],
                repetitions: numTrials,
                calibrationPart,
                jsPsych,
                state,
            }),
            {
                // If minimum taps is not reached in this set of conditional trials, then end trial
                timeline: [finishExperimentEarlyTrial(jsPsych)],
                conditional_function: function () {
                    if (calibrationPart === 'calibrationPart1') {
                        if (!(state.medianTapsPart1 >= MINIMUM_CALIBRATION_MEDIAN)) {
                            return false;
                        }
                        else
                            return true;
                    }
                    else if (calibrationPart === 'calibrationPart2') {
                        console.log(`state.medianTaps for conditional trial = ${state.medianTaps}`);
                        if ((state.medianTaps >= MINIMUM_CALIBRATION_MEDIAN)) {
                            return false;
                        }
                        else
                            return true;
                    }
                },
            }
        ],
        // Conditional trial section should only occur if the corresponding calibration part failed due to minimum taps previously
        conditional_function: function () {
            console.log(`state.calibrationPart1Failed = ${state.calibrationPart1Failed}`);
            console.log(`state.calibrationPart2Failed = ${state.calibrationPart2Failed}`);
            if (calibrationPart === 'calibrationPart1') {
                return state.calibrationPart1Failed;
            }
            else if (calibrationPart === 'calibrationPart2') {
                return state.calibrationPart2Failed;
            }
        }
    };
};
export const calibrationTrialPart1 = (jsPsych, state) => createCalibrationTrial({
    showThermometer: false,
    bounds: [
        EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
        EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
    ],
    repetitions: NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
    calibrationPart: 'calibrationPart1',
    jsPsych,
    state,
});
export const conditionalCalibrationTrialPart1 = (jsPsych, state) => createConditionalCalibrationTrial({
    calibrationPart: 'calibrationPart1',
    numTrials: NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
    jsPsych,
    state,
});
export const calibrationTrialPart2 = (jsPsych, state) => createCalibrationTrial({
    showThermometer: true,
    bounds: [
        EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
        EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
    ],
    repetitions: NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
    calibrationPart: 'calibrationPart2',
    jsPsych,
    state,
});
export const conditionalCalibrationTrialPart2 = (jsPsych, state) => createConditionalCalibrationTrial({
    calibrationPart: 'calibrationPart2',
    numTrials: NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
    jsPsych,
    state,
});
