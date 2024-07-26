import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import { JsPsych } from 'jspsych';
import { CountdownTrialPlugin } from './countdown';
import TaskPlugin from './task';
import { CalibrationTrialParams, ConditionalCalibrationTrialParams, State } from './types';
export declare const createCalibrationTrial: ({ showThermometer, bounds, repetitions, calibrationPart, jsPsych, state, }: CalibrationTrialParams) => {
    timeline: ({
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
    } | {
        type: typeof TaskPlugin;
        task: string;
        trial_duration: number;
        showThermometer: boolean;
        bounds: number[];
        autoIncreaseAmount: () => number;
        on_start: (trial: any) => void;
        on_finish: (data: any) => void;
        timeline?: undefined;
        conditional_function?: undefined;
    } | {
        timeline: {
            type: typeof import("./release-keys").ReleaseKeysPlugin;
            valid_responses: string[];
        }[];
        conditional_function: () => boolean;
        type?: undefined;
        task?: undefined;
        trial_duration?: undefined;
        showThermometer?: undefined;
        bounds?: undefined;
        autoIncreaseAmount?: undefined;
        on_start?: undefined;
        on_finish?: undefined;
    } | {
        timeline: {
            type: typeof HtmlKeyboardResponsePlugin;
            stimulus: () => string;
            choices: string;
            on_load: () => void;
            on_finish: () => void;
        }[];
        type?: undefined;
        task?: undefined;
        trial_duration?: undefined;
        showThermometer?: undefined;
        bounds?: undefined;
        autoIncreaseAmount?: undefined;
        on_start?: undefined;
        on_finish?: undefined;
        conditional_function?: undefined;
    })[];
    loop_function: () => boolean;
};
/**
 * @function createConditionalCalibrationTrial
 * @description Create a conditional calibration trial
 * @param {ConditionalCalibrationTrialParams} params - The parameters for the conditional calibration trial
 * @returns {Object} - jsPsych trial object
 */
