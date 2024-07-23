import htmlButtonResponse from '@jspsych/plugin-html-button-response';
import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import videoButtonResponse from '@jspsych/plugin-video-button-response';

import {
  DOMINANT_HAND_MESSAGE,
  GO_DURATION,
  HOLD,
  HOLD_KEYS_MESSAGE,
  INTERACTIVE_KEYBOARD_TUTORIAL_MESSAGE,
  KEYS_TO_HOLD,
  VIDEO_TUTORIAL_MESSAGE,
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
import { checkFlag } from './utils';

export const interactiveCountdown = {
  type: CountdownTrialPlugin,
  message: INTERACTIVE_KEYBOARD_TUTORIAL_MESSAGE,
  showKeyboard: true,
  data: {
    task: 'countdown',
  },
};

export const instructionalTrial = (message, video) => ({
  type: HtmlKeyboardResponsePlugin,
  choices: ['Enter'],
  stimulus: function () {
    return videoStimulus(message, video);
  },
});

export let DOMINANT_HAND = 'right';
export const dominantHand = {
  type: htmlButtonResponse,
  stimulus: DOMINANT_HAND_MESSAGE,
  choices: ['Left handed', 'Right handed'],
  data: {
    task: 'dominant-hand',
  },
  on_finish: function (data) {
    if (data.response === 0) {
      DOMINANT_HAND = 'left';
    } else {
      DOMINANT_HAND = 'right';
    }
  },
};

export const noStimuliVideoTutorial = {
  type: htmlButtonResponse,
  stimulus: [noStimuliVideo],
  choices: ['Continue'],
  enable_button_after: 15000,
};

export const stimuliVideoTutorial = {
  type: htmlButtonResponse,
  stimulus: [stimuliVideo],
  choices: ['Continue'],
  enable_button_after: 15000,
};

export const validationVideoTutorial = {
  type: htmlButtonResponse,
  stimulus: [validationVideo],
  choices: ['Continue'],
  enable_button_after: 15000,
};

export const practiceTrial = (jsPsych) => ({
  timeline: [
    {
      type: TaskPlugin,
      showThermometer: false,
      data: {
        task: 'practice',
      },
      on_start: function (trial) {
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
        return !checkFlag('practice', 'keysReleasedFlag', jsPsych);
      },
    },
  ],
});

export const practiceLoop = (jsPsych) => ({
  timeline: [
    interactiveCountdown,
    {
      type: HtmlKeyboardResponsePlugin,
      stimulus: '<p style="color: green; font-size: 48px;">GO</p>',
      choices: 'NO_KEYS',
      trial_duration: GO_DURATION, // Display "GO" for 1 second
      data: {
        task: 'go_screen',
      },
    },
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
    return keysReleasedFlag || keyTappedEarlyFlag;
  },
});
