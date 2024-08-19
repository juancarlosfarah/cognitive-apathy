/**
 * @title Cognitive Apathy Experiment
 * @description This experiment aims to measure cognitive apathy using calibration and thermometer tasks.
 * @version 0.1.0
 *
 * @assets assets/
 */
import PreloadPlugin from '@jspsych/plugin-preload';
import { JsPsych, initJsPsych } from 'jspsych';

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
import { finishExperiment, finishExperimentEarlyTrial } from './finish';
import './i18n';
import {
  likertFinalQuestion,
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
import { sampledArray, trialOrders } from './trials';
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

if ((window as any).Cypress) {
  (window as any).state = state;
  (window as any).appReady = true;
}

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
export async function run({ assetPaths }: any) {
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
    audio: assetPaths.audio,
    video: [
      './assets/videos/calibration-part1.mp4',
      './assets/videos/calibration-part2.mp4',
      './assets/videos/validation.mp4',
    ],
    max_load_time: 120000, // Increased timeout to 120 seconds
    on_success: function (file: string) {
      console.log(`Successfully preloaded: ${file}`);
    },
    on_error: function (file: string) {
      console.error(`Failed to preload: ${file}`);
    },
  });



  timeline.push(userIDTrial(jsPsych, state));

  timeline.push(experimentBeginTrial);
  timeline.push(sitComfortably);
  timeline.push(tutorialIntroductionTrial(jsPsych));

  timeline.push(noStimuliVideoTutorialTrial(jsPsych));
  timeline.push(handTutorialTrial);

  timeline.push(practiceLoop(jsPsych, state));

  timeline.push(practiceLoop(jsPsych, state));

  timeline.push(practiceLoop(jsPsych, state));

  timeline.push(calibrationSectionDirectionTrial(jsPsych));

  timeline.push(instructionalTrial(CALIBRATION_PART_1_DIRECTIONS));

  timeline.push(calibrationTrialPart1(jsPsych, state));
  timeline.push(conditionalCalibrationTrialPart1(jsPsych, state));

  timeline.push(stimuliVideoTutorialTrial(jsPsych));
  timeline.push({
    timeline: [calibrationTrialPart2(jsPsych, state)],
  });

  timeline.push(conditionalCalibrationTrialPart2(jsPsych, state));

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
  timeline.push(likertFinalQuestionAfterValidation),
    timeline.push({
      timeline: [validationResultScreen(jsPsych, state)],
    });
  timeline.push({
    timeline: [trialBlocksDirection(jsPsych)],
  });

  const sampledTrials = trialOrders(jsPsych, state) as any;

  sampledTrials['S12'].forEach((section: any) => {
    section.forEach((trial: any) => {
      timeline.push(trial);
    });
  });

  timeline.push(finalCalibrationSectionPart1);
  timeline.push(finalCalibrationTrialPart1(jsPsych, state));
  timeline.push(finalCalibrationSectionPart2);
  timeline.push({
    timeline: [finalCalibrationTrialPart2(jsPsych, state)],
  });
  timeline.push(finishExperiment(jsPsych));

  await jsPsych.run(timeline);

  return jsPsych;
}
