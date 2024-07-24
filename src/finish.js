"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.finishExperimentEarlyTrial = exports.finishExperimentEarly = exports.finishExperiment = void 0;
const plugin_html_keyboard_response_1 = __importDefault(require("@jspsych/plugin-html-keyboard-response"));
const file_saver_1 = require("file-saver");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const finishExperiment = (jsPsych) => ({
    type: plugin_html_keyboard_response_1.default,
    choices: ['enter'],
    stimulus: function () {
        const totalSuccessfulReward = (0, utils_1.calculateTotalReward)(jsPsych);
        return `<p>${(0, constants_1.REWARD_TOTAL_MESSAGE)(totalSuccessfulReward.toFixed(2))}</p>`;
    },
    data: {
        task: 'finish_experiment',
    },
    on_finish: function (data) {
        const totalSuccessfulReward = (0, utils_1.calculateTotalReward)(jsPsych);
        data.totalReward = totalSuccessfulReward;
        const allData = jsPsych.data.get().json();
        const blob = new Blob([allData], { type: 'application/json' });
        (0, file_saver_1.saveAs)(blob, `experiment_data_${new Date().toISOString()}.json`);
    },
});
exports.finishExperiment = finishExperiment;
const finishExperimentEarly = (jsPsych) => {
    const allData = jsPsych.data.get().json();
    const blob = new Blob([allData], { type: 'application/json' });
    (0, file_saver_1.saveAs)(blob, `experiment_data_${new Date().toISOString()}.json`);
    jsPsych.endExperiment(constants_1.FAILED_VALIDATION_MESSAGE);
};
exports.finishExperimentEarly = finishExperimentEarly;
const finishExperimentEarlyTrial = (jsPsych) => ({
    type: plugin_html_keyboard_response_1.default,
    choices: ['enter'],
    stimulus: constants_1.FAILED_VALIDATION_MESSAGE,
    data: {
        task: 'finish_experiment',
    },
    on_finish: function (data) {
        const allData = jsPsych.data.get().json();
        const blob = new Blob([allData], { type: 'application/json' });
        (0, file_saver_1.saveAs)(blob, `experiment_data_${new Date().toISOString()}.json`);
    },
});
exports.finishExperimentEarlyTrial = finishExperimentEarlyTrial;
