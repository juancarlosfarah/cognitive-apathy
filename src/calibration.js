import htmlButtonResponse from '@jspsych/plugin-html-button-response';
import { ADDITIONAL_CALIBRATION_PART_1_DIRECTIONS, AUTO_DECREASE_AMOUNT, AUTO_DECREASE_RATE, EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION, MINIMUM_CALIBRATION_MEDIAN, NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS, NUM_CALIBRATION_WITH_FEEDBACK_TRIALS, TRIAL_DURATION, PROGRESS_BAR, CONTINUE_BUTTON_MESSAGE, NUM_FINAL_CALIBRATION_TRIALS_PART_1, NUM_FINAL_CALIBRATION_TRIALS_PART_2 } from './constants';
import { countdownStep } from './countdown';
import { finishExperimentEarlyTrial } from './finish';
import { loadingBarTrial } from './loading-bar';
import { releaseKeysStep } from './release-keys';
import TaskPlugin from './task';
import { autoIncreaseAmount, calculateMedianTapCount, checkFlag, checkKeys, changeProgressBar } from './utils';
function handleCalibrationFailLogic(calibrationPart, state, jsPsych, data) {
    // Define the constants directly in the function
    const numTrialsMap = {
        'calibrationPart1': NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS - 1,
        'calibrationPart2': NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
        'finalCalibrationPart1': NUM_FINAL_CALIBRATION_TRIALS_PART_1,
        'finalCalibrationPart2': NUM_FINAL_CALIBRATION_TRIALS_PART_2,
    };
    const numTrials = numTrialsMap[calibrationPart];
    // Increase successful trials counter for the respective calibration part
    const successesKey = `${calibrationPart}Successes`;
    state[successesKey] = state[successesKey] + 1;
    // Calculate median for the respective trial and set it in the correct state key
    if (calibrationPart === 'calibrationPart1') {
        state.medianTapsPart1 = calculateMedianTapCount(calibrationPart, numTrials, jsPsych);
        if (state.medianTapsPart1 >= MINIMUM_CALIBRATION_MEDIAN) {
            state.calibrationPart1Failed = false;
        }
    }
    else if (calibrationPart === 'calibrationPart2') {
        state.medianTaps = calculateMedianTapCount(calibrationPart, numTrials, jsPsych);
        if (state.medianTaps >= MINIMUM_CALIBRATION_MEDIAN) {
            state.calibrationPart2Failed = false;
        }
    }
    else if (calibrationPart === 'finalCalibrationPart1') {
        state.finalMedianTapsPart1 = calculateMedianTapCount(calibrationPart, numTrials, jsPsych);
    }
    else if (calibrationPart === 'finalCalibrationPart2') {
        state.finalMedianTapsPart2 = calculateMedianTapCount(calibrationPart, numTrials, jsPsych);
    }
    data.calibrationPart1Median = state.medianTapsPart1;
    data.calibrationPart2Median = state.medianTaps;
    data.finalCalibrationPart1Median = state.finalMedianTapsPart1;
    data.finalCalibrationPart2Median = state.finalMedianTapsPart2;
}
function handleCalibrationLoopLogic(calibrationPart, state) {
    // Ensure minimum amount of trials are done fully without releasing keys or tapping early
    const requiredSuccesses = (() => {
        if (calibrationPart === 'calibrationPart1') {
            return NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS;
        }
        else if (calibrationPart === 'calibrationPart2') {
            return NUM_CALIBRATION_WITH_FEEDBACK_TRIALS;
        }
        else if (calibrationPart === 'finalCalibrationPart1') {
            return NUM_FINAL_CALIBRATION_TRIALS_PART_1; // Replace this with the actual value you want to use
        }
        else if (calibrationPart === 'finalCalibrationPart2') {
            return NUM_FINAL_CALIBRATION_TRIALS_PART_2;
        }
        else
            return 0;
    })();
    const currentSuccesses = (() => {
        if (calibrationPart === 'calibrationPart1') {
            return state.calibrationPart1Successes;
        }
        else if (calibrationPart === 'calibrationPart2') {
            return state.calibrationPart2Successes;
        }
        else if (calibrationPart === 'finalCalibrationPart1') {
            return state.finalCalibrationPart1Successes;
        }
        else if (calibrationPart === 'finalCalibrationPart2') {
            return state.finalCalibrationPart2Successes;
        }
        else
            return 0;
    })();
    const remainingSuccesses = requiredSuccesses - currentSuccesses;
    if (remainingSuccesses <= 0) {
        return false;
    }
    else {
        return true;
    }
}
/**
 * Creates a calibration trial object.
 *
 * @param {Object} params - The parameters for creating the calibration trial.
 * @param {boolean} params.showThermometer - A flag indicating whether to display the thermometer during the trial.
 * @param {Object} params.bounds - The bounds for the calibration task, used to control the difficulty or thresholds for success.
 * @param {string} params.calibrationPart - The part of the calibration process this trial is for, e.g., 'calibrationPart1', 'finalCalibrationPart2'.
 * @param {Object} params.jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {Object} params.state - The state object to track and store various pieces of data during the trial, such as median tap counts and success counters.
 *
 * @returns {Object} - A jsPsych trial object with a timeline and looping logic for running a calibration task.
 *
 * The trial consists of the following steps:
 * - CountdownStep: Displays "hold the keys and the following countdown." If the user clicks the key early at this step, a flag will be set and detected at the next trial start.
 * - TaskPlugin: The main calibration task, where the subject's taps and key presses are recorded (with or without stimuli).
 * - ReleaseKeysStep: The release the keys message (conditionally appears based on if user released keys at the end of the trial)
 * - LoadingBarTrial: Creates a fake loading bar If the parameter is set to true, loadingBarTrial(true, jsPsych), the loading bar speed will be slower, giving the user a longer break.
 *
 * Key Functions:
 * - `autoIncreaseAmount`: Calculates the amount by which the mercury should raise on every tap based on a calculated median tap.
 * - `on_start`: Updates keyTappedEarlyFlag trial parameter  if the key was tapped early during CountdownStep.
 * - `on_finish`: Updates median tap count based on which calibration trial is being created and updates state variables related to calibration failures.
 * - `loop_function`: Repeats a trial if the keys were tapped early or if the keys were released early.
 *
 * This function is designed to create a customizable calibration trial object and handle logic related to calibration failures and successes.
 */
