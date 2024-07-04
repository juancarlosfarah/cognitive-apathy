
export function generateStimulus(
  isAcceptStep,
  reward,
  targetHeight,
  mercuryHeight,
  error,
) {
  let messages = `<p id="hold-keys-message">Hold the <b>A</b>, <b>W</b>, and <b>E</b> keys!</p>
            <p id="start-message" style="display: none;">Hit <b>Enter</b> to start! Then tap the <b>R</b> key.</p>`;

  if (isAcceptStep) {
    messages = `<p>Do you accept the trial? (Arrow Left = Yes, Arrow Right = No)<p/>`;
  }

  const rewardBanner = reward
    ? `<h2 id="reward">Reward: $${reward.toFixed(2)}</h2>`
    : '';

  return `
    <div id="cognitive-agency-task" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
        ${rewardBanner}
        ${messages}
        <div id="thermometer-container" style="display: flex; justify-content: center; align-items: center; height: 300px; width: 100px; border: 1px solid #000;">
            <div id="thermometer" style="position: relative; width: 100%; height: 100%; background-color: #e0e0e0;">
                <div id="mercury" style="height: ${mercuryHeight}%; background-color: red;"></div>
                <div id="target-bar" style="position: absolute; bottom: ${targetHeight}%; width: 100%; height: 2px; background-color: black;"></div>
            </div>
        </div>
        <div id="status">
            <div id="error-message" style="color: red;">${error}</div>
        </div>
    </div>
  `;
}
export function calibrationStimulus(
  showThermometer,
  mercuryHeight,
  targetHeight,
  error,
) {
  const target = targetHeight
    ? `<div
          id="target-bar"
          style="position: absolute; bottom: ${targetHeight}%; width: 100%; height: 2px; background-color: black;"
        ></div>`
    : '';

  const thermometer = showThermometer
    ? `<div
      id="thermometer-container"
      style="display: flex; justify-content: center; align-items: center; height: 300px; width: 100px; border: 1px solid #000;"
    >
      <div
        id="thermometer"
        style="position: relative; width: 100%; height: 100%; background-color: #e0e0e0;"
      >
        <div
          id="mercury"
          style="height: ${mercuryHeight}%; background-color: red;"
        ></div>
        ${target}
      </div>
    </div>`
    : `<p style="font-size: 48px;">+</p>`;
  return `
    <div id="calibration-task" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
        <p id="hold-keys-message">Hold the <b>A</b> key with pinky, <b>W</b> key with ring finger, and <b>E</b> key with middle finger!
        <p id="start-message" style="display: none;">Hit <b>Enter</b> to start! Then tap the <b>R</b> key with your index finger as fast as possible.</p>
        ${thermometer}
        <div id="status">
            <div id="error-message" style="color: red;">${error}</div>
        </div>
    </div>
  `;
}

export const calibrationPartIWelcomeMessage = `
<h2>Calibration I</h2>
        
<p>Welcome to the first part of the calibration procedure!<p/>
   <p>Your goal is to tap as fast as possible.</p>
   <p><b>Please press "Enter" to start.</b></p>`;

export const calibrationPartIIWelcomeMessage = `
<h2>Calibration II</h2>
<p>Welcome to the second part of the calibration procedure!<p/>
     <p>You will be shown a target height at the middle of the bar.</p>
     <p>Your goal is to tap as fast as possible and finish above the target height at the end of each trial.</p>
     <p><b>Please press "Enter" to start.</b></p>`;

export const validationWelcomeMessage = `
<h2>Validation</h2>
<p>Welcome to the validation part of the calibration procedure!<p/>
     <p>You will be shown a target at different heights of the bar.</p>
     <p>Your goal is to finish above the target height at the end of each trial.</p>
     <p><b>Please press "Enter" start.</b></p>`;

export const experimentWelcomeMessage = `<p>Welcome to the Cognitive Apathy Experiment!<p/>
<p><b>Please press "Enter" to start the experiment.</b></p>`;

export const blockWelcomeMessage = (name) =>
  `<h2>${name}</h2><p><b>Please press "Enter" to start the experiment.</b></p>`;
