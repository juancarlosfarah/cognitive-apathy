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
  NUM_TRIALS,
  PARAMETER_COMBINATIONS,
  REWARD_TOTAL_MESSAGE,
  TRIAL_DURATION,
  EXPECTED_MAXIMUM_PERCENTAGE,
  PROGRESS_BAR,
  CONTINUE_BUTTON_MESSAGE,
  MEDIUM_BOUNDS,
  HARD_BOUNDS
} from './constants';
import { countdownStep } from './countdown';
import { likertFinalQuestion, likertIntro, likertIntroDemo, likertQuestions1, likertQuestions2Randomized } from './likert';
import { loadingBarTrial } from './loading-bar';
import { successScreen } from './success';
import { releaseKeysStep } from './release-keys';
import { acceptanceThermometer } from './stimulus';
import TaskPlugin from './task';
import { autoIncreaseAmount, calculateTotalReward, checkFlag, randomNumberBm, checkKeys, changeProgressBar } from './utils';
import { State, TaskTrialData, PassedTaskData, CreateTrialBlockParams } from './types'; // Assuming you have the appropriate types defined here
import { EASY_BOUNDS } from './constants';
import htmlButtonResponse from '@jspsych/plugin-html-button-response';
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
                  console.log(state.medianTaps);
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
                  console.log(`KEYS RELEASED FLAG: ${data.keysReleasedFlag}`)
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
                      return !state.minimumDemoTapsReached
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
      likertQuestions1,
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
        .fill(null)
        .map(() => ({
          reward: jsPsych.randomization.sampleWithReplacement(
            combination.reward,
            1,
          )[0],
          randomDelay: randomDelay,
          bounds: combination.bounds,
        })),
    );
    // Add 10% variation of bounds while keeping distance the same
    let differenceBetweenBounds = EASY_BOUNDS[1] - EASY_BOUNDS[0];
    for (let i = 0; i < trials.length; i++) {
      let center = (trials[i].bounds[0] + trials[i].bounds[1]) / 2;
      let min = center - (differenceBetweenBounds / 2) - (center - (differenceBetweenBounds / 2)) * 0.1;
      let max = center + (differenceBetweenBounds / 2) + (center + (differenceBetweenBounds / 2)) * 0.1;
      let newCenter = randomNumberBm(min, max);

      trials[i].bounds = [newCenter - (differenceBetweenBounds / 2), newCenter + (differenceBetweenBounds / 2)];
    }
    if ((window as any).Cypress) {
      (window as any).trials = trials;
    }
    // Shuffle the order of these trials
    trials = jsPsych.randomization.shuffle(trials);
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
              choices: ['arrowleft', 'arrowright'],
              data: {
                task: 'accept',
                reward: trialData.reward,
              },
              on_finish: (data: any) => {
                // ADD TYPE FOR DATA
                data.accepted = jsPsych.pluginAPI.compareKeys(
                  data.response,
                  'arrowleft',
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
                  task: 'block',
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
                    accept: () => {
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
                    console.log(data);
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
              conditional_function: () => trialData.accepted, // Use trialData.accepted in the conditional function
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
      likertFinalQuestion
    );
  }

  return { timeline };
};


// Function to create a trial that displays the accumulated reward to the user
export function createRewardDisplayTrial(jsPsych: JsPsych, state: State) {
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

// Array of trials that generates a 6 new random orders of the (3x3 factorial designed blocks of 63 trials) to complete the 3x3x3 factorial design.
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

// Randomly sample from the 3x3x3 factorial design to display 2 Synchronous Blocks of 63 trials,
// 2 Narrow Asynchronous Blocks of 63 trials, and 2 Wide Asynchronous Blocks of 63 trials for
// a total of 378 trials
export const sampledArray = (jsPsych: JsPsych, state: State) =>
  jsPsych.randomization.sampleWithoutReplacement(trialsArray(jsPsych, state), 6);
