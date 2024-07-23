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

export const handleValidationFinish = (data, validationName, state) => {
  if (validationName !== 'validationExtra') {
    if (!data.success) {
      state.validationFailures[validationName]++; // Increment the failure count if trial was not successful

      // If any of the validation levels have 3/4 or more failures, ensure extra validation follows.
      if (Object.values(state.validationFailures).some(failures => failures >= Math.floor(0.75 * NUM_VALIDATION_TRIALS))) {
        state.extraValidationRequired = true;
      }
    }
  } else {
    // If the trial is an extra validation trial and it was not successful
    if (!data.success) {
      state.validationExtraFailures++; // Increment the counter for extra validation failures
    }

    // Check if there have been 3 or more extra validation trials
    if (state.validationExtraFailures >= NUM_EXTRA_VALIDATION_TRIALS) {
      console.log(state.validationExtraFailures)
      console.log('more than 3 failurs have been reached')
      // Set validation success if the user passed at least 1 extra validation trial
      state.validationSuccess = false
    }
  }
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
        handleValidationFinish(data, validationName, state);
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

export const validationResultScreen = (jsPsych, state) => ({
  type: HtmlKeyboardResponsePlugin,
  choices: ['enter'],
  stimulus: function () {
    return state.validationSuccess
      ? PASSED_VALIDATION_MESSAGE
      : FAILED_VALIDATION_MESSAGE;
  },
  on_finish: function () {
    if (!state.validationSuccess) {
      const allData = jsPsych.data.get().json();
      const blob = new Blob([allData], { type: 'application/json' });
      saveAs(blob, `experiment_data_${new Date().toISOString()}.json`);
      jsPsych.endExperiment(FAILED_VALIDATION_MESSAGE);
    }
  },
});

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

