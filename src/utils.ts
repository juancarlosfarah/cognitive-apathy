import { JsPsych } from 'jspsych';
import { EASY_BOUNDS, NUM_TRIALS, PARAMETER_COMBINATIONS } from './constants';

/**
 * Generate a random number with a bias towards the mean.
 *
 * @param {number} min - The minimum value in the range.
 * @param {number} max - The maximum value in the range.
 * @param {number} skew - The skew factor to bias the distribution (default is 1).
 * @returns {number} - A random number between min and max, skewed towards the mean.
 */
export function randomNumberBm(min: number, max: number, skew = 1): number {
  let u = 0;
  let v = 0;
  // Converting [0,1) to (0,1)
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) {
    num = randomNumberBm(min, max, skew); // Resample between 0 and 1 if out of range
  } else {
    num = Math.pow(num, skew); // Apply skew
    num *= max - min; // Stretch to fill range
    num += min; // Offset to min
  }
  return num;
}

/**
 * Calculate the auto-increase amount for each tap within the thermometer.
 *
 * @param {number} EXPECTED_MAXIMUM_PERCENTAGE - The expected maximum percentage for calibration.
 * @param {number} TRIAL_DURATION - The duration of the trial.
 * @param {number} AUTO_DECREASE_RATE - The rate at which auto-decrease occurs.
 * @param {number} AUTO_DECREASE_AMOUNT - The amount by which auto-decrease occurs.
 * @returns {number} - The calculated auto-increase amount.
 */
export function autoIncreaseAmount(
  EXPECTED_MAXIMUM_PERCENTAGE: number,
  TRIAL_DURATION: number,
  AUTO_DECREASE_RATE: number,
  AUTO_DECREASE_AMOUNT: number,
  median: number
): number {
  return (
    (EXPECTED_MAXIMUM_PERCENTAGE+
      (TRIAL_DURATION / AUTO_DECREASE_RATE) * AUTO_DECREASE_AMOUNT) /
    median
  );
}

/**
 * @function calculateMedianTapCount
 * @description Calculate the median tap count for a given task type and number of trials that were successful (no keys released early and key was not tapped early)
 * @param {string} taskType - The task type to filter data by
 * @param {number} numTrials - The number of trials to consider
 * @param {JsPsych} jsPsych - The jsPsych instance
 * @returns {number} - The median tap count
 */
export function calculateMedianTapCount(
  taskType: string,
  numTrials: number,
  jsPsych: JsPsych
): number {
  const filteredTrials = jsPsych.data
    .get()
    .filter({ task: taskType })
    .filter({ keysReleasedFlag: false, keyTappedEarlyFlag: false})
    .last(numTrials)
    .select('tapCount');

  const medianValue = filteredTrials.median(); // Calculate the median
  return medianValue;
}


/**
 * @function checkFlag
 * @description Checks if a specific flag is set in the last trial of a specified task type.
 *
 * @param {string} taskFilter - The task type to filter the data by.
 * @param {string} flag - The flag to check (e.g., 'keyTappedEarlyFlag' or 'keysReleasedFlag').
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @returns {boolean} - Returns true if the specified flag is set; otherwise, false.
 */

export const checkFlag = (
  taskFilter: string,
  flag: string,
  jsPsych: JsPsych
): boolean => {
  const lastCountdownData = jsPsych.data
    .get()
    .filter({ task: taskFilter })
    .last(1)
    .values()[0];

  if (flag === 'keyTappedEarlyFlag') {
    return lastCountdownData ? lastCountdownData.keyTappedEarlyFlag : false;
  } else if (flag === 'keysReleasedFlag') {
    return lastCountdownData ? lastCountdownData.keysReleasedFlag : true;
  }
  return false;
};

/**
 * @function checkKeys
 * @description Checks whether all keys were held down at the end of the last trial of a specified task type.
 *
 * @param {string} taskFilter - The task type to filter the data by.
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @returns {boolean} - Returns true if all keys were held down; otherwise, false.
 */
export const checkKeys = (
  taskFilter: string,
  jsPsych: JsPsych
): boolean => {
  const lastTrialData = jsPsych.data.get().filter({ task: taskFilter }).last(1).values()[0];
  const keysState = lastTrialData.keysState;
  const wereKeysHeld = Object.values(keysState).every(state => state);
  return wereKeysHeld
};

/**
 * @function calculateTotalReward
 * @description Calculates the total accumulated reward from successful trials.
 *
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @returns {number} - The total accumulated reward from successful trials.
 */
