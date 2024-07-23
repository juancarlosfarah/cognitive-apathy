import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';

import {
  AUTO_DECREASE_AMOUNT,
  AUTO_DECREASE_RATE,
  DEMO_TRIAL_MESSAGE,
  EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
  FAILED_MINIMUM_DEMO_TAPS_DURATION,
  FAILED_MINIMUM_DEMO_TAPS_MESSAGE,
  MINIMUM_DEMO_TAPS,
  NUM_DEMO_TRIALS,
  NUM_TRIALS,
  PARAMETER_COMBINATIONS,
  REWARD_TOTAL_MESSAGE,
  TRIAL_DURATION,
} from './constants';
import { countdownStep } from './countdown';
import { likertQuestions1, likertQuestions2 } from './likert';
import { loadingBarTrial } from './loading-bar';
import { successScreen } from './message-trials';
import { releaseKeysStep } from './release-keys';
import { acceptanceThermometer } from './stimulus';
import TaskPlugin from './task';
import { autoIncreaseAmount, checkFlag, calculateTotalReward } from './utils';

const failedMinimumDemoTapsTrial = {
  type: HtmlKeyboardResponsePlugin,
  stimulus: `<p style="color: red;">${FAILED_MINIMUM_DEMO_TAPS_MESSAGE}</p>`,
  choices: ['NO_KEYS'],
  trial_duration: FAILED_MINIMUM_DEMO_TAPS_DURATION,
};

