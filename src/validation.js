import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';

import {
  AUTO_DECREASE_AMOUNT,
  AUTO_DECREASE_RATE,
  BOUND_OPTIONS,
  EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
  FAILED_VALIDATION_MESSAGE,
  NUM_EXTRA_VALIDATION_TRIALS,
  NUM_VALIDATION_TRIALS,
  PASSED_VALIDATION_MESSAGE,
  TRIAL_DURATION,
} from './constants';
import { countdownStep } from './countdown';
import { loadingBarTrial } from './loading-bar';
import { successScreen } from './message-trials';
import { releaseKeysStep } from './release-keys';
import TaskPlugin from './task';
import { autoIncreaseAmount, checkFlag } from './utils';

// Ensure handleValidationFinish is imported correctly

// Initialize validationFailures with each bound option set to 0
export const validationFailures = BOUND_OPTIONS.reduce((acc, bounds) => {
  acc[JSON.stringify(bounds)] = 0;
  return acc;
}, {});

let validationExtraFailures = 0; // Initialize the counter for extra validation failures

/**
 * Handle the logic for finishing a validation trial.
 *
 * @param {Object} data - The data object from the trial
 * @param {String} validationName - The name of the validation trial
 * @param {Array} bounds - The bounds used in the validation trial
 * @param {Object} validationFailures - The object tracking validation failures
 * @param {Array} validationExtraCount - The count of extra validation trials
 *
 * @returns {Object} - An object containing extraValidationRequired, validationSuccess, and validationExtraFailures
 */
export const handleValidationFinish = (data, validationName, bounds, state) => {
  let extraValidationRequired = false;
  let validationSuccess = true;

  if (validationName !== 'validationExtra') {
    if (!data.success) {
      state.validationFailures[JSON.stringify(bounds)]++; // Increment the failure count if trial was not successful
      // If any of the validations levels have 3/4 or more failures, ensure extra validation follows.
      if (
        Object.values(state.validationFailures).some(
          (failures) => failures >= Math.floor(0.75 * NUM_VALIDATION_TRIALS),
        )
      ) {
        extraValidationRequired = true;
      }
    }
  } else {
    // If the trial is an extra validation trial and it was not successful
    if (!data.success) {
      state.validationExtraFailures++; // Increment the counter for extra validation failures
    }

    // Check if there have been 3 or more extra validation trials
    if (state.validationExtraCount >= NUM_EXTRA_VALIDATION_TRIALS) {
      // Set validation success if the user passed at least 1 extra validation trial
      validationSuccess =
        state.validationExtraFailures <= NUM_EXTRA_VALIDATION_TRIALS - 1;
    }
  }

  return {
    extraValidationRequired,
    validationSuccess,
    validationExtraFailures: state.validationExtraFailures,
  };
};

export const createValidationTrial = (
  bounds,
  validationName,
  repetitions,
  jsPsych,
  state,
) => ({
  timeline: [
    countdownStep,
    {
      type: TaskPlugin,
      task: validationName,
      duration: TRIAL_DURATION,
      showThermometer: true,
      bounds: bounds,
      autoIncreaseAmount: function () {
        return autoIncreaseAmount(
          EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
          TRIAL_DURATION,
          AUTO_DECREASE_RATE,
          AUTO_DECREASE_AMOUNT,
          state.medianTaps,
        );
      },
      data: {
        task: validationName,
      },
      on_finish: function (data) {
        data.task = validationName;
        const validationExtraCount = jsPsych.data
          .get()
          .filter({ task: 'validationExtra' })
          .values();

        const result = handleValidationFinish(
          data,
          validationName,
          bounds,
          state.validationFailures,
          validationExtraCount,
          state.validationExtraFailures,
        );

        state.extraValidationRequired = result.extraValidationRequired;
        state.validationSuccess = result.validationSuccess;
        state.validationExtraFailures = result.validationExtraFailures;
      },
    },
    {
      timeline: [successScreen(jsPsych)],
    },
    {
      timeline: [releaseKeysStep],
      conditional_function: function () {
        return !checkFlag(validationName, 'keysReleasedFlag', jsPsych);
      },
    },
    {
      timeline: [loadingBarTrial(true, jsPsych)],
    },
  ],
  repetitions: repetitions,
});

const validationResultScreen = {
  type: HtmlKeyboardResponsePlugin,
  choices: ['enter'],
  stimulus: function () {
    return state.validationSuccess
      ? PASSED_VALIDATION_MESSAGE
      : FAILED_VALIDATION_MESSAGE;
  },
  on_finish: function () {
    if (!state.validationSuccess) {
      jsPsych.endExperiment(FAILED_VALIDATION_MESSAGE);
    }
  },
};

// Create individual validation trial functions
export const validationTrialEasy = (jsPsych, state) =>
  createValidationTrial(
    [30, 50],
    'validationEasy',
    NUM_VALIDATION_TRIALS,
    jsPsych,
    state,
  );

export const validationTrialMedium = (jsPsych, state) =>
  createValidationTrial(
    [50, 70],
    'validationMedium',
    NUM_VALIDATION_TRIALS,
    jsPsych,
    state,
  );

export const validationTrialHard = (jsPsych, state) =>
  createValidationTrial(
    [70, 90],
    'validationHard',
    NUM_VALIDATION_TRIALS,
    jsPsych,
    state,
  );

export const validationTrialExtra = (jsPsych, state) =>
  createValidationTrial(
    [70, 90],
    'validationExtra',
    NUM_EXTRA_VALIDATION_TRIALS,
    jsPsych,
    state,
  );

// Set up the validation trials array similarly
export const validationTrials = (jsPsych, state) => [
  validationTrialEasy(jsPsych, state),
  validationTrialMedium(jsPsych, state),
  validationTrialHard(jsPsych, state),
  {
    timeline: [validationTrialExtra(jsPsych, state)],
    conditional_function: function () {
      return state.extraValidationRequired;
    },
  },
  validationResultScreen,
];
