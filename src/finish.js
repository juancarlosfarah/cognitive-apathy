import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import { saveAs } from 'file-saver';
import { REWARD_TOTAL_MESSAGE, FAILED_VALIDATION_MESSAGE } from './constants';
import { calculateTotalReward } from './utils';
export const finishExperiment = (jsPsych) => ({
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: function () {
        const totalSuccessfulReward = calculateTotalReward(jsPsych);
        return `<p>${REWARD_TOTAL_MESSAGE(totalSuccessfulReward.toFixed(2))}</p>`;
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
    on_finish: function (data) {
        const allData = jsPsych.data.get().json();
        const blob = new Blob([allData], { type: 'application/json' });
        saveAs(blob, `experiment_data_${new Date().toISOString()}.json`);
    },
});
