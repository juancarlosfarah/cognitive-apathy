import { AUTO_DECREASE_AMOUNT, AUTO_DECREASE_RATE, FAILED_VALIDATION_MESSAGE, NUM_EXTRA_VALIDATION_TRIALS, NUM_VALIDATION_TRIALS, PASSED_VALIDATION_MESSAGE, TRIAL_DURATION, EXPECTED_MAXIMUM_PERCENTAGE, PROGRESS_BAR, CONTINUE_BUTTON_MESSAGE } from './constants';
import { countdownStep } from './countdown';
import { loadingBarTrial } from './loading-bar';
import { successScreen } from './success';
import { releaseKeysStep } from './release-keys';
import TaskPlugin from './task';
import { autoIncreaseAmount, checkKeys, changeProgressBar, checkFlag } from './utils';
import { finishExperimentEarly } from './finish';
import htmlButtonResponse from '@jspsych/plugin-html-button-response';
/**
 * @function handleValidationFinish
 * @description Handles the outcome of a validation trial by updating the state based on whether the participant succeeded or failed. It checks if additional validation trials are required based on the number of failures.
 *
 * This function includes:
 * - Updating the number of validation failures for the specific validation type.
 * - Checking if the participant failed enough trials to require additional validation trials.
 * - Setting the validation success flag based on the outcome of extra validation trials.
 *
 * @param {ValidationData} data - The data object from the validation trial, including the success status.
 * @param {string} validationName - The name of the validation trial (e.g., 'validationEasy', 'validationMedium').
 * @param {State} state - An object for storing and tracking state data during the trials, such as validation failures and success flags.
 */
export const handleValidationFinish = (data, validationName, state) => {
    if (validationName !== 'validationExtra') {
        if (!data.success) {
            state.validationFailures[validationName]++;
            if (Object.values(state.validationFailures).some(failures => failures >= Math.floor(0.75 * NUM_VALIDATION_TRIALS))) {
                state.extraValidationRequired = true;
            }
        }
    }
    else {
        if (!data.success) {
            state.validationExtraFailures++;
        }
        if (state.validationExtraFailures >= NUM_EXTRA_VALIDATION_TRIALS) {
            state.validationSuccess = false;
        }
    }
};
/**
 * @function createValidationTrial
 * @description Creates a validation trial where participants must perform a task with a specific set of bounds. The trial includes countdown, task performance, success screen, and key release steps.
 *
 * This function includes:
 * - Configuring the task with specific bounds and other parameters.
 * - Automatically adjusting the mercury level during the task based on participant performance.
 * - Handling trial success or failure and updating the state accordingly.
 * - Repeating the trial a specified number of times (repetitions).
 *
 * @param {number[]} bounds - The bounds for the mercury level during the task.
 * @param {string} validationName - The name of the validation trial (e.g., 'validationEasy', 'validationMedium').
 * @param {number} repetitions - The number of times the validation trial is repeated.
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {State} state - An object for storing and tracking state data during the trials, such as validation failures and success flags.
 *
 * @returns {Object} - A jsPsych trial object containing the timeline of steps for the validation trial.
 */
export const createValidationTrial = (bounds, validationName, repetitions, jsPsych, state) => ({
    timeline: [
        countdownStep,
        {
            type: TaskPlugin,
            task: validationName,
            duration: TRIAL_DURATION,
            showThermometer: true,
            bounds: bounds,
            autoIncreaseAmount: function () {
                return autoIncreaseAmount(EXPECTED_MAXIMUM_PERCENTAGE, TRIAL_DURATION, AUTO_DECREASE_RATE, AUTO_DECREASE_AMOUNT, state.medianTaps);
            },
            data: {
                task: validationName,
            },
            on_start: function (trial) {
                const keyTappedEarlyFlag = checkFlag('countdown', 'keyTappedEarlyFlag', jsPsych);
                // Update the trial parameters with keyTappedEarlyFlag
                trial.keyTappedEarlyFlag = keyTappedEarlyFlag;
                return keyTappedEarlyFlag;
            },
            on_finish: function (data) {
                data.task = validationName;
                handleValidationFinish(data, validationName, state);
            },
        },
        successScreen(jsPsych),
        {
            timeline: [releaseKeysStep],
            conditional_function: function () {
                return checkKeys('success', jsPsych) && checkKeys(validationName, jsPsych);
            },
        },
        {
            timeline: [loadingBarTrial(true, jsPsych)],
        },
    ],
    repetitions: repetitions,
});
/**
 * @function validationResultScreen
 * @description Displays a result screen after the validation trials, indicating whether the participant passed or failed the validation phase.
 *
 * This function includes:
 * - Displaying a message indicating whether the participant passed or failed the validation phase.
 * - Ending the experiment early if the participant failed the validation phase.
 *
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {State} state - An object for storing and tracking state data during the trials, such as the validation success flag.
 *
 * @returns {Object} - A jsPsych trial object that displays the validation result and handles the outcome.
 */
