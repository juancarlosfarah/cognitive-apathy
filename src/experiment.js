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
import { initJsPsych } from 'jspsych';
import { saveAs } from 'file-saver';
import '../styles/main.scss';
import TaskPlugin from './task';
import CountdownTrialPlugin from './countdown';
import ReleaseKeysPlugin from './release-keys';

import {
  validationResults,
  extraValidationLogic,
  getMessages,
} from './validation'

import {
  NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
  NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
  PARAMETER_COMBINATIONS,
  TRIAL_DURATION,
  NUM_VALIDATION_TRIALS,
  EASY_BOUNDS,
  MEDIUM_BOUNDS,
  HARD_BOUNDS,
  BOUND_OPTIONS,
  NUM_TRIALS,
  NUM_DEMO_TRIALS,
  CALIBRATION_PART_2_DIRECTIONS,
  CALIBRATION_PART_1_DIRECTIONS,
  VALIDATION_DIRECTIONS,
  KEYS_TO_HOLD,
  AUTO_DECREASE_AMOUNT,
  EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
  EXPECTED_MAXIMUM_PERCENTAGE,
  AUTO_DECREASE_RATE,
  AUTO_INCREASE_AMOUNT,
} from './constants';

import {
  blockWelcomeMessage,
  videoStimulus
} from './stimulus';

import {
  randomNumberBm
} from './utils';
/**
 * @function run
 * @description Main function to run the experiment
 * @param {Object} config - Configuration object for the experiment
 */