export function calculateTotalReward(jsPsych: JsPsych): number {
  const successfulTrials = jsPsych.data
    .get()
    .filter({ task: 'block', success: true });
  console.log(successfulTrials);
  console.log(successfulTrials.select('reward'));
  // If random chance is implemented, this is useful to calculate the rewards including skipped trials
/*   const accceptedSkippedTrials = jsPsych.data
    .get()
    .filter({ task: 'block', accept: true, randomChanceAccepted: true, success: false});
    console.log(accceptedSkippedTrials)
    console.log(accceptedSkippedTrials.select('reward')); */
  return (successfulTrials.select('reward').sum()/* +accceptedSkippedTrials.select('reward').sum() */);
}

/**
 * @function getQueryParam
 * @description Retrieves the value of a specified query parameter from the URL. Current options are ?lang=en and ?lang=fr
 *
 * @param {string} param - The name of the query parameter to retrieve.
 * @returns {string | null} - The value of the query parameter, or null if not found.
 */
export const getQueryParam = (param: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

/**
 * @function changeProgressBar
 * @description Updates the progress bar and progress bar message in the jsPsych experiment.
 *
 * @param {string} name - The message to display alongside the progress bar.
 * @param {number} percent - The percentage of progress to display.
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 */
export const changeProgressBar = (name: string, percent: number, jsPsych: JsPsych) => {
  const progressBarMessageElement = document.getElementsByTagName('span')[0];
  jsPsych.progressBar!.progress = percent
  progressBarMessageElement!.innerText = name;
}

/**
 * @function showEndScreen
 * @description Displays an end screen with a specified message.
 *
 * @param {string} message - The message to display on the end screen.
 */
export function showEndScreen(message: string): void {
  const screen: HTMLElement = document.createElement('div');
  screen.classList.add('custom-overlay');
  screen.innerHTML = `<h2 style="text-align: center; top: 50%;">${message}</h2>`;
  document.body.appendChild(screen);
} 

/**
 * @function saveDataToLocalStorage
 * @description Saves the current jsPsych data to local storage.
 *
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 */
export function saveDataToLocalStorage(jsPsych: JsPsych) {
  const jsonData = jsPsych.data.get().json();
  localStorage.setItem('jspsych-data', jsonData);
}


/**
 * @function createShuffledTrials
 * @description Creates and shuffles trials based on parameter combinations, with added variation to the bounds.
 * 
 * This function includes:
 * - Randomly mapping each combination of parameters to a set of trials.
 * - Adding a 10% variation to the bounds while keeping the difference between bounds the same.
 * - Shuffling the order of the trials.
 * 
 * @param {Array} randomDelay - An array specifying the minimum and maximum delay after a tap.
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 * 
 * @returns {Array} - An array of shuffled trials.
 */
export function createShuffledTrials({
  randomDelay,
  jsPsych,
}: {
  randomDelay: number[];
  jsPsych: JsPsych;
}) {
  const numTrialsPerCombination = Math.floor(
    NUM_TRIALS / PARAMETER_COMBINATIONS.length,
  );

  let trials = PARAMETER_COMBINATIONS.flatMap((combination) =>
    Array(numTrialsPerCombination)
      .fill(null)
      .map(() => ({
        reward: jsPsych.randomization.sampleWithReplacement(
          combination.reward,
          1,
        )[0],
        randomDelay: randomDelay,
        bounds: combination.bounds,
        originalBounds: combination.bounds,
      })),
  );

  // Add 10% variation to bounds while keeping the distance between bounds the same
  const differenceBetweenBounds = EASY_BOUNDS[1] - EASY_BOUNDS[0];
  trials.forEach((trial) => {
    const center = (trial.bounds[0] + trial.bounds[1]) / 2;
    const min = center - (differenceBetweenBounds / 2) - (center - (differenceBetweenBounds / 2)) * 0.1;
    const max = center + (differenceBetweenBounds / 2) + (center + (differenceBetweenBounds / 2)) * 0.1;
    const newCenter = randomNumberBm(min, max);

    trial.bounds = [
      newCenter - differenceBetweenBounds / 2,
      newCenter + differenceBetweenBounds / 2,
    ];
  });

  // Shuffle the order of these trials
  return jsPsych.randomization.shuffle(trials);
}


/**
 * @function getUserID
 * @description Retrieves the user ID from the jsPsych data.
 *
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @returns {string} - The user ID as a string.
 */
export function getUserID(jsPsych: JsPsych): string {
  const userIdData = jsPsych.data.get().filter({ task: 'userID' }).last(1).values()[0];
  console.log('userIdData:', userIdData);

  // Correctly extract the value from userIdData.response
  const userID = userIdData.response.UserID; // Access the 'UserID' key
  console.log('Extracted userID:', userID);

  return String(userID); // Ensure it's returned as a string
}


// If random chance is implemented, this function is useful
/* export function randomAcceptance(){
  let randomChance = Math.random()
  if(randomChance > .5){
    return true
  } else return false
} */


