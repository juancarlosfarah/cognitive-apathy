import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import { JsPsych } from 'jspsych';
import {
  AUTO_DECREASE_AMOUNT,
  AUTO_DECREASE_RATE,
  DEMO_TRIAL_MESSAGE,
  FAILED_MINIMUM_DEMO_TAPS_DURATION,
  FAILED_MINIMUM_DEMO_TAPS_MESSAGE,
  MINIMUM_DEMO_TAPS,
  NUM_DEMO_TRIALS,
  REWARD_TOTAL_MESSAGE,
  TRIAL_DURATION,
  EXPECTED_MAXIMUM_PERCENTAGE,
  PROGRESS_BAR,
  CONTINUE_BUTTON_MESSAGE,
  MEDIUM_BOUNDS,
  HARD_BOUNDS
} from './constants';
import { countdownStep } from './countdown';
import {likertFinalQuestion, likertQuestions1, likertQuestions2Randomized } from './likert';
import { loadingBarTrial } from './loading-bar';
import { successScreen } from './success';
import { releaseKeysStep } from './release-keys';
import { acceptanceThermometer } from './stimulus';
import TaskPlugin from './task';
import { autoIncreaseAmount, calculateTotalReward, checkFlag, checkKeys, changeProgressBar, saveDataToLocalStorage, createShuffledTrials, /* randomAcceptance */ } from './utils';
import { State, TaskTrialData, PassedTaskData, CreateTrialBlockParams } from './types'; // Assuming you have the appropriate types defined here
import { EASY_BOUNDS } from './constants';
import htmlButtonResponse from '@jspsych/plugin-html-button-response';
import { likertIntro, likertIntroDemo } from './message-trials';

/**
 * @const failedMinimumDemoTapsTrial
 * @description A jsPsych trial that displays a failure message when the participant fails to reach the minimum number of taps during a demo trial.
 * 
 * This trial includes:
 * - Displaying a red-colored failure message to the participant.
 * - Automatically ending the trial after a specified duration without requiring any key press.
 * 
 * @property {string} type - The plugin used for this trial (`HtmlKeyboardResponsePlugin`).
 * @property {string} stimulus - The failure message displayed to the participant.
 * @property {Array} choices - Specifies that no keys are allowed during this trial.
 * @property {number} trial_duration - The duration for which the failure message is displayed, in milliseconds.
 */
const failedMinimumDemoTapsTrial = {
  type: HtmlKeyboardResponsePlugin,
  stimulus: `<p style="color: red;">${FAILED_MINIMUM_DEMO_TAPS_MESSAGE}</p>`,
  choices: ['NO_KEYS'],
  trial_duration: FAILED_MINIMUM_DEMO_TAPS_DURATION,
};


/**
 * @function createTrialBlock
 * @description Creates a block of trials, optionally including demo trials, and randomizes trial parameters according to specified conditions.
 * 
 * This function includes:
 * - Optionally adding demo trials, each 3 with a different bound level (easy, medium, and hard) with a likert survey question afterwards.
 * - Adding acceptance and task performance phases to the timeline, with conditions for whether the trial proceeds based on participant input.
 * - Randomizing and shuffling trials based on different parameter combinations (reward, bounds).
 * - Returning a timeline that includes the trials and Likert scale surveys after each block.
 * 
 * @param {Object} params - The parameters for creating the trial block.
 * @param {string} params.blockName - The name of the block (e.g., 'Synchronous Block', 'Narrow Asynchronous Block').
 * @param {Array} params.randomDelay - An array specifying the minimum and maximum delay for increasing the mercury level after a key tap.
 * @param {Array} params.bounds - The bounds for the mercury level during the task.
 * @param {boolean} params.includeDemo - Whether to include demo trials at the beginning of the block.
 * @param {JsPsych} params.jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {Object} params.state - An object for storing and tracking state data during the trials.
 * 
 * @returns {Object} - An object containing the timeline of trials, including demo trials, task performance phases, and Likert scale surveys.
 */