export declare const createConditionalCalibrationTrial: ({ calibrationPart, numTrials, jsPsych, state, }: ConditionalCalibrationTrialParams) => {
    timeline: ({
        timeline: ({
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
        } | {
            type: typeof TaskPlugin;
            task: string;
            trial_duration: number;
            showThermometer: boolean;
            bounds: number[];
            autoIncreaseAmount: () => number;
            on_start: (trial: any) => void;
            on_finish: (data: any) => void;
            timeline?: undefined;
            conditional_function?: undefined;
        } | {
            timeline: {
                type: typeof import("./release-keys").ReleaseKeysPlugin;
                valid_responses: string[];
            }[];
            conditional_function: () => boolean;
            type?: undefined;
            task?: undefined;
            trial_duration?: undefined;
            showThermometer?: undefined;
            bounds?: undefined;
            autoIncreaseAmount?: undefined;
            on_start?: undefined;
            on_finish?: undefined;
        } | {
            timeline: {
                type: typeof HtmlKeyboardResponsePlugin;
                stimulus: () => string;
                choices: string;
                on_load: () => void;
                on_finish: () => void;
            }[];
            type?: undefined;
            task?: undefined;
            trial_duration?: undefined;
            showThermometer?: undefined;
            bounds?: undefined;
            autoIncreaseAmount?: undefined;
            on_start?: undefined;
            on_finish?: undefined;
            conditional_function?: undefined;
        })[];
        loop_function: () => boolean;
    } | {
        type: typeof HtmlKeyboardResponsePlugin;
        choices: string[];
        stimulus: () => string;
        timeline?: undefined;
        conditional_function?: undefined;
    } | {
        timeline: {
            type: typeof HtmlKeyboardResponsePlugin;
            choices: string[];
            stimulus: string;
            data: {
                task: string;
            };
            on_finish: (data: any) => void;
        }[];
        conditional_function: () => boolean | undefined;
        type?: undefined;
        choices?: undefined;
        stimulus?: undefined;
    })[];
    conditional_function: () => boolean | undefined;
};
export declare const calibrationTrialPart1: (jsPsych: JsPsych, state: State) => {
    timeline: ({
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
    } | {
        type: typeof TaskPlugin;
        task: string;
        trial_duration: number;
        showThermometer: boolean;
        bounds: number[];
        autoIncreaseAmount: () => number;
        on_start: (trial: any) => void;
        on_finish: (data: any) => void;
        timeline?: undefined;
        conditional_function?: undefined;
    } | {
        timeline: {
            type: typeof import("./release-keys").ReleaseKeysPlugin;
            valid_responses: string[];
        }[];
        conditional_function: () => boolean;
        type?: undefined;
        task?: undefined;
        trial_duration?: undefined;
        showThermometer?: undefined;
        bounds?: undefined;
        autoIncreaseAmount?: undefined;
        on_start?: undefined;
        on_finish?: undefined;
    } | {
        timeline: {
            type: typeof HtmlKeyboardResponsePlugin;
            stimulus: () => string;
            choices: string;
            on_load: () => void;
            on_finish: () => void;
        }[];
        type?: undefined;
        task?: undefined;
        trial_duration?: undefined;
        showThermometer?: undefined;
        bounds?: undefined;
        autoIncreaseAmount?: undefined;
        on_start?: undefined;
        on_finish?: undefined;
        conditional_function?: undefined;
    })[];
    loop_function: () => boolean;
};
export declare const conditionalCalibrationTrialPart1: (jsPsych: JsPsych, state: State) => {
    timeline: ({
        timeline: ({
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
        } | {
            type: typeof TaskPlugin;
            task: string;
            trial_duration: number;
            showThermometer: boolean;
            bounds: number[];
            autoIncreaseAmount: () => number;
            on_start: (trial: any) => void;
            on_finish: (data: any) => void;
            timeline?: undefined;
            conditional_function?: undefined;
        } | {
            timeline: {
                type: typeof import("./release-keys").ReleaseKeysPlugin;
                valid_responses: string[];
            }[];
            conditional_function: () => boolean;
            type?: undefined;
            task?: undefined;
            trial_duration?: undefined;
            showThermometer?: undefined;
            bounds?: undefined;
            autoIncreaseAmount?: undefined;
            on_start?: undefined;
            on_finish?: undefined;
        } | {
            timeline: {
                type: typeof HtmlKeyboardResponsePlugin;
                stimulus: () => string;
                choices: string;
                on_load: () => void;
                on_finish: () => void;
            }[];
            type?: undefined;
            task?: undefined;
            trial_duration?: undefined;
            showThermometer?: undefined;
            bounds?: undefined;
            autoIncreaseAmount?: undefined;
            on_start?: undefined;
            on_finish?: undefined;
            conditional_function?: undefined;
        })[];
        loop_function: () => boolean;
    } | {
        type: typeof HtmlKeyboardResponsePlugin;
        choices: string[];
        stimulus: () => string;
        timeline?: undefined;
        conditional_function?: undefined;
    } | {
        timeline: {
            type: typeof HtmlKeyboardResponsePlugin;
            choices: string[];
            stimulus: string;
            data: {
                task: string;
            };
            on_finish: (data: any) => void;
        }[];
        conditional_function: () => boolean | undefined;
        type?: undefined;
        choices?: undefined;
        stimulus?: undefined;
    })[];
    conditional_function: () => boolean | undefined;
};
export declare const calibrationTrialPart2: (jsPsych: JsPsych, state: State) => {
    timeline: ({
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
    } | {
        type: typeof TaskPlugin;
        task: string;
        trial_duration: number;
        showThermometer: boolean;
        bounds: number[];
        autoIncreaseAmount: () => number;
        on_start: (trial: any) => void;
        on_finish: (data: any) => void;
        timeline?: undefined;
        conditional_function?: undefined;
    } | {
        timeline: {
            type: typeof import("./release-keys").ReleaseKeysPlugin;
            valid_responses: string[];
        }[];
        conditional_function: () => boolean;
        type?: undefined;
        task?: undefined;
        trial_duration?: undefined;
        showThermometer?: undefined;
        bounds?: undefined;
        autoIncreaseAmount?: undefined;
        on_start?: undefined;
        on_finish?: undefined;
    } | {
        timeline: {
            type: typeof HtmlKeyboardResponsePlugin;
            stimulus: () => string;
            choices: string;
            on_load: () => void;
            on_finish: () => void;
        }[];
        type?: undefined;
        task?: undefined;
        trial_duration?: undefined;
        showThermometer?: undefined;
        bounds?: undefined;
        autoIncreaseAmount?: undefined;
        on_start?: undefined;
        on_finish?: undefined;
        conditional_function?: undefined;
    })[];
    loop_function: () => boolean;
};
export declare const conditionalCalibrationTrialPart2: (jsPsych: JsPsych, state: State) => {
    timeline: ({
        timeline: ({
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
        } | {
            type: typeof TaskPlugin;
            task: string;
            trial_duration: number;
            showThermometer: boolean;
            bounds: number[];
            autoIncreaseAmount: () => number;
            on_start: (trial: any) => void;
            on_finish: (data: any) => void;
            timeline?: undefined;
            conditional_function?: undefined;
        } | {
            timeline: {
                type: typeof import("./release-keys").ReleaseKeysPlugin;
                valid_responses: string[];
            }[];
            conditional_function: () => boolean;
            type?: undefined;
            task?: undefined;
            trial_duration?: undefined;
            showThermometer?: undefined;
            bounds?: undefined;
            autoIncreaseAmount?: undefined;
            on_start?: undefined;
            on_finish?: undefined;
        } | {
            timeline: {
                type: typeof HtmlKeyboardResponsePlugin;
                stimulus: () => string;
                choices: string;
                on_load: () => void;
                on_finish: () => void;
            }[];
            type?: undefined;
            task?: undefined;
            trial_duration?: undefined;
            showThermometer?: undefined;
            bounds?: undefined;
            autoIncreaseAmount?: undefined;
            on_start?: undefined;
            on_finish?: undefined;
            conditional_function?: undefined;
        })[];
        loop_function: () => boolean;
    } | {
        type: typeof HtmlKeyboardResponsePlugin;
        choices: string[];
        stimulus: () => string;
        timeline?: undefined;
        conditional_function?: undefined;
    } | {
        timeline: {
            type: typeof HtmlKeyboardResponsePlugin;
            choices: string[];
            stimulus: string;
            data: {
                task: string;
            };
            on_finish: (data: any) => void;
        }[];
        conditional_function: () => boolean | undefined;
        type?: undefined;
        choices?: undefined;
        stimulus?: undefined;
    })[];
    conditional_function: () => boolean | undefined;
};
