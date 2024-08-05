import {
  AUTO_DECREASE_AMOUNT,
  AUTO_DECREASE_RATE,
  FAILED_VALIDATION_MESSAGE,
  NUM_EXTRA_VALIDATION_TRIALS,
  NUM_VALIDATION_TRIALS,
  PASSED_VALIDATION_MESSAGE,
  TRIAL_DURATION,
  EXPECTED_MAXIMUM_PERCENTAGE,
  PROGRESS_BAR,
  CONTINUE_BUTTON_MESSAGE
} from './constants';
import { countdownStep } from './countdown';
import { loadingBarTrial } from './loading-bar';
import { successScreen } from './success';
import { releaseKeysStep } from './release-keys';
import TaskPlugin from './task';
import { autoIncreaseAmount, checkKeys, changeProgressBar, checkFlag } from './utils';
import { finishExperimentEarly } from './finish';
import { State, TaskTrialData, ValidationData } from './types';
import { JsPsych } from 'jspsych';
import htmlButtonResponse from '@jspsych/plugin-html-button-response';
export const handleValidationFinish = (data: ValidationData, validationName: string, state: State) => {
  if (validationName !== 'validationExtra') {
    if (!data.success) {
      state.validationFailures[validationName]++;

      if (Object.values(state.validationFailures).some(failures => failures >= Math.floor(0.75 * NUM_VALIDATION_TRIALS))) {
        state.extraValidationRequired = true;
      }
    }
  } else {
    if (!data.success) {
      state.validationExtraFailures++;
    }

    if (state.validationExtraFailures >= NUM_EXTRA_VALIDATION_TRIALS) {
      console.log(state.validationExtraFailures);
      console.log('more than 3 failures have been reached');
      state.validationSuccess = false;
    }
  }
};

export const createValidationTrial = (
  bounds: number[],
  validationName: string,
  repetitions: number,
  jsPsych: JsPsych,
  state: State,
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
          EXPECTED_MAXIMUM_PERCENTAGE,
          TRIAL_DURATION,
          AUTO_DECREASE_RATE,
          AUTO_DECREASE_AMOUNT,
          state.medianTaps,
        );
      },
      data: {
        task: validationName,
      },
      on_start: function (trial: TaskTrialData) {
        const keyTappedEarlyFlag = checkFlag(
          'countdown',
          'keyTappedEarlyFlag',
          jsPsych,
        );
        // Update the trial parameters with keyTappedEarlyFlag
        trial.keyTappedEarlyFlag = keyTappedEarlyFlag;
        return keyTappedEarlyFlag;
      },
      on_finish: function (data: ValidationData) {
        data.task = validationName;
        handleValidationFinish(data, validationName, state);
      },
    },
    successScreen(jsPsych),
    {
      timeline: [releaseKeysStep],
      conditional_function: function () {
        return checkKeys('success', jsPsych) && checkKeys(validationName, jsPsych)
      },
    },
    {
      timeline: [loadingBarTrial(true, jsPsych)],
    },
  ],
  repetitions: repetitions,
});

export const validationResultScreen = (jsPsych: JsPsych, state: State) => ({
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

export const validationTrialEasy = (jsPsych: JsPsych, state: State) => ({
  timeline: [
    createValidationTrial(
      [30, 50],
      'validationEasy',
      NUM_VALIDATION_TRIALS,
      jsPsych,
      state,
    ),
  ],
  on_timeline_finish: function() {
      changeProgressBar(`${PROGRESS_BAR.PROGRESS_BAR_CALIBRATION}`, 0.60, jsPsych);
  }
});

export const validationTrialMedium = (jsPsych: JsPsych, state: State) => ({
  timeline: [
    createValidationTrial(
      [50, 70],
      'validationMedium',
      NUM_VALIDATION_TRIALS,
      jsPsych,
      state,
    ),
  ],
  on_timeline_finish: function() {
    changeProgressBar(`${PROGRESS_BAR.PROGRESS_BAR_CALIBRATION}`, 0.75, jsPsych);
}
});

export const validationTrialHard = (jsPsych: JsPsych, state: State) => ({
  timeline: [
    createValidationTrial(
      [70, 90],
      'validationHard',
      NUM_VALIDATION_TRIALS,
      jsPsych,
      state,
    ),
  ],
  on_timeline_finish: function() {
    if (state.extraValidationRequired === false) {
      changeProgressBar(`${PROGRESS_BAR.PROGRESS_BAR_TRIAL_BLOCKS}`, .90, jsPsych);
    }
  }
});

export const validationTrialExtra = (jsPsych: JsPsych, state: State) => ({
  timeline: [
    createValidationTrial(
      [70, 90],
      'validationExtra',
      NUM_EXTRA_VALIDATION_TRIALS,
      jsPsych,
      state,
    ),
  ],
  on_timeline_finish: function() {
    if (state.validationExtraFailures >= 3) {
      changeProgressBar(`${PROGRESS_BAR.PROGRESS_BAR_TRIAL_BLOCKS}`, 0, jsPsych);
    }
  }
});