export const createTrialBlock = ({
  blockName,
  randomDelay,
  bounds,
  includeDemo = false,
  jsPsych,
  state,
}: CreateTrialBlockParams) => {
  const timeline: any[] = [];

  if (includeDemo) {
    timeline.push(
      {
        type: htmlButtonResponse,
        stimulus: () => `<p>${DEMO_TRIAL_MESSAGE}</p>`,
        choices: [CONTINUE_BUTTON_MESSAGE],
        on_start: function(){
          changeProgressBar(
            `${PROGRESS_BAR.PROGRESS_BAR_TRIAL_BLOCKS}`, 
            ((jsPsych.progressBar?.progress || 0)+.1), 
            jsPsych
          )
          state.demoTrialSuccesses = 0; // Reset demo successes before starting
        }
      },
      // Demo trials
      {
        timeline: [
          {
            timeline: [
              countdownStep,
              {
                type: TaskPlugin,
                task: 'demo',
                duration: TRIAL_DURATION,
                showThermometer: true,
                randomDelay,
                bounds: function () {
                  if (state.demoTrialSuccesses === 0){
                    return EASY_BOUNDS
                  } else if (state.demoTrialSuccesses === 1){
                    return MEDIUM_BOUNDS
                  } else if (state.demoTrialSuccesses === 2){
                    return HARD_BOUNDS
                  } else return [0,0]
                },
                autoIncreaseAmount: function () {
                  return autoIncreaseAmount(
                    EXPECTED_MAXIMUM_PERCENTAGE,
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
                },
                on_start: function (data: any) {
                  const keyTappedEarlyFlag = checkFlag(
                    'countdown',
                    'keyTappedEarlyFlag',
                    jsPsych,
                  );
                  // Update the trial parameters with keyTappedEarlyFlag
                  data.keyTappedEarlyFlag = keyTappedEarlyFlag;
                },
                on_finish: function (data: TaskTrialData) {
                  // Check if minimum taps was reached
                  if (data.tapCount > MINIMUM_DEMO_TAPS) {
                    state.minimumDemoTapsReached = true;
                  }
                  if (!data.keysReleasedFlag && state.minimumDemoTapsReached && !data.keyTappedEarlyFlag) {
                    state.demoTrialSuccesses++;
                  }
                },
              },
              {
                timeline: [
                  {
                    timeline: [releaseKeysStep],
                    conditional_function: function () {
                      return checkKeys('demo', jsPsych)
                    },
                  },
                  {
                    timeline: [failedMinimumDemoTapsTrial],
                    // Check if minimum taps was reached in the last trial to determine whether 'failedMinimumDemoTapsTrial' should display
                    conditional_function: function () {
                      return (!state.minimumDemoTapsReached && !checkFlag('demo','keyTappedEarlyFlag',jsPsych) && !checkFlag('demo','keysReleasedFlag',jsPsych))
                    },
                  },
                  {
                    timeline: [loadingBarTrial(true, jsPsych)],
                  },
                ],
              },
            ],
            // Needed to put loop around its own timeline in order to achieve same functionality as jsPsych 7.0 
            loop_function: function () {
              const remainingSuccesses = NUM_DEMO_TRIALS - state.demoTrialSuccesses;
              return remainingSuccesses > 0; // Repeat the timeline if more successes are needed
            },
          },
        ],
      },
      // Likert scale survey after demo
      likertIntroDemo,
      ...likertQuestions1,
    );
  }

  // If a block created is an actual trial
  if (blockName) {
    let trials = createShuffledTrials({ randomDelay, jsPsych });
    timeline.push(
      {
        timeline: trials.map((trialData: PassedTaskData) => ({
          timeline: [
            // Acceptance Phase
            {
              type: HtmlKeyboardResponsePlugin,
              stimulus: function () {
                return `${acceptanceThermometer(trialData.bounds, trialData.reward)}`;
              },
              choices: ['arrowright', 'arrowleft'],
              data: {
                task: 'accept',
                reward: trialData.reward,
                bounds: trialData.bounds,
                originalBounds: trialData.originalBounds,
                delay: trialData.randomDelay
              },
              on_finish: (data: any) => {
                // ADD TYPE FOR DATA
                data.accepted = jsPsych.pluginAPI.compareKeys(
                  data.response,
                  'arrowright',
                );
                trialData.accepted = data.accepted; // Pass accepted to trialData
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
/*                   randomChanceAccepted: trialData.randomChanceAccepted,
 */                  task: 'block',
                  autoIncreaseAmount: function () {
                    return autoIncreaseAmount(
                      EXPECTED_MAXIMUM_PERCENTAGE,
                      TRIAL_DURATION,
                      AUTO_DECREASE_RATE,
                      AUTO_DECREASE_AMOUNT,
                      state.medianTaps,
                    );
                  },
                  data: {
                    task: 'block',
                    blockType: blockName,
/*                     randomChanceAccepted: trialData.randomChanceAccepted,
 */                    accept: () => {
                      const acceptanceData = jsPsych.data
                        .get()
                        .filter({ task: 'accept' })
                        .last(1)
                        .values()[0];
                      return acceptanceData ? acceptanceData.accepted : null;
                    },
                    reward: trialData.reward,
                  },
                  on_start: function (trial: TaskTrialData) {
                    const keyTappedEarlyFlag = checkFlag(
                      'countdown',
                      'keyTappedEarlyFlag',
                      jsPsych,
                    );
                    // Update the trial parameters with keyTappedEarlyFlag
                    trial.keyTappedEarlyFlag = keyTappedEarlyFlag;
                    return keyTappedEarlyFlag;
                  },
                  on_finish: function (data: TaskTrialData) {
                    data.medianTaps = {calibrationPart1Median: state.medianTapsPart1, calibrationPart2Median: state.medianTaps}
                    saveDataToLocalStorage(jsPsych)
                  },
                },
                  successScreen(jsPsych),
                {
                  timeline: [releaseKeysStep],
                  conditional_function: function () {
                    return checkKeys('success',jsPsych) && checkKeys('block', jsPsych)
                  },
                },
              ],
              conditional_function: () => trialData.accepted /* && trialData.randomChanceAccepted */, // Use trialData.accepted in the conditional function
            },
            {
              timeline: [loadingBarTrial(false, jsPsych)],
              conditional_function: () => !trialData.accepted, // Use trialData.accepted in the conditional function
            },
            {
              timeline: [loadingBarTrial(true, jsPsych)],
              conditional_function: () => trialData.accepted, // Use trialData.accepted in the conditional function
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
      likertIntro,
      ...likertQuestions2Randomized(jsPsych),
      likertFinalQuestion,
    );
  }

  return { timeline };
};


/**
 * @function createRewardDisplayTrial
 * @description Creates a trial that displays the accumulated reward to the participant after completing a block of trials.
 * 
 * This function includes:
 * - Calculating the total reward based on the participant's performance across trials.
 * - Displaying the reward to the participant in a message.
 * - Allowing the participant to proceed by clicking a button.
 * - Incrementing the count of completed blocks in the state object (for the sake of the progress bar control)
 * 
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {Object} state - An object for storing and tracking state data during the trials.
 * 
 * @returns {Object} - A jsPsych trial object that displays the accumulated reward and allows the participant to proceed.
 */export function createRewardDisplayTrial(jsPsych: JsPsych, state: State) {
  return {
    type: htmlButtonResponse,
    choices: [CONTINUE_BUTTON_MESSAGE],
    stimulus: function () {
      const totalSuccessfulReward = calculateTotalReward(jsPsych);
      return `<p>${REWARD_TOTAL_MESSAGE(totalSuccessfulReward.toFixed(2))}</p>`;
    },
    data: {
      task: 'display_reward',
    },
    on_finish: function (data: any) {
      const totalSuccessfulReward = calculateTotalReward(jsPsych);
      data.totalReward = totalSuccessfulReward;
      state.completedBlockCount++
    },
  };
}

/**
 * @function trialsArray
 * @description Generates an array of trial blocks that includes demo trials, task performance trials, and reward display trials.
 * 
 * This array includes:
 * - Two blocks of synchronous trials (with and without delay).
 * - Two blocks of narrow asynchronous trials.
 * - Two blocks of wide asynchronous trials.
 * - Each block is preceded by demo trials and followed by a reward display trial.
 * 
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {Object} state - An object for storing and tracking state data during the trials.
 * 
 * @returns {Array} - An array of arrays, where each sub-array contains the timeline for one of the trial blocks.
 */
export const trialsArray = (jsPsych: JsPsych, state: State) => [
  [
    // Demo trials
    createTrialBlock({
      randomDelay: [0, 0],
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
    // Display accumulated reward in between trials
    createRewardDisplayTrial(jsPsych, state),
  ],
  [
    // Demo trials
    createTrialBlock({
      randomDelay: [0, 0],
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
    createRewardDisplayTrial(jsPsych, state),
  ],
  [
    // Demo trials
    createTrialBlock({
      randomDelay: [400, 600],
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
    createRewardDisplayTrial(jsPsych, state),
  ],
  [
    createTrialBlock({
      // Demo trials
      randomDelay: [400, 600],
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
    createRewardDisplayTrial(jsPsych, state),
  ],
  [
    createTrialBlock({
      // Demo trials
      randomDelay: [0, 1000],
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
    createRewardDisplayTrial(jsPsych, state),
  ],
  [
    createTrialBlock({
      // Demo trials
      randomDelay: [0, 1000],
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
    createRewardDisplayTrial(jsPsych, state),
  ],
];

const syncBlock = (jsPsych: JsPsych, state: State) => 
[
  [
  // Demo trials
  createTrialBlock({
    randomDelay: [0, 0],
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
  // Display accumulated reward in between trials
  createRewardDisplayTrial(jsPsych, state),
  ],
]



const narrowAsyncBlock = (jsPsych: JsPsych, state: State) => 
[
  [
    // Demo trials
    createTrialBlock({
      randomDelay: [400, 600],
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
    createRewardDisplayTrial(jsPsych, state),
  ],
]




const wideAsyncBlock = (jsPsych: JsPsych, state: State) => 
[
  [
    createTrialBlock({
      // Demo trials
      randomDelay: [0, 1000],
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
    createRewardDisplayTrial(jsPsych, state),
  ],
]


export const trialOrders = (jsPsych: JsPsych, state: State) => ({
  S01: [
    narrowAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
  ],
  S02: [
    narrowAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
  ],
  S03: [
    narrowAsyncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
  ],
  S04: [
    syncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
  ],
  S05: [
    wideAsyncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
  ],
  S06: [
    syncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
  ],
  S07: [
    wideAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
  ],
  S08: [
    syncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
  ],
  S09: [
    narrowAsyncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
  ],
  S10: [
    syncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
  ],
  S11: [
    wideAsyncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
  ],
  S12: [
    narrowAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
  ],
  S13: [
    wideAsyncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
  ],
  S14: [
    syncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
  ],
  S15: [
    narrowAsyncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
  ],
  S16: [
    syncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
  ],
  S17: [
    wideAsyncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
  ],
  S18: [
    narrowAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
  ],
  S19: [
    wideAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
  ],
  S20: [
    wideAsyncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
],
S21: [
    narrowAsyncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
],
S22: [
    syncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
    narrowAsyncBlock(jsPsych, state),
    syncBlock(jsPsych, state),
    wideAsyncBlock(jsPsych, state),
],
});


/**
 * @function sampledArray
 * @description Randomly samples six trial blocks from the 3x3x3 factorial design, resulting in a total of 378 trials.
 * 
 * This function includes:
 * - Randomly selecting two blocks of synchronous trials, two blocks of narrow asynchronous trials, and two blocks of wide asynchronous trials.
 * - Ensuring that no trial blocks are repeated by sampling without replacement.
 * 
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {Object} state - An object for storing and tracking state data during the trials.
 * 
 * @returns {Array} - An array containing the sampled trial blocks, ready to be used in the experiment's timeline.
 */
export const sampledArray = (jsPsych: JsPsych, state: State) =>
  jsPsych.randomization.sampleWithoutReplacement(trialsArray(jsPsych, state), 6);

