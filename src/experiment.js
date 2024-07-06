/**
 * @title Cognitive Apathy
 * @description
 * @version 0.1.0
 *
 * @assets assets/
 */
// You can import stylesheets (.scss or .css).
import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import PreloadPlugin from '@jspsych/plugin-preload';
import { ParameterType, initJsPsych } from 'jspsych';

import '../styles/main.scss';
import CalibrationPlugin from './calibration';
import {
  AUTO_DECREASE_RATE,
  AUTO_INCREASE_AMOUNT,
  EXPECTED_MAXIMUM_PERCENTAGE,
  EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
  MINIMUM_AUTO_DECREASE_AMOUNT,
  NUM_CALIBRATION_TRIALS,
  NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
  NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
  PARAMETER_COMBINATIONS,
  RELEASE_KEYS_STIMULUS_DURATION,
  RELEASE_KEYS_TRIAL_DURATION,
  REWARD_OPTIONS,
  TARGET_OPTIONS,
  TRIAL_DURATION,
} from './constants';
import {
  blockWelcomeMessage,
  calibrationPartIIWelcomeMessage,
  calibrationPartIWelcomeMessage,
  calibrationWelcomeMessage,
  experimentWelcomeMessage,
  generateStimulus,
  synchronousBlockWelcomeMessage,
  validationWelcomeMessage,
} from './stimulus';
import ThermometerPlugin from './thermometer';
import ReleaseKeysPlugin from './release-keys';
import CountdownTrialPlugin from './countdown';
import KeyHoldPlugin from './key-hold-plugin';
/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */
export async function run({
  assetPaths,
  input = {},
  environment,
  title,
  version,
}) {
  const jsPsych = initJsPsych();

  const randomReward = function () {
    return jsPsych.randomization.sampleWithReplacement(REWARD_OPTIONS, 1)[0];
  };

  const randomTargetHeight = function () {
    return jsPsych.randomization.sampleWithReplacement(TARGET_OPTIONS, 1)[0];
  };

  const timeline = [];

  // Preload assets
  timeline.push({
    type: PreloadPlugin,
    images: assetPaths.images,
    audio: assetPaths.audio,
    video: assetPaths.video,
  });


  const releaseKeysStep = {
    type: ReleaseKeysPlugin,
    stimulus: `<p>Release the Keys</p>`,
    valid_responses: ['a', 'w', 'e'],
  };

  const keyHoldStep = {
    type: KeyHoldPlugin,
  }

  const countdownStep = {
    type: CountdownTrialPlugin
  }

  // Calibration trials
  const calibrationWithoutFeedback = {
    timeline: [
      {
        type: CalibrationPlugin,
        duration: TRIAL_DURATION,
        showThermometer: false,
        targetHeight: 0,
      },
      releaseKeysStep,
    ],
  };


  const calibrationTrials = {
    timeline: [
      keyHoldStep,
      countdownStep,
      calibrationWithoutFeedback,
    ],
    repetitions: 2  // Adjust the number of repetitions as needed
  };
  
  // Add the repeated trials to the main timeline
  timeline.push(calibrationTrials);


  const calibrationWithFeedback = {
    autoDecreaseAmount: function () {
      const trials = jsPsych.data
        .get()
        .filter({ trial_type: 'calibration-task' })
        .values();

      const averageTaps = CalibrationPlugin.calculateAverageTaps(
        trials.slice(1, NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS),
      );

      const calculatedAutoDecreaseAmount =
        (EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION -
          averageTaps * AUTO_INCREASE_AMOUNT) /
        -(TRIAL_DURATION / AUTO_DECREASE_RATE);
      return Math.max(
        MINIMUM_AUTO_DECREASE_AMOUNT,
        calculatedAutoDecreaseAmount,
      );
    },
    timeline: [
      {
        type: CalibrationPlugin,
        duration: TRIAL_DURATION,
        showThermometer: true,
        targetHeight: 50,
      },
      releaseKeysStep,
    ],
    repetitions: NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
  };

  timeline.push(calibrationWithFeedback);

  // display average taps temporarily
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: function () {
      const trials = jsPsych.data
        .get()
        .filter({ trial_type: 'calibration-task' })
        .values();
      const averageTaps = CalibrationPlugin.calculateAverageTaps(trials);
      return `<p><b>Internal Check</b></p><p>Average Tap Count: ${averageTaps}</p><p><b>Press "Enter" to continue.</b></p>`;
    },
  });

  // accept trial object
  const acceptStep = {
    type: HtmlKeyboardResponsePlugin,
    choices: ['arrowright', 'arrowleft'],
    stimulus: function () {
      const reward = jsPsych.timelineVariable('reward') / 100;
      const targetHeight = jsPsych.timelineVariable('targetHeight');
      return generateStimulus(true, reward, targetHeight, 0, '');
    },
  };

  // perform trial object
  const performStep = {
    type: ThermometerPlugin,
  };

  const pilotTrials = {
    autoDecreaseAmount: function () {
      const trials = jsPsych.data
        .get()
        .filter({ trial_type: 'calibration-task' })
        .values();
      const averageTaps = CalibrationPlugin.calculateAverageTaps(
        trials.slice(
          NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
          NUM_CALIBRATION_TRIALS,
        ),
      );
      const calculatedAutoDecreaseAmount =
        (EXPECTED_MAXIMUM_PERCENTAGE - averageTaps * AUTO_INCREASE_AMOUNT) /
        -(TRIAL_DURATION / AUTO_DECREASE_RATE);
      return Math.max(
        MINIMUM_AUTO_DECREASE_AMOUNT,
        calculatedAutoDecreaseAmount,
      );
    },
    autoDecreaseRate: AUTO_DECREASE_RATE,
    autoIncreaseAmount: AUTO_INCREASE_AMOUNT,
    randomDelay: [0, 0],
    // no need for reward in the pilot phase
    timeline_variables: TARGET_OPTIONS.map((targetHeight) => ({
      targetHeight,
    })),
    sample: {
      type: 'fixed-repetitions',
      size: 1,
    },
    timeline: [performStep, releaseKeysStep],
    duration: TRIAL_DURATION,
  };

  // welcome screen for validation
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: validationWelcomeMessage,
  });

  timeline.push(pilotTrials);

  const conditionalPerformStep = {
    timeline: [performStep],
    conditional_function: function () {
      // get the data from the previous trial,
      // and check which key was pressed
      const data = jsPsych.data.get().last(1).values()[0];
      return jsPsych.pluginAPI.compareKeys(data.response, 'arrowleft');
    },
  };

  const conditionalReleaseKeysStep = {
    timeline: [releaseKeysStep],
    conditional_function: function () {
      // get the data from the previous trial,
      // and check which key was pressed
      const data = jsPsych.data.get().last(2).values()[0];
      return jsPsych.pluginAPI.compareKeys(data.response, 'arrowleft');
    },
  };

  const questionnaireStep = {};

  //
  const baseTrials = {
    autoDecreaseAmount: function () {
      const trials = jsPsych.data
        .get()
        .filter({ trial_type: 'calibration-task' })
        .values();
      const averageTaps = CalibrationPlugin.calculateAverageTaps(trials);
      const calculatedAutoDecreaseAmount =
        (EXPECTED_MAXIMUM_PERCENTAGE - averageTaps * AUTO_INCREASE_AMOUNT) /
        -(TRIAL_DURATION / AUTO_DECREASE_RATE);
      return Math.max(
        MINIMUM_AUTO_DECREASE_AMOUNT,
        calculatedAutoDecreaseAmount,
      );
    },
    autoDecreaseRate: AUTO_DECREASE_RATE,
    autoIncreaseAmount: AUTO_INCREASE_AMOUNT,
    timeline_variables: PARAMETER_COMBINATIONS,
    sample: {
      type: 'fixed-repetitions',
      size: 1,
    },
    duration: TRIAL_DURATION,
    timeline: [
      {
        ...acceptStep,
      },
      conditionalPerformStep,
      conditionalReleaseKeysStep,
    ],
  };

  const synchronousBlock = [
    {
      type: HtmlKeyboardResponsePlugin,
      choices: ['enter'],
      stimulus: blockWelcomeMessage('Synchronous Block'),
    },
    {
      ...baseTrials,
      randomDelay: [0, 0],
    },
  ];

  const narrowAsynchronousBlock = [
    {
      type: HtmlKeyboardResponsePlugin,
      choices: ['enter'],
      stimulus: blockWelcomeMessage('Narrow Asynchronous Block'),
    },
    {
      ...baseTrials,
      randomDelay: [400, 600],
    },
  ];

  const wideAsynchronousBlock = [
    {
      type: HtmlKeyboardResponsePlugin,
      choices: ['enter'],
      stimulus: blockWelcomeMessage('Wide Asynchronous Block'),
    },
    {
      ...baseTrials,
      randomDelay: [0, 1000],
    },
  ];

  // start
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: experimentWelcomeMessage,
  });

  // Switch to fullscreen
  // timeline.push({
  //   type: FullscreenPlugin,
  //   fullscreen_mode: true,
  // });

  timeline.push(...synchronousBlock);
  timeline.push(...narrowAsynchronousBlock);
  timeline.push(...wideAsynchronousBlock);

  await jsPsych.run(timeline);

  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  return jsPsych;
}
