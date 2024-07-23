import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';

import { LOADING_BAR_SPEED_NO, LOADING_BAR_SPEED_YES } from './constants';
import { loadingBar } from './stimulus';

export const loadingBarTrial = (acceptance, jsPsych) => ({
  type: HtmlKeyboardResponsePlugin,
  stimulus: loadingBar,
  choices: 'NO_KEYS',
  on_load: function () {
    const check_percentage = () => {
      const percentage = document.querySelector('.percentage');
      const percentageValue = +percentage.textContent;

      setTimeout(() => {
        if (percentageValue < 100) {
          update_percentage();
        } else {
          percentage.textContent = 100;
          jsPsych.finishTrial(); // Finish the trial when loading is complete
        }
      }, 100);
    };

    const update_percentage = () => {
      const percentage = document.querySelector('.percentage');
      const percentageValue = +percentage.textContent;
      const progress = document.querySelector('.progress');
      let increment;
      acceptance
        ? (increment = Math.ceil(Math.random() * LOADING_BAR_SPEED_YES))
        : (increment = Math.ceil(Math.random() * LOADING_BAR_SPEED_NO));
      const newPercentageValue = Math.min(percentageValue + increment, 100); // Ensure it does not exceed 100
      percentage.textContent = newPercentageValue;
      progress.setAttribute('style', `width:${newPercentageValue}%`);

      check_percentage();
    };

    check_percentage();
  },
  on_finish: function () {
    const loadingBarContainer = document.querySelector(
      '.loading-bar-container',
    );
    if (loadingBarContainer) {
      loadingBarContainer.remove();
    }
  },
});
