import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import {
  ADDITIONAL_CALIBRATION_PART_1_DIRECTIONS,
  AUTO_DECREASE_AMOUNT,
  AUTO_DECREASE_RATE,
  EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
  MINIMUM_CALIBRATION_MEDIAN,
  NUM_CALIBRATION_TRIALS,
  NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
  NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
  TRIAL_DURATION,
} from './constants';
import { CountdownTrialPlugin, countdownStep } from './countdown';
import { loadingBarTrial } from './loading-bar';
import { finishExperimentEarlyTrial } from './finish';
import { releaseKeysStep } from './release-keys';
import TaskPlugin from './task';
import { autoIncreaseAmount, checkFlag, calculateMedianTapCount } from './utils';
import { JsPsych } from 'jspsych';
import { CalibrationTrialParams, ConditionalCalibrationTrialParams, State } from './types';

export const createCalibrationTrial = ({
  showThermometer,
  bounds,
  repetitions,
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
        duration: TRIAL_DURATION,
        showThermometer,
        bounds,
        autoIncreaseAmount: function () {
          // Determine which median to use for Part 2
          let medianToUse = state.medianTaps;
          if (calibrationPart === 'calibrationPart2') {
            medianToUse =
              state.medianTapsPart1 >= MINIMUM_CALIBRATION_MEDIAN
                ? state.medianTapsPart1
                : state.conditionalMedianTapsPart1;
          }
          return autoIncreaseAmount(
            EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
            TRIAL_DURATION,
            AUTO_DECREASE_RATE,
            AUTO_DECREASE_AMOUNT,
            medianToUse,
          );
        },
        data: {
          task: calibrationPart,
          showThermometer,
          bounds,
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
            calibrationPart === 'calibrationPart1'
              ? state.calibrationPart1Successes++
              : state.calibrationPart2Successes++;
          }
          console.log(
            `calibrationPart1Successes: ${state.calibrationPart1Successes}`,
          );
          console.log(
            `calibrationPart2Successes: ${state.calibrationPart2Successes}`,
          );
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
      return remainingSuccesses > 0; // Repeat the timeline if more successes are needed
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
          // Reset success counters
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
        timeline: [
          finishExperimentEarlyTrial(jsPsych),
        ],
        conditional_function: function () {
          if (calibrationPart === 'calibrationPart1') {
            state.conditionalMedianTapsPart1 = calculateMedianTapCount(
              calibrationPart,
              numTrials,
              jsPsych,
            );
            console.log(
              `conditionalMedianTapsPart1: ${state.conditionalMedianTapsPart1}`,
            );
            return (
              state.conditionalMedianTapsPart1 < MINIMUM_CALIBRATION_MEDIAN
            );
          } else {
            state.conditionalMedianTapsPart2 = calculateMedianTapCount(
              calibrationPart,
              numTrials,
              jsPsych,
            );
            console.log(
              `conditionalMedianTapsPart2: ${state.conditionalMedianTapsPart2}`,
            );
            return (
              state.conditionalMedianTapsPart2 < MINIMUM_CALIBRATION_MEDIAN
            );
          }
        },
      },
    ],
    conditional_function: function () {
      if (calibrationPart === 'calibrationPart1') {
        console.log(`medianTapsPart1: ${state.medianTapsPart1}`);
        return state.medianTapsPart1 < MINIMUM_CALIBRATION_MEDIAN;
      } else {
        console.log(`medianTapsPart2: ${state.medianTapsPart2}`);
        return state.medianTapsPart2 < MINIMUM_CALIBRATION_MEDIAN;
      }
    },
  };
};

export const calibrationTrialPart1 = (jsPsych: JsPsych, state: State) =>
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
  });

export const conditionalCalibrationTrialPart1 = (
  jsPsych: JsPsych,
  state: State
) => createConditionalCalibrationTrial({
  calibrationPart: 'calibrationPart1',
  numTrials: NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
  jsPsych,
  state
});

export const calibrationTrialPart2 = (jsPsych: JsPsych, state: State) =>
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
  });

export const conditionalCalibrationTrialPart2 = (
  jsPsych: JsPsych,
  state: State
) => createConditionalCalibrationTrial({
  calibrationPart: 'calibrationPart2',
  numTrials: NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
  jsPsych,
  state
});
