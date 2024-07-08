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
import surveyLikert from '@jspsych/plugin-survey-likert';
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
  NUM_VALIDATION_TRIALS,
  EASY_BOUNDS,
  MEDIUM_BOUNDS,
  HARD_BOUNDS,
  BOUND_OPTIONS,
  NUM_TRIALS,
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

const randomBounds = () => jsPsych.randomization.sampleWithReplacement(BOUND_OPTIONS, 1)[0];

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
  const randomBounds = () => jsPsych.randomization.sampleWithReplacement(BOUND_OPTIONS, 1)[0];

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
  const createCalibrationTrial = (showThermometer, bounds) => ({
    timeline: [
      countdownStep,
      {
        type: CalibrationPlugin,
        duration: TRIAL_DURATION,
        showThermometer,
        bounds,
      },
      {
        timeline: [releaseKeysStep],
        conditional_function: () => !jsPsych.data.get().last(1).values()[0].skipReleaseKeysStep,
      },
    ],
    repetitions: NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
  });

  // Calibration trials without feedback
  const calibrationPart1 = createCalibrationTrial(false, randomBounds());
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
        bounds: [40, 60],
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
  const createValidationTrials = (bounds) => ({
    timeline: [
      countdownStep,
      {
        type: CalibrationPlugin,
        duration: TRIAL_DURATION,
        showThermometer: true,
        bounds,
        autoIncreaseAmount: function () {
          const averageTapsPart2 = jsPsych.data.get().values()[0].averageTapsPart2;
          return 100 / averageTapsPart2;
        },
      },
      {
        timeline: [releaseKeysStep],
        conditional_function: () => !jsPsych.data.getLastTrialData().values()[0].errorOccurred,
      },
    ],
    repetitions: NUM_VALIDATION_TRIALS,
  });

  // Push specific validation trials
  timeline.push(createValidationTrials([20, 40]));
  timeline.push(createValidationTrials([40, 60]));
  timeline.push(createValidationTrials([60, 80]));

  // Check if any condition failed more than twice
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: () => {
      const trials = jsPsych.data.get().filter({ trial_type: 'calibration-task' }).values();
      const failedConditions = BOUND_OPTIONS.filter(bounds =>
        trials.filter(trial => trial.bounds[0] === bounds[0] && trial.bounds[1] === bounds[1])
              .filter(trial => trial.tapCount < 2).length > 2
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
        bounds: [60, 80], // 90% condition equivalent bounds
        autoIncreaseAmount: function () {
          const averageTapsPart2 = jsPsych.data.get().values()[0].averageTapsPart2;
          return 100 / averageTapsPart2;
        },
      },
      {
        timeline: [releaseKeysStep],
        conditional_function: () => !jsPsych.data.getLastTrialData().values()[0].errorOccurred,
      },
    ],
    repetitions: 3,
  };

