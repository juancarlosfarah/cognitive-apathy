"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMedianCalibrationPart2 = exports.calculateMedianCalibrationPart1 = exports.successScreen = exports.endExperimentTrial = void 0;
const plugin_html_keyboard_response_1 = __importDefault(require("@jspsych/plugin-html-keyboard-response"));
const utils_1 = require("./utils");
const constants_1 = require("./constants");
const endExperimentTrial = (message) => ({
    type: plugin_html_keyboard_response_1.default,
    choices: ['enter'],
    stimulus: `<p>${message}</p>`,
    on_finish: function (jsPsych) {
        console.log('Experiment ended:', message);
        jsPsych.endExperiment(message);
    },
});
exports.endExperimentTrial = endExperimentTrial;
const successScreen = (jsPsych) => ({
    type: plugin_html_keyboard_response_1.default,
    stimulus: function () {
        const previousTrial = jsPsych.data.get().last(1).values()[0];
        if (previousTrial.success) {
            return `<p style="color: green; font-size: 48px;">${constants_1.TRIAL_SUCCEEDED}</p>`;
        }
        else {
            return `<p style="color: red; font-size: 48px;">${constants_1.TRIAL_FAILED}</p>`;
        }
    },
    choices: 'NO_KEYS',
    trial_duration: constants_1.SUCCESS_SCREEN_DURATION,
    data: {
        task: 'success_screen',
    },
});
exports.successScreen = successScreen;
const calculateMedianCalibrationPart1 = (jsPsych, state) => ({
    type: plugin_html_keyboard_response_1.default,
    choices: ['enter'],
    stimulus: function () {
        state.medianTapsPart1 = (0, utils_1.calculateMedianTapCount)('calibrationPart1', constants_1.NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS, jsPsych);
        console.log(`medianTapsPart1: ${state.medianTapsPart1}`);
        if (state.medianTapsPart1 >= constants_1.MINIMUM_CALIBRATION_MEDIAN) {
            state.medianTaps = state.medianTapsPart1;
            console.log(`medianTaps updated to: ${state.medianTaps}`);
        }
        return `<p>${constants_1.CALIBRATION_PART_1_ENDING_MESSAGE}</p>`;
    },
});
exports.calculateMedianCalibrationPart1 = calculateMedianCalibrationPart1;
const calculateMedianCalibrationPart2 = (jsPsych, state) => ({
    type: plugin_html_keyboard_response_1.default,
    choices: ['enter'],
    stimulus: function () {
        state.medianTapsPart2 = (0, utils_1.calculateMedianTapCount)('calibrationPart2', constants_1.NUM_CALIBRATION_WITH_FEEDBACK_TRIALS, jsPsych);
        console.log(`medianTapsPart2: ${state.medianTapsPart2}`);
        if (state.medianTapsPart2 >= constants_1.MINIMUM_CALIBRATION_MEDIAN) {
            state.medianTaps = state.medianTapsPart2;
            console.log(`medianTaps updated to: ${state.medianTaps}`);
        }
        return `<p>${constants_1.CALIBRATION_PART_2_ENDING_MESSAGE}</p>`;
    },
});
exports.calculateMedianCalibrationPart2 = calculateMedianCalibrationPart2;
