"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conditionalCalibrationTrialPart2 = exports.calibrationTrialPart2 = exports.conditionalCalibrationTrialPart1 = exports.calibrationTrialPart1 = exports.createConditionalCalibrationTrial = exports.createCalibrationTrial = void 0;
const plugin_html_keyboard_response_1 = __importDefault(require("@jspsych/plugin-html-keyboard-response"));
const constants_1 = require("./constants");
const countdown_1 = require("./countdown");
const loading_bar_1 = require("./loading-bar");
const finish_1 = require("./finish");
const release_keys_1 = require("./release-keys");
const task_1 = __importDefault(require("./task"));
const utils_1 = require("./utils");
const createCalibrationTrial = ({ showThermometer, bounds, repetitions, calibrationPart, jsPsych, state, }) => {
    return {
        timeline: [
            countdown_1.countdownStep,
            {
                type: task_1.default,
                task: calibrationPart,
                duration: constants_1.TRIAL_DURATION,
                showThermometer,
                bounds,
                autoIncreaseAmount: function () {
                    // Determine which median to use for Part 2
                    let medianToUse = state.medianTaps;
                    if (calibrationPart === 'calibrationPart2') {
                        medianToUse =
                            state.medianTapsPart1 >= constants_1.MINIMUM_CALIBRATION_MEDIAN
                                ? state.medianTapsPart1
                                : state.conditionalMedianTapsPart1;
                    }
                    return (0, utils_1.autoIncreaseAmount)(constants_1.EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION, constants_1.TRIAL_DURATION, constants_1.AUTO_DECREASE_RATE, constants_1.AUTO_DECREASE_AMOUNT, medianToUse);
                },
                data: {
                    task: calibrationPart,
                    showThermometer,
                    bounds,
                },
                on_start: function (trial) {
                    const keyTappedEarlyFlag = (0, utils_1.checkFlag)('countdown', 'keyTappedEarlyFlag', jsPsych);
                    // Update the trial parameters with keyTappedEarlyFlag
                    trial.keyTappedEarlyFlag = keyTappedEarlyFlag;
                },
                on_finish: function (data) {
                    if (!data.keysReleasedFlag && !data.keyTappedEarlyFlag) {
                        calibrationPart === 'calibrationPart1'
                            ? state.calibrationPart1Successes++
                            : state.calibrationPart2Successes++;
                    }
                    console.log(`calibrationPart1Successes: ${state.calibrationPart1Successes}`);
                    console.log(`calibrationPart2Successes: ${state.calibrationPart2Successes}`);
                },
            },
            {
                timeline: [release_keys_1.releaseKeysStep],
                conditional_function: function () {
                    return !(0, utils_1.checkFlag)(calibrationPart, 'keysReleasedFlag', jsPsych);
                },
            },
            {
                timeline: [(0, loading_bar_1.loadingBarTrial)(true, jsPsych)],
            },
        ],
        repetitions: repetitions,
        loop_function: function () {
            const requiredSuccesses = calibrationPart === 'calibrationPart1'
                ? constants_1.NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS
                : constants_1.NUM_CALIBRATION_WITH_FEEDBACK_TRIALS;
            const currentSuccesses = calibrationPart === 'calibrationPart1'
                ? state.calibrationPart1Successes
                : state.calibrationPart2Successes;
            const remainingSuccesses = requiredSuccesses - currentSuccesses;
            console.log(`Remaining successes for ${calibrationPart}: ${remainingSuccesses}`);
            return remainingSuccesses > 0; // Repeat the timeline if more successes are needed
        },
    };
};
exports.createCalibrationTrial = createCalibrationTrial;
/**
 * @function createConditionalCalibrationTrial
 * @description Create a conditional calibration trial
 * @param {ConditionalCalibrationTrialParams} params - The parameters for the conditional calibration trial
 * @returns {Object} - jsPsych trial object
 */