/*   timeline.push(additionalValidationTrials);
 */
  // Final check if failed additional validation
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: () => {
      const trials = jsPsych.data.get().filter({ trial_type: 'calibration-task' }).values();
      const conditionTrials = trials.filter(trial => trial.bounds[0] === 60 && trial.bounds[1] === 80);
      const succeeded = conditionTrials.some(trial => trial.mercuryHeight >= trial.bounds[0] && trial.mercuryHeight <= trial.bounds[1]);
      const failed = conditionTrials.filter(trial => trial.mercuryHeight < trial.bounds[0] || trial.mercuryHeight > trial.bounds[1]).length >= 3;
      return failed
        ? `<p>You failed the additional validation. The experiment will now end.</p>`
        : `<p>You passed the validation step. Press Enter to continue.</p>`;
    },
    choices: ['enter'],
    on_finish: (data) => {
      const trials = jsPsych.data.get().filter({ trial_type: 'calibration-task' }).values();
      const conditionTrials = trials.filter(trial => trial.bounds[0] === 60 && trial.bounds[1] === 80);
      const succeeded = conditionTrials.some(trial => trial.mercuryHeight >= trial.bounds[0] && trial.mercuryHeight <= trial.bounds[1]);
      const failed = conditionTrials.filter(trial => trial.mercuryHeight < trial.bounds[0] || trial.mercuryHeight > trial.bounds[1]).length >= 3;
      if (failed) {
        jsPsych.endExperiment('You failed the validation step.');
      } else if (!succeeded) {
        jsPsych.endExperiment('You must pass at least one 90% validation trial.');
      }
    },
  });

  // Placeholder Likert scale questions
  const likertQuestions = [
    {
      prompt: "Placeholder question 1",
      labels: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
      name: 'Q1'
    },
    {
      prompt: "Placeholder question 2",
      labels: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
      name: 'Q2'
    },
    {
      prompt: "Placeholder question 3",
      labels: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
      name: 'Q3'
    },
  ];

  // Common function for blocks
  const createBlock = (blockName, randomDelay, bounds) => ({
    timeline: [
      // Alert before demo
      {
        type: HtmlKeyboardResponsePlugin,
        stimulus: () => {
          return `<p>The delay you experience in the demo will be the same in the next block of trials.</p><p>Press Enter to continue.</p>`;
        },
        choices: ['enter'],
      },
      // Demo trial
      {
        timeline: [
          countdownStep,
          {
            type: ThermometerPlugin,
            duration: TRIAL_DURATION,
            showThermometer: true,
            randomDelay,
            bounds,
            autoIncreaseAmount: function () {
              const averageTapsPart2 = jsPsych.data.get().values()[0].averageTapsPart2;
              return 100 / averageTapsPart2;
            },
          },
          releaseKeysStep,
        ],
        repetitions: 1,
      },
      // Likert scale survey after demo
      {
        type: surveyLikert,
        questions: likertQuestions,
        randomize_question_order: false,
        preamble: '<p>Please answer the following questions about the demo trial.</p>',
        button_label: 'Continue'
      },
    ],
  });

  // Common function for actual block trials
  const createActualBlock = (blockName, randomDelay) => ({
    timeline: [
      {
        timeline: [
          {
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
                    bounds: function () {
                      return randomBounds();
                    },
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
            repetitions: 1,
          },
        ],
        repetitions: NUM_TRIALS,
      },
      // Likert scale survey after block
      {
        type: surveyLikert,
        questions: likertQuestions,
        randomize_question_order: false,
        preamble: '<p>Please answer the following questions about the block.</p>',
        button_label: 'Continue'
      },
    ],
  });
  
  

  // Synchronous block
  timeline.push({ type: HtmlKeyboardResponsePlugin, choices: ['enter'], stimulus: blockWelcomeMessage('Synchronous Block') });
  timeline.push(createBlock('Synchronous Block', [0, 0], randomBounds()));
  timeline.push(createActualBlock('Synchronous Block', [0, 0], randomBounds()));

  // Narrow Asynchronous block
  timeline.push({ type: HtmlKeyboardResponsePlugin, choices: ['enter'], stimulus: blockWelcomeMessage('Narrow Asynchronous Block') });
  timeline.push(createBlock('Narrow Asynchronous Block', [400, 600], randomBounds()));
  timeline.push(createActualBlock('Narrow Asynchronous Block', [400, 600], randomBounds()));

  // Wide Asynchronous block
  timeline.push({ type: HtmlKeyboardResponsePlugin, choices: ['enter'], stimulus: blockWelcomeMessage('Wide Asynchronous Block') });
  timeline.push(createBlock('Wide Asynchronous Block', [0, 1000], randomBounds()));
  timeline.push(createActualBlock('Wide Asynchronous Block', [0, 1000], randomBounds()));

  // Start
  timeline.push({ type: HtmlKeyboardResponsePlugin, choices: ['enter'], stimulus: experimentWelcomeMessage });

  // Switch to fullscreen
  timeline.push({ type: FullscreenPlugin, fullscreen_mode: true });

  await jsPsych.run(timeline);

  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in on_finish())
  return jsPsych;
}
