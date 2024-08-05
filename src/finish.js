import { FAILED_VALIDATION_MESSAGE, END_EXPERIMENT_MESSAGE, CONTINUE_BUTTON_MESSAGE, EXPERIMENT_HAS_ENDED_MESSAGE } from './constants';
import { calculateTotalReward, showEndScreen } from './utils';
import htmlButtonResponse from '@jspsych/plugin-html-button-response';
export const finishExperiment = (jsPsych) => ({
    type: htmlButtonResponse,
    choices: [CONTINUE_BUTTON_MESSAGE],
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
    showEndScreen(EXPERIMENT_HAS_ENDED_MESSAGE);
};
export const finishExperimentEarlyTrial = (jsPsych) => ({
    type: htmlButtonResponse,
    choices: [CONTINUE_BUTTON_MESSAGE],
    stimulus: FAILED_VALIDATION_MESSAGE,
    data: {
        task: 'finish_experiment',
    },
    on_finish: function () {
        jsPsych.data.get().localSave('csv', 'cognitive-apathy.csv');
        showEndScreen(EXPERIMENT_HAS_ENDED_MESSAGE);
    },
});
