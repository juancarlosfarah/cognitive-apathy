import fastCartesian from 'fast-cartesian';

// randomNumberBm.test.ts
function randomNumberBm(min, max, skew = 1) {
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

const PARAMETER_COMBINATIONS = fastCartesian([
  REWARD_OPTIONS,
  BOUND_OPTIONS,
]).map(([reward, bounds]) => ({
  reward,
  bounds,
}));
export const PARAMETER_COMBINATIONS_TOTAL = Math.floor(
  NUM_TRIALS / PARAMETER_COMBINATIONS.length,
);
const LOW_REWARDS = [0.01, 0.02, 0.03];
const MEDIUM_REWARDS = [0.05, 0.06, 0.07];
const HIGH_REWARDS = [0.10, 0.11, 0.12];
const REWARD_OPTIONS = [LOW_REWARDS, MEDIUM_REWARDS, HIGH_REWARDS];


EASY_BOUNDS = [30, 50];
MEDIUM_BOUNDS = [50, 70];
HARD_BOUNDS = [70, 90];
BOUND_OPTIONS = [EASY_BOUNDS, MEDIUM_BOUNDS, HARD_BOUNDS];
describe('randomNumberBm', () => {
  it('should return a number within the specified range', () => {
    const min = 0;
    const max = 10;
    const result = randomNumberBm(min, max);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
  });

  it('should apply the skew factor correctly', () => {
    const min = 0;
    const max = 10;
    const skew = 2;
    const results = Array.from({ length: 1000 }, () => randomNumberBm(min, max, skew));
    const mean = results.reduce((acc, val) => acc + val, 0) / results.length;
    expect(mean).toBeLessThan((max - min) / 2);
  });
});

// trials.test.ts

describe('Trial bounds adjustment', () => {
  jest.mock('./path_to_your_function', () => ({
    randomNumberBm: jest.fn((min, max) => (min + max) / 2), // Mock the function for predictability
  }));

  const adjustBounds = (trials, differenceBetweenBounds) => {
    for (let i = 0; i < trials.length; i++) {
      let center = (trials[i].bounds[0] + trials[i].bounds[1]) / 2;
      let min = center - (differenceBetweenBounds / 2) - (center - (differenceBetweenBounds / 2)) * 0.1;
      let max = center + (differenceBetweenBounds / 2) + (center + (differenceBetweenBounds / 2)) * 0.1;
      let newCenter = randomNumberBm(min, max);

      trials[i].bounds = [newCenter - (differenceBetweenBounds / 2), newCenter + (differenceBetweenBounds / 2)];
    }
  };

  it('should adjust bounds correctly', () => {
    const trials = PARAMETER_COMBINATIONS.map(combination => ({
      ...combination,
      bounds: combination.bounds.slice(),
    }));
    
    trials.forEach(trial => {
      const originalDifference = trial.bounds[1] - trial.bounds[0];
      const originalCenter = (trial.bounds[0] + trial.bounds[1]) / 2;
      const allowedVariance = originalCenter * 0.1;

      adjustBounds([trial], originalDifference);

      const [min, max] = trial.bounds;
      const newCenter = (min + max) / 2;

      // Check that the new bounds vary by 10% or less from the original center
      expect(newCenter).toBeGreaterThanOrEqual(originalCenter - allowedVariance);
      expect(newCenter).toBeLessThanOrEqual(originalCenter + allowedVariance);

      // Check that the difference between bounds is still the same
      expect(max - min).toBeCloseTo(originalDifference);
    });
  });
});
