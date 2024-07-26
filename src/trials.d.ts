import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import { JsPsych } from 'jspsych';
import { State } from './types';
interface CreateTrialBlockParams {
    blockName?: string;
    randomDelay: [number, number];
    bounds?: [number, number];
    includeDemo?: boolean;
    jsPsych: JsPsych;
    state: State;
}
export declare const createTrialBlock: ({ blockName, randomDelay, bounds, includeDemo, jsPsych, state, }: CreateTrialBlockParams) => {
    timeline: any[];
};
export declare function createRewardDisplayTrial(jsPsych: JsPsych): {
    type: typeof HtmlKeyboardResponsePlugin;
    choices: string[];
    stimulus: () => string;
    data: {
        task: string;
    };
    on_finish: (data: any) => void;
};
export declare const trialsArray: (jsPsych: JsPsych, state: State) => ({
    type: typeof HtmlKeyboardResponsePlugin;
    choices: string[];
    stimulus: () => string;
    data: {
        task: string;
    };
    on_finish: (data: any) => void;
} | {
    timeline: any[];
})[][];
export declare const sampledArray: (jsPsych: JsPsych, state: State) => any[];
export {};
