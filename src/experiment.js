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
  TUTORIAL_MESSAGE_1,
  VALIDATION_DIRECTIONS,
  VIDEO_TUTORIAL_MESSAGE,
  TRIAL_SUCCEEDED,
  TRIAL_FAILED,
} from './constants';
import CountdownTrialPlugin from './countdown';
import { KeyboardInteractionPlugin } from './keyboard';
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
import {
  instructionalCountdownSte,
  interactiveCountdown,
  noStimuliVideoTutorial,
  stimuliVideoTutorial,
  validationVideoTutorial,
  instructionalTrial,
  dominantHand,
  DOMINANT_HAND
} from './tutorial';
import { autoIncreaseAmount, randomNumberBm } from './utils';
import { handleValidationFinish, validationFailures } from './validation';

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



  const checkFlag = (taskFilter, flag) => {
    const lastCountdownData = jsPsych.data
      .get()
      .filter({ task: taskFilter })
      .last(1)
      .values()[0];
    
    if (flag === 'keyTappedEarlyFlag') {
      return lastCountdownData ? lastCountdownData.keyTappedEarlyFlag : false;
    } else if (flag === 'keysReleasedFlag') {
      return lastCountdownData ? lastCountdownData.keysReleasedFlag : true;
    }
  };
  

  // Release keys step
  const releaseKeysStep = {
    type: ReleaseKeysPlugin,
    stimulus: `<p>Release the Keys</p>`,
    valid_responses: KEYS_TO_HOLD,
  };

  // Did 
  const successScreen = {
    timeline: [
      {
        type: HtmlKeyboardResponsePlugin,
        stimulus: function () {
          const previousTrial = jsPsych.data.get().last(1).values()[0];
          if (previousTrial.success) {
            return `<p style="color: green; font-size: 48px;">${TRIAL_SUCCEEDED}</p>`;
          } else {
            return `<p style="color: red; font-size: 48px;">${TRIAL_FAILED}</p>`;
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
    on_finish: function () {
      const loadingBarContainer = document.querySelector(
        '.loading-bar-container',
      );
      if (loadingBarContainer) {
        loadingBarContainer.remove();
      }
    },
  });

  const failedMinimumDemoTapsTrial = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `<p style="color: red;">${FAILED_MINIMUM_DEMO_TAPS_MESSAGE}</p>`,
    choices: ['NO_KEYS'],
    trial_duration: FAILED_MINIMUM_DEMO_TAPS_DURATION,
  };

  // Countdown step with `key `release flag check
  const countdownStep = {
    timeline: [
      {
        type: CountdownTrialPlugin,
        data: {
          task: 'countdown',
        },
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

  let medianTaps; // Declare a universal variable
  let medianTapsPart1;
  let conditionalMedianTapsPart1;
  let medianTapsPart2;
  let conditionalMedianTapsPart2;

  /**
   * @function calculateMedianTapCount
   * @description Calculate the median tap count for a given task type and number of trials
   * @param {string} taskType - The task type to filter data by
   * @param {number} numTrials - The number of trials to consider
   * @returns {number} - The median tap count
   */
  function calculateMedianTapCount(taskType, numTrials) {
    const filteredTrials = jsPsych.data
      .get()
      .filter({ task: taskType })
      .last(numTrials)
      .filter({ keysReleasedFlag: false })
      .select('tapCount');

    const medianValue = filteredTrials.median(); // Calculate the median
    return medianValue;
  }

  /**
   * @function endExperimentTrial
   * @description Create a trial to end the experiment with a message
   * @param {string} message - The message to display
   * @returns {Object} - jsPsych trial object
   */
  const endExperimentTrial = (message) => ({
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: `<p>${message}</p>`,
    on_finish: function () {
      console.log('Experiment ended:', message);
      jsPsych.endExperiment(message);
    },
  });

  let calibrationPart1Successes = 0;
  let calibrationPart2Successes = 0;

  const createCalibrationTrial = (
    showThermometer,
    bounds,
    repetitions,
    calibrationPart,
  ) => {
    return {
      timeline: [
        countdownStep,
        {
          type: TaskPlugin,
          task: calibrationPart,
          duration: TRIAL_DURATION,
          showThermometer,
          bounds,
          autoIncreaseAmount: function () {
            // Determine which median to use for Part 2
            let medianToUse = medianTaps;
            if (calibrationPart === 'calibrationPart2') {
              medianToUse =
                medianTapsPart1 >= MINIMUM_CALIBRATION_MEDIAN
                  ? medianTapsPart1
                  : conditionalMedianTapsPart1;
            }
            return autoIncreaseAmount(
              EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
              TRIAL_DURATION,
              AUTO_DECREASE_RATE,
              AUTO_DECREASE_AMOUNT,
              medianToUse,
            );
          },
          data: {
            task: calibrationPart,
            showThermometer,
            bounds,
          },
          on_start: function (trial) {
            const keyTappedEarlyFlag = checkFlag('countdown', 'keyTappedEarlyFlag')
            // Update the trial parameters with keyTappedEarlyFlag
            trial.keyTappedEarlyFlag = keyTappedEarlyFlag;
          },
          on_finish: function (data) {
            if (!data.keysReleasedFlag && !data.keyTappedEarlyFlag) {
              calibrationPart === 'calibrationPart1'
                ? calibrationPart1Successes++
                : calibrationPart2Successes++;
            }
            console.log(
              `calibrationPart1Successes: ${calibrationPart1Successes}`,
            );
            console.log(
              `calibrationPart2Successes: ${calibrationPart2Successes}`,
            );
          },
        },
        {
          timeline: [releaseKeysStep],
          conditional_function: function () {
            return !checkFlag(calibrationPart, 'keysReleasedFlag');
          },
          
        },
        {
          timeline: [loadingBarTrial(true)],
        },
      ],
      repetitions: repetitions,
      // Repeat until the user has completed minimum number of calibration trials without releasing keys early or tapping early
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
        console.log(
          `Remaining successes for ${calibrationPart}: ${remainingSuccesses}`,
        );
        return remainingSuccesses > 0; // Repeat the timeline if more successes are needed
      },
    };
  };

  /**
   * @function createConditionalCalibrationTrial
   * @description Create a conditional calibration trial
   * @param {string} message - The message to display
   * @param {string} calibrationPart - The calibration part
   * @param {number} numTrials - The number of trials to consider
   * @returns {Object} - jsPsych trial object
   */

  const createConditionalCalibrationTrial = (calibrationPart, numTrials) => {
    return {
      timeline: [
        {
          type: HtmlKeyboardResponsePlugin,
          choices: ['enter'],
          stimulus: function () {
            // Reset success counters
            if (calibrationPart === 'calibrationPart1') {
              calibrationPart1Successes = 0;
            } else {
              calibrationPart2Successes = 0;
            }
            console.log(`Reset successes for ${calibrationPart}`);
            return `<p>${ADDITIONAL_CALIBRATION_PART_1_DIRECTIONS}</p>`;
          },
        },
        createCalibrationTrial(
          calibrationPart === 'calibrationPart2',
          [
            EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
            EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
          ],
          numTrials,
          calibrationPart,
        ),
        {
          timeline: [
            endExperimentTrial(
              'Calibration failed. The experiment is now ending.',
            ),
          ],
          conditional_function: function () {
            if (calibrationPart === 'calibrationPart1') {
              conditionalMedianTapsPart1 = calculateMedianTapCount(
                calibrationPart,
                numTrials,
              );
              console.log(
                `conditionalMedianTapsPart1: ${conditionalMedianTapsPart1}`,
              );
              return conditionalMedianTapsPart1 < MINIMUM_CALIBRATION_MEDIAN;
            } else {
              conditionalMedianTapsPart2 = calculateMedianTapCount(
                calibrationPart,
                numTrials,
              );
              console.log(
                `conditionalMedianTapsPart2: ${conditionalMedianTapsPart2}`,
              );
              return conditionalMedianTapsPart2 < MINIMUM_CALIBRATION_MEDIAN;
            }
          },
        },
      ],
      conditional_function: function () {
        if (calibrationPart === 'calibrationPart1') {
          console.log(`medianTapsPart1: ${medianTapsPart1}`);
          return medianTapsPart1 < MINIMUM_CALIBRATION_MEDIAN;
        } else {
          console.log(`medianTapsPart2: ${medianTapsPart2}`);
          return medianTapsPart2 < MINIMUM_CALIBRATION_MEDIAN;
        }
      },
    };
  };

  /**
   * @function createValidationTrial
   * @description Create validation trials with specified bounds and difficulty level
   * @param {Array} bounds - The bounds for the validation task
   * @param {string} validationName - The name of the validation
   * @param {number} repetitions - The number of repetitions
   * @returns {Object} - jsPsych trial object
   */
  let validationSuccess = false;
  let extraValidationRequired = false;
  let validationExtraFailures = 0;

  const createValidationTrial = (bounds, validationName, repetitions) => ({
    timeline: [
      countdownStep,
      {
        type: TaskPlugin,
        task: validationName,
        duration: TRIAL_DURATION,
        showThermometer: true,
        bounds: bounds,
        autoIncreaseAmount: function () {
          return autoIncreaseAmount(
            EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
            TRIAL_DURATION,
            AUTO_DECREASE_RATE,
            AUTO_DECREASE_AMOUNT,
            medianTaps,
          );
        },
        data: {
          task: validationName,
        },
        on_finish: function (data) {
          data.task = validationName;
          const validationExtraCount = jsPsych.data
            .get()
            .filter({ task: 'validationExtra' })
            .values();

          const result = handleValidationFinish(
            data,
            validationName,
            bounds,
            validationFailures,
            validationExtraCount,
            validationExtraFailures,
          );

          extraValidationRequired = result.extraValidationRequired;
          validationSuccess = result.validationSuccess;
          validationExtraFailures = result.validationExtraFailures;
        },
      },
      {
        timeline: [successScreen],
      },
      {
        timeline: [releaseKeysStep],
        conditional_function: function () {
          return !checkFlag(validationName, 'keysReleasedFlag')
        },
      },
      {
        timeline: [loadingBarTrial(true)],
      },
    ],
    repetitions: repetitions,
  });

  // Screen to display validation success
  const validationResultScreen = {
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: function () {
      return validationSuccess
        ? PASSED_VALIDATION_MESSAGE
        : FAILED_VALIDATION_MESSAGE;
    },
    on_finish: function () {
      if (!validationSuccess) {
        jsPsych.endExperiment(FAILED_VALIDATION_MESSAGE);
      }
    },
  };

  const validationTrialEasy = createValidationTrial(
    [30, 50],
    'validationEasy',
    NUM_VALIDATION_TRIALS,
  );
  const validationTrialMedium = createValidationTrial(
    [50, 70],
    'validationMedium',
    NUM_VALIDATION_TRIALS,
  );
  const validationTrialHard = createValidationTrial(
    [70, 90],
    'validationHard',
    NUM_VALIDATION_TRIALS,
  );
  const validationTrialExtra = createValidationTrial(
    [70, 90],
    'validationExtra',
    NUM_EXTRA_VALIDATION_TRIALS,
  );

  const validationTrials = [
    validationTrialEasy,
    validationTrialMedium,
    validationTrialHard,
    {
      timeline: [validationTrialExtra],
      conditional_function: function () {
        return extraValidationRequired;
      },
    },
    validationResultScreen,
  ];
  // Trial for the user to practice
  const practiceTrial = {
    timeline: [
      {
        type: TaskPlugin,
        showThermometer: false,
        data: {
          task: 'practice',
        },
        on_start: function (trial) {
          const keyTappedEarlyFlag = checkFlag('countdown', 'keyTappedEarlyFlag')
          // Update the trial parameters with keyTappedEarlyFlag
          trial.keyTappedEarlyFlag = keyTappedEarlyFlag;
        },
      },
      {
        timeline: [releaseKeysStep],
        conditional_function: function () {
          return !checkFlag('practice', 'keysReleasedFlag');
        },        
      },
    ],
  };

 // Create a loop for the user to practice until done successfully (pushed at the start).
  const practiceLoop = {
    timeline: [
      interactiveCountdown,
      {
        type: HtmlKeyboardResponsePlugin,
        stimulus: '<p style="color: green; font-size: 48px;">GO</p>',
        choices: 'NO_KEYS',
        trial_duration: GO_DURATION, // Display "GO" for 1 second
        data: {
          task: 'go_screen',
        },
      },
      practiceTrial,
      loadingBarTrial(true),
    ],
    // Repeat if the keys were released early or if user tapped before go.
    loop_function: function () {
      const keyTappedEarlyFlag = checkFlag('countdown', 'keyTappedEarlyFlag');
      const keysReleasedFlag = checkFlag('practice', 'keysReleasedFlag');
      return keysReleasedFlag || keyTappedEarlyFlag;
    },
  };

  // Video + instructions for 
  timeline.push({
    timeline: [noStimuliVideoTutorial],
    on_finish: function () {
      // Clear the display element
      jsPsych.getDisplayElement().innerHTML = '';
    },
  });
  timeline.push(practiceLoop);
  timeline.push(instructionalTrial(CALIBRATION_PART_1_DIRECTIONS));
  timeline.push({
    timeline: [
      createCalibrationTrial(
        false,
        [
          EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
          EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
        ],
        NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
        'calibrationPart1',
      ),
    ],
  });
  timeline.push(
    createConditionalCalibrationTrial(
      'calibrationPart1',
      NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
    ),
  );
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: function () {
      medianTapsPart1 = calculateMedianTapCount(
        'calibrationPart1',
        NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
      );
      console.log(`medianTapsPart1: ${medianTapsPart1}`);
      if (medianTapsPart1 >= MINIMUM_CALIBRATION_MEDIAN) {
        medianTaps = medianTapsPart1;
        console.log(`medianTaps updated to: ${medianTaps}`);
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
    timeline: [
      createCalibrationTrial(
        true,
        [
          EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
          EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
        ],
        NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
        'calibrationPart2',
      ),
    ],
  });
  timeline.push(
    createConditionalCalibrationTrial(
      'calibrationPart2',
      NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
    ),
  );
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: function () {
      medianTapsPart2 = calculateMedianTapCount(
        'calibrationPart2',
        NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
      );
      console.log(`medianTapsPart2: ${medianTapsPart2}`);
      if (medianTapsPart2 >= MINIMUM_CALIBRATION_MEDIAN) {
        medianTaps = medianTapsPart2;
        console.log(`medianTaps updated to: ${medianTaps}`);
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
  timeline.push(...validationTrials);
  let demoTrialSuccesses = 0;
  timeline.push(instructionalTrial(TRIAL_BLOCKS_DIRECTIONS));

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
            return `<p>${DEMO_TRIAL_MESSAGE}</p>`;
          },
          choices: ['enter'],
        },
        // Demo trials
        {
          timeline: [
            countdownStep,
            {
              type: TaskPlugin,
              task: blockName,
              duration: TRIAL_DURATION,
              showThermometer: true,
              randomDelay,
              bounds,
              autoIncreaseAmount: function () {
                return autoIncreaseAmount(
                  EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
                  TRIAL_DURATION,
                  AUTO_DECREASE_RATE,
                  AUTO_DECREASE_AMOUNT,
                  medianTaps,
                );
              },
              data: {
                task: 'demo',
                randomDelay: randomDelay,
                bounds: bounds,
                minimumTapsReached: false,
              },
              on_start: function (trial) {
                const keyTappedEarlyFlag = checkFlag('countdown', 'keyTappedEarlyFlag')
                // Update the trial parameters with keyTappedEarlyFlag
                trial.keyTappedEarlyFlag = keyTappedEarlyFlag;
                return keyTappedEarlyFlag
              },
              on_finish: function (data) {
                // Check if minimum taps was reached
                if (data.tapCount > MINIMUM_DEMO_TAPS) {
                  data.minimumTapsReached = true;
                }
                if (!data.keysReleasedFlag && data.minimumTapsReached) {
                  demoTrialSuccesses++;
                }
              },
            },
            {
              timeline: [releaseKeysStep],
              conditional_function: function () {
                return !checkFlag('demo', 'keysReleasedFlag')
              },
            },
            {
              timeline: [failedMinimumDemoTapsTrial],
              // Check if minimum taps was reached in last trial to determine whether 'failedMinimumDemoTapsTrial' should display
              conditional_function: function () {
                const lastTrialData = jsPsych.data
                  .get()
                  .filter({ task: 'demo' })
                  .last(1)
                  .values()[0];
                return !lastTrialData.minimumTapsReached;
              },
            },
            {
              timeline: [loadingBarTrial(true)],
            },
          ],
          loop_function: function () {
            const remainingSuccesses = NUM_DEMO_TRIALS - demoTrialSuccesses;
            return remainingSuccesses > 0; // Repeat the timeline if more successes are needed
          },
        },
        // Likert scale survey after demo
        ...likertQuestions1,
      );
    }
 // If a block created is an actual trial
    if (blockName) { 
      // Create the number of full combination of trials (63 trials  / (3 x 3) factorial design = 7 sets of these 9 trials)
      
      const numTrialsPerCombination = Math.floor(
        NUM_TRIALS / PARAMETER_COMBINATIONS.length,
      );
      // Randomly map each of these combination parameters to each trial within 63 created samples 
      let trials = PARAMETER_COMBINATIONS.flatMap((combination) =>
        Array(numTrialsPerCombination)
          .fill()
          .map(() => ({
            reward: jsPsych.randomization.sampleWithReplacement(
              combination.reward,
              1,
            )[0],
            randomDelay: randomDelay,
            bounds: combination.bounds,
          })),
      );
      // Shuffle the order of these trials
      trials = jsPsych.randomization.shuffle(trials);
      timeline.push(
        {
          timeline: trials.map((trialData) => ({
            timeline: [
              // Acceptance Phase
              {
                type: HtmlKeyboardResponsePlugin,
                stimulus: function () {
                  return `${acceptanceThermometer(trialData.bounds, trialData.reward)}`;
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
                    autoIncreaseAmount: function () {
                      return autoIncreaseAmount(
                        EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
                        TRIAL_DURATION,
                        AUTO_DECREASE_RATE,
                        AUTO_DECREASE_AMOUNT,
                        medianTaps,
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
                      reward: trialData.reward,
                    },
                    on_start: function (trial) {
                      const keyTappedEarlyFlag = checkFlag('countdown', 'keyTappedEarlyFlag')
                      // Update the trial parameters with keyTappedEarlyFlag
                      trial.keyTappedEarlyFlag = keyTappedEarlyFlag;
                      return keyTappedEarlyFlag
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
                      return !checkFlag('block', 'keysReleasedFlag')
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
          // Sample these without replacement so no trials are repeated
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
  // Function to calculate accumulated reward
  function calculateTotalReward() {
    const successfulTrials = jsPsych.data
      .get()
      .filter({ task: 'block', success: true });
    console.log(successfulTrials);
    console.log(successfulTrials.select('reward'));
    return successfulTrials.select('reward').sum();
  }
  // Function to create a trial that displays the accumulated reward to the user
  function createRewardDisplayTrial() {
    return {
      type: HtmlKeyboardResponsePlugin,
      choices: ['enter'],
      stimulus: function () {
        const totalSuccessfulReward = calculateTotalReward();
        return `<p>${REWARD_TOTAL_MESSAGE(totalSuccessfulReward)}</p>`;
      },
      data: {
        task: 'display_reward',
      },
      on_finish: function (data) {
        const totalSuccessfulReward = calculateTotalReward();
        data.totalReward = totalSuccessfulReward;
      },
    };
  }
  // Array of trials that generates a 6 new random orders of the (3x3 factorial designed blocks of 63 trials) to complete the 3x3x3 factorial design.  
  const trialsArray = [
    [
      // Demo trials
      createTrialBlock({
        randomDelay: [0, 0],
        bounds: [0, 0],
        includeDemo: true,
      }),
      // Synchronous Block of 63 trials 
      createTrialBlock({ blockName: 'Synchronous Block', randomDelay: [0, 0] }),
       // Display accumulated reward
      createRewardDisplayTrial(),
    ],
    [
      // Demo trials
      createTrialBlock({
        randomDelay: [0, 0],
        bounds: [0, 0],
        includeDemo: true,
      }),
      // Synchronous Block of 63 trials 
      createTrialBlock({ blockName: 'Synchronous Block', randomDelay: [0, 0] }),
      // Display accumulated reward
      createRewardDisplayTrial(),
    ],
    [
      // Demo trials
      createTrialBlock({
        randomDelay: [400, 600],
        bounds: [0, 0],
        includeDemo: true,
      }),
      // Narrow Asynchronous Block of 63 trials 
      createTrialBlock({
        blockName: 'Narrow Asynchronous Block',
        randomDelay: [400, 600],
      }),
      // Display accumulated reward
      createRewardDisplayTrial(),
    ],
    [
      createTrialBlock({
      // Demo trials
        randomDelay: [400, 600],
        bounds: [0, 0],
        includeDemo: true,
      }),
      createTrialBlock({
      // Narrow Asynchronous Block of 63 trials 
        blockName: 'Narrow Asynchronous Block',
        randomDelay: [400, 600],
      }),
      // Display accumulated reward
      createRewardDisplayTrial(),
    ],
    [
      createTrialBlock({
      // Demo trials
        randomDelay: [0, 1000],
        bounds: [0, 0],
        includeDemo: true,
      }),
      createTrialBlock({
      // Wide Asynchronous Block of 63 trials 
        blockName: 'Wide Asynchronous Block',
        randomDelay: [0, 1000],
      }),
      // Display accumulated reward
      createRewardDisplayTrial(),
    ],
    [
      createTrialBlock({
      // Demo trials
        randomDelay: [0, 1000],
        bounds: [0, 0],
        includeDemo: true,
      }),
      createTrialBlock({
      // Wide Asynchronous Block of 63 trials 
        blockName: 'Wide Asynchronous Block',
        randomDelay: [0, 1000],
      }),
      // Display accumulated reward
      createRewardDisplayTrial(),
    ],
  ];
  // Randomly sample from the 3x3x3 factorial design to display 2 Synchronous Blocks of 63 trials, 
  // 2 Narrow Asynchronous Blocks of 63 trials, and 2 Wide Asynchronous Blocks of 63 trials for 
  // a total of 378 trials
  const sampledArray = jsPsych.randomization.sampleWithoutReplacement(
    trialsArray,
    6,
  );
  // NOTE: SAMPLING IS NOT EVENLY DISTRIBUTED LIKE HUMMEL LAB

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
