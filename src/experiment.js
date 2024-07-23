/**
 * @title Cognitive Apathy Experiment
 * @description This experiment aims to measure cognitive apathy using calibration and thermometer tasks.
 * @version 0.1.0
 *
 * @assets assets/
 */
import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import PreloadPlugin from '@jspsych/plugin-preload';
import surveyLikert from '@jspsych/plugin-survey-likert';
import videoButtonResponse from '@jspsych/plugin-video-button-response';
import { saveAs } from 'file-saver';
import { initJsPsych } from 'jspsych';

import '../styles/main.scss';
import {
  calibrationTrialPart1,
  calibrationTrialPart2,
  createCalibrationTrial,
  createConditionalCalibrationTrial,
} from './calibration';
import {
  ADDITIONAL_CALIBRATION_PART_1_DIRECTIONS,
  AUTO_DECREASE_AMOUNT,
  AUTO_DECREASE_RATE,
  AUTO_INCREASE_AMOUNT,
  BOUND_OPTIONS,
  CALIBRATION_FINISHED_DIRECTIONS,
  CALIBRATION_PART_1_DIRECTIONS,
  CALIBRATION_PART_1_ENDING_MESSAGE,
  CALIBRATION_PART_2_DIRECTIONS,
  CALIBRATION_PART_2_ENDING_MESSAGE,
  DEMO_TRIAL_MESSAGE,
  EASY_BOUNDS,
  EXPECTED_MAXIMUM_PERCENTAGE,
  EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
  FAILED_MINIMUM_DEMO_TAPS_DURATION,
  FAILED_MINIMUM_DEMO_TAPS_MESSAGE,
  FAILED_VALIDATION_MESSAGE,
  GO_DURATION,
  HARD_BOUNDS,
  KEYS_TO_HOLD,
  LIKERT_PREAMBLE,
  LOADING_BAR_SPEED_NO,
  LOADING_BAR_SPEED_YES,
  MEDIUM_BOUNDS,
  MINIMUM_CALIBRATION_MEDIAN,
  MINIMUM_DEMO_TAPS,
  NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
  NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
  NUM_DEMO_TRIALS,
  NUM_EXTRA_VALIDATION_TRIALS,
  NUM_TRIALS,
  NUM_VALIDATION_TRIALS,
  PARAMETER_COMBINATIONS,
  PASSED_VALIDATION_MESSAGE,
  REWARD_TOTAL_MESSAGE,
  SUCCESS_SCREEN_DURATION,
  TRIAL_BLOCKS_DIRECTIONS,
  TRIAL_DURATION,
  TRIAL_FAILED,
  TRIAL_SUCCEEDED,
  TUTORIAL_MESSAGE_1,
  VALIDATION_DIRECTIONS,
  VIDEO_TUTORIAL_MESSAGE,
} from './constants';
import { countdownStep } from './countdown';
import { KeyboardInteractionPlugin } from './keyboard';
import { likertQuestions1, likertQuestions2 } from './likert';
import { loadingBarTrial } from './loading-bar';
import { successScreen } from './message-trials';
import { ReleaseKeysPlugin, releaseKeysStep } from './release-keys';
import {
  acceptanceThermometer,
  blockWelcomeMessage,
  loadingBar,
  showThermometer,
  thermometer,
  videoStimulus,
} from './stimulus';
import TaskPlugin from './task';
import { sampledArray } from './trials';
import {
  DOMINANT_HAND,
  dominantHand,
  instructionalCountdownSte,
  instructionalTrial,
  interactiveCountdown,
  noStimuliVideoTutorial,
  practiceLoop,
  stimuliVideoTutorial,
  validationVideoTutorial,
} from './tutorial';
import {
  autoIncreaseAmount,
  calculateMedianTapCount,
  checkFlag,
  randomNumberBm,
} from './utils';
import {
  validationTrialEasy,
  validationTrialExtra,
  validationTrialHard,
  validationTrialMedium,
} from './validation';

let state = {
  medianTaps: 0,
  medianTapsPart1: 0,
  medianTapsPart2: 0,
  calibrationPart1Successes: 0,
  calibrationPart2Successes: 0,
  conditionalMedianTapsPart1: 0,
  conditionalMedianTapsPart2: 0,
  validationExtraFailures: 0,
  validationSuccess: false,
  extraValidationRequired: false,
  validationFailures: {
    '[30,50]': 0,
    '[50,70]': 0,
    '[70,90]': 0,
  },
  failedMinimumDemoTapsTrial: 0,
  demoTrialSuccesses: 0,
};

