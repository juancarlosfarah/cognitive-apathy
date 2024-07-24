"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationTrialExtra = exports.validationTrialHard = exports.validationTrialMedium = exports.validationTrialEasy = exports.validationResultScreen = exports.createValidationTrial = exports.handleValidationFinish = void 0;
const plugin_html_keyboard_response_1 = __importDefault(require("@jspsych/plugin-html-keyboard-response"));
const constants_1 = require("./constants");
const countdown_1 = require("./countdown");
const loading_bar_1 = require("./loading-bar");
const message_trials_1 = require("./message-trials");
const release_keys_1 = require("./release-keys");
const task_1 = __importDefault(require("./task"));
const utils_1 = require("./utils");
const finish_1 = require("./finish");
const handleValidationFinish = (data, validationName, state) => {
    if (validationName !== 'validationExtra') {
        if (!data.success) {
            state.validationFailures[validationName]++;
            if (Object.values(state.validationFailures).some(failures => failures >= Math.floor(0.75 * constants_1.NUM_VALIDATION_TRIALS))) {
                state.extraValidationRequired = true;
            }
        }
    }
    else {
        if (!data.success) {
            state.validationExtraFailures++;
        }
        if (state.validationExtraFailures >= constants_1.NUM_EXTRA_VALIDATION_TRIALS) {
            console.log(state.validationExtraFailures);
            console.log('more than 3 failures have been reached');
            state.validationSuccess = false;
        }
    }
};
exports.handleValidationFinish = handleValidationFinish;
const createValidationTrial = (bounds, validationName, repetitions, jsPsych, state) => ({
    timeline: [
        countdown_1.countdownStep,
        {
            type: task_1.default,
            task: validationName,
            duration: constants_1.TRIAL_DURATION,
            showThermometer: true,
            bounds: bounds,
            autoIncreaseAmount: function () {
                return (0, utils_1.autoIncreaseAmount)(constants_1.EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION, constants_1.TRIAL_DURATION, constants_1.AUTO_DECREASE_RATE, constants_1.AUTO_DECREASE_AMOUNT, state.medianTaps);
            },
            data: {
                task: validationName,
            },
            on_finish: function (data) {
                data.task = validationName;
                (0, exports.handleValidationFinish)(data, validationName, state);
            },
        },
        {
            timeline: [(0, message_trials_1.successScreen)(jsPsych)],
        },
        {
            timeline: [release_keys_1.releaseKeysStep],
            conditional_function: function () {
                return !(0, utils_1.checkFlag)(validationName, 'keysReleasedFlag', jsPsych);
            },
        },
        {
            timeline: [(0, loading_bar_1.loadingBarTrial)(true, jsPsych)],
        },
    ],
    repetitions: repetitions,
});
exports.createValidationTrial = createValidationTrial;
const validationResultScreen = (jsPsych, state) => ({
    type: plugin_html_keyboard_response_1.default,
    choices: ['enter'],
    stimulus: function () {
        return state.validationSuccess
            ? constants_1.PASSED_VALIDATION_MESSAGE
            : constants_1.FAILED_VALIDATION_MESSAGE;
    },
    on_finish: function () {
        if (!state.validationSuccess) {
            (0, finish_1.finishExperimentEarly)(jsPsych);
        }
    },
});
exports.validationResultScreen = validationResultScreen;
const validationTrialEasy = (jsPsych, state) => (0, exports.createValidationTrial)([30, 50], 'validationEasy', constants_1.NUM_VALIDATION_TRIALS, jsPsych, state);
exports.validationTrialEasy = validationTrialEasy;
const validationTrialMedium = (jsPsych, state) => (0, exports.createValidationTrial)([50, 70], 'validationMedium', constants_1.NUM_VALIDATION_TRIALS, jsPsych, state);
exports.validationTrialMedium = validationTrialMedium;
const validationTrialHard = (jsPsych, state) => (0, exports.createValidationTrial)([70, 90], 'validationHard', constants_1.NUM_VALIDATION_TRIALS, jsPsych, state);
exports.validationTrialHard = validationTrialHard;
const validationTrialExtra = (jsPsych, state) => (0, exports.createValidationTrial)([70, 90], 'validationExtra', constants_1.NUM_EXTRA_VALIDATION_TRIALS, jsPsych, state);
exports.validationTrialExtra = validationTrialExtra;
