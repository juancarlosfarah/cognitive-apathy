import { ParameterType, JsPsych } from 'jspsych';
declare class TaskPlugin {
    static info: {
        name: string;
        parameters: {
            task: {
                type: ParameterType;
                default: string;
            };
            autoDecreaseAmount: {
                type: ParameterType;
                default: number;
            };
            autoDecreaseRate: {
                type: ParameterType;
                default: number;
            };
            autoIncreaseAmount: {
                type: ParameterType;
                default: number;
            };
            showThermometer: {
                type: ParameterType;
                default: boolean;
            };
            bounds: {
                type: ParameterType;
                array: boolean;
                default: number[];
            };
            trial_duration: {
                type: ParameterType;
                default: number;
            };
            keysReleasedFlag: {
                type: ParameterType;
                default: boolean;
            };
            randomDelay: {
                type: ParameterType;
                array: boolean;
                default: number[];
            };
            reward: {
                type: ParameterType;
                default: number;
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
    mercuryHeight: number;
    isKeyDown: boolean;
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: any): void;
}
export default TaskPlugin;
