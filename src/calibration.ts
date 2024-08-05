import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import { JsPsych } from 'jspsych';

import {
  ADDITIONAL_CALIBRATION_PART_1_DIRECTIONS,
  AUTO_DECREASE_AMOUNT,
  AUTO_DECREASE_RATE,
  EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
  MINIMUM_CALIBRATION_MEDIAN,
  NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
  NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
  TRIAL_DURATION,
  PROGRESS_BAR
} from './constants';
import { countdownStep } from './countdown';
import { finishExperimentEarlyTrial } from './finish';
import { loadingBarTrial } from './loading-bar';
import { releaseKeysStep } from './release-keys';
import TaskPlugin from './task';
import {
  CalibrationTrialParams,
  ConditionalCalibrationTrialParams,
  State,
} from './types';
import {
  autoIncreaseAmount,
  calculateMedianTapCount,
  checkFlag,
  checkKeys,
  changeProgressBar
} from './utils';

export const createCalibrationTrial = ({
  showThermometer,
  bounds,
  calibrationPart,
  jsPsych,
  state,
}: CalibrationTrialParams) => {
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
          console.log(
            'autoIncreaseAmount called with medianTapsPart1:',
            state.medianTapsPart1,
          );
          return autoIncreaseAmount(
            EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
            TRIAL_DURATION,
            AUTO_DECREASE_RATE,
            AUTO_DECREASE_AMOUNT,
            state.medianTapsPart1,
          );
        },
        on_start: function (trial: any) {
          const keyTappedEarlyFlag = checkFlag(
            'countdown',
            'keyTappedEarlyFlag',
            jsPsych,
          );
          // Update the trial parameters with keyTappedEarlyFlag
          trial.keyTappedEarlyFlag = keyTappedEarlyFlag;
        },
        on_finish: function (data: any) {
          if (!data.keysReleasedFlag && !data.keyTappedEarlyFlag) {
            // Only consider trials where keys were not released early and not tapped early for minimum tapping logic
            if (calibrationPart === 'calibrationPart1') {
              // Increase successful trials counter for respective calibration part
              state.calibrationPart1Successes++;
              console.log(state.calibrationPart1Successes);
              // calculate median for respective trial
              state.medianTapsPart1 = calculateMedianTapCount(
                'calibrationPart1',
                NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS-1,
                jsPsych,
              );
              // If median taps is greater than the minimum median, set state.calibrationPart1Failed to false so conditional trial does not occur
              if (state.medianTapsPart1 >= MINIMUM_CALIBRATION_MEDIAN) {
                state.calibrationPart1Failed = false;
              }
            } else if (calibrationPart === 'calibrationPart2') {
              // Increase successful trials counter for respective calibration part
              state.calibrationPart2Successes++;
              // calculate median for respective trial
              state.medianTaps = calculateMedianTapCount(
                'calibrationPart2',
                NUM_CALIBRATION_WITH_FEEDBACK_TRIALS-1,
                jsPsych,
              );
              // If median taps is greater than the minimum median, set state.calibrationPart1Failed to false so conditional trial does not occur
              if (state.medianTaps >= MINIMUM_CALIBRATION_MEDIAN) {
                state.calibrationPart2Failed = false;
              }
            }
          }
        },
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
    loop_function: function () {
      // Ensure minimum amount of trials are done fully without releasing keys or tapping early
      const requiredSuccesses =
        calibrationPart === 'calibrationPart1'
          ? NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS
          : NUM_CALIBRATION_WITH_FEEDBACK_TRIALS;

      const currentSuccesses =
        calibrationPart === 'calibrationPart1'
          ? state.calibrationPart1Successes
          : state.calibrationPart2Successes;

      const remainingSuccesses = requiredSuccesses - currentSuccesses;
      console.log(
        `Remaining successes for ${calibrationPart}: ${remainingSuccesses}`,
      );
      if (remainingSuccesses <= 0) {
        console.log('Stopping loop');
        return false;
      } else {
        return true;
      }
    },
  };
};

