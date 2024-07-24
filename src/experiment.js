"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const plugin_preload_1 = __importDefault(require("@jspsych/plugin-preload"));
const jspsych_1 = require("jspsych");
require("../styles/main.scss");
const calibration_1 = require("./calibration");
const constants_1 = require("./constants");
const finish_1 = require("./finish");
const message_trials_1 = require("./message-trials");
const trials_1 = require("./trials");
const tutorial_1 = require("./tutorial");
const validation_1 = require("./validation");
let state = {
    medianTaps: 0,
    medianTapsPart1: 0,
    medianTapsPart2: 0,
    calibrationPart1Successes: 0,
    calibrationPart2Successes: 0,
    conditionalMedianTapsPart1: 0,
    conditionalMedianTapsPart2: 0,
    validationExtraFailures: 0,
    validationSuccess: true,
    extraValidationRequired: false,
    validationFailures: {
        'validationEasy': 0,
        'validationMedium': 0,
        'validationHard': 0,
    },
    failedMinimumDemoTapsTrial: 0,
    demoTrialSuccesses: 0,
};
require("./i18n");
/**
 * @function run
 * @description Main function to run the experiment
 * @param {Object} config - Configuration object for the experiment
 */
function run(_a) {
    return __awaiter(this, arguments, void 0, function* ({ assetPaths, input = {}, environment, title, version, }) {
        const jsPsych = (0, jspsych_1.initJsPsych)();
        const timeline = [];
        timeline.push({
            type: plugin_preload_1.default,
            audio: assetPaths.audio,
            video: '../assets/videos',
        });
        timeline.push((0, tutorial_1.noStimuliVideoTutorialTrial)(jsPsych));
        timeline.push((0, tutorial_1.practiceLoop)(jsPsych));
        timeline.push((0, tutorial_1.instructionalTrial)(constants_1.CALIBRATION_PART_1_DIRECTIONS));
        timeline.push((0, calibration_1.calibrationTrialPart1)(jsPsych, state)),
            timeline.push((0, calibration_1.conditionalCalibrationTrialPart1)(jsPsych, state));
        timeline.push((0, message_trials_1.calculateMedianCalibrationPart1)(jsPsych, state));
        timeline.push((0, tutorial_1.stimuliVideoTutorialTrial)(jsPsych));
        timeline.push({
            timeline: [(0, calibration_1.calibrationTrialPart2)(jsPsych, state)],
        });
        timeline.push((0, calibration_1.conditionalCalibrationTrialPart2)(jsPsych, state));
        timeline.push((0, message_trials_1.calculateMedianCalibrationPart2)(jsPsych, state));
        timeline.push((0, tutorial_1.validationVideoTutorialTrial)(jsPsych));
        timeline.push({
            timeline: [(0, validation_1.validationTrialEasy)(jsPsych, state)],
        });
        timeline.push({
            timeline: [(0, validation_1.validationTrialMedium)(jsPsych, state)],
        });
        timeline.push({
            timeline: [(0, validation_1.validationTrialHard)(jsPsych, state)],
        });
        timeline.push({
            timeline: [(0, validation_1.validationTrialExtra)(jsPsych, state)],
            conditional_function: function () {
                return state.extraValidationRequired;
            },
        });
        timeline.push({
            timeline: [(0, validation_1.validationResultScreen)(jsPsych, state)]
        });
        const sampledTrials = (0, trials_1.sampledArray)(jsPsych, state);
        sampledTrials.forEach((trialBlock) => {
            trialBlock.forEach((trial) => {
                timeline.push(trial);
            });
        });
        timeline.push((0, finish_1.finishExperiment)(jsPsych));
        yield jsPsych.run(timeline);
        return jsPsych;
    });
}
