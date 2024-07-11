/**
 * @title Cognitive Apathy Experiment
 * @description This experiment aims to measure cognitive apathy using calibration and thermometer tasks.
 * @version 0.1.0
 *
 * @assets assets/
 */

import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import jsPsychCallFunction from '@jspsych/plugin-call-function';
import PreloadPlugin from '@jspsych/plugin-preload';
import surveyLikert from '@jspsych/plugin-survey-likert';
import { ParameterType, initJsPsych } from 'jspsych';
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
  PARAMETER_COMBINATIONS_TOTAL,
  CALIBRATION_PART_2_DIRECTIONS,
  CALIBRATION_PART_1_DIRECTIONS,
  VALIDATION_DIRECTIONS,
} from './constants';

import {
  blockWelcomeMessage,
} from './stimulus';


export async function run({ assetPaths, input = {}, environment, title, version }) {
  const jsPsych = initJsPsych();

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
    conditional_function: function(){
      return jsPsych.data.get().last(1).values()[0].keysReleasedFlag;  
    },
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

  const directionTrial = (message, video) => ({
    type: HtmlKeyboardResponsePlugin,
    choices: ['Enter'],
    stimulus: function() {
        return `<p>${message}</p>`;
    }
});

  
  // Function to dynamically create a timeline step based on the previous trial's outcome
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
      },
    ],
    repetitions: NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
  });

  // Calibration trials without feedback
  const calibrationPart1 = createCalibrationTrial(false, randomBounds());


  


  // After calibration part 1, calculate the median taps and log it
  const calculateTapsStep = (message) => ({
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: function () {
      const medianTaps = calculateMedianTapCount('calibration', NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS);
      jsPsych.data.addProperties({ medianTaps });
      return `<p>(${CALIBRATION_PART_2_DIRECTIONS});</p>`;
    },
  });
  

  // Calibration trials with feedback
  const calibrationPart2 = {
    timeline: [
      countdownStep,
      {
        type: TaskPlugin,
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
        timeline: [releaseKeysStep]      },
    ],
    repetitions: NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
  };





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
  const validationSucesss = {
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

  //Push All Trials
  timeline.push(directionTrial(CALIBRATION_PART_1_DIRECTIONS))
  timeline.push(calibrationPart1);
  timeline.push(calculateTapsStep(CALIBRATION_PART_2_DIRECTIONS))
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

  // Common function for blocks
  const createBlock = (randomDelay, bounds) => ({
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



  const createActualBlock = (blockName, randomDelay) => {
    const numTrialsPerCombination = Math.floor(NUM_TRIALS / PARAMETER_COMBINATIONS.length);
  
    // Create an array with each parameter combination repeated numTrialsPerCombination times
    let trials = PARAMETER_COMBINATIONS.flatMap(combination => 
      Array(numTrialsPerCombination).fill().map(() => ({
        reward: combination.reward,
        success: false, // Initially set to false, will be updated in the trial
        randomDelay: randomDelay,
        bounds: combination.bounds
      }))
    );
  
    // Shuffle the trials to randomize their order
    trials = jsPsych.randomization.shuffle(trials);
  
    // Define the block timeline
    return {
      timeline: [
        {
          timeline: trials.map(trialData => ({
            timeline: [
              // Acceptance Phase
              {
                type: HtmlKeyboardResponsePlugin,
                stimulus: function() {
                  return `<p>Reward: $${(trialData.reward / 100).toFixed(2)}</p><p>Do you accept the trial? (Arrow Left = Yes, Arrow Right = No)</p>`;
                },
                choices: ['arrowleft', 'arrowright'],
                data: {
                  task: 'block', // Add the task name here
                  phase: 'accept',
                  reward: trialData.reward / 100,
                },
                on_finish: (data) => {
                  data.accepted = jsPsych.pluginAPI.compareKeys(data.response, 'arrowleft');
                  trialData.accepted = data.accepted; // Update the acceptance status in the trial data
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
                    autoIncreaseAmount: function () {
                      const medianTaps = jsPsych.data.get().values()[0].medianTaps;
                      return 100 / medianTaps;
                    },
                    on_finish: (data) => {
                      console.log('trial successful?:' , data.success);
                    },
                    data: {
                      task: 'block', // Add the task name here
                    }
                  },
                  releaseKeysStep,
                ],
                conditional_function: () => trialData.accepted, // Only run if accepted
              }
            ]
          })),
          sample: {
            type: 'without-replacement',
            size: trials
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
      ]
    };
  };
  
  // Synchronous block
  timeline.push({ type: HtmlKeyboardResponsePlugin, choices: ['enter'], stimulus: blockWelcomeMessage('Synchronous Block') });
  timeline.push(createBlock([0, 0], [60,80]));
  timeline.push(createActualBlock('Synchronous Block', [0, 0], randomBounds()));

  // Narrow Asynchronous block
  timeline.push({ type: HtmlKeyboardResponsePlugin, choices: ['enter'], stimulus: blockWelcomeMessage('Narrow Asynchronous Block') });
  timeline.push(createBlock([400, 600], [60,80]));
  timeline.push(createActualBlock('Narrow Asynchronous Block', [400, 600]));

  // Wide Asynchronous block
  timeline.push({ type: HtmlKeyboardResponsePlugin, choices: ['enter'], stimulus: blockWelcomeMessage('Wide Asynchronous Block') });
  timeline.push(createBlock([0, 1000], [60,80]));
  timeline.push(createActualBlock('Wide Asynchronous Block', [0, 1000]));
  
  // Calculate total reward at the end of the experiment


  const saveData = {
    type: jsPsychCallFunction,
    async: true,
    func: function(done) {
      // Filter trials that are part of the blocks
      const blockTrials = jsPsych.data.get().filter({task: 'block'}).values();
      console.log(blockTrials);
      
      // Filter trials that are successful
      const successfulTrials = blockTrials.filter(trial => trial.success === true);
      console.log(successfulTrials);
      
      // Calculate total reward for successful trials
      const totalSuccessfulReward = successfulTrials.reduce((sum, trial) => sum + trial.reward, 0);
      jsPsych.data.addProperties({ total_successful_reward: totalSuccessfulReward });
      
      done();  // Indicate that the asynchronous operation is complete
    }
  };
  
  timeline.push(saveData);
  
  // Start

/*   // Switch to fullscreen
  timeline.push({ type: FullscreenPlugin, fullscreen_mode: true }); */

  await jsPsych.run(timeline);

  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in on_finish())
  return jsPsych;
}``