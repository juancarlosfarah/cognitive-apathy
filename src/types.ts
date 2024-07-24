import { JsPsych } from 'jspsych';

// Define the State interface
export interface State {
  medianTaps: number;
  medianTapsPart1: number;
  medianTapsPart2: number;
  calibrationPart1Successes: number;
  calibrationPart2Successes: number;
  conditionalMedianTapsPart1: number;
  conditionalMedianTapsPart2: number;
  validationExtraFailures: number;
  validationSuccess: boolean;
  extraValidationRequired: boolean;
  validationFailures: Record<string, number>;
  failedMinimumDemoTapsTrial: number;
  demoTrialSuccesses: number;
}

// Define the CalibrationTrialParams interface
export interface CalibrationTrialParams {
  showThermometer: boolean;
  bounds: number[];
  repetitions: number;
  calibrationPart: string;
  jsPsych: JsPsych;
  state: State;
}

// Define the ConditionalCalibrationTrialParams interface
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
  accepted?: boolean; // Added accepted as optional
  response?: string;
  minimumTapsReached?: boolean;
}

export interface PassedTaskData {
  bounds: number[];
  reward: number;
  accepted?: boolean; // Added accepted as optional
  randomDelay: number[];
}

