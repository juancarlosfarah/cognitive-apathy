"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sampledArray = exports.trialsArray = exports.createTrialBlock = void 0;
exports.createRewardDisplayTrial = createRewardDisplayTrial;
const plugin_html_keyboard_response_1 = __importDefault(require("@jspsych/plugin-html-keyboard-response"));
const constants_1 = require("./constants");
const countdown_1 = require("./countdown");
const likert_1 = require("./likert");
const loading_bar_1 = require("./loading-bar");
const message_trials_1 = require("./message-trials");
const release_keys_1 = require("./release-keys");
const stimulus_1 = require("./stimulus");
const task_1 = __importDefault(require("./task"));
const utils_1 = require("./utils");
const failedMinimumDemoTapsTrial = {
    type: plugin_html_keyboard_response_1.default,
    stimulus: `<p style="color: red;">${constants_1.FAILED_MINIMUM_DEMO_TAPS_MESSAGE}</p>`,
    choices: ['NO_KEYS'],
    trial_duration: constants_1.FAILED_MINIMUM_DEMO_TAPS_DURATION,
};
const createTrialBlock = ({ blockName, randomDelay, bounds, includeDemo = false, jsPsych, state, }) => {
    const timeline = [];
    if (includeDemo) {
        state.demoTrialSuccesses = 0; // Reset demo successes before starting
        timeline.push(
        // Alert before demo
        {
            type: plugin_html_keyboard_response_1.default,
            stimulus: () => `<p>${constants_1.DEMO_TRIAL_MESSAGE}</p>`,
            choices: ['enter'],
        }, 
        // Demo trials
        {
            timeline: [
                countdown_1.countdownStep,
                {
                    type: task_1.default,
                    task: blockName,
                    duration: constants_1.TRIAL_DURATION,
                    showThermometer: true,
                    randomDelay,
                    bounds,
                    autoIncreaseAmount: function () {
                        console.log(state.medianTaps);
                        return (0, utils_1.autoIncreaseAmount)(constants_1.EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION, constants_1.TRIAL_DURATION, constants_1.AUTO_DECREASE_RATE, constants_1.AUTO_DECREASE_AMOUNT, state.medianTaps);
                    },
                    data: {
                        task: 'demo',
                        randomDelay: randomDelay,
                        bounds: bounds,
                        minimumTapsReached: false,
                    },
                    on_start: function (data) {
                        const keyTappedEarlyFlag = (0, utils_1.checkFlag)('countdown', 'keyTappedEarlyFlag', jsPsych);
                        // Update the trial parameters with keyTappedEarlyFlag
                        data.keyTappedEarlyFlag = keyTappedEarlyFlag;
                    },
                    on_finish: function (data) {
                        // Check if minimum taps was reached
                        if (data.tapCount > constants_1.MINIMUM_DEMO_TAPS) {
                            data.minimumTapsReached = true;
                        }
                        if (!data.keysReleasedFlag && data.minimumTapsReached && !data.keyTappedEarlyFlag) {
                            state.demoTrialSuccesses++;
                        }
                    },
                },
                {
                    timeline: [release_keys_1.releaseKeysStep],
                    conditional_function: function () {
                        return !(0, utils_1.checkFlag)('demo', 'keysReleasedFlag', jsPsych);
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
                        return !lastTrialData.minimumTapsReached && !lastTrialData.keyTappedEarlyFlag;
                    },
                },
                {
                    timeline: [(0, loading_bar_1.loadingBarTrial)(true, jsPsych)],
                },
            ],
            loop_function: function () {
                const remainingSuccesses = constants_1.NUM_DEMO_TRIALS - state.demoTrialSuccesses;
                return remainingSuccesses > 0; // Repeat the timeline if more successes are needed
            },
        }, 
        // Likert scale survey after demo
        ...likert_1.likertQuestions1);
    }
    // If a block created is an actual trial
    if (blockName) {
        // Create the number of full combination of trials (63 trials  / (3 x 3) factorial design = 7 sets of these 9 trials)
        const numTrialsPerCombination = Math.floor(constants_1.NUM_TRIALS / constants_1.PARAMETER_COMBINATIONS.length);
        // Randomly map each of these combination parameters to each trial within 63 created samples
        let trials = constants_1.PARAMETER_COMBINATIONS.flatMap((combination) => Array(numTrialsPerCombination)
            .fill(null)
            .map(() => ({
            reward: jsPsych.randomization.sampleWithReplacement(combination.reward, 1)[0],
            randomDelay: randomDelay,
            bounds: combination.bounds,
        })));
        // Shuffle the order of these trials
        trials = jsPsych.randomization.shuffle(trials);
        timeline.push({
            timeline: trials.map((trialData) => ({
                timeline: [
                    // Acceptance Phase
                    {
                        type: plugin_html_keyboard_response_1.default,
                        stimulus: function () {
                            return `${(0, stimulus_1.acceptanceThermometer)(trialData.bounds, trialData.reward)}`;
                        },
                        choices: ['arrowleft', 'arrowright'],
                        data: {
                            task: 'accept',
                            reward: trialData.reward,
                        },
                        on_finish: (data) => {
                            // ADD TYPE FOR DATA
                            data.accepted = jsPsych.pluginAPI.compareKeys(data.response, 'arrowleft');
                            trialData.accepted = data.accepted; // Pass accepted to trialData
                        },
                    },
                    // Task Performance Phase (only if accepted)
                    {
                        timeline: [
                            countdown_1.countdownStep,
                            {
                                type: task_1.default,
                                duration: constants_1.TRIAL_DURATION,
                                showThermometer: true,
                                randomDelay: trialData.randomDelay,
                                bounds: trialData.bounds,
                                reward: trialData.reward,
                                autoIncreaseAmount: function () {
                                    return (0, utils_1.autoIncreaseAmount)(constants_1.EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION, constants_1.TRIAL_DURATION, constants_1.AUTO_DECREASE_RATE, constants_1.AUTO_DECREASE_AMOUNT, state.medianTaps);
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
                                on_start: function (trial) {
                                    const keyTappedEarlyFlag = (0, utils_1.checkFlag)('countdown', 'keyTappedEarlyFlag', jsPsych);
                                    // Update the trial parameters with keyTappedEarlyFlag
                                    trial.keyTappedEarlyFlag = keyTappedEarlyFlag;
                                    return keyTappedEarlyFlag;
                                },
                                on_finish: function (data) {
                                    console.log(data);
                                },
                            },
                            {
                                timeline: [(0, message_trials_1.successScreen)(jsPsych)],
                            },
                            {
                                timeline: [release_keys_1.releaseKeysStep],
                                conditional_function: function () {
                                    return !(0, utils_1.checkFlag)('block', 'keysReleasedFlag', jsPsych);
                                },
                            },
                        ],
                        conditional_function: () => trialData.accepted, // Use trialData.accepted in the conditional function
                    },
                    {
                        timeline: [(0, loading_bar_1.loadingBarTrial)(false, jsPsych)],
                        conditional_function: () => !trialData.accepted, // Use trialData.accepted in the conditional function
                    },
                    {
                        timeline: [(0, loading_bar_1.loadingBarTrial)(true, jsPsych)],
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
        ...likert_1.likertQuestions2);
    }
    return { timeline };
};
exports.createTrialBlock = createTrialBlock;
// Function to create a trial that displays the accumulated reward to the user
function createRewardDisplayTrial(jsPsych) {
    return {
        type: plugin_html_keyboard_response_1.default,
        choices: ['enter'],
        stimulus: function () {
            const totalSuccessfulReward = (0, utils_1.calculateTotalReward)(jsPsych);
            return `<p>${(0, constants_1.REWARD_TOTAL_MESSAGE)(totalSuccessfulReward.toFixed(2))}</p>`;
        },
        data: {
            task: 'display_reward',
        },
        on_finish: function (data) {
            const totalSuccessfulReward = (0, utils_1.calculateTotalReward)(jsPsych);
            data.totalReward = totalSuccessfulReward;
        },
    };
}
// Array of trials that generates a 6 new random orders of the (3x3 factorial designed blocks of 63 trials) to complete the 3x3x3 factorial design.
const trialsArray = (jsPsych, state) => [
    [
        // Demo trials
        (0, exports.createTrialBlock)({
            randomDelay: [0, 0],
            bounds: [0, 0],
            includeDemo: true,
            jsPsych,
            state,
        }),
        // Synchronous Block of 63 trials
        (0, exports.createTrialBlock)({
            blockName: 'Synchronous Block',
            randomDelay: [0, 0],
            jsPsych,
            state,
        }),
        // Display accumulated reward in between trials
        createRewardDisplayTrial(jsPsych),
    ],
    [
        // Demo trials
        (0, exports.createTrialBlock)({
            randomDelay: [0, 0],
            bounds: [0, 0],
            includeDemo: true,
            jsPsych,
            state,
        }),
        // Synchronous Block of 63 trials
        (0, exports.createTrialBlock)({
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
        (0, exports.createTrialBlock)({
            randomDelay: [400, 600],
            bounds: [0, 0],
            includeDemo: true,
            jsPsych,
            state,
        }),
        // Narrow Asynchronous Block of 63 trials
        (0, exports.createTrialBlock)({
            blockName: 'Narrow Asynchronous Block',
            randomDelay: [400, 600],
            jsPsych,
            state,
        }),
        // Display accumulated reward
        createRewardDisplayTrial(jsPsych),
    ],
    [
        (0, exports.createTrialBlock)({
            // Demo trials
            randomDelay: [400, 600],
            bounds: [0, 0],
            includeDemo: true,
            jsPsych,
            state,
        }),
        (0, exports.createTrialBlock)({
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
        (0, exports.createTrialBlock)({
            // Demo trials
            randomDelay: [0, 1000],
            bounds: [0, 0],
            includeDemo: true,
            jsPsych,
            state,
        }),
        (0, exports.createTrialBlock)({
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
        (0, exports.createTrialBlock)({
            // Demo trials
            randomDelay: [0, 1000],
            bounds: [0, 0],
            includeDemo: true,
            jsPsych,
            state,
        }),
        (0, exports.createTrialBlock)({
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
exports.trialsArray = trialsArray;
// Randomly sample from the 3x3x3 factorial design to display 2 Synchronous Blocks of 63 trials,
// 2 Narrow Asynchronous Blocks of 63 trials, and 2 Wide Asynchronous Blocks of 63 trials for
// a total of 378 trials
const sampledArray = (jsPsych, state) => jsPsych.randomization.sampleWithoutReplacement((0, exports.trialsArray)(jsPsych, state), 6);
exports.sampledArray = sampledArray;
