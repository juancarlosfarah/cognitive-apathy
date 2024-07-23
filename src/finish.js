import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import { calculateTotalReward } from './utils'; // Ensure this is correctly imported
import { REWARD_TOTAL_MESSAGE } from './constants'; // Ensure this is correctly imported
import { saveAs } from 'file-saver'; // Ensure this is correctly imported

export const finishExperiment = (jsPsych) => ({
  type: HtmlKeyboardResponsePlugin,
  choices: ['enter'],
  stimulus: function () {
    const totalSuccessfulReward = calculateTotalReward(jsPsych);
    return `<p>${REWARD_TOTAL_MESSAGE(totalSuccessfulReward)}</p>`;
  },
  data: {
    task: 'finish_experiment',
  },
  on_finish: function (data) {
    // Add total reward data to this trial for easy access
    const totalSuccessfulReward = calculateTotalReward(jsPsych);
    data.totalReward = totalSuccessfulReward;
    const allData = jsPsych.data.get().json();
    const blob = new Blob([allData], { type: 'application/json' });
    saveAs(blob, `experiment_data_${new Date().toISOString()}.json`);
  },
});
