import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import { JsPsych } from 'jspsych';
export declare const loadingBarTrial: (acceptance: boolean, jsPsych: JsPsych) => {
    type: typeof HtmlKeyboardResponsePlugin;
    stimulus: () => string;
    choices: string;
    on_load: () => void;
    on_finish: () => void;
};
