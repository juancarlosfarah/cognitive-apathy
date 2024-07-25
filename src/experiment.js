import PreloadPlugin from '@jspsych/plugin-preload';
import { initJsPsych } from 'jspsych';
import '../styles/main.scss';
import { calibrationTrialPart1, calibrationTrialPart2, conditionalCalibrationTrialPart1, conditionalCalibrationTrialPart2 } from './calibration';
import { finishExperiment } from './finish';
import { sampledArray } from './trials';
import { stimuliVideoTutorialTrial, validationVideoTutorialTrial, } from './tutorial';
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
};
import './i18n';
/**
 * @function run
 * @description Main function to run the experiment
 * @param {Object} config - Configuration object for the experiment
 */
export async function run({ assetPaths, input = {}, environment, title, version, }) {
    const jsPsych = initJsPsych();
    const timeline = [];
    timeline.push({
        type: PreloadPlugin,
        audio: assetPaths.audio,
        video: '../assets/videos',
    });
    /*   timeline.push(noStimuliVideoTutorialTrial(jsPsych));
      timeline.push(practiceLoop(jsPsych));
    
      timeline.push(instructionalTrial(CALIBRATION_PART_1_DIRECTIONS)); */
    timeline.push(calibrationTrialPart1(jsPsych, state)),
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
        timeline: [validationResultScreen(jsPsych, state)]
    });
    const sampledTrials = sampledArray(jsPsych, state);
    sampledTrials.forEach((trialBlock) => {
        trialBlock.forEach((trial) => {
            timeline.push(trial);
        });
    });
    timeline.push(finishExperiment(jsPsych));
    await jsPsych.run(timeline);
    return jsPsych;
}
