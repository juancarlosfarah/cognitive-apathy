import videoButtonResponse from '@jspsych/plugin-video-button-response';
import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import htmlButtonResponse from '@jspsych/plugin-html-button-response';
import { videoStimulus, videoTutorial } from './stimulus';
import { VIDEO_TUTORIAL_MESSAGE, KEYS_TO_HOLD, HOLD_KEYS_MESSAGE, HOLD, INTERACTIVE_KEYBOARD_TUTORIAL_MESSAGE, GO_DURATION , } from './constants';
import CountdownTrialPlugin from './countdown';



export const interactiveCountdown = {
  type: CountdownTrialPlugin,
  message: INTERACTIVE_KEYBOARD_TUTORIAL_MESSAGE,
  showKeyboard: true
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
  enable_button_after: 15000
};