export const createTrialBlock = ({
  blockName,
  randomDelay,
  bounds,
  includeDemo = false,
  jsPsych,
  state,
}) => {
  const timeline = [];

  if (includeDemo) {
    state.demoTrialSuccesses = 0; // Reset demo successes before starting

    timeline.push(
      // Alert before demo
      {
        type: HtmlKeyboardResponsePlugin,
        stimulus: () => `<p>${DEMO_TRIAL_MESSAGE}</p>`,
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
              console.log(state.medianTaps);
              return autoIncreaseAmount(
                EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
                TRIAL_DURATION,
                AUTO_DECREASE_RATE,
                AUTO_DECREASE_AMOUNT,
                state.medianTaps,
              );
            },
            data: {
              task: 'demo',
              randomDelay: randomDelay,
              bounds: bounds,
              minimumTapsReached: false,
            },
            on_start: function (trial) {
              const keyTappedEarlyFlag = checkFlag(
                'countdown',
                'keyTappedEarlyFlag',
                jsPsych,
              );
              // Update the trial parameters with keyTappedEarlyFlag
              trial.keyTappedEarlyFlag = keyTappedEarlyFlag;
              return keyTappedEarlyFlag;
            },
            on_finish: function (data) {
              // Check if minimum taps was reached
              if (data.tapCount > MINIMUM_DEMO_TAPS) {
                data.minimumTapsReached = true;
              }
              if (!data.keysReleasedFlag && data.minimumTapsReached) {
                state.demoTrialSuccesses++;
              }
            },
          },
          {
            timeline: [releaseKeysStep],
            conditional_function: function () {
              return !checkFlag('demo', 'keysReleasedFlag', jsPsych);
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
            timeline: [loadingBarTrial(true, jsPsych)],
          },
        ],
        loop_function: function () {
          const remainingSuccesses = NUM_DEMO_TRIALS - state.demoTrialSuccesses;
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
                      state.medianTaps,
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
                    const keyTappedEarlyFlag = checkFlag(
                      'countdown',
                      'keyTappedEarlyFlag',
                      jsPsych,
                    );
                    // Update the trial parameters with keyTappedEarlyFlag
                    trial.keyTappedEarlyFlag = keyTappedEarlyFlag;
                    return keyTappedEarlyFlag;
                  },
                  on_finish: function (data) {
                    console.log(data);
                  },
                },
                {
                  timeline: [successScreen(jsPsych)],
                },
                {
                  timeline: [releaseKeysStep],
                  conditional_function: function () {
                    return !checkFlag('block', 'keysReleasedFlag', jsPsych);
                  },
                },
              ],
              conditional_function: () => trialData.accepted,
            },
            {
              timeline: [loadingBarTrial(false, jsPsych)],
              conditional_function: () => !trialData.accepted,
            },
            {
              timeline: [loadingBarTrial(true, jsPsych)],
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



// Function to create a trial that displays the accumulated reward to the user
export function createRewardDisplayTrial(jsPsych) {
  return {
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: function () {
      const totalSuccessfulReward = calculateTotalReward(jsPsych);
      return `<p>${REWARD_TOTAL_MESSAGE(totalSuccessfulReward)}</p>`;
    },
    data: {
      task: 'display_reward',
    },
    on_finish: function (data) {
      const totalSuccessfulReward = calculateTotalReward(jsPsych);
      data.totalReward = totalSuccessfulReward;
    },
  };
}

// Array of trials that generates a 6 new random orders of the (3x3 factorial designed blocks of 63 trials) to complete the 3x3x3 factorial design.
export const trialsArray = (jsPsych, state) => [
  [
    // Demo trials
    createTrialBlock({
      randomDelay: [0, 0],
      bounds: [0, 0],
      includeDemo: true,
      jsPsych,
      state,
    }),
    // Synchronous Block of 63 trials
    createTrialBlock({
      blockName: 'Synchronous Block',
      randomDelay: [0, 0],
      jsPsych,
      state,
    }),
    // Display accumulated reward
    createRewardDisplayTrial(jsPsych),
  ],
  [
    // Demo trials
    createTrialBlock({
      randomDelay: [0, 0],
      bounds: [0, 0],
      includeDemo: true,
      jsPsych,
      state,
    }),
    // Synchronous Block of 63 trials
    createTrialBlock({
      blockName: 'Synchronous Block',
      randomDelay: [0, 0],
      jsPsych,
      state,
    }),
    // Display accumulated reward
    createRewardDisplayTrial(jsPsych),
  ],
  [
    // Demo trials
    createTrialBlock({
      randomDelay: [400, 600],
      bounds: [0, 0],
      includeDemo: true,
      jsPsych,
      state,
    }),
    // Narrow Asynchronous Block of 63 trials
    createTrialBlock({
      blockName: 'Narrow Asynchronous Block',
      randomDelay: [400, 600],
      jsPsych,
      state,
    }),
    // Display accumulated reward
    createRewardDisplayTrial(jsPsych),
  ],
  [
    createTrialBlock({
      // Demo trials
      randomDelay: [400, 600],
      bounds: [0, 0],
      includeDemo: true,
      jsPsych,
      state,
    }),
    createTrialBlock({
      // Narrow Asynchronous Block of 63 trials
      blockName: 'Narrow Asynchronous Block',
      randomDelay: [400, 600],
      jsPsych,
      state,
    }),
    // Display accumulated reward
    createRewardDisplayTrial(jsPsych),
  ],
  [
    createTrialBlock({
      // Demo trials
      randomDelay: [0, 1000],
      bounds: [0, 0],
      includeDemo: true,
      jsPsych,
      state,
    }),
    createTrialBlock({
      // Wide Asynchronous Block of 63 trials
      blockName: 'Wide Asynchronous Block',
      randomDelay: [0, 1000],
      jsPsych,
      state,
    }),
    // Display accumulated reward
    createRewardDisplayTrial(jsPsych),
  ],
  [
    createTrialBlock({
      // Demo trials
      randomDelay: [0, 1000],
      bounds: [0, 0],
      includeDemo: true,
      jsPsych,
      state,
    }),
    createTrialBlock({
      // Wide Asynchronous Block of 63 trials
      blockName: 'Wide Asynchronous Block',
      randomDelay: [0, 1000],
      jsPsych,
      state,
    }),
    // Display accumulated reward
    createRewardDisplayTrial(jsPsych),
  ],
];

// Randomly sample from the 3x3x3 factorial design to display 2 Synchronous Blocks of 63 trials,
// 2 Narrow Asynchronous Blocks of 63 trials, and 2 Wide Asynchronous Blocks of 63 trials for
// a total of 378 trials
export const sampledArray = (jsPsych, state) =>
  jsPsych.randomization.sampleWithoutReplacement(
    trialsArray(jsPsych, state),
    6,
  );
