export function randomNumberBm(min, max, skew = 1) {
  let u = 0;
  let v = 0;
  // converting [0,1) to (0,1)
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) {
    num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
  } else {
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
  }
  if (Math.random() < 0.5) {
    num = -num;
  }
  return num;
}

