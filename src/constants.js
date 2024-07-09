import fastCartesian from 'fast-cartesian';

// constants
export const TRIAL_DURATION = 5000; // how long does a trial last (ms)
export const COUNTDOWN_TIME = 3 // how long the countdown is after "A", "W," and "E" are pressed before trial starts (s)
export const MINIMUM_AUTO_DECREASE_AMOUNT = 0;
export const AUTO_DECREASE_RATE = 0; // how often do we decrease the thermometer (ms)
export const AUTO_INCREASE_AMOUNT = 10; // how much increase we see in the thermometer with each tap (%)
export const MAXIMUM_THERMOMETER_HEIGHT = 100; // maximum thermometer height (%)
export const EXPECTED_MAXIMUM_PERCENTAGE = 100; // where should participants end up if they tap at their maximum rate
export const EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION = 50; // where should participants end up if they tap at their maximum rate
export const TARGET_OPTIONS = [50, 70, 90];
export const REWARD_OPTIONS = [1, 10, 20];

export const PARAMETER_COMBINATIONS = fastCartesian([
  REWARD_OPTIONS,
  TARGET_OPTIONS,
]).map(([reward, targetHeight]) => ({
  reward,
  targetHeight,
}));

export const NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS = 1;
export const NUM_CALIBRATION_WITH_FEEDBACK_TRIALS = 5;
export const NUM_CALIBRATION_TRIALS =
  NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS +
  NUM_CALIBRATION_WITH_FEEDBACK_TRIALS;
export const NUM_VALIDATION_TRIALS = 1
export const NUM_TRIALS = 1
export const EASY_BOUNDS = [20,40]
export const MEDIUM_BOUNDS = [40,60]
export const HARD_BOUNDS = [60,80]
export const BOUND_OPTIONS = [EASY_BOUNDS, MEDIUM_BOUNDS, HARD_BOUNDS];





export const RELEASE_KEYS_STIMULUS_DURATION = 2000;
export const RELEASE_KEYS_TRIAL_DURATION = 3000; // should be 30000
