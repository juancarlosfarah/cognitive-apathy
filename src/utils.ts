import { JsPsych } from 'jspsych';

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
 * Calculate the auto-increase amount for the thermometer.
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


export const checkKeys = (
  taskFilter: string,
  jsPsych: JsPsych
): boolean => {
  const lastTrialData = jsPsych.data.get().filter({ task: taskFilter }).last(1).values()[0];
  const keysState = lastTrialData.keysState;
  const wereKeysHeld = Object.values(keysState).every(state => state);
  return wereKeysHeld
};

// Function to calculate accumulated reward
export function calculateTotalReward(jsPsych: JsPsych): number {
  const successfulTrials = jsPsych.data
    .get()
    .filter({ task: 'block', success: true });
  console.log(successfulTrials);
  console.log(successfulTrials.select('reward'));
/*   const accceptedSkippedTrials = jsPsych.data
    .get()
    .filter({ task: 'block', accept: true, randomChanceAccepted: true, success: false});
    console.log(accceptedSkippedTrials)
    console.log(accceptedSkippedTrials.select('reward')); */
  return (successfulTrials.select('reward').sum()/* +accceptedSkippedTrials.select('reward').sum() */);
}

export const getQueryParam = (param: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

export const changeProgressBar = (name: string, percent: number, jsPsych: JsPsych) => {
  const progressBarMessageElement = document.getElementsByTagName('span')[0];
  jsPsych.progressBar!.progress = percent
  progressBarMessageElement!.innerText = name;
}

export function showEndScreen(message: string): void {
  const screen: HTMLElement = document.createElement('div');
  screen.classList.add('custom-overlay');
  screen.innerHTML = `<h2 style="text-align: center; top: 50%;">${message}</h2>`;
  document.body.appendChild(screen);
} 

export function saveDataToLocalStorage(jsPsych: JsPsych) {
  const jsonData = jsPsych.data.get().json();
  localStorage.setItem('jspsych-data', jsonData);
}

/* export function randomAcceptance(){
  let randomChance = Math.random()
  if(randomChance > .5){
    return true
  } else return false
} */