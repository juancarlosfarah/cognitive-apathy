// randomNumberBm.test.ts
import { randomNumberBm } from '../utils'

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
import { PARAMETER_COMBINATIONS } from '../constants';

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
