import { ParameterType, JsPsych } from 'jspsych';
export declare class ReleaseKeysPlugin {
    static info: {
        name: string;
        parameters: {
            stimulus: {
                type: ParameterType;
                default: string;
            };
            valid_responses: {
                type: ParameterType;
                array: boolean;
                default: string[];
            };
            stimulus_duration: {
                type: ParameterType;
                default: null;
            };
            trial_duration: {
                type: ParameterType;
                default: null;
            };
            allow_held_key: {
                type: ParameterType;
                default: boolean;
            };
        };
    };
    jsPsych: JsPsych;
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: any): void;
}
export declare const releaseKeysStep: {
    type: typeof ReleaseKeysPlugin;
    valid_responses: string[];
};
