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

export const calculateMedianCalibrationPart1 = (jsPsych, state) => ({
  type: HtmlKeyboardResponsePlugin,
  choices: ['enter'],
  stimulus: function () {
    state.medianTapsPart1 = calculateMedianTapCount(
      'calibrationPart1',
      NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
      jsPsych,
      state.medianTaps,
    );
    console.log(`medianTapsPart1: ${state.medianTapsPart1}`);
    if (state.medianTapsPart1 >= MINIMUM_CALIBRATION_MEDIAN) {
      state.medianTaps = state.medianTapsPart1;
      console.log(`medianTaps updated to: ${state.medianTaps}`);
    }
    return `<p>${CALIBRATION_PART_1_ENDING_MESSAGE}</p>`;
  },
});

export const calculateMedianCalibrationPart2 = (jsPsych, state) => ({
  type: HtmlKeyboardResponsePlugin,
  choices: ['enter'],
  stimulus: function () {
    state.medianTapsPart2 = calculateMedianTapCount(
      'calibrationPart2',
      NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
      jsPsych,
      state.medianTaps,
    );
    console.log(`medianTapsPart2: ${state.medianTapsPart2}`);
    if (state.medianTapsPart2 >= MINIMUM_CALIBRATION_MEDIAN) {
      state.medianTaps = state.medianTapsPart2;
      console.log(`medianTaps updated to: ${state.medianTaps}`);
    }
    return `<p>${CALIBRATION_PART_2_ENDING_MESSAGE}</p>`;
  },
});
