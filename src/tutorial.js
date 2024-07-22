import htmlButtonResponse from '@jspsych/plugin-html-button-response';
import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import videoButtonResponse from '@jspsych/plugin-video-button-response';

import {
  GO_DURATION,
  HOLD,
  HOLD_KEYS_MESSAGE,
  INTERACTIVE_KEYBOARD_TUTORIAL_MESSAGE,
  KEYS_TO_HOLD,
  VIDEO_TUTORIAL_MESSAGE,
  DOMINANT_HAND_MESSAGE
} from './constants';
import CountdownTrialPlugin from './countdown';
import {
  noStimuliVideo,
  stimuliVideo,
  validationVideo,
  videoStimulus,
} from './stimulus';

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

export let DOMINANT_HAND = 'right'
export const dominantHand = {
  type: htmlButtonResponse,
  stimulus: DOMINANT_HAND_MESSAGE,
  choices: ['Left handed', 'Right handed'],
  data: {
    task: 'dominant-hand'
  },
  on_finish: function(data) {
    if(data.response === 0) {
      DOMINANT_HAND = 'left';
    } else {
      DOMINANT_HAND = 'right';
    }
  }
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
