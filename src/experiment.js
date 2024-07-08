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
  MINIMUM_AUTO_DECREASE_AMOUNT,
  AUTO_DECREASE_RATE,
  EXPECTED_MAXIMUM_PERCENTAGE,
  EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
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

  const randomReward = () => jsPsych.randomization.sampleWithReplacement(REWARD_OPTIONS, 1)[0];
  const randomTargetHeight = () => jsPsych.randomization.sampleWithReplacement(TARGET_OPTIONS, 1)[0];

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

  const countdownStep = {
    type: CountdownTrialPlugin,
  };

  // Function to dynamically create a timeline step based on the previous trial's outcome
  const createCalibrationTrial = (showThermometer, targetHeight) => ({
    timeline: [
      countdownStep,
      {
        type: CalibrationPlugin,
        duration: TRIAL_DURATION,
        showThermometer,
        targetHeight,
      },
      {
        timeline: [releaseKeysStep],
        conditional_function: () => !jsPsych.data.get().last(1).values()[0].skipReleaseKeysStep,
      },
    ],
    repetitions: NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
  });

  // Calibration trials without feedback
  const calibrationPart1 = createCalibrationTrial(false, 0);
  timeline.push(calibrationPart1);

  // After calibration part 1, calculate the average taps and log it
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: function () {
      const trials = jsPsych.data.get().filter({ trial_type: 'calibration-task' }).values();
      const averageTapsPart1 = trials.reduce((sum, trial) => sum + trial.tapCount, 0) / trials.length;
      jsPsych.data.addProperties({ averageTapsPart1 });
      console.log(`Average Tap Count from Calibration Part 1: ${averageTapsPart1}`);
      return `<p>Press "Enter" to continue.</p>`;
    },
  });

  // Calibration trials with feedback
  const calibrationPart2 = {
    timeline: [
      countdownStep,
      {
        type: CalibrationPlugin,
        duration: TRIAL_DURATION,
        showThermometer: true,
        targetHeight: 50,
        autoIncreaseAmount: function () {
          const averageTapsPart1 = jsPsych.data.get().values()[0].averageTapsPart1;
          return 50 / averageTapsPart1;
        },
      },
      {
        timeline: [releaseKeysStep],
        conditional_function: () => !jsPsych.data.get().last(1).values()[0].skipReleaseKeysStep,
      },
    ],
    repetitions: NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
  };
  timeline.push(calibrationPart2);

  // After calibration part 2, calculate the average taps and log it
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: function () {
      const trials = jsPsych.data.get().filter({ trial_type: 'calibration-task' }).values();
      const averageTapsPart2 = trials.reduce((sum, trial) => sum + trial.tapCount, 0) / trials.length;
      jsPsych.data.addProperties({ averageTapsPart2 });
      console.log(`Average Tap Count from Calibration Part 2: ${averageTapsPart2}`);
      return `<p>Press "Enter" to continue.</p>`;
    },
  });

  // Validation trials
  const createValidationTrials = (targetHeight) => ({
    timeline: [
      countdownStep,
      {
        type: CalibrationPlugin,
        duration: TRIAL_DURATION,
        showThermometer: true,
        targetHeight,
      },
      {
        timeline: [releaseKeysStep],
        conditional_function: () => !jsPsych.data.getLastTrialData().values()[0].errorOccurred,
      },
    ],
    repetitions: 4,
  });

  timeline.push(...TARGET_OPTIONS.map(createValidationTrials));

  // Check if any condition failed more than twice
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: () => {
      const trials = jsPsych.data.get().filter({ trial_type: 'calibration-task' }).values();
      const failedConditions = TARGET_OPTIONS.filter(targetHeight =>
        trials.filter(trial => trial.targetHeight === targetHeight).filter(trial => trial.tapCount < 2).length > 2
      );
      return failedConditions.length > 0
        ? `<p>You failed one or more conditions more than twice. Press Enter to retry the 90% condition.</p>`
        : `<p>You passed the validation step. Press Enter to continue.</p>`;
    },
    choices: ['enter'],
  });

  // Additional validation for 90% condition
  const additionalValidationTrials = {
    timeline: [
      countdownStep,
      {
        type: CalibrationPlugin,
        duration: TRIAL_DURATION,
        showThermometer: true,
        targetHeight: 90,
      },
      {
        timeline: [releaseKeysStep],
        conditional_function: () => !jsPsych.data.getLastTrialData().values()[0].errorOccurred,
      },
    ],
    repetitions: 3,
    conditional_function: () => {
      const trials = jsPsych.data.get().filter({ trial_type: 'calibration-task' }).values();
      return TARGET_OPTIONS.some(targetHeight =>
        trials.filter(trial => trial.targetHeight === targetHeight).filter(trial => trial.tapCount < 2).length > 2
      );
    },
  };

  timeline.push(additionalValidationTrials);

  // Final check if failed additional validation
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: () => {
      const trials = jsPsych.data.get().filter({ trial_type: 'calibration-task' }).values();
      const conditionTrials = trials.filter(trial => trial.targetHeight === 90);
      const failed = conditionTrials.filter(trial => trial.tapCount < 2).length >= 3;
      return failed
        ? `<p>You failed the additional validation. The experiment will now end.</p>`
        : `<p>You passed the validation step. Press Enter to continue.</p>`;
    },
    choices: ['enter'],
    on_finish: (data) => {
      const trials = jsPsych.data.get().filter({ trial_type: 'calibration-task' }).values();
      const conditionTrials = trials.filter(trial => trial.targetHeight === 90);
      const failed = conditionTrials.filter(trial => trial.tapCount < 2).length >= 3;
      if (failed) {
        jsPsych.endExperiment('You failed the validation step.');
      }
    },
  });

  // Common function for blocks
  const createBlock = (blockName, randomDelay) => ({
    timeline: [
      {
        type: HtmlKeyboardResponsePlugin,
        stimulus: () => {
          const reward = randomReward() / 100;
          return `<p>Reward: $${reward.toFixed(2)}</p><p>Do you accept the trial? (Arrow Left = Yes, Arrow Right = No)</p>`;
        },
        choices: ['arrowleft', 'arrowright'],
        data: { block: blockName, phase: 'accept' },
      },
      {
        timeline: [
          countdownStep,
          {
            type: ThermometerPlugin,
            duration: TRIAL_DURATION,
            showThermometer: true,
            randomDelay,
            targetHeight: randomTargetHeight,
            autoIncreaseAmount: function () {
              const averageTapsPart2 = jsPsych.data.get().values()[0].averageTapsPart2;
              return 100 / averageTapsPart2;
            },
          },
          releaseKeysStep,
        ],
        conditional_function: () => {
          const lastResponse = jsPsych.data.get().last(1).values()[0].response;
          return jsPsych.pluginAPI.compareKeys(lastResponse, 'arrowleft');
        },
        data: { block: blockName, phase: 'perform' },
      },
    ],
    repetitions: 10,
  });

  // Synchronous block
  timeline.push({ type: HtmlKeyboardResponsePlugin, choices: ['enter'], stimulus: blockWelcomeMessage('Synchronous Block') });
  timeline.push(createBlock('Synchronous Block'));

  // Narrow Asynchronous block
  timeline.push({ type: HtmlKeyboardResponsePlugin, choices: ['enter'], stimulus: blockWelcomeMessage('Narrow Asynchronous Block') });
  timeline.push(createBlock('Narrow Asynchronous Block', [400, 600]));

  // Wide Asynchronous block
  timeline.push({ type: HtmlKeyboardResponsePlugin, choices: ['enter'], stimulus: blockWelcomeMessage('Wide Asynchronous Block') });
  timeline.push(createBlock('Wide Asynchronous Block', [0, 1000]));

  // Start
  timeline.push({ type: HtmlKeyboardResponsePlugin, choices: ['enter'], stimulus: experimentWelcomeMessage });

  // Switch to fullscreen
  timeline.push({ type: FullscreenPlugin, fullscreen_mode: true });

  await jsPsych.run(timeline);

  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  return jsPsych;
}
