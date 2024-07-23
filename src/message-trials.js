import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';

import {
  SUCCESS_SCREEN_DURATION,
  TRIAL_FAILED,
  TRIAL_SUCCEEDED,
} from './constants';

export const endExperimentTrial = (message) => ({
  type: HtmlKeyboardResponsePlugin,
  choices: ['enter'],
  stimulus: `<p>${message}</p>`,
  on_finish: function () {
    console.log('Experiment ended:', message);
    jsPsych.endExperiment(message);
  },
});

export const successScreen = (jsPsych) => ({
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