export async function run({ assetPaths, input = {}, environment, title, version }) {
  const jsPsych = initJsPsych();

  const timeline = [];

  // Preload assets
  timeline.push({
    type: PreloadPlugin,
    images: assetPaths.images,
    audio: assetPaths.audio,
    video: assetPaths.video,
  });

  // Release keys step
  const releaseKeysStep = {
    type: ReleaseKeysPlugin,
    stimulus: `<p>Release the Keys</p>`,
    valid_responses: KEYS_TO_HOLD,
  };

  // Countdown step with key release flag check
  const countdownStep = {
    type: CountdownTrialPlugin,
    keysReleasedFlag: function() {
      const lastTrialData = jsPsych.data.get().filter({ task: 'calibration' }).last(1).values()[0];
      return lastTrialData ? lastTrialData.keysReleasedFlag : false;
    }
  };

  /**
   * @function calculateMedianTapCount
   * @description Calculate the median tap count for a given task type and number of trials
   * @param {string} taskType - The task type to filter data by
   * @param {number} numTrials - The number of trials to consider
   * @returns {number} - The median tap count
   */
  let medianTaps;
  function calculateMedianTapCount(taskType, numTrials) {
    const trials = jsPsych.data.get().filter({ task: taskType }).last(numTrials).values();
    const filteredTrials = trials.filter(trial => !trial.keysReleasedFlag);
    let tapCounts = filteredTrials.map(trial => trial.tapCount);
    tapCounts.sort((a, b) => a - b);

    const middle = Math.floor(tapCounts.length / 2);
    return tapCounts.length % 2 === 0
      ? (tapCounts[middle - 1] + tapCounts[middle]) / 2
      : tapCounts[middle];
  }

  /**
   * @function directionTrial
   * @description Create a direction trial with a message and optional video
   * @param {string} message - The message to display
   * @param {string} video - Optional video URL to display
   * @returns {Object} - jsPsych trial object
   */
  const directionTrial = (message) => ({
    type: HtmlKeyboardResponsePlugin,
    choices: ['Enter'],
    stimulus: function() {
      return `<p>${message}</p>`;
    }
  });


  const videoDemo = (message, video) => ({
    type: HtmlKeyboardResponsePlugin,
    choices: ['Enter'],
    stimulus: function() {
      return videoStimulus(message, video);
    }
  });

  /**
   * @function createCalibrationTrial
   * @description Create a calibration trial with optional thermometer display and specified bounds
   * @param {boolean} showThermometer - Whether to show the thermometer
   * @param {Array} bounds - The bounds for the calibration task
   * @returns {Object} - jsPsych trial object
   */
  const createCalibrationTrial = (showThermometer, bounds) => ({
    timeline: [
      countdownStep,
      {
        type: TaskPlugin,
        duration: TRIAL_DURATION,
        showThermometer,
        bounds,
        data: {
          task: 'calibration',
        }
      },
      {
        timeline: [releaseKeysStep],
        conditional_function: function() {
          const lastTrialData = jsPsych.data.get().last(1).values()[0];
          return !lastTrialData.keysReleasedFlag;
        }
      }
    ],
    repetitions: NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
  });

  const calibrationPart1 = createCalibrationTrial(false, [EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION]);

  /**
   * @function calculateTapsStep
   * @description Create a step to calculate the median taps and display a message
   * @param {string} message - The message to display
   * @returns {Object} - jsPsych trial object
   */
  const calculateTapsStep = (message) => ({
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    data: {
      task: 'median',
      medianTaps: function() {
        return calculateMedianTapCount('calibration', NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS);
      }
    },
    stimulus: function() {
      medianTaps = calculateMedianTapCount('calibration', NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS);
      return `<p>${CALIBRATION_PART_2_DIRECTIONS}</p>`;
    }
  });

  
  // Calibration trials with feedback
  const calibrationPart2 = {
    timeline: [
      countdownStep,
      {
        type: TaskPlugin,
        duration: TRIAL_DURATION,
        showThermometer: true,
        bounds: [EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION, EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION],
        autoIncreaseAmount: function() {
          return (EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION + (TRIAL_DURATION/AUTO_DECREASE_RATE)*AUTO_DECREASE_AMOUNT)/medianTaps;
        },
        data: {
          task: 'calibration',
          showThermometer: true,
          bounds: [EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION, EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION]
        }
      },
      {
        timeline: [releaseKeysStep],
        conditional_function: function() {
          const lastTrialData = jsPsych.data.get().last(1).values()[0];
          return !lastTrialData.keysReleasedFlag;
        }
      }
    ],
    repetitions: NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
  };

  /**
   * @function validationTrials
   * @description Create validation trials with specified bounds and difficulty level
   * @param {Array} bounds - The bounds for the validation task
   * @param {string} difficultyLevel - The difficulty level
   * @returns {Object} - jsPsych trial object
   */
  const validationTrials = (bounds, difficultyLevel) => ({
    timeline: [
      countdownStep,
      {
        type: TaskPlugin,
        duration: TRIAL_DURATION,
        showThermometer: true,
        bounds,
        autoIncreaseAmount: function() {
          console.log()
          return (EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION + (TRIAL_DURATION/AUTO_DECREASE_RATE)*AUTO_DECREASE_AMOUNT)/medianTaps;
        },
        on_finish: function(data) {
          if (!data.success) {
            validationResults[difficultyLevel]++;
          }
        },
      },
      {
        timeline: [releaseKeysStep],
        conditional_function: function() {
          const lastTrialData = jsPsych.data.get().last(1).values()[0];
          return !lastTrialData.keysReleasedFlag;
        }
      }
    ],
    repetitions: NUM_VALIDATION_TRIALS
  });

  /**
   * @function extraValidationTrials
   * @description Create extra validation trials if the user failed 2 or more in any of the levels in the first validation step
   * @param {Array} bounds - The bounds for the validation task
   * @param {string} difficultyLevel - The difficulty level
   * @returns {Object} - jsPsych trial object
   */
  const extraValidationTrials = (bounds, difficultyLevel) => ({
    timeline: [
      countdownStep,
      {
        type: TaskPlugin,
        duration: TRIAL_DURATION,
        showThermometer: true,
        bounds,
        autoIncreaseAmount: function() {
          console.log()
          return (EXPECTED_MAXIMUM_PERCENTAGE + (TRIAL_DURATION/AUTO_DECREASE_RATE)*AUTO_DECREASE_AMOUNT)/medianTaps;
        },
        on_finish: function(data) {
          if (!data.success) {
            validationResults[difficultyLevel]++;
          }
        },
        data: {
          showThermometer: true,
          bounds: bounds
        }
      },
      {
        timeline: [releaseKeysStep],
        conditional_function: function() {
          const lastTrialData = jsPsych.data.get().last(1).values()[0];
          return !lastTrialData.keysReleasedFlag;
        }
      }
    ],
    repetitions: 3
  });

  // Failed or succeeded validation message
  const validationSuccess = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: function() {
      const result = getMessages();
      return result.message;
    },
    choices: ['Enter'],
    on_finish: function(data) {
      const result = getMessages();
      if (result.endExperiment) {
        jsPsych.endExperiment(result.message);
      }
    }
  };

  // Conditional extra validation node
  const extraValidationNode = {
    timeline: [extraValidationTrials(HARD_BOUNDS, 'extraValidation')],
    conditional_function: extraValidationLogic()
  };

  // Add trials to the timeline
  timeline.push(videoDemo(CALIBRATION_PART_1_DIRECTIONS, ))
  timeline.push(calibrationPart1);
  timeline.push(calculateTapsStep(CALIBRATION_PART_2_DIRECTIONS));
  timeline.push(calibrationPart2);
  /*   timeline.push(directionTrial(VALIDATION_DIRECTIONS))
  timeline.push(validationTrials(EASY_BOUNDS, 'easy'))
  timeline.push(validationTrials(MEDIUM_BOUNDS, 'medium'))
  timeline.push(validationTrials(HARD_BOUNDS, 'hard'))
  timeline.push(extraValidationNode);
  timeline.push(validationSucesss); */


  // Placeholder Likert scale questions after demo
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
let randomSkew = null;
/**
 * @function createTrialBlock
 * @description Create a block of trials with optional demo, Likert questions, acceptance phase, and task performance phase
 * @param {Object} options - Options for creating the trial block
 * @param {string} [options.blockName] - The name of the block
 * @param {Array} options.randomDelay - The delay range for the demo and block trials
 * @param {Array} options.bounds - The bounds for the thermometer task
 * @param {boolean} [options.includeDemo=false] - Whether to include the demo trials
 * @param {number} [options.numDemoTrials=0] - Number of demo trials to include if includeDemo is true
 * @returns {Object} - jsPsych trial object
 */
