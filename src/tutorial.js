import { initJsPsych } from 'jspsych';
import videoButtonResponse from '@jspsych/plugin-video-button-response';
import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import { videoStimulus } from './stimulus';
import { VIDEO_TUTORIAL_MESSAGE, KEYS_TO_HOLD, HOLD_KEYS_MESSAGE, HOLD, INTERACTIVE_KEYBOARD_TUTORIAL_MESSAGE, GO_DURATION } from './constants';
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
  type: videoButtonResponse,
  stimulus: ['../assets/videos/temporary_keyboard_tutorial.mp4'],
  choices: ['Continue'],
  prompt: `<p>${VIDEO_TUTORIAL_MESSAGE}</p>`,
  width: 640,
  height: 200,
  autoplay: true,
  controls: false,
  start: 0,
  stop: null,
  trial_ends_after_video: false,
  trial_duration: null,
  response_ends_trial: true,
  response_allowed_while_playing: false,

};
