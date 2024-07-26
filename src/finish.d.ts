import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import { JsPsych } from 'jspsych';
export declare const finishExperiment: (jsPsych: JsPsych) => {
    type: typeof HtmlKeyboardResponsePlugin;
    choices: string[];
    stimulus: () => string;
    data: {
        task: string;
    };
    on_finish: (data: any) => void;
};
export declare const finishExperimentEarly: (jsPsych: JsPsych) => void;
export declare const finishExperimentEarlyTrial: (jsPsych: JsPsych) => {
    type: typeof HtmlKeyboardResponsePlugin;
    choices: string[];
    stimulus: string;
    data: {
        task: string;
    };
    on_finish: (data: any) => void;
};
