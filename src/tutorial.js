"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.practiceLoop = exports.practiceTrial = exports.validationVideoTutorialTrial = exports.validationVideoTutorial = exports.stimuliVideoTutorialTrial = exports.stimuliVideoTutorial = exports.noStimuliVideoTutorialTrial = exports.noStimuliVideoTutorial = exports.dominantHand = exports.DOMINANT_HAND = exports.instructionalTrial = exports.interactiveCountdown = void 0;
const plugin_html_button_response_1 = __importDefault(require("@jspsych/plugin-html-button-response"));
const plugin_html_keyboard_response_1 = __importDefault(require("@jspsych/plugin-html-keyboard-response"));
const constants_1 = require("./constants");
const countdown_1 = require("./countdown");
const loading_bar_1 = require("./loading-bar");
const release_keys_1 = require("./release-keys");
const stimulus_1 = require("./stimulus");
const task_1 = __importDefault(require("./task"));
const utils_1 = require("./utils");
exports.interactiveCountdown = {
    type: countdown_1.CountdownTrialPlugin,
    message: constants_1.INTERACTIVE_KEYBOARD_TUTORIAL_MESSAGE,
    showKeyboard: true,
    data: {
        task: 'countdown',
    },
};
const instructionalTrial = (message) => ({
    type: plugin_html_keyboard_response_1.default,
    choices: ['Enter'],
    stimulus: function () {
        return (0, stimulus_1.videoStimulus)(message);
    },
});
exports.instructionalTrial = instructionalTrial;
exports.DOMINANT_HAND = 'right';
exports.dominantHand = {
    type: plugin_html_button_response_1.default,
    stimulus: constants_1.DOMINANT_HAND_MESSAGE,
    choices: ['Left handed', 'Right handed'],
    data: {
        task: 'dominant-hand',
    },
    on_finish: function (data) {
        if (data.response === 0) {
            exports.DOMINANT_HAND = 'left';
        }
        else {
            exports.DOMINANT_HAND = 'right';
        }
    },
};
exports.noStimuliVideoTutorial = {
    type: plugin_html_button_response_1.default,
    stimulus: [stimulus_1.noStimuliVideo],
    choices: [constants_1.CONTINUE_BUTTON_MESSAGE],
    enable_button_after: 15000,
};
const noStimuliVideoTutorialTrial = (jsPsych) => ({
    timeline: [exports.noStimuliVideoTutorial],
    on_finish: function () {
        // Clear the display element
        jsPsych.getDisplayElement().innerHTML = '';
    },
});
exports.noStimuliVideoTutorialTrial = noStimuliVideoTutorialTrial;
exports.stimuliVideoTutorial = {
    type: plugin_html_button_response_1.default,
    stimulus: [stimulus_1.stimuliVideo],
    choices: [constants_1.CONTINUE_BUTTON_MESSAGE],
    enable_button_after: 15000,
};
const stimuliVideoTutorialTrial = (jsPsych) => ({
    timeline: [exports.stimuliVideoTutorial],
    on_finish: function () {
        // Clear the display element
        jsPsych.getDisplayElement().innerHTML = '';
    },
});
exports.stimuliVideoTutorialTrial = stimuliVideoTutorialTrial;
exports.validationVideoTutorial = {
    type: plugin_html_button_response_1.default,
    stimulus: [stimulus_1.validationVideo],
    choices: [constants_1.CONTINUE_BUTTON_MESSAGE],
    enable_button_after: 15000,
};
const validationVideoTutorialTrial = (jsPsych) => ({
    timeline: [exports.validationVideoTutorial],
    on_finish: function () {
        // Clear the display element
        jsPsych.getDisplayElement().innerHTML = '';
    },
});
exports.validationVideoTutorialTrial = validationVideoTutorialTrial;
const practiceTrial = (jsPsych) => ({
    timeline: [
        {
            type: task_1.default,
            showThermometer: false,
            data: {
                task: 'practice',
            },
            on_start: function (trial) {
                // ADD TYPE FOR TRIAL
                const keyTappedEarlyFlag = (0, utils_1.checkFlag)('countdown', 'keyTappedEarlyFlag', jsPsych);
                // Update the trial parameters with keyTappedEarlyFlag
                trial.keyTappedEarlyFlag = keyTappedEarlyFlag;
            },
        },
        {
            timeline: [release_keys_1.releaseKeysStep],
            conditional_function: function () {
                return !(0, utils_1.checkFlag)('practice', 'keysReleasedFlag', jsPsych);
            },
        },
    ],
});
exports.practiceTrial = practiceTrial;
const practiceLoop = (jsPsych) => ({
    timeline: [
        exports.interactiveCountdown,
        {
            type: plugin_html_keyboard_response_1.default,
            stimulus: `<p style="color: green; font-size: 48px;">${constants_1.GO_MESSAGE}</p>`,
            choices: 'NO_KEYS',
            trial_duration: constants_1.GO_DURATION, // Display "GO" for 1 second
            data: {
                task: 'go_screen',
            },
        },
        (0, exports.practiceTrial)(jsPsych),
        (0, loading_bar_1.loadingBarTrial)(true, jsPsych),
    ],
    // Repeat if the keys were released early or if user tapped before go.
    loop_function: function () {
        const keyTappedEarlyFlag = (0, utils_1.checkFlag)('countdown', 'keyTappedEarlyFlag', jsPsych);
        const keysReleasedFlag = (0, utils_1.checkFlag)('practice', 'keysReleasedFlag', jsPsych);
        const numberOfTaps = jsPsych.data
            .get()
            .filter({ task: 'practice' })
            .last(1)
            .values()[0]
            .tapCount;
        return keysReleasedFlag || keyTappedEarlyFlag || numberOfTaps < constants_1.MINIMUM_CALIBRATION_MEDIAN;
    },
});
exports.practiceLoop = practiceLoop;
