"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadingBarTrial = void 0;
const plugin_html_keyboard_response_1 = __importDefault(require("@jspsych/plugin-html-keyboard-response"));
const constants_1 = require("./constants");
const stimulus_1 = require("./stimulus");
const loadingBarTrial = (acceptance, jsPsych) => ({
    type: plugin_html_keyboard_response_1.default,
    stimulus: stimulus_1.loadingBar,
    choices: 'NO_KEYS',
    on_load: function () {
        const check_percentage = () => {
            const percentage = document.querySelector('.percentage');
            const percentageValue = +((percentage === null || percentage === void 0 ? void 0 : percentage.textContent) || 0);
            setTimeout(() => {
                if (percentageValue < 100) {
                    update_percentage();
                }
                else {
                    if (percentage)
                        percentage.textContent = '100';
                    jsPsych.finishTrial();
                }
            }, 100);
        };
        const update_percentage = () => {
            const percentage = document.querySelector('.percentage');
            const percentageValue = +((percentage === null || percentage === void 0 ? void 0 : percentage.textContent) || 0);
            const progress = document.querySelector('.progress');
            let increment;
            acceptance
                ? (increment = Math.ceil(Math.random() * constants_1.LOADING_BAR_SPEED_YES))
                : (increment = Math.ceil(Math.random() * constants_1.LOADING_BAR_SPEED_NO));
            const newPercentageValue = Math.min(percentageValue + increment, 100);
            if (percentage)
                percentage.textContent = newPercentageValue.toString();
            if (progress)
                progress.setAttribute('style', `width:${newPercentageValue}%`);
            check_percentage();
        };
        check_percentage();
    },
    on_finish: function () {
        const loadingBarContainer = document.querySelector('.loading-bar-container');
        if (loadingBarContainer) {
            loadingBarContainer.remove();
        }
    },
});
exports.loadingBarTrial = loadingBarTrial;
