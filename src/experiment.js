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
import { saveAs } from 'file-saver';
import { initJsPsych } from 'jspsych';

import '../styles/main.scss';
import {
  AUTO_DECREASE_AMOUNT,
  AUTO_DECREASE_RATE,
  AUTO_INCREASE_AMOUNT,
  BOUND_OPTIONS,
  CALIBRATION_PART_1_DIRECTIONS,
  CALIBRATION_PART_2_DIRECTIONS,
  EASY_BOUNDS,
  EXPECTED_MAXIMUM_PERCENTAGE,
  EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
  GO_DURATION,
  HARD_BOUNDS,
  KEYS_TO_HOLD,
  LIKERT_PREAMBLE,
  LOADING_BAR_SPEED_NO,
  LOADING_BAR_SPEED_YES,
  MEDIUM_BOUNDS,
  NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
  NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
  NUM_DEMO_TRIALS,
  NUM_TRIALS,
  NUM_VALIDATION_TRIALS,
  PARAMETER_COMBINATIONS,
  SUCCESS_SCREEN_DURATION,
  TRIAL_DURATION,
  VALIDATION_DIRECTIONS,
  MINIMUM_DEMO_TAPS,
  FAILED_MINIMUM_DEMO_TAPS_MESSAGE,
  FAILED_MINIMUM_DEMO_TAPS_DURATION
} from './constants';
import CountdownTrialPlugin from './countdown';
import { likertQuestions1, likertQuestions2 } from './likert';
import ReleaseKeysPlugin from './release-keys';
import {
  acceptanceThermometer,
  blockWelcomeMessage,
  loadingBar,
  showThermometer,
  thermometer,
  videoStimulus,
} from './stimulus';
import TaskPlugin from './task';
import { randomNumberBm } from './utils';
import {
  extraValidationLogic,
  getMessages,
  validationResults,
} from './validation';

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

  const loadingBarTrial = (acceptance) => ({
    type: HtmlKeyboardResponsePlugin,
    stimulus: loadingBar,
    choices: 'NO_KEYS',
    on_load: function () {
      function check_percentage() {
        let percentage = document.querySelector('.percentage');
        let percentageValue = +percentage.textContent;
        let title = document.querySelector('h1');

        setTimeout(function () {
          if (percentageValue < 100) {
            update_percentage();
          } else {
            percentage.textContent = 100;
            title.textContent = 'Done!';
            title.style.color = '#568259';
            jsPsych.finishTrial(); // Finish the trial when loading is complete
          }
        }, 100);
      }

      function update_percentage() {
        let percentage = document.querySelector('.percentage');
        let percentageValue = +percentage.textContent;
        let progress = document.querySelector('.progress');
        let increment;
        acceptance
          ? (increment = Math.ceil(Math.random() * LOADING_BAR_SPEED_YES))
          : (increment = Math.ceil(Math.random() * LOADING_BAR_SPEED_NO));
        let newPercentageValue = Math.min(percentageValue + increment, 100); // Ensure it does not exceed 100
        percentage.textContent = newPercentageValue;
        progress.setAttribute('style', `width:${newPercentageValue}%`);

        check_percentage();
      }

      check_percentage();
    },
  });

  const failedMinimumDemoTapsTrial = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `<p style="color: red;">${FAILED_MINIMUM_DEMO_TAPS_MESSAGE}</p>`,
    choices: ['NO_KEYS'],
    trial_duration: FAILED_MINIMUM_DEMO_TAPS_DURATION
  };

  // Countdown step with `key `release flag check
  const countdownStep = {
    timeline: [
      {
        type: CountdownTrialPlugin,
      },
      {
        type: HtmlKeyboardResponsePlugin,
        stimulus: '<p style="color: green; font-size: 48px;">GO</p>',
        choices: 'NO_KEYS',
        trial_duration: GO_DURATION, // Display "GO" for 1 second
        data: {
          task: 'go_screen',
        },
      },
    ],
  };
  /**
   * @function calculateMedianTapCount
   * @description Calculate the median tap count for a given task type and number of trials
   * @param {string} taskType - The task type to filter data by
   * @param {number} numTrials - The number of trials to consider
   * @returns {number} - The median tap count
   */
  let medianTaps;
  function calculateMedianTapCount(allTrials, taskType, numTrials) {
    const trials = allTrials
      .filter((trial) => trial.task === taskType)
      .slice(-numTrials);
    const filteredTrials = trials.filter((trial) => !trial.keysReleasedFlag);
    let tapCounts = filteredTrials.map((trial) => trial.tapCount);
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
    stimulus: function () {
      return `<p>${message}</p>`;
    },
  });

  const videoDemo = (message, video) => ({
    type: HtmlKeyboardResponsePlugin,
    choices: ['Enter'],
    stimulus: function () {
      return videoStimulus(message, video);
    },
  });

  /**
   * @function calculateTapsStep
   * @description Create a step to calculate the median taps and display a message
   * @param {string} message - The message to display
   * @returns {Object} - jsPsych trial object
   */
  const calculateTapsStep = (message, calibrationPart, numTrials) => {
    const allTrials = jsPsych.data.get().values(); // Get all trials once

    return {
      type: HtmlKeyboardResponsePlugin,
      choices: ['enter'],
      data: {
        task: `${calibrationPart}Median`,
        medianTaps: function () {
          let medianTapCount = calculateMedianTapCount(
            allTrials,
            calibrationPart,
            numTrials,
          );
          console.log(medianTapCount);
          return medianTapCount;
        },
      },
      stimulus: function () {
        medianTaps = calculateMedianTapCount(
          allTrials,
          calibrationPart,
          numTrials,
        );
        return `<p>${message}</p>`;
      },
    };
  };


  let calibrationPart1Successes = 0;
  let calibrationPart2Successes = 0;

  const createCalibrationTrial = (
    showThermometer,
    bounds,
    repetitions,
    calibrationPart,
  ) => ({
    timeline: [
      countdownStep,
      {
        type: TaskPlugin,
        duration: TRIAL_DURATION,
        showThermometer,
        bounds,
        autoIncreaseAmount: function () {
          return (
            (EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION +
              (TRIAL_DURATION / AUTO_DECREASE_RATE) * AUTO_DECREASE_AMOUNT) /
            medianTaps
          );
        },
        data: {
          task: calibrationPart,
          showThermometer,
          bounds,
        },
        on_finish: function (data) {
          if (!data.keysReleasedFlag) {
            calibrationPart === 'calibrationPart1'
              ? calibrationPart1Successes++
              : calibrationPart2Successes++;
          }
        },
      },
      {
        timeline: [releaseKeysStep],
        conditional_function: function () {
          const lastTrialData = jsPsych.data.get().last(1).values()[0]; // Get all trials once
          return !lastTrialData.keysReleasedFlag;
        },
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
          ? calibrationPart1Successes
          : calibrationPart2Successes;

      const remainingSuccesses = requiredSuccesses - currentSuccesses;
      return remainingSuccesses > 0; // Repeat the timeline if more successes are needed
    },
  });

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
        autoIncreaseAmount: function () {
          return (
            (EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION +
              (TRIAL_DURATION / AUTO_DECREASE_RATE) * AUTO_DECREASE_AMOUNT) /
            medianTaps
          );
        },
        on_finish: function (data) {
          if (!data.success) {
            validationResults[difficultyLevel]++;
          }
        },
      },
      {
        timeline: [releaseKeysStep],
        conditional_function: function () {
          const lastTrialData = jsPsych.data.get().last(1).values()[0];
          return !lastTrialData.keysReleasedFlag;
        },
      },
    ],
    repetitions: NUM_VALIDATION_TRIALS,
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
        autoIncreaseAmount: function () {
          console.log();
          return (
            (EXPECTED_MAXIMUM_PERCENTAGE +
              (TRIAL_DURATION / AUTO_DECREASE_RATE) * AUTO_DECREASE_AMOUNT) /
            medianTaps
          );
        },
        on_finish: function (data) {
          if (!data.success) {
            validationResults[difficultyLevel]++;
          }
        },
        data: {
          showThermometer: true,
          bounds: bounds,
        },
      },
      {
        timeline: [releaseKeysStep],
        conditional_function: function () {
          const lastTrialData = jsPsych.data.get().last(1).values()[0];
          return !lastTrialData.keysReleasedFlag;
        },
      },
    ],
    repetitions: 3,
  });

  // Failed or succeeded validation message
  const validationSuccess = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: function () {
      const result = getMessages();
      return result.message;
    },
    choices: ['Enter'],
    on_finish: function (data) {
      const result = getMessages();
      if (result.endExperiment) {
        jsPsych.endExperiment(result.message);
      }
    },
  };

  // Conditional extra validation node
  const extraValidationNode = {
    timeline: [extraValidationTrials(HARD_BOUNDS, 'extraValidation')],
    conditional_function: extraValidationLogic(),
  };

  // Add trials to the timeline
  timeline.push(videoDemo(CALIBRATION_PART_1_DIRECTIONS));
  timeline.push(
    createCalibrationTrial(
      false,
      [
        EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
        EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
      ],
      NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
      'calibrationPart1',
    ),
  );
  timeline.push(
    calculateTapsStep(
      CALIBRATION_PART_2_DIRECTIONS,
      'calibrationPart1',
      NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
    ),
  );
  timeline.push(
    createCalibrationTrial(
      true,
      [
        EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
        EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
      ],
      NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
      'calibrationPart2',
    ),
  );
  timeline.push(
    calculateTapsStep(
      CALIBRATION_PART_2_DIRECTIONS,
      'calibrationPart2',
      NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
    ),
  );

  /*   timeline.push(directionTrial(VALIDATION_DIRECTIONS))
  timeline.push(validationTrials(EASY_BOUNDS, 'easy'))
  timeline.push(validationTrials(MEDIUM_BOUNDS, 'medium'))
  timeline.push(validationTrials(HARD_BOUNDS, 'hard'))
  timeline.push(extraValidationNode);
  timeline.push(validationSucesss); */

  const successScreen = {
    timeline: [
      {
        type: HtmlKeyboardResponsePlugin,
        stimulus: function () {
          const previousTrial = jsPsych.data.get().last(1).values()[0]; // Get the trial 1 steps ago
          if (previousTrial.success) {
            return '<p style="color: green; font-size: 48px;">Trial Succeeded</p>';
          } else {
            return '<p style="color: red; font-size: 48px;">Trial Failed</p>';
          }
        },
        choices: 'NO_KEYS',
        trial_duration: SUCCESS_SCREEN_DURATION,
        data: {
          task: 'success_screen',
        },
      },
    ],
  };

  let demoTrialSuccesses = 0;

  /**
   * @function createTrialBlock
   * @description Create a block of trials with optional demo, Likert questions, acceptance phase, and task performance phase
   * @param {Object} options - Options for creating the trial block
   * @param {string} [options.blockName] - The name of the block
   * @param {Array} options.randomDelay - The delay range for the demo and block trials
   * @param {Array} options.bounds - The bounds for the thermometer task
   * @param {boolean} [options.includeDemo=false] - Whether to include the demo trials
   * @returns {Object} - jsPsych trial object
   */
  const createTrialBlock = ({
    blockName,
    randomDelay,
    bounds,
    includeDemo = false,
  }) => {
    const timeline = [];

    if (includeDemo) {
      demoTrialSuccesses = 0; // Reset demo successes before starting

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
              autoIncreaseAmount: function () {
                return (
                  (EXPECTED_MAXIMUM_PERCENTAGE +
                    (TRIAL_DURATION / AUTO_DECREASE_RATE) *
                      AUTO_DECREASE_AMOUNT) /
                  medianTaps
                );
              },
              data: {
                task: 'demo',
                randomDelay: randomDelay,
                bounds: bounds,
                minimumTapsReached: false,
              },
              on_finish: function (data) {
                //check if minimum taps was reached
                if (data.tapCount > MINIMUM_DEMO_TAPS){
                  data.minimumTapsReached = true
                } 
                //
                if (!data.keysReleasedFlag && data.minimumTapsReached) {
                  demoTrialSuccesses++;
                }
 
              },
            },
            {
              timeline: [releaseKeysStep],
              conditional_function: function () {
                const lastTrialData = jsPsych.data.get().last(1).values()[0];
                return !lastTrialData.keysReleasedFlag;
              },
            },
            {
              timeline: [failedMinimumDemoTapsTrial],
              //Check if minimum taps was reached in last trial to determine whether 'failedMinimumDemoTapsTrial' should display
              conditional_function: function () {
                const lastTrialData = jsPsych.data.get().filter({ task: 'demo' }).last(1).values()[0]
                console.log(lastTrialData)
                return !lastTrialData.minimumTapsReached;
              },
            },
            {
              timeline: [loadingBarTrial(true)],
            },
          ],
          loop_function: function () {
            const remainingSuccesses = NUM_DEMO_TRIALS - demoTrialSuccesses;
            if (remainingSuccesses > 0) {
              return true; // Repeat the timeline if more successes are needed
            }
            return false;
          },
        },
        // Likert scale survey after demo
        ...likertQuestions1,
      );
    }

    if (blockName) {
      const numTrialsPerCombination = Math.floor(
        NUM_TRIALS / PARAMETER_COMBINATIONS.length,
      );

      let trials = PARAMETER_COMBINATIONS.flatMap((combination) =>
        Array(numTrialsPerCombination)
          .fill()
          .map(() => ({
            reward: jsPsych.randomization.sampleWithReplacement(combination.reward,1)[0],
            randomDelay: randomDelay,
            bounds: combination.bounds,
          })),
      );

/*       for (let i = 0; i < trials.length; i++) {
        let min = trials[i].reward - 0.1 * trials[i].reward;
        let max = trials[i].reward + 0.1 * trials[i].reward;
        trials[i].reward = randomNumberBm(min, max);
      } */

      trials = jsPsych.randomization.shuffle(trials);
      timeline.push(
        {
          timeline: trials.map((trialData) => ({
            timeline: [
              // Acceptance Phase
              {
                type: HtmlKeyboardResponsePlugin,
                stimulus: function () {
                  // Generate the thermometer HTML with bounds from trialData
                  return `
                  ${acceptanceThermometer(trialData.bounds, trialData.reward)}
                `;
                },
                choices: ['arrowleft', 'arrowright'],
                data: {
                  task: 'accept',
                  reward: trialData.reward,
                },

                on_finish: (data) => {
                  data.accepted = jsPsych.pluginAPI.compareKeys(
                    data.response,
                    'arrowleft',
                  );
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
                    on_start: function () {
                      console.log(
                        `Task Performance Phase reward: $${trialData.reward}`,
                      ); // Logging reward in TaskPlugin step
                    },
                    autoIncreaseAmount: function () {
                      console.log();
                      return (
                        (EXPECTED_MAXIMUM_PERCENTAGE +
                          (TRIAL_DURATION / AUTO_DECREASE_RATE) *
                            AUTO_DECREASE_AMOUNT) /
                        medianTaps
                      );
                    },
                    data: {
                      task: 'block',
                      blockType: blockName,
                      accept: () => {
                        var acceptanceData = jsPsych.data
                          .get()
                          .filter({ task: 'accept' })
                          .last(1)
                          .values()[0];
                        return acceptanceData ? acceptanceData.accepted : null;
                      },
                    },
                    on_finish: function (data) {
                      console.log(data);
                    },
                  },
                  {
                    timeline: [successScreen],
                  },
                  {
                    timeline: [releaseKeysStep],
                    conditional_function: function () {
                      const lastTrialData = jsPsych.data
                        .get()
                        .last(2)
                        .values()[0];
                      return !lastTrialData.keysReleasedFlag;
                    },
                  },
                ],
                conditional_function: () => trialData.accepted,
              },
              {
                timeline: [loadingBarTrial(false)],
                conditional_function: () => !trialData.accepted,
              },
              {
                timeline: [loadingBarTrial(true)],
                conditional_function: () => trialData.accepted,
              },
            ],
          })),
          sample: {
            type: 'without-replacement',
            size: trials.length,
          },
        },
        // Likert scale survey after block
        ...likertQuestions2,
      );
    }

    return { timeline };
  };

  function calculateTotalReward(allTrials) {
    const blockTrials = allTrials.filter((trial) => trial.task === 'block');
    const successfulTrials = blockTrials.filter(
      (trial) => trial.success === true,
    );
    return successfulTrials.reduce((sum, trial) => sum + trial.reward, 0);
  }

  function createRewardDisplayTrial() {
    const allTrials = jsPsych.data.get().values(); // Get all trials once

    return {
      type: HtmlKeyboardResponsePlugin,
      choices: ['enter'],
      stimulus: function () {
        const totalSuccessfulReward = calculateTotalReward(allTrials);
        return `<p>The block has ended. Total reward for successful trials is: $${totalSuccessfulReward}. Press Enter to continue.</p>`;
      },
      data: {
        task: 'display_reward',
      },
      on_finish: function (data) {
        const totalSuccessfulReward = calculateTotalReward(allTrials);
        data.totalReward = totalSuccessfulReward;
      },
    };
  }

  const trialsArray = [
    [
      createTrialBlock({
        randomDelay: [0, 0],
        bounds: [0, 0],
        includeDemo: true,
      }),
      createTrialBlock({ blockName: 'Synchronous Block', randomDelay: [0, 0] }),
      createRewardDisplayTrial(),
    ],
    [
      createTrialBlock({
        randomDelay: [0, 0],
        bounds: [0, 0],
        includeDemo: true,
      }),
      createTrialBlock({ blockName: 'Synchronous Block', randomDelay: [0, 0] }),
      createRewardDisplayTrial(),
    ],
    [
      createTrialBlock({
        randomDelay: [400, 600],
        bounds: [0, 0],
        includeDemo: true,
      }),
      createTrialBlock({
        blockName: 'Narrow Asynchronous Block',
        randomDelay: [400, 600],
      }),
      createRewardDisplayTrial(),
    ],
    [
      createTrialBlock({
        randomDelay: [400, 600],
        bounds: [0, 0],
        includeDemo: true,
      }),
      createTrialBlock({
        blockName: 'Narrow Asynchronous Block',
        randomDelay: [400, 600],
      }),
      createRewardDisplayTrial(),
    ],
    [
      createTrialBlock({
        randomDelay: [0, 1000],
        bounds: [0, 0],
        includeDemo: true,
      }),
      createTrialBlock({
        blockName: 'Wide Asynchronous Block',
        randomDelay: [0, 1000],
      }),
      createRewardDisplayTrial(),
    ],
    [
      createTrialBlock({
        randomDelay: [0, 1000],
        bounds: [0, 0],
        includeDemo: true,
      }),
      createTrialBlock({
        blockName: 'Wide Asynchronous Block',
        randomDelay: [0, 1000],
      }),
      createRewardDisplayTrial(),
    ],
  ];

  const sampledArray = jsPsych.randomization.sampleWithoutReplacement(
    trialsArray,
    6,
  );
  //NOTE: SAMPLING IS NOT EVENLY DISTRIBUTED LIKE HUMMEL LAB

  // Push each array of trial blocks to the timeline
  sampledArray.forEach((sampledArray) => {
    timeline.push(sampledArray[0]);
    timeline.push(sampledArray[1]);
    timeline.push(sampledArray[2]);
  });

  // Final step to calculate total reward at the end of the experiment
  const finishExperiment = {
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: function () {
      const allTrials = jsPsych.data.get().values(); // Get all trials once
      const totalSuccessfulReward = calculateTotalReward(allTrials);
      return `<p>The experiment has now ended. Total reward for successful trials is: $${totalSuccessfulReward}. Press Enter to finish and then please let the experimenter know.</p>`;
    },
    data: {
      task: 'finish_experiment',
    },
    on_start: function () {
      const allTrials = jsPsych.data.get().values(); // Get all trials once
      blockTrialData = allTrials.filter((trial) => trial.task === 'block');
    },
    on_finish: function (data) {
      const allTrials = jsPsych.data.get().values(); // Get all trials once
      const totalSuccessfulReward = calculateTotalReward(allTrials);
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
