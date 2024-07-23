/**
 * @title Cognitive Apathy Experiment
 * @description This experiment aims to measure cognitive apathy using calibration and thermometer tasks.
 * @version 0.1.0
 *
 * @assets assets/
 */
// Import necessary plugins and modules from jsPsych and other libraries
import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import PreloadPlugin from '@jspsych/plugin-preload';
import { saveAs } from 'file-saver';
import { initJsPsych } from 'jspsych';

import '../styles/main.scss';
import { calibrationTrialPart1, calibrationTrialPart2 } from './calibration';
import {
  CALIBRATION_PART_1_DIRECTIONS,
  REWARD_TOTAL_MESSAGE,
} from './constants';
import {
  calculateMedianCalibrationPart1,
  calculateMedianCalibrationPart2,
} from './message-trials';
import { sampledArray } from './trials';
import {
  instructionalTrial,
  noStimuliVideoTutorialTrial,
  practiceLoop,
  stimuliVideoTutorialTrial,
  validationVideoTutorialTrial,
} from './tutorial';
import {
  validationTrialEasy,
  validationTrialExtra,
  validationTrialHard,
  validationTrialMedium,
} from './validation';
import { finishExperiment } from './finish';

// Initialize the state object to keep track of various metrics and flags throughout the experiment
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

  // Practice Section
  timeline.push(noStimuliVideoTutorialTrial(jsPsych));
  timeline.push(practiceLoop(jsPsych));

  // Calibration Part 1
  timeline.push(instructionalTrial(CALIBRATION_PART_1_DIRECTIONS))

  timeline.push(calibrationTrialPart1(jsPsych, state)),
  
  timeline.push(calculateMedianCalibrationPart1(jsPsych, state))

  // Calibration Part 2
  timeline.push(stimuliVideoTutorialTrial(jsPsych));
  timeline.push({
    timeline: [calibrationTrialPart2(jsPsych, state)],
  });
  timeline.push(calculateMedianCalibrationPart2(jsPsych, state));

  // Validation section
  timeline.push(validationVideoTutorialTrial(jsPsych));
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

  // Sample 6 random blocks of 63 trials
  const sampledTrials = sampledArray(jsPsych, state);
  sampledTrials.forEach((trialBlock) => {
    trialBlock.forEach((trial) => {
      timeline.push(trial);
    });
  });

  // Finish experiment and save data
  timeline.push(finishExperiment(jsPsych));

  // Start the experiment
  await jsPsych.run(timeline);

  return jsPsych;
}
