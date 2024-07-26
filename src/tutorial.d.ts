import htmlButtonResponse from '@jspsych/plugin-html-button-response';
import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import { CountdownTrialPlugin } from './countdown';
import TaskPlugin from './task';
import { JsPsych } from 'jspsych';
export declare const interactiveCountdown: {
    type: typeof CountdownTrialPlugin;
    message: string;
    showKeyboard: boolean;
    data: {
        task: string;
    };
};
export declare const instructionalTrial: (message: string) => {
    type: typeof HtmlKeyboardResponsePlugin;
    choices: string[];
    stimulus: () => string;
};
export declare let DOMINANT_HAND: string;
export declare const dominantHand: {
    type: typeof htmlButtonResponse;
    stimulus: string;
    choices: string[];
    data: {
        task: string;
    };
    on_finish: (data: any) => void;
};
export declare const noStimuliVideoTutorial: {
    type: typeof htmlButtonResponse;
    stimulus: string[];
    choices: string[];
    enable_button_after: number;
};
export declare const noStimuliVideoTutorialTrial: (jsPsych: JsPsych) => {
    timeline: {
        type: typeof htmlButtonResponse;
        stimulus: string[];
        choices: string[];
        enable_button_after: number;
    }[];
    on_finish: () => void;
};
export declare const stimuliVideoTutorial: {
    type: typeof htmlButtonResponse;
    stimulus: string[];
    choices: string[];
    enable_button_after: number;
};
export declare const stimuliVideoTutorialTrial: (jsPsych: JsPsych) => {
    timeline: {
        type: typeof htmlButtonResponse;
        stimulus: string[];
        choices: string[];
        enable_button_after: number;
    }[];
    on_finish: () => void;
};
export declare const validationVideoTutorial: {
    type: typeof htmlButtonResponse;
    stimulus: string[];
    choices: string[];
    enable_button_after: number;
};
export declare const validationVideoTutorialTrial: (jsPsych: JsPsych) => {
    timeline: {
        type: typeof htmlButtonResponse;
        stimulus: string[];
        choices: string[];
        enable_button_after: number;
    }[];
    on_finish: () => void;
};
export declare const practiceTrial: (jsPsych: JsPsych) => {
    timeline: ({
        type: typeof TaskPlugin;
        showThermometer: boolean;
        task: string;
        on_start: (trial: any) => void;
        timeline?: undefined;
        conditional_function?: undefined;
    } | {
        timeline: {
            type: typeof import("./release-keys").ReleaseKeysPlugin;
            valid_responses: string[];
        }[];
        conditional_function: () => boolean;
        type?: undefined;
        showThermometer?: undefined;
        task?: undefined;
        on_start?: undefined;
    })[];
};
export declare const practiceLoop: (jsPsych: JsPsych) => {
    timeline: ({
        type: typeof HtmlKeyboardResponsePlugin;
        stimulus: () => string;
        choices: string;
        on_load: () => void;
        on_finish: () => void;
    } | {
        type: typeof CountdownTrialPlugin;
        message: string;
        showKeyboard: boolean;
        data: {
            task: string;
        };
    } | {
        timeline: ({
            type: typeof TaskPlugin;
            showThermometer: boolean;
            task: string;
            on_start: (trial: any) => void;
            timeline?: undefined;
            conditional_function?: undefined;
        } | {
            timeline: {
                type: typeof import("./release-keys").ReleaseKeysPlugin;
                valid_responses: string[];
            }[];
            conditional_function: () => boolean;
            type?: undefined;
            showThermometer?: undefined;
            task?: undefined;
            on_start?: undefined;
        })[];
    } | {
        type: typeof HtmlKeyboardResponsePlugin;
        stimulus: string;
        choices: string;
        trial_duration: number;
        data: {
            task: string;
        };
    })[];
    loop_function: () => boolean;
};
