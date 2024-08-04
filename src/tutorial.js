import htmlButtonResponse from '@jspsych/plugin-html-button-response';
import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import { GO_DURATION, INTERACTIVE_KEYBOARD_TUTORIAL_MESSAGE, CONTINUE_BUTTON_MESSAGE, GO_MESSAGE, MINIMUM_CALIBRATION_MEDIAN, PROGRESS_BAR } from './constants';
import { CountdownTrialPlugin } from './countdown';
import { loadingBarTrial } from './loading-bar';
import { releaseKeysStep } from './release-keys';
import { noStimuliVideo, stimuliVideo, validationVideo, videoStimulus, } from './stimulus';
import TaskPlugin from './task';
import { checkFlag, checkKeys } from './utils';
import { changeProgressBar } from './utils';
export const interactiveCountdown = {
    type: CountdownTrialPlugin,
    message: INTERACTIVE_KEYBOARD_TUTORIAL_MESSAGE,
    showKeyboard: true,
    data: {
        task: 'countdown',
    },
};
export const instructionalTrial = (message) => ({
    type: htmlButtonResponse,
    choices: [CONTINUE_BUTTON_MESSAGE],
    stimulus: function () {
        return videoStimulus(message);
    },
});
export const noStimuliVideoTutorial = {
    type: htmlButtonResponse,
    stimulus: [noStimuliVideo],
    enable_button_after: 0,
    choices: [CONTINUE_BUTTON_MESSAGE],
};
export const noStimuliVideoTutorialTrial = (jsPsych) => ({
    timeline: [noStimuliVideoTutorial],
    on_finish: function () {
        // Clear the display element
        jsPsych.getDisplayElement().innerHTML = '';
        // Change progress bar
        changeProgressBar(PROGRESS_BAR.PROGRESS_BAR_PRACTICE + ' 1', 0.07, jsPsych);
    },
});
export const stimuliVideoTutorial = {
    type: htmlButtonResponse,
    stimulus: [stimuliVideo],
    choices: [CONTINUE_BUTTON_MESSAGE],
    enable_button_after: 0,
};
export const stimuliVideoTutorialTrial = (jsPsych) => ({
    timeline: [stimuliVideoTutorial],
    on_finish: function () {
        // Clear the display element
        jsPsych.getDisplayElement().innerHTML = '';
    },
});
export const validationVideoTutorial = {
    type: htmlButtonResponse,
    stimulus: [validationVideo],
    choices: [CONTINUE_BUTTON_MESSAGE],
    enable_button_after: 0,
};
export const validationVideoTutorialTrial = (jsPsych) => ({
    timeline: [validationVideoTutorial],
    on_finish: function () {
        // Clear the display element
        jsPsych.getDisplayElement().innerHTML = '';
    },
});
export const practiceTrial = (jsPsych) => ({
    timeline: [
        {
            type: TaskPlugin,
            showThermometer: false,
            task: 'practice',
            on_start: function (trial) {
                // ADD TYPE FOR TRIAL
                const keyTappedEarlyFlag = checkFlag('countdown', 'keyTappedEarlyFlag', jsPsych);
                // Update the trial parameters with keyTappedEarlyFlag
                trial.keyTappedEarlyFlag = keyTappedEarlyFlag;
            },
        },
        {
            timeline: [releaseKeysStep],
            conditional_function: function () {
                return checkKeys('practice', jsPsych);
            },
        },
    ],
});
export const practiceLoop = (jsPsych, state) => ({
    timeline: [
        {
            timeline: [
                interactiveCountdown,
                {
                    type: HtmlKeyboardResponsePlugin,
                    stimulus: `<p style="color: green; font-size: 48px;">${GO_MESSAGE}</p>`,
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
                const keyTappedEarlyFlag = checkFlag('countdown', 'keyTappedEarlyFlag', jsPsych);
                const keysReleasedFlag = checkFlag('practice', 'keysReleasedFlag', jsPsych);
                const numberOfTaps = jsPsych.data
                    .get()
                    .filter({ task: 'practice' })
                    .last(1)
                    .values()[0]
                    .tapCount;
                return keysReleasedFlag || keyTappedEarlyFlag || numberOfTaps < MINIMUM_CALIBRATION_MEDIAN;
            },
        }
    ],
    on_timeline_finish: function () {
        state.numberOfPracticeLoopsCompleted++;
        let progressBarProgress = jsPsych.progressBar.progress;
        if (state.numberOfPracticeLoopsCompleted === 3) {
            changeProgressBar(PROGRESS_BAR.PROGRESS_BAR_CALIBRATION, .11, jsPsych);
        }
        else {
            changeProgressBar(PROGRESS_BAR.PROGRESS_BAR_PRACTICE + `${state.numberOfPracticeLoopsCompleted}`, progressBarProgress + .03, jsPsych);
        }
    }
});
