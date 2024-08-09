import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import htmlButtonResponse from '@jspsych/plugin-html-button-response';
import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import {
  CONTINUE_BUTTON_MESSAGE,
  EXPERIMENT_BEGIN_MESSAGE,
  TUTORIAL_INTRODUCTION_MESSAGE,
  CALIBRATION_PART_1_DIRECTIONS,
  CALIBRATION_SECTION_MESSAGE,
  PROGRESS_BAR,
  TRIAL_BLOCKS_DIRECTIONS,
  START_BUTTON_MESSAGE
} from './constants';
import { changeProgressBar } from './utils';
import { JsPsych } from 'jspsych';
import { finalNoStimuliVideo, finalStimuliVideo, sitComfortablyStimuli } from './stimulus';

export const endExperimentTrial = (message: string) => ({
  type: HtmlKeyboardResponsePlugin,
  choices: ['enter'],
  stimulus: `<p>${message}</p>`,
  on_finish: function (jsPsych: any) {
    console.log('Experiment ended:', message);
    jsPsych.endExperiment(message);
  },
});



export const experimentBeginTrial = {
  type: FullscreenPlugin,
  choices: [START_BUTTON_MESSAGE],
  message: [EXPERIMENT_BEGIN_MESSAGE],
  fullscreen_mode: true
};

export const tutorialIntroductionTrial = (jsPsych: JsPsych) => ({
  type: htmlButtonResponse,
  choices: [CONTINUE_BUTTON_MESSAGE],
  stimulus: [TUTORIAL_INTRODUCTION_MESSAGE],
  on_finish: function () {
    changeProgressBar(PROGRESS_BAR.PROGRESS_BAR_PRACTICE, 0.05, jsPsych);
  }
})
export const calibrationSectionDirectionTrial = (jsPsych: JsPsych) => ({
  type: htmlButtonResponse,
  choices: [CONTINUE_BUTTON_MESSAGE],
  stimulus: [CALIBRATION_SECTION_MESSAGE],
  on_finish: function(){
    changeProgressBar(`${PROGRESS_BAR.PROGRESS_BAR_CALIBRATION}`, .11, jsPsych)
  }
})

export const calibrationPart1DirectionTrial = {
  type: htmlButtonResponse,
  choices: [CONTINUE_BUTTON_MESSAGE],
  stimulus: [CALIBRATION_PART_1_DIRECTIONS],
}

export const finalCalibrationSectionPart1 = {
  type: htmlButtonResponse,
  choices: [CONTINUE_BUTTON_MESSAGE],
  stimulus: [finalNoStimuliVideo],
}

export const finalCalibrationSectionPart2 = {
  type: htmlButtonResponse,
  choices: [CONTINUE_BUTTON_MESSAGE],
  stimulus: [finalStimuliVideo],
}

export const sitComfortably = {
  type: htmlButtonResponse,
  choices: [CONTINUE_BUTTON_MESSAGE],
  stimulus: [sitComfortablyStimuli],
}
export const trialBlocksDirection = (jsPsych: JsPsych) => ({
  type: htmlButtonResponse,
  choices: [CONTINUE_BUTTON_MESSAGE],
  stimulus: [TRIAL_BLOCKS_DIRECTIONS],
  on_finish: function(){
    changeProgressBar(`${PROGRESS_BAR.PROGRESS_BAR_TRIAL_BLOCKS}`, .11, jsPsych)
  }
})