export const createCalibrationTrial = ({ showThermometer, bounds, calibrationPart, jsPsych, state, }) => {
    return {
        timeline: [
            countdownStep,
            {
                type: TaskPlugin,
                task: calibrationPart,
                trial_duration: TRIAL_DURATION,
                showThermometer,
                bounds,
                autoIncreaseAmount: function () {
                    let medianTapsToUse;
                    if (calibrationPart === 'finalCalibrationPart2') {
                        medianTapsToUse = state.finalMedianTapsPart1;
                    }
                    else {
                        medianTapsToUse = state.medianTapsPart1;
                    }
                    return autoIncreaseAmount(EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION, TRIAL_DURATION, AUTO_DECREASE_RATE, AUTO_DECREASE_AMOUNT, medianTapsToUse);
                },
                on_start: function (trial) {
                    const keyTappedEarlyFlag = checkFlag('countdown', 'keyTappedEarlyFlag', jsPsych);
                    // Update the trial parameters with keyTappedEarlyFlag
                    trial.keyTappedEarlyFlag = keyTappedEarlyFlag;
                },
                on_finish: function (data) {
                    // Only check calibration fail logic if the key was not tapped early and if the keys were not released early
                    if (!data.keysReleasedFlag && !data.keyTappedEarlyFlag) {
                        handleCalibrationFailLogic(calibrationPart, state, jsPsych, data);
                    }
                }
            },
            {
                timeline: [releaseKeysStep],
                conditional_function: function () {
                    return checkKeys(calibrationPart, jsPsych);
                },
            },
            {
                timeline: [loadingBarTrial(true, jsPsych)],
            },
        ],
        loop_function: function () { return handleCalibrationLoopLogic(calibrationPart, state); }
    };
};
/**
 * @function createConditionalCalibrationTrial
 * @description Creates a conditional calibration trial that only occurs if certain calibration conditions are not met in a prior trial.
 *
 * @param {Object} params - The parameters for creating the conditional calibration trial.
 * @param {string} params.calibrationPart - The part of the calibration process this trial is for, e.g., 'calibrationPart1', 'calibrationPart2'.
 * @param {Object} params.jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {Object} params.state - The state object to track and store various pieces of data during the trial, such as median tap counts and success counters.
 *
 * @returns {Object} - A jsPsych trial object with a timeline and conditional logic for running a calibration task only if certain conditions are met.
 *
 * The trial consists of the following steps:
 * - Displays additional instructions for the participant to prepare for the trial.
 * - Resets the success counters if a calibration part is repeated.
 * - Runs the calibration trial using the `createCalibrationTrial` function.
 * - Checks if the median tap count meets the minimum requirement; if not, it ends the experiment early.
 *
 * The entire trial is conditionally run based on whether the corresponding calibration part failed in a previous trial due to not reaching the minimum median taps.
 */
