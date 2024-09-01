/**
 * @title Cognitive Apathy Experiment
 * @description This experiment aims to measure cognitive apathy using calibration and thermometer tasks.
 * @version 0.1.0
 *
 * @assets assets/
 */
import PreloadPlugin from '@jspsych/plugin-preload';
import {initJsPsych } from 'jspsych';

import '../styles/main.scss';
import {
  calibrationTrialPart1,
  calibrationTrialPart2,
  conditionalCalibrationTrialPart1,
  conditionalCalibrationTrialPart2,
  finalCalibrationTrialPart1,
  finalCalibrationTrialPart2,
} from './calibration';
import { CALIBRATION_PART_1_DIRECTIONS, PROGRESS_BAR } from './constants';
import { finishExperiment } from './finish';
import './i18n';
import {
  likertFinalQuestionAfterValidation,
} from './likert';
import {
  calibrationSectionDirectionTrial,
  experimentBeginTrial,
  finalCalibrationSectionPart1,
  finalCalibrationSectionPart2,
  handTutorialTrial,
  sitComfortably,
  trialBlocksDirection,
  tutorialIntroductionTrial,
  userIDTrial,
} from './message-trials';
import {
  instructionalTrial,
  noStimuliVideoTutorialTrial,
  practiceLoop,
  stimuliVideoTutorialTrial,
  validationVideoTutorialTrial,
} from './tutorial';
import { State } from './types';
import {
  validationResultScreen,
  validationTrialEasy,
  validationTrialExtra,
  validationTrialHard,
  validationTrialMedium,
} from './validation';
import { getUserID } from './utils';
import { randomTrialOrder, userTrialOrder } from './trial-order';

// State variable that is passed throughout trials to ensure variables are updated universally
let state: State = {
  medianTapsPart1: 0,
  medianTaps: 0,
  calibrationPart1Successes: 0,
  calibrationPart2Successes: 0,
  finalCalibrationPart1Successes: 0,
  finalCalibrationPart2Successes: 0,
  calibrationPart1Failed: true,
  calibrationPart2Failed: true,
  validationExtraFailures: 0,
  validationSuccess: true,
  extraValidationRequired: false,
  validationFailures: {
    validationEasy: 0,
    validationMedium: 0,
    validationHard: 0,
  },
  failedMinimumDemoTapsTrial: 0,
  demoTrialSuccesses: 0,
  minimumDemoTapsReached: false,
  completedBlockCount: 1,
  numberOfPracticeLoopsCompleted: 1,
  finalMedianTapsPart1: 0,
  finalMedianTapsPart2: 0,
  userID: '',
};


// Ensures warning message on reload
window.addEventListener('beforeunload', function (event) {
  event.preventDefault();
  event.returnValue = ''; // Modern browsers require returnValue to be set
  return '';
});

/**
 * @function run
 * @description Main function to run the experiment
 * @param {Object} config - Configuration object for the experiment
 */
