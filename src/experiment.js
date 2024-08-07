import { __awaiter } from "tslib";
/**
 * @title Cognitive Apathy Experiment
 * @description This experiment aims to measure cognitive apathy using calibration and thermometer tasks.
 * @version 0.1.0
 *
 * @assets assets/
 */
import PreloadPlugin from '@jspsych/plugin-preload';
import { initJsPsych } from 'jspsych';
import '../styles/main.scss';
import { calibrationTrialPart1, calibrationTrialPart2, conditionalCalibrationTrialPart1, conditionalCalibrationTrialPart2 } from './calibration';
import { CALIBRATION_PART_1_DIRECTIONS, PROGRESS_BAR, } from './constants';
import { finishExperiment } from './finish';
import { sampledArray } from './trials';
import { instructionalTrial, noStimuliVideoTutorialTrial, practiceLoop, stimuliVideoTutorialTrial, validationVideoTutorialTrial, } from './tutorial';
import { validationResultScreen, validationTrialEasy, validationTrialExtra, validationTrialHard, validationTrialMedium, } from './validation';
let state = {
    medianTapsPart1: 0,
    medianTaps: 0,
    calibrationPart1Successes: 0,
    calibrationPart2Successes: 0,
    calibrationPart1Failed: true,
    calibrationPart2Failed: true,
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
    minimumDemoTapsReached: false,
    completedBlockCount: 1,
    numberOfPracticeLoopsCompleted: 1,
};
import './i18n';
if (window.Cypress) {
    window.state = state;
    window.appReady = true;
}
import { calibrationSectionDirectionTrial, experimentBeginTrial, trialBlocksDirection, tutorialIntroductionTrial } from './message-trials';
window.addEventListener("beforeunload", function (event) {
    event.preventDefault();
    event.returnValue = ''; // Modern browsers require returnValue to be set
    return '';
});
/**
 * @function run
 * @description Main function to run the experiment
 * @param {Object} config - Configuration object for the experiment
 */
export function run(_a) {
    return __awaiter(this, arguments, void 0, function* ({ assetPaths }) {
        const jsPsych = initJsPsych({
            show_progress_bar: true,
            auto_update_progress_bar: false,
            message_progress_bar: PROGRESS_BAR.PROGRESS_BAR_INTRODUCTION
        });
        const timeline = [];
        timeline.push({
            type: PreloadPlugin,
            images: assetPaths.images,
            audio: assetPaths.audio,
            video: [
                './assets/videos/calibration-2-video.mp4',
                './assets/videos/tutorial_video_no_stimuli.mp4',
                './assets/videos/validation-video.mp4'
            ],
            max_load_time: 120000, // Increased timeout to 120 seconds
            on_success: function (file) {
                console.log(`Successfully preloaded: ${file}`);
            },
            on_error: function (file) {
                console.error(`Failed to preload: ${file}`);
            }
        });
        timeline.push(experimentBeginTrial);
        timeline.push(tutorialIntroductionTrial(jsPsych));
        timeline.push(noStimuliVideoTutorialTrial(jsPsych));
        timeline.push(practiceLoop(jsPsych, state));
        timeline.push(practiceLoop(jsPsych, state));
        timeline.push(practiceLoop(jsPsych, state));
        timeline.push(calibrationSectionDirectionTrial(jsPsych));
        timeline.push(instructionalTrial(CALIBRATION_PART_1_DIRECTIONS));
        timeline.push(calibrationTrialPart1(jsPsych, state));
        timeline.push(conditionalCalibrationTrialPart1(jsPsych, state));
        timeline.push(stimuliVideoTutorialTrial(jsPsych));
        timeline.push({
            timeline: [calibrationTrialPart2(jsPsych, state)],
        });
        timeline.push(conditionalCalibrationTrialPart2(jsPsych, state));
        timeline.push(validationVideoTutorialTrial(jsPsych));
        timeline.push({
            timeline: [validationTrialEasy(jsPsych, state)],
        });
        timeline.push({
            timeline: [validationTrialMedium(jsPsych, state)],
        });
        timeline.push({
            timeline: [validationTrialHard(jsPsych, state)],
        });
        timeline.push({
            timeline: [validationTrialExtra(jsPsych, state)],
            conditional_function: function () {
                return state.extraValidationRequired;
            },
        });
        timeline.push({
            timeline: [validationResultScreen(jsPsych, state)],
        });
        timeline.push({
            timeline: [trialBlocksDirection(jsPsych)]
        });
        const sampledTrials = sampledArray(jsPsych, state);
        sampledTrials.forEach((trialBlock) => {
            trialBlock.forEach((trial) => {
                timeline.push(trial);
            });
        });
        timeline.push(finishExperiment(jsPsych));
        yield jsPsych.run(timeline);
        return jsPsych;
    });
}