/**
 * @function createConditionalCalibrationTrial
 * @description Create a conditional calibration trial
 * @param {ConditionalCalibrationTrialParams} params - The parameters for the conditional calibration trial
 * @returns {Object} - jsPsych trial object
 */
export const createConditionalCalibrationTrial = ({
  calibrationPart,
  numTrials,
  jsPsych,
  state,
}: ConditionalCalibrationTrialParams) => {
  return {
    timeline: [
      {
        type: HtmlKeyboardResponsePlugin,
        choices: ['enter'],
        stimulus: function () {
          // Reset success counters for the calibration trials completed after minimum taps not reached
          if (calibrationPart === 'calibrationPart1') {
            state.calibrationPart1Successes = 0;
          } else {
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
        // If minimum taps is not reached in this set of conditional trials, then end experiment
        timeline: [finishExperimentEarlyTrial(jsPsych)],
        conditional_function: function () {
          if (calibrationPart === 'calibrationPart1') {
            if (state.medianTapsPart1 >= MINIMUM_CALIBRATION_MEDIAN) {
              return false;
            } else return true;
          } else {
            console.log(
              `state.medianTaps for conditional trial = ${state.medianTaps}`,
            );
            if (state.medianTaps >= MINIMUM_CALIBRATION_MEDIAN) {
              return false;
            } else return true;
          }
        },
      },
    ],
    // Conditional trial section should only occur if the corresponding calibration part failed due to minimum taps previously
    conditional_function: function () {
      if (calibrationPart === 'calibrationPart1') {
        return state.calibrationPart1Failed;
      } else {
        return state.calibrationPart2Failed;
      }
    },
  };
};

// Create actual trial sections
export const calibrationTrialPart1 = (jsPsych: JsPsych, state: State) => ({
  timeline: [
    createCalibrationTrial({
      showThermometer: false,
      bounds: [
        EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
        EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
      ],
      repetitions: NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
      calibrationPart: 'calibrationPart1',
      jsPsych,
      state,
    }),
  ],
  on_timeline_finish: function() {
    if(state.calibrationPart1Failed === false){
      changeProgressBar(PROGRESS_BAR.PROGRESS_BAR_CALIBRATION + ' Part 2', 0.2, jsPsych);
    }
  }
});


export const conditionalCalibrationTrialPart1 = (jsPsych: JsPsych, state: State) => ({
  timeline: [
    createConditionalCalibrationTrial({
      calibrationPart: 'calibrationPart1',
      numTrials: NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
      jsPsych,
      state,
    }),
  ],
  on_timeline_finish: function() {
    if(state.calibrationPart1Failed === false){
      changeProgressBar(PROGRESS_BAR.PROGRESS_BAR_CALIBRATION + ' Part 2', 0.23, jsPsych);
    }
  }
});

export const calibrationTrialPart2 = (jsPsych: JsPsych, state: State) => ({
  timeline: [
    createCalibrationTrial({
      showThermometer: true,
      bounds: [
        EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
        EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
      ],
      repetitions: NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
      calibrationPart: 'calibrationPart2',
      jsPsych,
      state,
    }),
  ],
  on_timeline_finish: function() {
    if (state.calibrationPart2Failed === false) {
      changeProgressBar(PROGRESS_BAR.PROGRESS_BAR_CALIBRATION + ' Part 3', 0.5, jsPsych);
    }
  }
});

export const conditionalCalibrationTrialPart2 = (jsPsych: JsPsych, state: State) => ({
  timeline: [
    createConditionalCalibrationTrial({
      calibrationPart: 'calibrationPart2',
      numTrials: NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
      jsPsych,
      state,
    }),
  ],
  on_timeline_finish: function() {
    if (state.calibrationPart2Failed === false) {
      changeProgressBar(PROGRESS_BAR.PROGRESS_BAR_CALIBRATION + ' Part 3', 0.53, jsPsych);
    }
  }
});

