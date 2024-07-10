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
import { ParameterType, initJsPsych } from 'jspsych';

import '../styles/main.scss';
import TaskPlugin from './task';
import CountdownTrialPlugin from './countdown';
import ReleaseKeysPlugin from './release-keys';

import {
  validationResults,
  extraValidationLogic,
  getMessages,
  messageStep
} from './validation'

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
  NUM_DEMO_TRIALS,
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

const randomBounds = () => jsPsych.randomization.sampleWithReplacement(BOUND_OPTIONS, 1)[0];

export async function run({ assetPaths, input = {}, environment, title, version }) {
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
    keysReleasedFlag: function() {
      const lastTrialData = jsPsych.data.get().filter({task: 'calibration'}).last(1).values()[0]
      return(lastTrialData ? lastTrialData.keysReleasedFlag : false)
    }
  };

  function calculateMedianTapCount(taskType, numTrials) {
    const trials = jsPsych.data.get().filter({task: taskType}).last(numTrials).values()
    const filteredTrials = trials.filter(trial => !trial.keysReleasedFlag);
    console.log("Filtered Trials:", filteredTrials); // Log the filtered trials
    let tapCounts = filteredTrials.map(trial => trial.tapCount);
    tapCounts.sort((a, b) => a - b); // Sort the tap counts in ascending order
    console.log("Sorted Tap Counts:", tapCounts); // Log the sorted tap counts

    let medianTaps;
    const middle = Math.floor(tapCounts.length / 2);

    if (tapCounts.length % 2 === 0) {
      // If even, average the two middle numbers
      medianTaps = (tapCounts[middle - 1] + tapCounts[middle]) / 2;
    } else {
      // If odd, take the middle number
      medianTaps = tapCounts[middle];
    }

    return medianTaps;
  }

  // Function to dynamically create a timeline step based on the previous trial's outcome
  const createCalibrationTrial = (showThermometer, bounds) => ({
    timeline: [
      countdownStep,
      {
        type: TaskPlugin,
        taskType: 'calibration',
        duration: TRIAL_DURATION,
        showThermometer,
        bounds,
        data: {
          task: 'calibration',
        }
      },
      {
        timeline: [releaseKeysStep],
        conditional_function: () => !jsPsych.data.getLastTrialData().values()[0].skipReleaseKeysStep,
      },
    ],
    repetitions: NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
  });

  // Calibration trials without feedback
  const calibrationPart1 = createCalibrationTrial(false, randomBounds());
  timeline.push(calibrationPart1);

  // After calibration part 1, calculate the median taps and log it
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: function () {
      const medianTaps = calculateMedianTapCount('calibration', NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS);
      jsPsych.data.addProperties({ medianTaps });
      console.log(`Median Tap Count from Calibration Part 1: ${medianTaps}`);
      return `<p>Press "Enter" to continue.</p>`;
    },
  });
  

  // Calibration trials with feedback
  const calibrationPart2 = {
    timeline: [
      countdownStep,
      {
        type: TaskPlugin,
        taskType: 'calibration',
        duration: TRIAL_DURATION,
        showThermometer: true,
        bounds: [40, 60],
        autoIncreaseAmount: function () {
          const medianTaps = jsPsych.data.get().values()[0].medianTaps;
          return 50 / medianTaps;
        },
        data: {
          task: 'calibration',
          showThermometer: true,
          bounds: [40, 60]
        }
      },
      {
        timeline: [releaseKeysStep],
        conditional_function: () => !jsPsych.data.getLastTrialData().values()[0].skipReleaseKeysStep,
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
      const medianTaps = calculateMedianTapCount('calibration', NUM_CALIBRATION_WITH_FEEDBACK_TRIALS);
      jsPsych.data.addProperties({ medianTaps });
      console.log(`Median Tap Count from Calibration Part 2: ${medianTaps}`);
      return `<p>Press "Enter" to continue.</p>`;
    },
  });


  //Validation Trial Creation
  const validationTrials = (bounds, difficultyLevel) => ({
    timeline: [
      countdownStep,
      {
        type: TaskPlugin,
        duration: TRIAL_DURATION,
        showThermometer: true,
        bounds,
        autoIncreaseAmount: function () {
          const medianTaps = jsPsych.data.get().values()[0].medianTaps;
          console.log(medianTaps)
          return 100 / medianTaps;
        },
        on_finish: function(data) {
          if (!data.success) {
            console.log('activated');
            console.log(data.success);
            validationResults[difficultyLevel]++;
            console.log('failures for:', [difficultyLevel], ' ', validationResults[difficultyLevel])
          }
        },
      },
      {
      timeline: [releaseKeysStep],
      conditional_function: () => !jsPsych.data.getLastTrialData().values()[0].skipReleaseKeysStep,
      }
    ],
    repetitions: NUM_VALIDATION_TRIALS
  });

  //Extra validation step (if user failed 2 or more in any of the levels in first validation step)
  const extraValidationTrials = (bounds, difficultyLevel) => ({
    timeline: [
      countdownStep,
      {
        type: TaskPlugin,
        duration: TRIAL_DURATION,
        showThermometer: true,
        bounds,
        autoIncreaseAmount: function () {
          const medianTaps = jsPsych.data.get().values()[0].medianTaps;
          console.log(medianTaps)
          return 100 / medianTaps;
        },
        on_finish: function(data) {
          if (!data.success) {
            console.log('activated');
            console.log(data.success);
            validationResults[difficultyLevel]++;
            console.log('failures for:', [difficultyLevel], ' ', validationResults[difficultyLevel])
          }
        },
        data: {
          showThermometer: true,
          bounds: bounds
        }
      },
      {
      timeline: [releaseKeysStep],
      conditional_function: () => !jsPsych.data.getLastTrialData().values()[0].skipReleaseKeysStep,
      }
    ],
    repetitions: 3
  });
  //Failed or Succeeded Validation
  const messageStep = {
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

  const extraValidationNode = {
    timeline: [extraValidationTrials(HARD_BOUNDS, 'extraValidation')],
    conditional_function: extraValidationLogic()
  };

  //Push Validation Trials
  timeline.push(validationTrials(EASY_BOUNDS, 'easy'))
  timeline.push(validationTrials(MEDIUM_BOUNDS, 'medium'))
  timeline.push(validationTrials(HARD_BOUNDS, 'hard'))
  timeline.push(extraValidationNode);
  timeline.push(messageStep);


  


  // Check if any condition failed more than twice

  
  // Define additional validation trials for the last bound condition



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
            type: TaskPlugin,
            taskType: 'thermometer',
            duration: TRIAL_DURATION,
            showThermometer: true,
            randomDelay,
            bounds,
            autoIncreaseAmount: function () {
              const medianTaps = jsPsych.data.get().values()[0].medianTaps;
              console.log(medianTaps)
              return 100 / medianTaps;
            },
            data: {
              task: 'thermometer',
              randomDelay: randomDelay,
              bounds: bounds
            }
          },
          releaseKeysStep,
        ],
        repetitions: NUM_DEMO_TRIALS,
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
  const createActualBlock = (blockName, randomDelay) => {
    const numRewardOptions = REWARD_OPTIONS.length;
    const numTrialsPerReward = Math.floor(NUM_TRIALS / numRewardOptions);
  
    // Create an array with each reward option repeated numTrialsPerReward times
    const trials = REWARD_OPTIONS.flatMap(reward => 
      Array(numTrialsPerReward).fill().map(() => ({
        reward: reward,
        accepted: false, // Initially set to false, will be updated in the trial
        randomDelay: randomDelay,
        bounds: randomBounds()
      }))
    );
  
    // Shuffle the trials to randomize their order
    const shuffledTrials = jsPsych.randomization.shuffle(trials);
  
    // Define the block timeline
    return {
      timeline: [
        {
          timeline: shuffledTrials.map(trialData => ({
            timeline: [
              {
                type: HtmlKeyboardResponsePlugin,
                stimulus: function() {
                  return `<p>Reward: $${(trialData.reward / 100).toFixed(2)}</p><p>Do you accept the trial? (Arrow Left = Yes, Arrow Right = No)</p>`;
                },
                choices: ['arrowleft', 'arrowright'],
                data: {
                  block: blockName,
                  phase: 'accept',
                  reward: trialData.reward / 100
                },
                on_finish: (data) => {
                  data.accepted = jsPsych.pluginAPI.compareKeys(data.response, 'arrowleft');
                  trialData.accepted = data.accepted; // Update the acceptance status in the trial data
                },
              },
              {
                timeline: [
                  countdownStep,
                  {
                    type: TaskPlugin,
                    taskType: 'thermometer',
                    duration: TRIAL_DURATION,
                    showThermometer: true,
                    randomDelay: trialData.randomDelay,
                    bounds: trialData.bounds,
                    autoIncreaseAmount: function () {
                      const medianTaps = jsPsych.data.get().values()[0].medianTaps;
                      console.log(medianTaps)
                      return 100 / medianTaps;
                    },
                    data: {
                      task: 'thermometer',
                      randomDelay: trialData.randomDelay,
                      reward: trialData.reward / 100
                    }
                  },
                  releaseKeysStep,
                ],
                conditional_function: () => trialData.accepted,
                data: { block: blockName, phase: 'perform' },
              }
            ]
          })),
          repetitions: NUM_TRIALS,
        },
        // Likert scale survey after block
        {
          type: surveyLikert,
          questions: likertQuestions,
          randomize_question_order: false,
          preamble: '<p>Please answer the following questions about the block.</p>',
          button_label: 'Continue'
        }
      ]
    };
  };
  
  
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

  // Calculate total reward at the end of the experiment
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: function() {
      // Filter trials that are accepted
      const acceptedTrials = jsPsych.data.get().filterCustom(trial => trial.accepted).values();
      console.log(acceptedTrials);
  
      // Calculate total reward for accepted trials
      const totalReward = acceptedTrials.reduce((sum, trial) => sum + trial.reward, 0);
  
      // Filter trials that are successful
      const successfulTrials = acceptedTrials.filter(trial => trial.success);
      console.log(successfulTrials);
  
      // Calculate total reward for successful trials
      const totalSuccessfulReward = successfulTrials.reduce((sum, trial) => sum + trial.reward, 0);
  
      return `<p>Your total reward is: $${totalReward.toFixed(2)}. 
              Total reward for successful trials is: $${totalSuccessfulReward.toFixed(2)}. 
              Press Enter to finish.</p>`;
    }
  });
  

  await jsPsych.run(timeline);

  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in on_finish())
  return jsPsych;
}