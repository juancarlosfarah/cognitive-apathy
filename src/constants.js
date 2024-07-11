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
export const EASY_BOUNDS = [20,40]
export const MEDIUM_BOUNDS = [40,60]
export const HARD_BOUNDS = [60,80]
export const BOUND_OPTIONS = [[20,40], [40,60], [60,80]];
export const PARAMETER_COMBINATIONS = fastCartesian([
  REWARD_OPTIONS,
  BOUND_OPTIONS,
]).map(([reward, bounds]) => ({
  reward,
  bounds,
}));

export const NUM_TRIALS = 63; // NUM_TRIALS_PER_BLOCK
// error checking
// round up to the nearest multiple of PARAMETER_COMBINATIONS.length //63 trials
export const PARAMETER_COMBINATIONS_TOTAL = Math.floor(PARAMETER_COMBINATIONS * (NUM_TRIALS / PARAMETER_COMBINATIONS.length))
//

export const NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS = 1;
export const NUM_CALIBRATION_WITH_FEEDBACK_TRIALS = 1;
export const NUM_CALIBRATION_TRIALS =
  NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS +
  NUM_CALIBRATION_WITH_FEEDBACK_TRIALS;
export const NUM_VALIDATION_TRIALS = 1

export const NUM_DEMO_TRIALS = 0






export const RELEASE_KEYS_STIMULUS_DURATION = 2000;
export const RELEASE_KEYS_TRIAL_DURATION = 3000; // should be 30000

//Messsages 
export const PASSED_VALIDATION_MESSAGE = 'Congratulations! You passed the extra validation trials.'
export const FAILED_VALIDATION_MESSAGE = 'You did not pass the extra validation trials. Experiment now ending.'
export const CALIBRATION_PART_1_DIRECTIONS = 'INSERT CALIBRATION PART 1 DIRECTIONS HERE'
export const CALIBRATION_PART_2_DIRECTIONS = 'INSERT CALIBRATION PART 2 DIRECTIONS HERE'
export const VALIDATION_DIRECTIONS = 'INSERT VALIDATION DIRECTIONS HERE'



