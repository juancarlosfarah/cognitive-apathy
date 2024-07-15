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
  thermometer,
  showThermometer,
  videoStimulus,
  acceptanceThermometer,
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

  // Countdown step with `key `release flag check
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

  let calibrationPart1Failures = 0;
  const createCalibrationTrialPart1 = (showThermometer, bounds, repetitions) => ({
    timeline: [
      countdownStep,
      {
        type: TaskPlugin,
        duration: TRIAL_DURATION,
        showThermometer,
        bounds,
        data: {
          task: 'calibrationPart1',
        },
        on_finish: function(data) {
          // Check if the keysReleasedFlag was not activated and increment the failure count
          if (data.keysReleasedFlag) {
            calibrationPart1Failures++;
            console.log(calibrationPart1Failures)

          }
        }
      },
      {
        timeline: [releaseKeysStep],
        conditional_function: function() {
          const lastTrialData = jsPsych.data.get().last(1).values()[0];
          return !lastTrialData.keysReleasedFlag;
        },
      }
    ],
    repetitions: repetitions,
  });



  const calibrationPart1 = createCalibrationTrialPart1(false, [EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION],NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS );

  
  /**
   * @function calculateTapsStep
   * @description Create a step to calculate the median taps and display a message
   * @param {string} message - The message to display
   * @returns {Object} - jsPsych trial object
   */
  const calculateTapsStep = (message, calibrationPart, numTrials) => ({
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    data: {
      task: `${calibrationPart}Median`,
      medianTaps: function() {
        let medianTapCount = calculateMedianTapCount(calibrationPart, numTrials);
        console.log(medianTapCount)
        return calculateMedianTapCount(calibrationPart, numTrials);

        
      }
    },
    stimulus: function() {
      medianTaps = calculateMedianTapCount(calibrationPart, numTrials);
      return `<p>${CALIBRATION_PART_2_DIRECTIONS}</p>`;
    }
  });

  
  // Calibration trials with feedback
  let calibrationPart2Failures = 0;
  const createCalibrationPart2 = (repetitions) => ({
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
          task: 'calibrationPart2',
          showThermometer: true,
          bounds: [EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION, EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION]
        },
        on_finish: function(data) {
          // Check if the keysReleasedFlag was not activated and increment the failure count
          if (data.keysReleasedFlag) {
            calibrationPart2Failures++;
          }
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
    repetitions: repetitions,
  });

  const calibrationPart2 = createCalibrationPart2(NUM_CALIBRATION_WITH_FEEDBACK_TRIALS);
  const calibrationPart2Extras = createCalibrationPart2(calibrationPart2Failures)

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
  timeline.push({
    timeline: [createCalibrationTrialPart1(false, [EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION], calibrationPart1Failures)],
    conditional_function: () => calibrationPart1Failures > 0,
  });  
  timeline.push(calculateTapsStep(CALIBRATION_PART_2_DIRECTIONS, 'calibrationPart1', (NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS+calibrationPart1Failures)));
  timeline.push(calibrationPart2);
  calibrationPart2Failures > 0 ? timeline.push(calibrationPart2Extras) : null
  timeline.push(calculateTapsStep(CALIBRATION_PART_2_DIRECTIONS, 'calibrationPart2', (NUM_CALIBRATION_WITH_FEEDBACK_TRIALS+calibrationPart2Failures)));

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
        randomDelay: randomDelay,
        bounds: combination.bounds,
      }))
    );
    //min is trials[i].reward - 10% and max is +10%
    // increase to .fixed(4)
    // change constants to actual rewards and remove /100
    
    for (let i = 0; i < trials.length; i++) {
      let min = trials[i].reward - 0.1 * trials[i].reward;
      let max = trials[i].reward + 0.1 * trials[i].reward;
      trials[i].reward = randomNumberBm(min, max);
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
                // Generate the thermometer HTML with bounds from trialData
                return `
                  ${acceptanceThermometer(trialData.bounds)}
                  <p>Reward: $${trialData.reward.toFixed(4)}</p>
                  <p>Do you accept the trial? (Arrow Left = Yes, Arrow Right = No)</p>
                `;
              },
              choices: ['arrowleft', 'arrowright'],
              data: {
                task: 'accept',
                reward: (trialData.reward),
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
                  reward: trialData.reward,
                  on_start: function() {
                    console.log(`Task Performance Phase reward: $${trialData.reward.toFixed(4)}`); // Logging reward in TaskPlugin step
                  },
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
                    },
                  },
                  on_finish: function(data){
                    console.log(data)
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


function createRewardDisplayTrial() {
  return {
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: function() {
      const blockTrials = jsPsych.data.get().filter({ task: 'block' }).values();
      console.log(blockTrials)
      const successfulTrials = blockTrials.filter(trial => trial.success === true);
      console.log(successfulTrials)
      const totalSuccessfulReward = successfulTrials.reduce((sum, trial) => sum + trial.reward, 0);
      return `<p>The block has ended. Total reward for successful trials is: $${totalSuccessfulReward.toFixed(2)}. Press Enter to continue.</p>`;
    },
    data: {
      task: 'display_reward'
    },
    on_finish: function(data) {
      const blockTrials = jsPsych.data.get().filter({ task: 'block' }).values();
      const successfulTrials = blockTrials.filter(trial => trial.success === true);
      const totalSuccessfulReward = successfulTrials.reduce((sum, trial) => sum + trial.reward, 0);
      data.totalReward = totalSuccessfulReward;
    }
  };
}




const trialsArray = [
  [createTrialBlock({ randomDelay: [0, 0], bounds: [0, 0], includeDemo: true, numDemoTrials: NUM_DEMO_TRIALS }), createTrialBlock({ blockName: 'Synchronous Block', randomDelay: [0, 0]}), createRewardDisplayTrial()],
  [createTrialBlock({ randomDelay: [0, 0], bounds: [0, 0], includeDemo: true, numDemoTrials: NUM_DEMO_TRIALS }), createTrialBlock({ blockName: 'Synchronous Block', randomDelay: [0, 0]}), createRewardDisplayTrial()],
  [createTrialBlock({ randomDelay: [400, 600], bounds: [0, 0], includeDemo: true, numDemoTrials: NUM_DEMO_TRIALS }), createTrialBlock({ blockName: 'Narrow Asynchronous Block', randomDelay: [400, 600]}), createRewardDisplayTrial()],
  [createTrialBlock({ randomDelay: [400, 600], bounds: [0, 0], includeDemo: true, numDemoTrials: NUM_DEMO_TRIALS }), createTrialBlock({ blockName: 'Narrow Asynchronous Block', randomDelay: [400, 600]}), createRewardDisplayTrial()],
  [createTrialBlock({ randomDelay: [0, 1000], bounds: [0, 0], includeDemo: true, numDemoTrials: NUM_DEMO_TRIALS }), (createTrialBlock({ blockName: 'Wide Asynchronous Block', randomDelay: [0, 1000]})), createRewardDisplayTrial()],
  [createTrialBlock({ randomDelay: [0, 1000], bounds: [0, 0], includeDemo: true, numDemoTrials: NUM_DEMO_TRIALS }), (createTrialBlock({ blockName: 'Wide Asynchronous Block', randomDelay: [0, 1000]})), createRewardDisplayTrial()],
]

const sampledArray = jsPsych.randomization.sampleWithoutReplacement(trialsArray, 6);
//NOTE: SAMPLING IS NOT EVENLY DISTRIBUTED LIKE HUMMEL LAB

// Push each array of trial blocks to the timeline
sampledArray.forEach(sampledArray => {
  timeline.push(sampledArray[0])
  timeline.push(sampledArray[1])
  timeline.push(sampledArray[2])
});



// Final step to calculate total reward at the end of the experiment
const finishExperiment = {
  type: HtmlKeyboardResponsePlugin,
  choices: ['enter'],
  stimulus: function() {
    const blockTrials = jsPsych.data.get().filter({ task: 'block' }).values();
    const successfulTrials = blockTrials.filter(trial => trial.success === true);
    const totalSuccessfulReward = successfulTrials.reduce((sum, trial) => sum + trial.reward, 0);
    return `<p>The experiment has now ended. Total reward for successful trials is: $${totalSuccessfulReward.toFixed(4)}. Press Enter to finish and then please let the experimenter know.</p>`;
  },
  data: {
    task: 'finish_experiment'
  },
  on_start: function() {
    // Ensure block trial data is updated before calculating reward
    const blockTrials = jsPsych.data.get().filter({ task: 'block' }).values();
    blockTrialData = blockTrials;
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
