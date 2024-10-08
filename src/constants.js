import fastCartesian from 'fast-cartesian';

// constants
export const TRIAL_DURATION = 5000; // how long does a trial last (ms)

export const MINIMUM_AUTO_DECREASE_AMOUNT = 0.5;
export const AUTO_DECREASE_RATE = 100; // how often do we decrease the thermometer (ms)
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

export const NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS = 4;
export const NUM_CALIBRATION_WITH_FEEDBACK_TRIALS = 3;
export const NUM_CALIBRATION_TRIALS =
  NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS +
  NUM_CALIBRATION_WITH_FEEDBACK_TRIALS;

export const RELEASE_KEYS_STIMULUS_DURATION = 2000;
export const RELEASE_KEYS_TRIAL_DURATION = 3000; // should be 30000