export async function run() {
  const jsPsych = initJsPsych({
    show_progress_bar: true,
    auto_update_progress_bar: false,
    message_progress_bar: PROGRESS_BAR.PROGRESS_BAR_INTRODUCTION,
  });

  const timeline: any[] = [];
  timeline.push({
    type: PreloadPlugin,
    images: [
      './assets/images/left.jpg',
      './assets/images/right.jpg',
      './assets/images/tip.png',
      './assets/images/hand.png',
    ],
    video: [
      './assets/videos/calibration-part1.mp4',
      './assets/videos/calibration-part2.mp4',
      './assets/videos/validation.mp4',
    ],
    max_load_time: 120000, // Allows program to load (arbitrary value currently)
  });


  // Update global user ID variable after userID trial to ensure order of trial blocks is correct
  timeline.push({
    timeline: [userIDTrial],
    on_timeline_finish: function() {state.userID = getUserID(jsPsych)}
  });
  // User will enter fullscreen on button click
  timeline.push(experimentBeginTrial);
  // User is displayed image demonstrating how they should sit
  timeline.push(sitComfortably);
  // User is displayed information pertaining to how the beginning section of the experiment is ordered
  timeline.push(tutorialIntroductionTrial(jsPsych));
  // User is displayed instructions and a visual demonstration on how the practice trials will proceed
  timeline.push(noStimuliVideoTutorialTrial(jsPsych));
  // User is displayed an instructional image on hand/finger placement (CONSIDER MOVING THIS EARLIER)
  timeline.push(handTutorialTrial);
  // User is guided through a practice trial with a virtual keyboard. User must complete trials without releasing keys, without tapping early, and reaching the minimum taps to proceed.
  timeline.push(practiceLoop(jsPsych, state));

  timeline.push(practiceLoop(jsPsych, state));

  timeline.push(practiceLoop(jsPsych, state));
  
  // User is displayed information pertaining to how the calibration section of the experiment is structured

  timeline.push(calibrationSectionDirectionTrial(jsPsych));
  // User is displayed instructions on how the calibration part 1 trials will proceed

  timeline.push(instructionalTrial(CALIBRATION_PART_1_DIRECTIONS));
  // Calibration part 1 proceeds (4 trials, user taps as fast as possible, no visual feedback)

  timeline.push(calibrationTrialPart1(jsPsych, state));
  // If the median tap count from calibrationTrialPart1 is less than MINIMUM_CALIBRATION_MEDIAN, conditionalCalibrationTrialPart1 is pushed (Warning so user taps faster, 4 trials, user taps as fast as possible, no visual feedback)

  timeline.push(conditionalCalibrationTrialPart1(jsPsych, state));
  // User is displayed instructions and visual demonstration on how the calibration part 2 trials will proceed

  timeline.push(stimuliVideoTutorialTrial(jsPsych));
  // Calibration part 2 proceeds (3 trials, user taps as fast as possible, visual feedback)

  timeline.push({
    timeline: [calibrationTrialPart2(jsPsych, state)],
  });
  // If the median tap count from calibrationTrialPart2 is less than MINIMUM_CALIBRATION_MEDIAN, conditionalCalibrationTrialPart2 is pushed (Warning so user taps faster, 3 trials, user taps as fast as possible, visual feedback)

  timeline.push(conditionalCalibrationTrialPart2(jsPsych, state));
  // User is displayed instructions and visual demonstration on how the validations trials will proceed

  timeline.push(validationVideoTutorialTrial(jsPsych));
  // Easy validation trials are pushed (4 trials, user must end with top of red bar in target area, bounds are [30,50])

  timeline.push({
    timeline: [validationTrialEasy(jsPsych, state)],
  });
  // Medium validation trials are pushed (4 trials, user must end with top of red bar in target area, bounds are [50,70])

  timeline.push({
    timeline: [validationTrialMedium(jsPsych, state)],
  });
  // Hard validation trials are pushed (4 trials, user must end with top of red bar in target area, bounds are [70,90])

  timeline.push({
    timeline: [validationTrialHard(jsPsych, state)],
  });
  // If 3/4 or more of any of the group of the validation trials are failed for any reason, validationTrialExtra is pushed (3 trials, user must end with top of red bar in target area, bounds are [70,90])

  timeline.push({
    timeline: [validationTrialExtra(jsPsych, state)],
    conditional_function: function () {
      return state.extraValidationRequired;
    },
  });
  // Fatigue and motivation likert questions are asked as a baseline

  timeline.push(likertFinalQuestionAfterValidation),
  // If user failed validation, experiment ends and data is downloaded. If not, user clicks continue to proceed
    timeline.push({
      timeline: [validationResultScreen(jsPsych, state)],
    });
  // User is displayed instructions and visual demonstration on how the trial blocks will proceed

  timeline.push({
    timeline: [trialBlocksDirection(jsPsych)],
  });  
  // If typed userID matched a key in trialOrders (in trial-order.ts) then ...userTrialOrder is pushed for designated order
  timeline.push(...userTrialOrder(jsPsych, state));
  // If typed userID DOES NOT match a key in trialOrders (in trial-order.ts) then randomTrialOrder is pushed for a random order
  timeline.push(randomTrialOrder(jsPsych, state));
  // User is displayed instructions on how the final calibration part 1 trials will proceed
  timeline.push(finalCalibrationSectionPart1);
  // Calibration part 1 proceeds (3 trials, user taps as fast as possible, no visual feedback)
  timeline.push(finalCalibrationTrialPart1(jsPsych, state));
  // User is displayed instructions on how the final calibration part 1 trials will proceed
  timeline.push(finalCalibrationSectionPart2);
  // Calibration part 2 proceeds (3 trials, user taps as fast as possible, visual feedback)
  timeline.push({
    timeline: [finalCalibrationTrialPart2(jsPsych, state)],
  });
  // User clicks continue to download experiment data locally
  timeline.push(finishExperiment(jsPsych));

  await jsPsych.run(timeline);

  return jsPsych;
}