const createConditionalCalibrationTrial = ({ calibrationPart, numTrials, jsPsych, state, }) => {
    return {
        timeline: [
            {
                type: plugin_html_keyboard_response_1.default,
                choices: ['enter'],
                stimulus: function () {
                    // Reset success counters
                    if (calibrationPart === 'calibrationPart1') {
                        state.calibrationPart1Successes = 0;
                    }
                    else {
                        state.calibrationPart2Successes = 0;
                    }
                    console.log(`Reset successes for ${calibrationPart}`);
                    return `<p>${constants_1.ADDITIONAL_CALIBRATION_PART_1_DIRECTIONS}</p>`;
                },
            },
            (0, exports.createCalibrationTrial)({
                showThermometer: calibrationPart === 'calibrationPart2',
                bounds: [
                    constants_1.EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
                    constants_1.EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
                ],
                repetitions: numTrials,
                calibrationPart,
                jsPsych,
                state,
            }),
            {
                timeline: [
                    (0, finish_1.finishExperimentEarlyTrial)(jsPsych),
                ],
                conditional_function: function () {
                    if (calibrationPart === 'calibrationPart1') {
                        state.conditionalMedianTapsPart1 = (0, utils_1.calculateMedianTapCount)(calibrationPart, numTrials, jsPsych);
                        console.log(`conditionalMedianTapsPart1: ${state.conditionalMedianTapsPart1}`);
                        return (state.conditionalMedianTapsPart1 < constants_1.MINIMUM_CALIBRATION_MEDIAN);
                    }
                    else {
                        state.conditionalMedianTapsPart2 = (0, utils_1.calculateMedianTapCount)(calibrationPart, numTrials, jsPsych);
                        console.log(`conditionalMedianTapsPart2: ${state.conditionalMedianTapsPart2}`);
                        return (state.conditionalMedianTapsPart2 < constants_1.MINIMUM_CALIBRATION_MEDIAN);
                    }
                },
            },
        ],
        conditional_function: function () {
            if (calibrationPart === 'calibrationPart1') {
                console.log(`medianTapsPart1: ${state.medianTapsPart1}`);
                return state.medianTapsPart1 < constants_1.MINIMUM_CALIBRATION_MEDIAN;
            }
            else {
                console.log(`medianTapsPart2: ${state.medianTapsPart2}`);
                return state.medianTapsPart2 < constants_1.MINIMUM_CALIBRATION_MEDIAN;
            }
        },
    };
};
exports.createConditionalCalibrationTrial = createConditionalCalibrationTrial;
const calibrationTrialPart1 = (jsPsych, state) => (0, exports.createCalibrationTrial)({
    showThermometer: false,
    bounds: [
        constants_1.EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
        constants_1.EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
    ],
    repetitions: constants_1.NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
    calibrationPart: 'calibrationPart1',
    jsPsych,
    state,
});
exports.calibrationTrialPart1 = calibrationTrialPart1;
const conditionalCalibrationTrialPart1 = (jsPsych, state) => (0, exports.createConditionalCalibrationTrial)({
    calibrationPart: 'calibrationPart1',
    numTrials: constants_1.NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
    jsPsych,
    state
});
exports.conditionalCalibrationTrialPart1 = conditionalCalibrationTrialPart1;
const calibrationTrialPart2 = (jsPsych, state) => (0, exports.createCalibrationTrial)({
    showThermometer: true,
    bounds: [
        constants_1.EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
        constants_1.EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
    ],
    repetitions: constants_1.NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
    calibrationPart: 'calibrationPart2',
    jsPsych,
    state,
});
exports.calibrationTrialPart2 = calibrationTrialPart2;
const conditionalCalibrationTrialPart2 = (jsPsych, state) => (0, exports.createConditionalCalibrationTrial)({
    calibrationPart: 'calibrationPart2',
    numTrials: constants_1.NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
    jsPsych,
    state
});
exports.conditionalCalibrationTrialPart2 = conditionalCalibrationTrialPart2;
