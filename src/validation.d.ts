import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import TaskPlugin from './task';
import { State, ValidationData } from './types';
import { JsPsych } from 'jspsych';
export declare const handleValidationFinish: (data: ValidationData, validationName: string, state: State) => void;
export declare const createValidationTrial: (bounds: number[], validationName: string, repetitions: number, jsPsych: JsPsych, state: State) => {
    timeline: ({
        timeline: ({
            type: typeof import("./countdown").CountdownTrialPlugin;
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
        duration: number;
        showThermometer: boolean;
        bounds: number[];
        autoIncreaseAmount: () => number;
        data: {
            task: string;
        };
        on_finish: (data: ValidationData) => void;
        timeline?: undefined;
        conditional_function?: undefined;
    } | {
        timeline: {
            type: typeof HtmlKeyboardResponsePlugin;
            stimulus: () => string;
            choices: string;
            trial_duration: number;
            data: {
                task: string;
            };
        }[];
        type?: undefined;
        task?: undefined;
        duration?: undefined;
        showThermometer?: undefined;
        bounds?: undefined;
        autoIncreaseAmount?: undefined;
        data?: undefined;
        on_finish?: undefined;
        conditional_function?: undefined;
    } | {
        timeline: {
            type: typeof import("./release-keys").ReleaseKeysPlugin;
            valid_responses: string[];
        }[];
        conditional_function: () => boolean;
        type?: undefined;
        task?: undefined;
        duration?: undefined;
        showThermometer?: undefined;
        bounds?: undefined;
        autoIncreaseAmount?: undefined;
        data?: undefined;
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
        duration?: undefined;
        showThermometer?: undefined;
        bounds?: undefined;
        autoIncreaseAmount?: undefined;
        data?: undefined;
        on_finish?: undefined;
        conditional_function?: undefined;
    })[];
    repetitions: number;
};
export declare const validationResultScreen: (jsPsych: JsPsych, state: State) => {
    type: typeof HtmlKeyboardResponsePlugin;
    choices: string[];
    stimulus: () => string;
    on_finish: () => void;
};
export declare const validationTrialEasy: (jsPsych: JsPsych, state: State) => {
    timeline: ({
        timeline: ({
            type: typeof import("./countdown").CountdownTrialPlugin;
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
        duration: number;
        showThermometer: boolean;
        bounds: number[];
        autoIncreaseAmount: () => number;
        data: {
            task: string;
        };
        on_finish: (data: ValidationData) => void;
        timeline?: undefined;
        conditional_function?: undefined;
    } | {
        timeline: {
            type: typeof HtmlKeyboardResponsePlugin;
            stimulus: () => string;
            choices: string;
            trial_duration: number;
            data: {
                task: string;
            };
        }[];
        type?: undefined;
        task?: undefined;
        duration?: undefined;
        showThermometer?: undefined;
        bounds?: undefined;
        autoIncreaseAmount?: undefined;
        data?: undefined;
        on_finish?: undefined;
        conditional_function?: undefined;
    } | {
        timeline: {
            type: typeof import("./release-keys").ReleaseKeysPlugin;
            valid_responses: string[];
        }[];
        conditional_function: () => boolean;
        type?: undefined;
        task?: undefined;
        duration?: undefined;
        showThermometer?: undefined;
        bounds?: undefined;
        autoIncreaseAmount?: undefined;
        data?: undefined;
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
        duration?: undefined;
        showThermometer?: undefined;
        bounds?: undefined;
        autoIncreaseAmount?: undefined;
        data?: undefined;
        on_finish?: undefined;
        conditional_function?: undefined;
    })[];
    repetitions: number;
};
export declare const validationTrialMedium: (jsPsych: JsPsych, state: State) => {
    timeline: ({
        timeline: ({
            type: typeof import("./countdown").CountdownTrialPlugin;
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
        duration: number;
        showThermometer: boolean;
        bounds: number[];
        autoIncreaseAmount: () => number;
        data: {
            task: string;
        };
        on_finish: (data: ValidationData) => void;
        timeline?: undefined;
        conditional_function?: undefined;
    } | {
        timeline: {
            type: typeof HtmlKeyboardResponsePlugin;
            stimulus: () => string;
            choices: string;
            trial_duration: number;
            data: {
                task: string;
            };
        }[];
        type?: undefined;
        task?: undefined;
        duration?: undefined;
        showThermometer?: undefined;
        bounds?: undefined;
        autoIncreaseAmount?: undefined;
        data?: undefined;
        on_finish?: undefined;
        conditional_function?: undefined;
    } | {
        timeline: {
            type: typeof import("./release-keys").ReleaseKeysPlugin;
            valid_responses: string[];
        }[];
        conditional_function: () => boolean;
        type?: undefined;
        task?: undefined;
        duration?: undefined;
        showThermometer?: undefined;
        bounds?: undefined;
        autoIncreaseAmount?: undefined;
        data?: undefined;
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
        duration?: undefined;
        showThermometer?: undefined;
        bounds?: undefined;
        autoIncreaseAmount?: undefined;
        data?: undefined;
        on_finish?: undefined;
        conditional_function?: undefined;
    })[];
    repetitions: number;
};
export declare const validationTrialHard: (jsPsych: JsPsych, state: State) => {
    timeline: ({
        timeline: ({
            type: typeof import("./countdown").CountdownTrialPlugin;
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
        duration: number;
        showThermometer: boolean;
        bounds: number[];
        autoIncreaseAmount: () => number;
        data: {
            task: string;
        };
        on_finish: (data: ValidationData) => void;
        timeline?: undefined;
        conditional_function?: undefined;
    } | {
        timeline: {
            type: typeof HtmlKeyboardResponsePlugin;
            stimulus: () => string;
            choices: string;
            trial_duration: number;
            data: {
                task: string;
            };
        }[];
        type?: undefined;
        task?: undefined;
        duration?: undefined;
        showThermometer?: undefined;
        bounds?: undefined;
        autoIncreaseAmount?: undefined;
        data?: undefined;
        on_finish?: undefined;
        conditional_function?: undefined;
    } | {
        timeline: {
            type: typeof import("./release-keys").ReleaseKeysPlugin;
            valid_responses: string[];
        }[];
        conditional_function: () => boolean;
        type?: undefined;
        task?: undefined;
        duration?: undefined;
        showThermometer?: undefined;
        bounds?: undefined;
        autoIncreaseAmount?: undefined;
        data?: undefined;
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
        duration?: undefined;
        showThermometer?: undefined;
        bounds?: undefined;
        autoIncreaseAmount?: undefined;
        data?: undefined;
        on_finish?: undefined;
        conditional_function?: undefined;
    })[];
    repetitions: number;
};
export declare const validationTrialExtra: (jsPsych: JsPsych, state: State) => {
    timeline: ({
        timeline: ({
            type: typeof import("./countdown").CountdownTrialPlugin;
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
        duration: number;
        showThermometer: boolean;
        bounds: number[];
        autoIncreaseAmount: () => number;
        data: {
            task: string;
        };
        on_finish: (data: ValidationData) => void;
        timeline?: undefined;
        conditional_function?: undefined;
    } | {
        timeline: {
            type: typeof HtmlKeyboardResponsePlugin;
            stimulus: () => string;
            choices: string;
            trial_duration: number;
            data: {
                task: string;
            };
        }[];
        type?: undefined;
        task?: undefined;
        duration?: undefined;
        showThermometer?: undefined;
        bounds?: undefined;
        autoIncreaseAmount?: undefined;
        data?: undefined;
        on_finish?: undefined;
        conditional_function?: undefined;
    } | {
        timeline: {
            type: typeof import("./release-keys").ReleaseKeysPlugin;
            valid_responses: string[];
        }[];
        conditional_function: () => boolean;
        type?: undefined;
        task?: undefined;
        duration?: undefined;
        showThermometer?: undefined;
        bounds?: undefined;
        autoIncreaseAmount?: undefined;
        data?: undefined;
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
        duration?: undefined;
        showThermometer?: undefined;
        bounds?: undefined;
        autoIncreaseAmount?: undefined;
        data?: undefined;
        on_finish?: undefined;
        conditional_function?: undefined;
    })[];
    repetitions: number;
};
