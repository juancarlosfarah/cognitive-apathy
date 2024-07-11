export function generateStimulus(
  isAcceptStep,
  reward,
  lowerBound,
  upperBound,
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
                <div id="lower-bound" style="position: absolute; bottom: ${lowerBound}%; width: 100%; height: 2px; background-color: black;"></div>
                <div id="upper-bound" style="position: absolute; bottom: ${upperBound}%; width: 100%; height: 2px; background-color: black;"></div>
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
  lowerBound,
  upperBound,
  error,
) {
  const bounds = `
    <div
      id="lower-bound"
      style="position: absolute; bottom: ${lowerBound}%; width: 100%; height: 2px; background-color: black;"
    ></div>
    <div
      id="upper-bound"
      style="position: absolute; bottom: ${upperBound}%; width: 100%; height: 2px; background-color: black;"
    ></div>
  `;

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
        ${bounds}
      </div>
    </div>`
    : '<p style="font-size: 48px; position: absolute;">+</p>';


  return `
    <div id="calibration-task" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
        ${thermometer}
        <p id="start-message" style="display: none;">Hit <b>Enter</b> to start! Then tap the <b>R</b> key with your index finger as fast as possible.</p>
        <div id="status" style="margin-top: 50px;"> <!-- Adjust margin-top to place error message lower -->
            <div id="error-message" style="color: red;">${error}</div>
        </div>
    </div>
  `;
}


export const blockWelcomeMessage = (name) =>
  `<h2>${name}</h2><p><b>Please press "Enter" to start the experiment.</b></p>`;

/**
 * @function videoStimulus
 * @description Generate HTML for a message with an optional video
 * @param {string} message - The message to display
 * @param {string} [video] - Optional video URL to display
 * @returns {string} - HTML string for the stimulus
 */
export const videoStimulus = (message, video) => {
  let stimulusHTML = `<p>${message}</p>`;
  if (video) {
    stimulusHTML += `<video width="600" controls>
                       <source src="${video}" type="video/mp4">
                       Your browser does not support the video tag.
                     </video>`;
  }
  return stimulusHTML;
};
