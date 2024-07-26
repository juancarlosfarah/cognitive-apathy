import { JsPsych } from 'jspsych';
/**
 * Generate a random number with a bias towards the mean.
 *
 * @param {number} min - The minimum value in the range.
 * @param {number} max - The maximum value in the range.
 * @param {number} skew - The skew factor to bias the distribution (default is 1).
 * @returns {number} - A random number between min and max, skewed towards the mean.
 */
export declare function randomNumberBm(min: number, max: number, skew?: number): number;
/**
 * Calculate the auto-increase amount for the thermometer.
 *
 * @param {number} EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION - The expected maximum percentage for calibration.
 * @param {number} TRIAL_DURATION - The duration of the trial.
 * @param {number} AUTO_DECREASE_RATE - The rate at which auto-decrease occurs.
 * @param {number} AUTO_DECREASE_AMOUNT - The amount by which auto-decrease occurs.
 * @returns {number} - The calculated auto-increase amount.
 */
export declare function autoIncreaseAmount(EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION: number, TRIAL_DURATION: number, AUTO_DECREASE_RATE: number, AUTO_DECREASE_AMOUNT: number, median: number): number;
/**
 * @function calculateMedianTapCount
 * @description Calculate the median tap count for a given task type and number of trials
 * @param {string} taskType - The task type to filter data by
 * @param {number} numTrials - The number of trials to consider
 * @param {JsPsych} jsPsych - The jsPsych instance
 * @returns {number} - The median tap count
 */
export declare function calculateMedianTapCount(taskType: string, numTrials: number, jsPsych: JsPsych): number;
export declare const checkFlag: (taskFilter: string, flag: string, jsPsych: JsPsych) => boolean;
export declare function calculateTotalReward(jsPsych: JsPsych): number;
export declare const getQueryParam: (param: string) => string | null;
