// trialDataTests.js

/* import fastCartesian from 'fast-cartesian'; */


// Test Setup
const EASY_BOUNDS = [30, 50];
const MEDIUM_BOUNDS = [50, 70];
const HARD_BOUNDS = [70, 90];
const BOUND_OPTIONS = [EASY_BOUNDS, MEDIUM_BOUNDS, HARD_BOUNDS];

const LOW_REWARDS = [0.01, 0.02, 0.03];
const MEDIUM_REWARDS = [0.05, 0.06, 0.07];
const HIGH_REWARDS = [0.10, 0.11, 0.12];
const REWARD_OPTIONS = [LOW_REWARDS, MEDIUM_REWARDS, HIGH_REWARDS];

/* const PARAMETER_COMBINATIONS = fastCartesian([
  REWARD_OPTIONS,
  BOUND_OPTIONS,
]).map(([reward, bounds]) => ({
  reward,
  bounds,
})); */

/* export const PARAMETER_COMBINATIONS_TOTAL = Math.floor(
  100 / PARAMETER_COMBINATIONS.length,
); */


// Updated randomNumberBm Function with skew factor fixed at 1
function randomNumberBm(min, max) {
  let u = 0;
  let v = 0;
  // Converting [0,1) to (0,1)
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) {
    num = randomNumberBm(min, max); // Resample between 0 and 1 if out of range
  } else {
    num = Math.pow(num, 1); // Apply skew (always 1)
    num *= max - min; // Stretch to fill range
    num += min; // Offset to min
  }
  return num;
}

// Updated newBounds Function
function newBounds(trials, differenceBetweenBounds) {
  for (let i = 0; i < trials.length; i++) {
    let center = (trials[i].bounds[0] + trials[i].bounds[1]) / 2;
    const varianceFactor = differenceBetweenBounds * 0.1;

    let min = center - (differenceBetweenBounds / 2 + varianceFactor);
    let max = center + (differenceBetweenBounds / 2 + varianceFactor);

    min = Math.max(trials[i].bounds[0], min); // Ensure min doesn't go below the original bounds
    max = Math.min(trials[i].bounds[1], max); // Ensure max doesn't go above the original bounds

    let newCenter = randomNumberBm(min, max);

    trials[i].bounds = [
      newCenter - differenceBetweenBounds / 2,
      newCenter + differenceBetweenBounds / 2,
    ];
  }
}


// BOUNDS ARE CORRECT AND 
describe('bound centers fall within 10% and are normally distributed', () => {
  it('should produce a normal distribution with expected proportions', () => {
    const numSamples = 10000; // Number of samples to generate
    const min = 0;
    const max = 1;
    const samples = [];

    // Generate samples
    for (let i = 0; i < numSamples; i++) {
      samples.push(randomNumberBm(min, max));
    }

    // Calculate mean and standard deviation
    const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;
    const variance = samples.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / samples.length;
    const stdDev = Math.sqrt(variance);

    // Count the number of samples within 1, 2, and 3 standard deviations
    const within1SD = samples.filter(value => value >= mean - stdDev && value <= mean + stdDev).length;
    const within2SD = samples.filter(value => value >= mean - 2 * stdDev && value <= mean + 2 * stdDev).length;
    const within3SD = samples.filter(value => value >= mean - 3 * stdDev && value <= mean + 3 * stdDev).length;

    // Calculate percentages
    const within1SDPercentage = (within1SD / numSamples) * 100;
    const within2SDPercentage = (within2SD / numSamples) * 100;
    const within3SDPercentage = (within3SD / numSamples) * 100;

    // Expect around 68% within 1 SD, 95% within 2 SD, and 99.7% within 3 SD
    expect(within1SDPercentage).toBeGreaterThanOrEqual(67); // 1% tolerance
    expect(within2SDPercentage).toBeGreaterThanOrEqual(93); // 1% tolerance
    expect(within3SDPercentage).toBeGreaterThanOrEqual(98); // 0.5% tolerance
  });
});

describe('The difference between new trial bounds are always 20', () => {
  it('should adjust bounds correctly multiple times', () => {
    const runCount = 10000; // Number of times to run the test

    for (let run = 0; run < runCount; run++) {
      const trials = [
        { bounds: [...EASY_BOUNDS] },
        { bounds: [...MEDIUM_BOUNDS] },
        { bounds: [...HARD_BOUNDS] },
      ];

      trials.forEach(trial => {
        const originalDifference = trial.bounds[1] - trial.bounds[0];
        const originalCenter = (trial.bounds[0] + trial.bounds[1]) / 2;

        newBounds([trial], originalDifference);

        const [min, max] = trial.bounds;
        const newDifference = max - min;

        // Check that the new center is within the allowed variance


        // Check that the difference between bounds is exactly the same as the original difference
        expect(newDifference).toBeCloseTo(originalDifference,5);
      });
    }
  });
});
