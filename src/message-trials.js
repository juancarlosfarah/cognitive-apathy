import htmlButtonResponse from '@jspsych/plugin-html-button-response';
import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import { CONTINUE_BUTTON_MESSAGE, EXPERIMENT_BEGIN_MESSAGE, TUTORIAL_INTRODUCTION_MESSAGE, CALIBRATION_PART_1_DIRECTIONS, CALIBRATION_SECTION_MESSAGE, PROGRESS_BAR, TRIAL_BLOCKS_DIRECTIONS, START_BUTTON_MESSAGE, ENABLE_BUTTON_AFTER_TIME } from './constants';
import { changeProgressBar } from './utils';
import { finalNoStimuliVideo, finalStimuliVideo, handTutorial, sitComfortablyStimuli } from './stimulus';
// Contains the first welcome message of the experiment and puts the users display in fullscreen on button click
export const experimentBeginTrial = {
    type: FullscreenPlugin,
    choices: [START_BUTTON_MESSAGE],
    message: [EXPERIMENT_BEGIN_MESSAGE],
    fullscreen_mode: true
};
// Contains the preamble before the tutorial at the start of the experiment
export const tutorialIntroductionTrial = (jsPsych) => ({
    type: htmlButtonResponse,
    choices: [CONTINUE_BUTTON_MESSAGE],
    stimulus: [TUTORIAL_INTRODUCTION_MESSAGE],
    on_finish: function () {
        changeProgressBar(PROGRESS_BAR.PROGRESS_BAR_PRACTICE, 0.05, jsPsych);
    }
});
// Contains the preamble before the calibration at the start of the experiment
export const calibrationSectionDirectionTrial = (jsPsych) => ({
    type: htmlButtonResponse,
    choices: [CONTINUE_BUTTON_MESSAGE],
    stimulus: [CALIBRATION_SECTION_MESSAGE],
    on_finish: function () {
        changeProgressBar(`${PROGRESS_BAR.PROGRESS_BAR_CALIBRATION}`, .11, jsPsych);
    },
});
// Contains the directions before the calibration part 1 at the start of the experiment
export const calibrationPart1DirectionTrial = {
    type: htmlButtonResponse,
    choices: [CONTINUE_BUTTON_MESSAGE],
    stimulus: [CALIBRATION_PART_1_DIRECTIONS],
    enable_button_after: ENABLE_BUTTON_AFTER_TIME,
};
// Contains the directions before the calibration part 1 after the 6 blocks of 63 trials
export const finalCalibrationSectionPart1 = {
    type: htmlButtonResponse,
    choices: [CONTINUE_BUTTON_MESSAGE],
    stimulus: [finalNoStimuliVideo],
    enable_button_after: ENABLE_BUTTON_AFTER_TIME,
};
// Contains the directions before the calibration part 2 after the 6 blocks of 63 trials
export const finalCalibrationSectionPart2 = {
    type: htmlButtonResponse,
    choices: [CONTINUE_BUTTON_MESSAGE],
    stimulus: [finalStimuliVideo],
    enable_button_after: ENABLE_BUTTON_AFTER_TIME,
};
// Contains the directions to show the user how/where they should sit
export const sitComfortably = {
    type: htmlButtonResponse,
    choices: [CONTINUE_BUTTON_MESSAGE],
    stimulus: [sitComfortablyStimuli],
};
// Contains the directions before the 6 blocks of 63 trials
export const trialBlocksDirection = (jsPsych) => ({
    type: htmlButtonResponse,
    choices: [CONTINUE_BUTTON_MESSAGE],
    stimulus: [TRIAL_BLOCKS_DIRECTIONS],
    enable_button_after: ENABLE_BUTTON_AFTER_TIME,
    on_finish: function () {
        changeProgressBar(`${PROGRESS_BAR.PROGRESS_BAR_TRIAL_BLOCKS}`, .11, jsPsych);
    }
});
// Directional trial that contains the image to show users finger placement
export const handTutorialTrial = {
    type: htmlButtonResponse,
    choices: [CONTINUE_BUTTON_MESSAGE],
    stimulus: [handTutorial],
    enable_button_after: ENABLE_BUTTON_AFTER_TIME,
};
