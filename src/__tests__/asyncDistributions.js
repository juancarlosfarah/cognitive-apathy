// Import necessary modules and constants
const getRandomDelay = (trial) => {
  const [min, max] = trial.randomDelay;
  return Math.random() * (max - min) + min;
};

describe('getRandomDelay', () => {
  const testDistribution = (min, max) => {
    const trial = { randomDelay: [min, max] };
    const numSamples = 1000;
    const samples = Array.from({ length: numSamples }, () => getRandomDelay(trial));
    
    // Check if the mean is roughly in the middle
    const mean = samples.reduce((acc, val) => acc + val, 0) / numSamples;
    const expectedMean = (min + max) / 2;
    const tolerance = (max - min) * 0.1; // 10% tolerance
    expect(mean).toBeGreaterThanOrEqual(expectedMean - tolerance);
    expect(mean).toBeLessThanOrEqual(expectedMean + tolerance);

    // Check if the distribution is roughly normal (simple test: majority should be within one standard deviation)
    const stdDev = Math.sqrt(samples.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numSamples);
    const withinOneStdDev = samples.filter(val => val >= (mean - stdDev) && val <= (mean + stdDev)).length;
    const withinTwoStdDev = samples.filter(val => val >= (mean - 2 * stdDev) && val <= (mean + 2 * stdDev)).length;
    
    // Expect around 68% within one std dev and 95% within two std devs for normal distribution
    expect(withinOneStdDev / numSamples).toBeGreaterThanOrEqual(0.68);
    expect(withinTwoStdDev / numSamples).toBeGreaterThanOrEqual(0.95);
  };

  it('should return a number within the range [0, 1000] and follow a normal distribution', () => {
    const min = 0;
    const max = 1000;
    const trial = { randomDelay: [min, max] };

    const result = getRandomDelay(trial);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);

    testDistribution(min, max);
  });

  it('should return a number within the range [400, 600] and follow a normal distribution', () => {
    const min = 400;
    const max = 600;
    const trial = { randomDelay: [min, max] };

    const result = getRandomDelay(trial);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);

    testDistribution(min, max);
  });
});