/**
 * @function run
 * @description Main function to run the experiment
 * @param {Object} config - Configuration object for the experiment
 */
export async function run({
  assetPaths,
  input = {},
  environment,
  title,
  version,
}) {
  const jsPsych = initJsPsych();

  const timeline = [];

  // Preload assets
  timeline.push({
    type: PreloadPlugin,
    audio: assetPaths.audio,
    video: '../assets/videos',
  });

  // Did

  // Countdown step with `key `release flag check

  /**
   * @function endExperimentTrial
   * @description Create a trial to end the experiment with a message
   * @param {string} message - The message to display
   * @returns {Object} - jsPsych trial object
   */

  // Video + instructions for
  timeline.push({
    timeline: [noStimuliVideoTutorial],
    on_finish: function () {
      // Clear the display element
      jsPsych.getDisplayElement().innerHTML = '';
    },
  });

  timeline.push(practiceLoop(jsPsych));

  timeline.push(instructionalTrial(CALIBRATION_PART_1_DIRECTIONS));
  timeline.push({
    timeline: [calibrationTrialPart1(jsPsych, state)],
  });

  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: function () {
      state.medianTapsPart1 = calculateMedianTapCount(
        'calibrationPart1',
        NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
        jsPsych,
        state.medianTaps,
      );
      console.log(`medianTapsPart1: ${state.medianTapsPart1}`);
      if (state.medianTapsPart1 >= MINIMUM_CALIBRATION_MEDIAN) {
        state.medianTaps = state.medianTapsPart1;
        console.log(`medianTaps updated to: ${state.medianTaps}`);
      }
      return `<p>${CALIBRATION_PART_1_ENDING_MESSAGE}</p>`;
    },
  });

  timeline.push({
    timeline: [stimuliVideoTutorial],
    on_finish: function () {
      // Clear the display element
      jsPsych.getDisplayElement().innerHTML = '';
    },
  });

  timeline.push({
    timeline: [calibrationTrialPart2(jsPsych, state)],
  });

  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: function () {
      state.medianTapsPart2 = calculateMedianTapCount(
        'calibrationPart2',
        NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
        jsPsych,
        state.medianTaps,
      );
      console.log(`medianTapsPart2: ${state.medianTapsPart2}`);
      if (state.medianTapsPart2 >= MINIMUM_CALIBRATION_MEDIAN) {
        state.medianTaps = state.medianTapsPart2;
        console.log(`medianTaps updated to: ${state.medianTaps}`);
      }
      return `<p>${CALIBRATION_PART_2_ENDING_MESSAGE}</p>`;
    },
  });

  timeline.push({
    timeline: [validationVideoTutorial],
    on_finish: function () {
      // Clear the display element
      jsPsych.getDisplayElement().innerHTML = '';
    },
  });

  timeline.push({
    timeline: [validationTrialEasy(jsPsych, state)],
  });

  timeline.push({
    timeline: [validationTrialMedium(jsPsych, state)],
  });

  timeline.push({
    timeline: [validationTrialHard(jsPsych, state)],
  });

  timeline.push({
    timeline: [validationTrialExtra(jsPsych, state)],
    conditional_function: function () {
      return state.extraValidationRequired;
    },
  });

  const sampledTrials = sampledArray(jsPsych, state);
  sampledTrials.forEach((trialBlock) => {
    timeline.push(trialBlock[0]);
    timeline.push(trialBlock[1]);
    timeline.push(trialBlock[2]);
  });

  // Final step to calculate total reward at the end of the experiment
  const finishExperiment = {
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: function () {
      const totalSuccessfulReward = calculateTotalReward();
      return `<p>${REWARD_TOTAL_MESSAGE(totalSuccessfulReward)}</p>`;
    },
    data: {
      task: 'finish_experiment',
    },
    on_finish: function (data) {
      // Add total reward data to this trial for easy access
      const totalSuccessfulReward = calculateTotalReward();
      data.totalReward = totalSuccessfulReward;
      const allData = jsPsych.data.get().json();
      const blob = new Blob([allData], { type: 'application/json' });
      saveAs(blob, `experiment_data_${new Date().toISOString()}.json`);
    },
  };

  timeline.push(finishExperiment);

  // Start the experiment
  await jsPsych.run(timeline);

  return jsPsych;
}
