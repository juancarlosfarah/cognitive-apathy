import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import { FAILED_VALIDATION_MESSAGE, END_EXPERIMENT_MESSAGE } from './constants';
import { calculateTotalReward, showEndScreen } from './utils';
export const finishExperiment = (jsPsych) => ({
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: function () {
        return `<p>${END_EXPERIMENT_MESSAGE}</p>`;
    },
    data: {
        task: 'finish_experiment',
    },
    on_finish: function (data) {
        const totalSuccessfulReward = calculateTotalReward(jsPsych);
        data.totalReward = totalSuccessfulReward;
        jsPsych.data.get().localSave('csv', 'cognitive-apathy.csv');
        showEndScreen('experiment ended');
    },
});
export const finishExperimentEarly = (jsPsych) => {
    jsPsych.data.get().localSave('csv', 'cognitive-apathy.csv');
    jsPsych.abortExperiment(FAILED_VALIDATION_MESSAGE);
    showEndScreen('experiment ended');
};
export const finishExperimentEarlyTrial = (jsPsych) => ({
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: FAILED_VALIDATION_MESSAGE,
    data: {
        task: 'finish_experiment',
    },
    on_finish: function () {
        jsPsych.data.get().localSave('csv', 'cognitive-apathy.csv');
        showEndScreen('experiment ended');
    },
});
