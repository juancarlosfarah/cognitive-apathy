import videoButtonResponse from '@jspsych/plugin-video-button-response';
import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import { videoStimulus } from './stimulus';
import { VIDEO_TUTORIAL_MESSAGE } from './constants';


export const videoDemo = (message, video) => ({
  type: HtmlKeyboardResponsePlugin,
  choices: ['Enter'],
  stimulus: function () {
    return videoStimulus(message, video);
  },
});




export const videoTrial1 = [
  {
    type: videoButtonResponse,
    stimulus: ['../assets/videos/temporary_keyboard_tutorial.mp4'],
    choices: ['Continue'],
    width: 640,
    height: 200,
    autoplay: true,
    trial_ends_after_video: false,
    trial_duration: null,
    response_ends_trial: true,
    response_allowed_while_playing: false,
    enable_button_after: null,
    prompt: `<p>${VIDEO_TUTORIAL_MESSAGE}</p>`,
  },
];
