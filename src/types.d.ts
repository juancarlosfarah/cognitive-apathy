import { JsPsych } from 'jspsych';
export interface State {
    medianTaps: number;
    medianTapsPart1: number;
    calibrationPart1Failed: boolean;
    calibrationPart2Failed: boolean;
    calibrationPart1Successes: number;
    calibrationPart2Successes: number;
    validationExtraFailures: number;
    validationSuccess: boolean;
    extraValidationRequired: boolean;
    validationFailures: Record<string, number>;
    failedMinimumDemoTapsTrial: number;
    demoTrialSuccesses: number;
    minimumDemoTapsReached: boolean;
}
export interface CalibrationTrialParams {
    showThermometer: boolean;
    bounds: number[];
    repetitions: number;
    calibrationPart: string;
    jsPsych: JsPsych;
    state: State;
}
export interface ConditionalCalibrationTrialParams {
    calibrationPart: string;
    numTrials: number;
    jsPsych: JsPsych;
    state: State;
}
export interface ValidationData {
    task: string;
    success: boolean;
}
export interface TaskTrialData {
    tapCount: number;
    startTime: number;
    endTime: number;
    mercuryHeight: number;
    error: string;
    bounds: number[];
    reward: number;
    task: string;
    errorOccurred: boolean;
    keysReleasedFlag: boolean;
    success: boolean;
    keyTappedEarlyFlag: boolean;
    accepted?: boolean;
    response?: string;
    minimumTapsReached?: boolean;
}
export interface PassedTaskData {
    bounds: number[];
    reward: number;
    accepted?: boolean;
    randomDelay: number[];
}
