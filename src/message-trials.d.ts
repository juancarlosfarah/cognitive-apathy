import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
export declare const endExperimentTrial: (message: string) => {
    type: typeof HtmlKeyboardResponsePlugin;
    choices: string[];
    stimulus: string;
    on_finish: (jsPsych: any) => void;
};
export declare const successScreen: (jsPsych: any) => {
    type: typeof HtmlKeyboardResponsePlugin;
    stimulus: () => string;
    choices: string;
    trial_duration: number;
    data: {
        task: string;
    };
};
