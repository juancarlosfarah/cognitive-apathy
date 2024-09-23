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

// Creates an interactive countdown that shows the user the keyboard for the sake of tutorial
export const interactiveCountdown = {
  type: CountdownTrialPlugin,
  message: INTERACTIVE_KEYBOARD_TUTORIAL_MESSAGE,
  showKeyboard: true,
  data: {
    task: 'countdown',
  },
};

// Creates a tutorial trial that will be used to display "CALIBRATION_PART_1_DIRECTIONS" before calibration part 1
export const instructionalTrial = (message: string) => ({
  type: htmlButtonResponse,
  choices: [CONTINUE_BUTTON_MESSAGE],
  stimulus: function () {
    return videoStimulus(message);
  },
});

// Creates a tutorial trial that will be used to display the video tutorial for the calibration trials without stimulus
export const noStimuliVideoTutorial = {
  type: htmlButtonResponse,
  stimulus: [noStimuliVideo],
  enable_button_after: ENABLE_BUTTON_AFTER_TIME,
  choices: [CONTINUE_BUTTON_MESSAGE],
};

// Creates a tutorial trial that will be used to display the video tutorial for the calibration trials without stimulus and changes the progress bar afterwards
// Should be merged with trial above

export const noStimuliVideoTutorialTrial = (jsPsych: JsPsych) => ({
  timeline: [noStimuliVideoTutorial],
  on_finish: function () {
    // Clear the display element
    jsPsych.getDisplayElement().innerHTML = '';
    // Change progress bar
    changeProgressBar(PROGRESS_BAR.PROGRESS_BAR_PRACTICE, 0.07, jsPsych);
  },
});

// Creates a tutorial trial that will be used to display the video tutorial for the calibration trials with stimulus
// Should be merged with trial above
export const stimuliVideoTutorial = {
  type: htmlButtonResponse,
  stimulus: [stimuliVideo],
  choices: [CONTINUE_BUTTON_MESSAGE],
  enable_button_after: ENABLE_BUTTON_AFTER_TIME,
};

// Creates a tutorial trial that will be used to display the video tutorial for the calibration trials with stimulus and changes the progress bar afterwards
// Should be merged with trial above
export const stimuliVideoTutorialTrial = (jsPsych: JsPsych) => ({
  timeline: [stimuliVideoTutorial],
  on_finish: function () {
    // Clear the display element
    jsPsych.getDisplayElement().innerHTML = '';
  },

});

// Creates a tutorial trial that will be used to display the video tutorial for the validations trials 
export const validationVideoTutorial = {
  type: htmlButtonResponse,
  stimulus: [validationVideo],
  choices: [CONTINUE_BUTTON_MESSAGE],
  enable_button_after: ENABLE_BUTTON_AFTER_TIME,
};

// Creates a tutorial trial that will be used to display the video tutorial for the validations trials with stimulus and changes the progress bar afterwards
// Should be merged with trial above
export const validationVideoTutorialTrial = (jsPsych: JsPsych) => ({
  timeline: [validationVideoTutorial],
  on_finish: function () {
    // Clear the display element
    jsPsych.getDisplayElement().innerHTML = '';
  },
});

/**
 * @function practiceTrial
 * @description Creates a practice trial timeline in which participants practice holding keys and tapping a key to increase a virtual mercury level.
 * 
 * This trial includes:
 * - A task plugin where participants practice without visual feedback from the thermometer.
 * - Monitoring the state of key presses to detect early key taps before the "go" signal.
 * 
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 * 
 * @returns {Object} - A jsPsych trial object containing the practice task and a conditional release keys step.
 */
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
/**
 * @function practiceLoop
 * @description Creates a loop of practice trials where participants must repeatedly complete practice tasks until they meet the required criteria.
 * 
 * This loop includes:
 * - A countdown step to prepare participants for the practice task with a keyboard showing their key presses.
 * - A practice trial where participants practice key holding and tapping.
 * - A loading bar trial to give participants a break between practice trials.
 * - A loop function that repeats the practice trials if the keys were released early, the key was tapped early, or the participant did not meet the minimum tap count.
 * - An update to the progress bar based on the number of practice loops completed successfully based on the criteria above, resetting it after four loops.
 * 
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {State} state - An object for storing and tracking state data during the trials, such as the number of practice loops completed.
 * 
 * @returns {Object} - A jsPsych trial object that loops the practice task until the participant meets the required criteria.
 */
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