export const validationResultScreen = (jsPsych, state) => ({
    type: htmlButtonResponse,
    choices: [CONTINUE_BUTTON_MESSAGE],
    stimulus: function () {
        return state.validationSuccess
            ? PASSED_VALIDATION_MESSAGE
            : FAILED_VALIDATION_MESSAGE;
    },
    on_finish: function () {
        if (!state.validationSuccess) {
            finishExperimentEarly(jsPsych);
        }
    },
});
/**
 * @function validationTrialEasy
 * @description Creates a series of easy validation trials where participants must perform the task within the lowest bounds.
 *
 * This function includes:
 * - Creating a timeline of validation trials with easy bounds.
 * - Updating the progress bar upon completion of the easy validation trials.
 *
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {State} state - An object for storing and tracking state data during the trials, such as validation failures and success flags.
 *
 * @returns {Object} - A jsPsych trial object containing the easy validation trials and progress bar updates.
 */
export const validationTrialEasy = (jsPsych, state) => ({
    timeline: [
        createValidationTrial([30, 50], 'validationEasy', NUM_VALIDATION_TRIALS, jsPsych, state),
    ],
    on_timeline_finish: function () {
        changeProgressBar(`${PROGRESS_BAR.PROGRESS_BAR_CALIBRATION}`, 0.60, jsPsych);
    }
});
/**
 * @function validationTrialMedium
 * @description Creates a series of medium validation trials where participants must perform the task within the medium bounds.
 *
 * This function includes:
 * - Creating a timeline of validation trials with medium bounds.
 * - Updating the progress bar upon completion of the medium validation trials.
 *
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {State} state - An object for storing and tracking state data during the trials, such as validation failures and success flags.
 *
 * @returns {Object} - A jsPsych trial object containing the medium validation trials and progress bar updates.
 */
export const validationTrialMedium = (jsPsych, state) => ({
    timeline: [
        createValidationTrial([50, 70], 'validationMedium', NUM_VALIDATION_TRIALS, jsPsych, state),
    ],
    on_timeline_finish: function () {
        changeProgressBar(`${PROGRESS_BAR.PROGRESS_BAR_CALIBRATION}`, 0.75, jsPsych);
    }
});
/**
 * @function validationTrialHard
 * @description Creates a series of hard validation trials where participants must perform the task within harder bounds.
 *
 * This function includes:
 * - Creating a timeline of validation trials with hard bounds.
 * - Updating the progress bar upon completion of the hard validation trials.
 * - Checking if extra validation is required and updating the progress bar accordingly.
 *
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {State} state - An object for storing and tracking state data during the trials, such as validation failures and success flags.
 *
 * @returns {Object} - A jsPsych trial object containing the hard validation trials and progress bar updates.
 */
export const validationTrialHard = (jsPsych, state) => ({
    timeline: [
        createValidationTrial([70, 90], 'validationHard', NUM_VALIDATION_TRIALS, jsPsych, state),
    ],
    on_timeline_finish: function () {
        if (state.extraValidationRequired === false) {
            changeProgressBar(`${PROGRESS_BAR.PROGRESS_BAR_TRIAL_BLOCKS}`, .90, jsPsych);
        }
    }
});
/**
 * @function validationTrialExtra
 * @description Creates a series of extra validation trials where participants must perform the task within the hardest bounds if they failed 3/4 or more of any of previous validation trial blocks.
 *
 * This function includes:
 * - Creating a timeline of extra validation trials with the hardest bounds.
 * - Updating the progress bar or ending the experiment if the participant does not succeed at least one extra validation trials.
 *
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {State} state - An object for storing and tracking state data during the trials, such as validation failures and success flags.
 *
 * @returns {Object} - A jsPsych trial object containing the extra validation trials and progress bar updates.
 */
export const validationTrialExtra = (jsPsych, state) => ({
    timeline: [
        createValidationTrial([70, 90], 'validationExtra', NUM_EXTRA_VALIDATION_TRIALS, jsPsych, state),
    ],
    on_timeline_finish: function () {
        if (state.validationExtraFailures >= 3) {
            changeProgressBar(`${PROGRESS_BAR.PROGRESS_BAR_TRIAL_BLOCKS}`, 0, jsPsych);
        }
    }
});
