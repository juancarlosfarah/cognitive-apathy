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
} from './constants';
import CountdownTrialPlugin from './countdown';
import { videoStimulus, videoTutorial } from './stimulus';

export const interactiveCountdown = {
  type: CountdownTrialPlugin,
  message: INTERACTIVE_KEYBOARD_TUTORIAL_MESSAGE,
  showKeyboard: true,
  data: {
    task: 'countdown',
  },
};

export const videoDemo = (message, video) => ({
  type: HtmlKeyboardResponsePlugin,
  choices: ['Enter'],
  stimulus: function () {
    return videoStimulus(message, video);
  },
});

export const videoTrial1 = {
  type: htmlButtonResponse,
  stimulus: [videoTutorial],
  choices: ['Continue'],
  enable_button_after: 15000,
};
