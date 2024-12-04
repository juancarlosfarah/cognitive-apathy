import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import { calculateMedianTapCount } from './utils';

import {
  SUCCESS_SCREEN_DURATION,
  TRIAL_FAILED,
  TRIAL_SUCCEEDED,
  NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
  NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
  CALIBRATION_PART_1_ENDING_MESSAGE,
  CALIBRATION_PART_2_ENDING_MESSAGE,
  MINIMUM_CALIBRATION_MEDIAN,
} from './constants';
import { State } from './types';

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




