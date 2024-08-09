// Import necessary modules and constants
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
const getRandomDelay = (trial) => {
  const [min, max] = trial.randomDelay;
  return randomNumberBm(min,max)
};

describe('getRandomDelay', () => {
  const testDistribution = (min, max) => {
    const trial = { randomDelay: [min, max] };
    const numSamples = 2000;
    const samples = Array.from({ length: numSamples }, () => getRandomDelay(trial));
    
    // Check if the mean is roughly in the middle
    const mean = samples.reduce((acc, val) => acc + val, 0) / numSamples;
    const expectedMean = (min + max) / 2;
    expect(mean).toBeGreaterThanOrEqual(expectedMean-25);
    expect(mean).toBeLessThanOrEqual(expectedMean+25);

    // Check if the distribution is roughly normal (simple test: majority should be within one standard deviation)
     // Calculate standard deviation
     const variance = samples.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numSamples;
     const stdDev = Math.sqrt(variance);
     
     // Check how many samples fall within one and two standard deviations
     const withinOneStdDev = samples.filter(val => val >= (mean - stdDev) && val <= (mean + stdDev)).length;
     const withinTwoStdDev = samples.filter(val => val >= (mean - 2 * stdDev) && val <= (mean + 2 * stdDev)).length;
    
    // Expect around 68% within one std dev and 95% within two std devs for normal distribution
    expect(withinOneStdDev / numSamples).toBeGreaterThanOrEqual(0.65);
    expect(withinTwoStdDev / numSamples).toBeGreaterThanOrEqual(0.93);
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