import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import { ParameterType, JsPsych } from 'jspsych';
export declare class CountdownTrialPlugin {
    static info: {
        name: string;
        parameters: {
            keystoHold: {
                type: ParameterType;
                array: boolean;
                default: string[];
            };
            keyToPress: {
                type: ParameterType;
                array: boolean;
                default: string;
            };
            message: {
                type: ParameterType;
                default: string;
            };
            waitTime: {
                type: ParameterType;
                default: number;
            };
            initialText: {
                type: ParameterType;
                default: string;
            };
            allow_held_key: {
                type: ParameterType;
                default: boolean;
            };
            keyTappedEarlyFlag: {
                type: ParameterType;
                default: boolean;
            };
            showKeyboard: {
                type: ParameterType;
                default: boolean;
            };
        };
    };
    jsPsych: JsPsych;
    constructor(jsPsych: JsPsych);
    trial(displayElement: HTMLElement, trial: any): void;
}
export declare const countdownStep: {
    timeline: ({
        type: typeof CountdownTrialPlugin;
        data: {
            task: string;
        };
        stimulus?: undefined;
        choices?: undefined;
        trial_duration?: undefined;
    } | {
        type: typeof HtmlKeyboardResponsePlugin;
        stimulus: string;
        choices: string;
        trial_duration: number;
        data: {
            task: string;
        };
    })[];
};
