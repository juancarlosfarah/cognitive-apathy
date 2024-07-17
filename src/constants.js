import fastCartesian from 'fast-cartesian';

// LOADING BAR CONSTANTS
export const LOADING_BAR_SPEED_NO = 50; // How fast does the loading bar increment (between 2 and 50) after the declines a trial. Multiplied with a random number for design sake.
export const LOADING_BAR_SPEED_YES = 5; // How fast does the loading bar increment (between 2 and 50) after a user completes a trial. Multiplied with a random number for design sake.

// GENERAL THERMOMETER CONSTANTS
export const AUTO_DECREASE_AMOUNT = 2;
export const AUTO_DECREASE_RATE = 100; // how often do we decrease the thermometer (ms)
export const AUTO_INCREASE_AMOUNT = 10; // how much increase we see in the thermometer with each tap (%)
export const MAXIMUM_THERMOMETER_HEIGHT = 100; // maximum thermometer height (%)
export const EXPECTED_MAXIMUM_PERCENTAGE = 100; // where should participants end up if they tap at their maximum rate
export const KEYS_TO_HOLD = ['a', 'w', 'e']; // which keys should be held throughout the experiment
export const KEY_TO_PRESS = 'r'; // which key should be tapped throughout the experiment

// REWARD OPTIONS CONSTANTS
export const LOW_REWARDS = [0.01, 0.02, 0.03];
export const MEDIUM_REWARDS = [0.08, 0.09, 0.1, 0.11, 0.12];
export const HIGH_REWARDS = [0.17, 0.18, 0.19, 0.2, 0.21, 0.22, 0.23];
export const REWARD_OPTIONS = [LOW_REWARDS, MEDIUM_REWARDS, HIGH_REWARDS];

// TARGET BOUND CONSTANTS
export const EASY_BOUNDS = [30, 50];
export const MEDIUM_BOUNDS = [50, 70];
export const HARD_BOUNDS = [70, 90];
export const BOUND_OPTIONS = [EASY_BOUNDS, MEDIUM_BOUNDS, HARD_BOUNDS];

// CALIBRATION CONSTANTS
export const NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS = 1; // Number of calibration trials without stimuli
export const NUM_CALIBRATION_WITH_FEEDBACK_TRIALS = 1; // Number of calibration trials with stimuli
export const NUM_CALIBRATION_TRIALS =
  NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS +
  NUM_CALIBRATION_WITH_FEEDBACK_TRIALS;
export const MINIMUM_CALIBRATION_MEDIAN = 10; // Minimum median number of taps needed to continue with experiment after calibration
export const EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION = 50; // where should participants end up if they tap at their maximum rate

// VALIDATION CONSTANTS
export const NUM_VALIDATION_TRIALS = 1; // Number of validation trials per BOUND_OPTIONS (standard is 4)
export const NUM_EXTRA_VALIDATION_TRIALS = 3; // Number of extra validation trials that occurs if user fails > 3/4 of NUM_VALIDATION_TRIALS (standard is 3)

// DEMO TRIAL CONSTANTS
export const NUM_DEMO_TRIALS = 1; // Number of demo trials that occur before each block
export const MINIMUM_DEMO_TAPS = 4; // Minimum number of taps user needs to move on from a demo trial.
export const FAILED_MINIMUM_DEMO_TAPS_DURATION = 1000; // How long the error appears on the screen when minimum taps was not reached (ms)

// BLOCK TRIAL CONSTANTS
export const NUM_TRIALS = 63; // NUM_TRIALS_PER_BLOCK
export const TRIAL_DURATION = 5000; // how long does a trial last (ms)
export const PARAMETER_COMBINATIONS = fastCartesian([
  REWARD_OPTIONS,
  BOUND_OPTIONS,
]).map(([reward, bounds]) => ({
  reward,
  bounds,
}));
// round up to the nearest multiple of PARAMETER_COMBINATIONS.length //63 trials
export const PARAMETER_COMBINATIONS_TOTAL = Math.floor(
  PARAMETER_COMBINATIONS * (NUM_TRIALS / PARAMETER_COMBINATIONS.length),
);

// OTHER CONSTANTS
export const GO_DURATION = 500; // how long does the "GO" screen last (ms)
export const SUCCESS_SCREEN_DURATION = 500; // How long does the "SUCCESS" or "FAILURE" screen last (ms)
export const COUNTDOWN_TIME = 3; // how long the countdown is after "A", "W," and "E" are pressed before trial starts (s)
export const PREMATURE_KEY_RELEASE_ERROR_TIME = 1000; // how long does the premature release error appear (ms)
export const KEY_TAPPED_EARLY_ERROR_TIME = 3000; //how long does the key tapped early error appear (ms)

// MESSAGES
export const PASSED_VALIDATION_MESSAGE =
  'Congratulations! You passed the extra validation trials.';
export const FAILED_VALIDATION_MESSAGE =
  'You did not pass the extra validation trials. Experiment now ending.';
export const CALIBRATION_PART_1_DIRECTIONS =
  'INSERT CALIBRATION PART 1 DIRECTIONS HERE';
export const CALIBRATION_PART_2_DIRECTIONS =
  'INSERT CALIBRATION PART 2 DIRECTIONS HERE';
export const CALIBRATION_FINISHED_DIRECTIONS =
  'You have finished the first set of trials... INSERT MORE HERE';
export const VALIDATION_DIRECTIONS = 'INSERT VALIDATION DIRECTIONS HERE';
export const PREMATURE_KEY_RELEASE_ERROR_MESSAGE =
  'You released the keys early!';
export const LIKERT_PREAMBLE = 'Please answer the question below.';
export const FAILED_MINIMUM_DEMO_TAPS_MESSAGE =
  'You did not tap enough during the last practice trial. Please try again.';
export const HOLD_KEYS_MESSAGE = `<p>Hold the <b>${KEYS_TO_HOLD[0].toUpperCase()}</b>, <b>${KEYS_TO_HOLD[1].toUpperCase()}</b>, and <b>${KEYS_TO_HOLD[2].toUpperCase()}</b> keys!</p>`;
export const KEY_TAPPED_EARLY_MESSAGE =
  'Key was tapped too early. Please wait for the appropriate time to press the key.';
export const RELEASE_KEYS_MESSAGE = 'Release the Keys';
export const REWARD_TOTAL_MESSAGE = (totalSuccessfulReward) =>
  `Total reward for successful trials is: $${totalSuccessfulReward}. Press Enter to continue.`;
