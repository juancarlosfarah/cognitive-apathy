import { JsPsych } from 'jspsych';
// Define the State interface
export interface State {
  medianTaps: number;
  medianTapsPart1: number;
  calibrationPart1Failed: boolean;
  calibrationPart2Failed: boolean;
  calibrationPart1Successes: number;
  calibrationPart2Successes: number;
  finalCalibrationPart1Successes: number;
  finalCalibrationPart2Successes: number;
  validationExtraFailures: number;
  validationSuccess: boolean;
  extraValidationRequired: boolean;
  validationFailures: Record<string, number>;
  failedMinimumDemoTapsTrial: number;
  demoTrialSuccesses: number;
  minimumDemoTapsReached: boolean;
  completedBlockCount: number;
  numberOfPracticeLoopsCompleted: number;
  finalMedianTapsPart1: number;
  finalMedianTapsPart2: number;
  userID: any;
  [key: string]: number | boolean | Record<string, number> | string; // Allow dynamic keys with specific types
}


// Define the CalibrationTrialParams interface
export interface CalibrationTrialParams {
  showThermometer: boolean;
  bounds: number[];
  calibrationPart: string;
  jsPsych: JsPsych;
  state: State;
}

// Define the ConditionalCalibrationTrialParams interface
export interface ConditionalCalibrationTrialParams {
  calibrationPart: string;
  jsPsych: JsPsych;
  state: State;
}

interface MedianTaps {
  calibrationPart1Median: number; 
  calibrationPart2Median: number;   
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
  keysState?: { [key: string]: boolean }
  medianTaps?: MedianTaps //FIX ANY TYPE
}

export interface PassedTaskData {
  bounds: number[];
  originalBounds: number[];
  reward: number;
  accepted?: boolean; // Added accepted as optional
  randomDelay: number[];
  randomChanceAccepted?: boolean
}


export interface CreateTrialBlockParams {
  blockName?: string;
  randomDelay: [number, number];
  bounds?: [number, number];
  includeDemo?: boolean;
  jsPsych: JsPsych;
  state: State;
}

type TrialBlock = { timeline: any[] } | { [key: string]: any }; // Define the type of each block or trial
export type TrialOrdersType = Record<string, TrialBlock[][][]>;