export const createConditionalCalibrationTrial = ({ calibrationPart, jsPsych, state, }) => {
    return {
        timeline: [
            {
                type: htmlButtonResponse,
                choices: [CONTINUE_BUTTON_MESSAGE],
                stimulus: function () {
                    // Reset success counters for the calibration trials completed after minimum taps not reached
                    if (calibrationPart === 'calibrationPart1') {
                        state.calibrationPart1Successes = 0;
                    }
                    else {
                        state.calibrationPart2Successes = 0;
                    }
                    return `<p>${ADDITIONAL_CALIBRATION_PART_1_DIRECTIONS}</p>`;
                },
            },
            createCalibrationTrial({
                showThermometer: calibrationPart === 'calibrationPart2',
                bounds: [
                    EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
                    EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
                ],
                calibrationPart,
                jsPsych,
                state,
            }),
            {
                // If minimum taps is not reached in this set of conditional trials, then end experiment
                timeline: [finishExperimentEarlyTrial(jsPsych)],
                conditional_function: function () {
                    if (calibrationPart === 'calibrationPart1') {
                        if (state.medianTapsPart1 >= MINIMUM_CALIBRATION_MEDIAN) {
                            return false;
                        }
                        else
                            return true;
                    }
                    else {
                        if (state.medianTaps >= MINIMUM_CALIBRATION_MEDIAN) {
                            return false;
                        }
                        else
                            return true;
                    }
                },
            },
        ],
        // Conditional trial section should only occur if the corresponding calibration part failed due to minimum taps previously
        conditional_function: function () {
            if (calibrationPart === 'calibrationPart1') {
                return state.calibrationPart1Failed;
            }
            else {
                return state.calibrationPart2Failed;
            }
        },
    };
};
/**
 * @function calibrationTrialPart1
 * @description Creates the first calibration task, repeated
 *
 * @param {Object} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {Object} state - The state object to track and store various pieces of data during the trial, such as median tap counts and success counters.
 *
 * @returns {Object} - A jsPsych trial object that runs the first part of the calibration trial.
 *
 * The trial timeline includes the following:
 * - Runs a calibration trial using the `createCalibrationTrial` function without displaying a thermometer.
 * - Adjusts the progress bar upon successful completion of the trial.
 */
export const calibrationTrialPart1 = (jsPsych, state) => ({
    timeline: [
        createCalibrationTrial({
            showThermometer: false,
            bounds: [
                EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
                EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
            ],
            calibrationPart: 'calibrationPart1',
            jsPsych,
            state,
        }),
    ],
    on_timeline_finish: function () {
        if (state.calibrationPart1Failed === false) {
            changeProgressBar(PROGRESS_BAR.PROGRESS_BAR_CALIBRATION, 0.2, jsPsych);
        }
    }
});
/**
 * @function conditionalCalibrationTrialPart1
 * @description Creates a conditional copy of the first calibration task
 *
 * @param {Object} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {Object} state - The state object to track and store various pieces of data during the trial, such as median tap counts and success counters.
 *
 * @returns {Object} - A jsPsych trial object that runs a no-stimuli calibration trial only if the first calibration trial's median was below the minimum median required.
 *
 * The trial timeline includes the following:
 * - Runs a calibration trial using the `createConditionalCalibrationTrial` function without displaying a thermometer.
 * - Adjusts the progress bar upon successful completion of the trial.
 */