const createTrialBlock = ({ blockName, randomDelay, bounds, includeDemo = false, numDemoTrials = 0 }) => {
  const timeline = [];

  if (includeDemo) {
    timeline.push(
      // Alert before demo
      {
        type: HtmlKeyboardResponsePlugin,
        stimulus: () => {
          return `<p>The delay you experience in the demo will be the same in the next block of trials.</p><p>Press Enter to continue.</p>`;
        },
        choices: ['enter'],
      },
      // Demo trials
      {
        timeline: [
          countdownStep,
          {
            type: TaskPlugin,
            duration: TRIAL_DURATION,
            showThermometer: true,
            randomDelay,
            bounds,
            autoIncreaseAmount: function() {
              console.log()
              return (EXPECTED_MAXIMUM_PERCENTAGE + (TRIAL_DURATION/AUTO_DECREASE_RATE)*AUTO_DECREASE_AMOUNT)/medianTaps;
            },
            data: {
              task: 'demo',
              randomDelay: randomDelay,
              bounds: bounds
            }
          },
          {
            timeline: [releaseKeysStep],
            conditional_function: function() {
              const lastTrialData = jsPsych.data.get().last(1).values()[0];
              return !lastTrialData.keysReleasedFlag;
            }
          },
        ],
        repetitions: numDemoTrials,
      },
      // Likert scale survey after demo
      {
        type: surveyLikert,
        questions: likertQuestions,
        randomize_question_order: false,
        preamble: '<p>Please answer the following questions about the demo trial.</p>',
        button_label: 'Continue'
      }
    );
  }

  if (blockName) {
    const numTrialsPerCombination = Math.floor(NUM_TRIALS / PARAMETER_COMBINATIONS.length);

    let trials = PARAMETER_COMBINATIONS.flatMap(combination => 
      Array(numTrialsPerCombination).fill().map(() => ({
        reward: combination.reward,
        success: false,
        randomDelay: randomDelay,
        bounds: combination.bounds
      }))
    );
    for(let i = 0; i < trials.length; i++){
      trials[i].reward += randomNumberBm(1,10);
    }

    trials = jsPsych.randomization.shuffle(trials);
    timeline.push(
      {
        timeline: trials.map(trialData => ({
          timeline: [
            // Acceptance Phase
            {
              type: HtmlKeyboardResponsePlugin,
              stimulus: function() {
                return `<p>Reward: $${((trialData.reward)/100).toFixed(2)}</p><p>Do you accept the trial? (Arrow Left = Yes, Arrow Right = No)</p>`;
              },
              choices: ['arrowleft', 'arrowright'],
              data: {
                task: 'accept',
                reward: (trialData.reward) / 100,
              },
              on_finish: (data) => {
                data.accepted = jsPsych.pluginAPI.compareKeys(data.response, 'arrowleft');
                trialData.accepted = data.accepted;
              },
            },
            // Task Performance Phase (only if accepted)
            {
              timeline: [
                countdownStep,
                {
                  type: TaskPlugin,
                  duration: TRIAL_DURATION,
                  showThermometer: true,
                  randomDelay: trialData.randomDelay,
                  bounds: trialData.bounds,
                  reward: trialData.reward / 100,
                  autoIncreaseAmount: function() {
                    console.log()
                    return (EXPECTED_MAXIMUM_PERCENTAGE + (TRIAL_DURATION/AUTO_DECREASE_RATE)*AUTO_DECREASE_AMOUNT)/medianTaps;
                  },
                  data: {
                    task: 'block',
                    blockType: blockName,
                    accept: () => {
                      var acceptanceData = jsPsych.data.get().filter({ task: 'accept' }).last(1).values()[0];
                      return acceptanceData ? acceptanceData.accepted : null;
                    }
                  } 
                },
                {
                  timeline: [releaseKeysStep],
                  conditional_function: function() {
                    const lastTrialData = jsPsych.data.get().last(1).values()[0];
                    return !lastTrialData.keysReleasedFlag;
                  }
                },
              ],
              conditional_function: () => trialData.accepted,
            }
          ]
        })),
        sample: {
          type: 'without-replacement',
          size: trials.length
        }
      },
      // Likert scale survey after block
      {
        type: surveyLikert,
        questions: likertQuestions,
        randomize_question_order: false,
        preamble: '<p>Please answer the following questions about the block.</p>',
        button_label: 'Continue'
      }
    );
  }

  return { timeline };
};

