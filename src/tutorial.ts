import htmlButtonResponse from '@jspsych/plugin-html-button-response';

import {
  INTERACTIVE_KEYBOARD_TUTORIAL_MESSAGE,
  CONTINUE_BUTTON_MESSAGE,
  MINIMUM_CALIBRATION_MEDIAN,
  PROGRESS_BAR,
  ENABLE_BUTTON_AFTER_TIME
} from './constants';
import { CountdownTrialPlugin } from './countdown';
import { loadingBarTrial } from './loading-bar';
import { releaseKeysStep } from './release-keys';
import {
  noStimuliVideo,
  stimuliVideo,
  validationVideo,
  videoStimulus,
} from './stimulus';
import TaskPlugin from './task';
import {checkFlag, checkKeys } from './utils';
import { JsPsych } from 'jspsych';
import { changeProgressBar } from './utils';
import { State } from './types';
export const interactiveCountdown = {
  type: CountdownTrialPlugin,
  message: INTERACTIVE_KEYBOARD_TUTORIAL_MESSAGE,
  showKeyboard: true,
  data: {
    task: 'countdown',
  },
};

export const instructionalTrial = (message: string) => ({
  type: htmlButtonResponse,
  choices: [CONTINUE_BUTTON_MESSAGE],
  stimulus: function () {
    return videoStimulus(message);
  },
});


export const noStimuliVideoTutorial = {
  type: htmlButtonResponse,
  stimulus: [noStimuliVideo],
  enable_button_after: ENABLE_BUTTON_AFTER_TIME,
  choices: [CONTINUE_BUTTON_MESSAGE],
};

export const noStimuliVideoTutorialTrial = (jsPsych: JsPsych) => ({
  timeline: [noStimuliVideoTutorial],
  on_finish: function () {
    // Clear the display element
    jsPsych.getDisplayElement().innerHTML = '';
    // Change progress bar
    changeProgressBar(PROGRESS_BAR.PROGRESS_BAR_PRACTICE, 0.07, jsPsych);
  },
});

export const stimuliVideoTutorial = {
  type: htmlButtonResponse,
  stimulus: [stimuliVideo],
  choices: [CONTINUE_BUTTON_MESSAGE],
  enable_button_after: ENABLE_BUTTON_AFTER_TIME,
};

export const stimuliVideoTutorialTrial = (jsPsych: JsPsych) => ({
  timeline: [stimuliVideoTutorial],
  on_finish: function () {
    // Clear the display element
    jsPsych.getDisplayElement().innerHTML = '';
  },

});

export const validationVideoTutorial = {
  type: htmlButtonResponse,
  stimulus: [validationVideo],
  choices: [CONTINUE_BUTTON_MESSAGE],
  enable_button_after: ENABLE_BUTTON_AFTER_TIME,
};

export const validationVideoTutorialTrial = (jsPsych: JsPsych) => ({
  timeline: [validationVideoTutorial],
  on_finish: function () {
    // Clear the display element
    jsPsych.getDisplayElement().innerHTML = '';
  },
});

export const practiceTrial = (jsPsych: JsPsych) => ({
  timeline: [
    {
      type: TaskPlugin,
      showThermometer: false,
      task: 'practice',
      on_start: function (trial: any) {
        // ADD TYPE FOR TRIAL
        const keyTappedEarlyFlag = checkFlag(
          'countdown',
          'keyTappedEarlyFlag',
          jsPsych,
        );
        // Update the trial parameters with keyTappedEarlyFlag
        trial.keyTappedEarlyFlag = keyTappedEarlyFlag;
      },
    },
    {
      timeline: [releaseKeysStep],
      conditional_function: function () {
        return checkKeys('practice', jsPsych)
      },
    },
  ],
});

export const practiceLoop = (jsPsych: JsPsych, state: State) => ({
  timeline: [
    {
    timeline: [
    interactiveCountdown,
    practiceTrial(jsPsych),
    loadingBarTrial(true, jsPsych),
  ],
  // Repeat if the keys were released early or if user tapped before go.
  loop_function: function () {
    const keyTappedEarlyFlag = checkFlag(
      'countdown',
      'keyTappedEarlyFlag',
      jsPsych,
    );
    const keysReleasedFlag = checkFlag('practice', 'keysReleasedFlag', jsPsych);
    const numberOfTaps = jsPsych.data
    .get()
    .filter({ task: 'practice' })
    .last(1)
    .values()[0]
    .tapCount;
    return keysReleasedFlag || keyTappedEarlyFlag || numberOfTaps < MINIMUM_CALIBRATION_MEDIAN;
  },
}],
on_timeline_finish: function(){
  state.numberOfPracticeLoopsCompleted++
  let progressBarProgress = jsPsych.progressBar!.progress
  if(state.numberOfPracticeLoopsCompleted === 4){
    changeProgressBar(PROGRESS_BAR.PROGRESS_BAR_CALIBRATION, 0, jsPsych)
  } else{
  changeProgressBar(PROGRESS_BAR.PROGRESS_BAR_PRACTICE, progressBarProgress +.25, jsPsych);
  }
}});