export const conditionalCalibrationTrialPart1 = (jsPsych, state) => ({
    timeline: [
        createConditionalCalibrationTrial({
            calibrationPart: 'calibrationPart1',
            jsPsych,
            state,
        }),
    ],
    on_timeline_finish: function () {
        if (state.calibrationPart1Failed === false) {
            changeProgressBar(PROGRESS_BAR.PROGRESS_BAR_CALIBRATION, 0.23, jsPsych);
        }
    }
});
/**
 * @function calibrationTrialPart2
 * @description Creates the second calibration task, repeated
 *
 * @param {Object} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {Object} state - The state object to track and store various pieces of data during the trial, such as median tap counts and success counters.
 *
 * @returns {Object} - A jsPsych trial object that runs the first part of the calibration trial.
 *
 * The trial timeline includes the following:
 * - Runs a calibration trial using the `createCalibrationTrial` function with displaying a thermometer.
 * - Adjusts the progress bar upon successful completion of the trial.
 */
export const calibrationTrialPart2 = (jsPsych, state) => ({
    timeline: [
        createCalibrationTrial({
            showThermometer: true,
            bounds: [
                EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
                EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
            ],
            calibrationPart: 'calibrationPart2',
            jsPsych,
            state,
        }),
    ],
    on_timeline_finish: function () {
        if (state.calibrationPart2Failed === false) {
            changeProgressBar(PROGRESS_BAR.PROGRESS_BAR_CALIBRATION, 0.35, jsPsych);
        }
    }
});
/**
 * @function conditionalCalibrationTrialPart2
 * @description Creates a conditional copy of the second calibration task
 *
 * @param {Object} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {Object} state - The state object to track and store various pieces of data during the trial, such as median tap counts and success counters.
 *
 * @returns {Object} - A jsPsych trial object that runs a calibration trial with stimuli and using the median from the first calibration trial only if the first calibration trial's median was below the minimum median required.
 *
 * The trial timeline includes the following:
 * - Runs a calibration trial using the `createConditionalCalibrationTrial` function with displaying a thermometer.
 * - Adjusts the progress bar upon successful completion of the trial.
 */
export const conditionalCalibrationTrialPart2 = (jsPsych, state) => ({
    timeline: [
        createConditionalCalibrationTrial({
            calibrationPart: 'calibrationPart2',
            jsPsych,
            state,
        }),
    ],
    on_timeline_finish: function () {
        if (state.calibrationPart2Failed === false) {
            changeProgressBar(PROGRESS_BAR.PROGRESS_BAR_CALIBRATION, 0.45, jsPsych);
        }
    }
});
/**
 * @function finalCalibrationTrialPart1
 * @description Creates the first calibration task, repeated
 *
 * @param {Object} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {Object} state - The state object to track and store various pieces of data during the trial, such as median tap counts and success counters.
 *
 * @returns {Object} - A jsPsych trial object that runs the first part of the calibration trial.
 *
 * The trial timeline includes the following:
 * - Runs a calibration trial using the `createCalibrationTrial` function without displaying a thermometer.
 * - Adjusts the progress bar upon successful completion of the trial.
 */
export const finalCalibrationTrialPart1 = (jsPsych, state) => ({
    timeline: [
        createCalibrationTrial({
            showThermometer: false,
            bounds: [
                EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
                EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
            ],
            calibrationPart: 'finalCalibrationPart1',
            jsPsych,
            state,
        }),
    ],
    on_timeline_finish: function () {
        changeProgressBar(PROGRESS_BAR.PROGRESS_BAR_TRIAL_BLOCKS, 0.8, jsPsych);
    }
});
/**
 * @function finalCalibrationTrialPart2
 * @description Creates the second calibration task, repeated
 *
 * @param {Object} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {Object} state - The state object to track and store various pieces of data during the trial, such as median tap counts and success counters.
 *
 * @returns {Object} - A jsPsych trial object that runs the first part of the calibration trial.
 *
 * The trial timeline includes the following:
 * - Runs a calibration trial using the `createCalibrationTrial` function with displaying a thermometer.
 * - Adjusts the progress bar upon successful completion of the trial.
 */
export const finalCalibrationTrialPart2 = (jsPsych, state) => ({
    timeline: [
        createCalibrationTrial({
            showThermometer: true,
            bounds: [
                EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
                EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
            ],
            calibrationPart: 'finalCalibrationPart2',
            jsPsych,
            state,
        }),
    ],
    on_timeline_finish: function () {
        changeProgressBar(PROGRESS_BAR.PROGRESS_BAR_TRIAL_BLOCKS, 0.99, jsPsych);
    }
});