// Adding blocks to the timeline
timeline.push({ type: HtmlKeyboardResponsePlugin, choices: ['enter'], stimulus: blockWelcomeMessage('Synchronous Block') });
timeline.push(createTrialBlock({ randomDelay: [0, 0], bounds: [60, 80], includeDemo: true, numDemoTrials: NUM_DEMO_TRIALS }));
timeline.push(createTrialBlock({ blockName: 'Synchronous Block', randomDelay: [0, 0]}));

timeline.push({ type: HtmlKeyboardResponsePlugin, choices: ['enter'], stimulus: blockWelcomeMessage('Narrow Asynchronous Block') });
timeline.push(createTrialBlock({ randomDelay: [400, 600], bounds: [60, 80], includeDemo: true, numDemoTrials: NUM_DEMO_TRIALS }));
timeline.push(createTrialBlock({ blockName: 'Narrow Asynchronous Block', randomDelay: [400, 600]}));

timeline.push({ type: HtmlKeyboardResponsePlugin, choices: ['enter'], stimulus: blockWelcomeMessage('Wide Asynchronous Block') });
timeline.push(createTrialBlock({ randomDelay: [0, 1000], bounds: [60, 80], includeDemo: true, numDemoTrials: NUM_DEMO_TRIALS }));
timeline.push(createTrialBlock({ blockName: 'Wide Asynchronous Block', randomDelay: [0, 1000]}));

// Final step to calculate total reward at the end of the experiment
const finishExperiment = {
  type: HtmlKeyboardResponsePlugin,
  choices: ['enter'],
  stimulus: function() {
    const blockTrials = jsPsych.data.get().filter({ task: 'block' }).values();
    const successfulTrials = blockTrials.filter(trial => trial.success === true);
    const totalSuccessfulReward = successfulTrials.reduce((sum, trial) => sum + trial.reward, 0);
    return `<p>The experiment has now ended. Total reward for successful trials is: $${totalSuccessfulReward.toFixed(2)}. Press Enter to finish and then please let the experimenter know.</p>`;
  },
  data: {
    task: 'finish_experiment'
  },
  on_finish: function(data) {
    const blockTrials = jsPsych.data.get().filter({ task: 'block' }).values();
    const successfulTrials = blockTrials.filter(trial => trial.success === true);
    const totalSuccessfulReward = successfulTrials.reduce((sum, trial) => sum + trial.reward, 0);
    data.totalReward = totalSuccessfulReward;

    const allData = jsPsych.data.get().json();
    const blob = new Blob([allData], { type: 'application/json' });
    saveAs(blob, `experiment_data_${new Date().toISOString()}.json`);
  }
};

timeline.push(finishExperiment);

// Start the experiment
await jsPsych.run(timeline);

return jsPsych;
}
