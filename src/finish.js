import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import { saveAs } from 'file-saver';
import { FAILED_VALIDATION_MESSAGE, END_EXPERIMENT_MESSAGE } from './constants';
import { calculateTotalReward } from './utils';
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
        const allData = jsPsych.data.get().json();
        const blob = new Blob([allData], { type: 'application/json' });
        saveAs(blob, `experiment_data_${new Date().toISOString()}.json`);
    },
});
export const finishExperimentEarly = (jsPsych) => {
    const allData = jsPsych.data.get().json();
    const blob = new Blob([allData], { type: 'application/json' });
    saveAs(blob, `experiment_data_${new Date().toISOString()}.json`);
    jsPsych.abortExperiment(FAILED_VALIDATION_MESSAGE);
};
export const finishExperimentEarlyTrial = (jsPsych) => ({
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: FAILED_VALIDATION_MESSAGE,
    data: {
        task: 'finish_experiment',
    },
    on_finish: function () {
        const allData = jsPsych.data.get().json();
        const blob = new Blob([allData], { type: 'application/json' });
        saveAs(blob, `experiment_data_${new Date().toISOString()}.json`);
    },
});
