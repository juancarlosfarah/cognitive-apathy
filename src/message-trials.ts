import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import htmlButtonResponse from '@jspsych/plugin-html-button-response';
import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import {
  SUCCESS_SCREEN_DURATION,
  TRIAL_FAILED,
  TRIAL_SUCCEEDED,
  CONTINUE_BUTTON_MESSAGE,
  EXPERIMENT_BEGIN_MESSAGE,
  TUTORIAL_INTRODUCTION_MESSAGE,
  CALIBRATION_PART_1_DIRECTIONS,
  CALIBRATION_SECTION_MESSAGE,
  PROGRESS_BAR
} from './constants';
import { changeProgressBar } from './utils';
import { JsPsych } from 'jspsych';

export const endExperimentTrial = (message: string) => ({
  type: HtmlKeyboardResponsePlugin,
  choices: ['enter'],
  stimulus: `<p>${message}</p>`,
  on_finish: function (jsPsych: any) {
    console.log('Experiment ended:', message);
    jsPsych.endExperiment(message);
  },
});

export const successScreen = (jsPsych: any) => ({
  type: HtmlKeyboardResponsePlugin,
  stimulus: function () {
    const previousTrial = jsPsych.data.get().last(1).values()[0];
    if (previousTrial.success) {
      return `<p style="color: green; font-size: 48px;">${TRIAL_SUCCEEDED}</p>`;
    } else {
      return `<p style="color: red; font-size: 48px;">${TRIAL_FAILED}</p>`;
    }
  },
  choices: 'NO_KEYS',
  trial_duration: SUCCESS_SCREEN_DURATION,
  data: {
    task: 'success_screen',
  },
});

export const experimentBeginTrial = {
  type: FullscreenPlugin,
  choices: [CONTINUE_BUTTON_MESSAGE],
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
    changeProgressBar(PROGRESS_BAR.PROGRESS_BAR_CALIBRATION, .11, jsPsych)
  }
})

export const calibrationPart1DirectionTrial = {
  type: htmlButtonResponse,
  choices: [CONTINUE_BUTTON_MESSAGE],
  stimulus: [CALIBRATION_PART_1_DIRECTIONS],
}



