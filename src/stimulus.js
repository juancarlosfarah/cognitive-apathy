import { NO_STIMULI_VIDEO_TUTORIAL_MESSAGE, STIMULI_VIDEO_TUTORIAL_MESSAGE, VALIDATION_VIDEO_TUTORIAL_MESSAGE, ACCEPTANCE_TRIAL_MESSAGE} from './constants';

export function stimulus(
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
        </div>
    </div>
  `;
}

export const acceptanceThermometer = (bounds, reward) => `
<div
  id="acceptance-container"
  style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%;"
>
  <div
    id="thermometer-container"
    style="display: flex; justify-content: center; align-items: center; height: 300px; width: 100px; border: 1px solid #000; margin-bottom: 10px;"
  >
    <div
      id="thermometer"
      style="position: relative; width: 100%; height: 100%; background-color: #e0e0e0;"
    >
      <div
        id="lower-bound"
        style="position: absolute; bottom: ${bounds[0]}%; width: 100%; height: 2px; background-color: black;"
      ></div>
      <div
        id="upper-bound"
        style="position: absolute; bottom: ${bounds[1]}%; width: 100%; height: 2px; background-color: black;"
      ></div>
    </div>
  </div>
  <p style="text-align: center;">Reward: $${reward}</p>
  <p style="text-align: center;">${ACCEPTANCE_TRIAL_MESSAGE}</p>
</div>
`;

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
  let stimulusHTML = `<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; text-align: center;">
                        <p style="margin-bottom: 20px;">${message}</p>`;
  if (video) {
    stimulusHTML += `<video width="600" controls style="margin: 0 auto;">
                       <source src="${video}" type="video/mp4">
                       Your browser does not support the video tag.
                     </video>`;
  }
  stimulusHTML += '</div>';
  return stimulusHTML;
};
export const loadingBar = () => `
  <div class="loading-bar-container">
    <h1>Loading...</h1>
    <br>
    <div class="bar">
      <div class="progress"></div>
    </div>
    <div class="percentage">0</div>
    <link rel="stylesheet" type="text/css" href="import '../styles/main.scss';">
  </div>
`;
export const noStimuliVideo = `
<div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
<p style=font-size: 18px; color: #333; max-width: 80%; line-height: 1.5;">
${NO_STIMULI_VIDEO_TUTORIAL_MESSAGE}
</p>
  <video
    id="videoTutorial"
    title="Tutorial Video"
    style="background-color: rgb(255, 255, 255); width: 640px; height: 200px;"
    src="../assets/videos/calibration-1-video.mp4"
    autoplay
    muted
    loop
  ></video>

</div>`;


export const stimuliVideo = `
<div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
<p style=font-size: 18px; color: #333; max-width: 80%; line-height: 1.5;">
${STIMULI_VIDEO_TUTORIAL_MESSAGE}
</p>
  <video
    id="videoTutorial"
    title="Tutorial Video"
    style="background-color: rgb(255, 255, 255); width: 640px; height: 400px;"
    src="../assets/videos/calibration-2-video.mp4"
    autoplay
    muted
    loop
  ></video>
</div>`;

export const validationVideo = `
<div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
<p style=font-size: 18px; color: #333; max-width: 80%; line-height: 1.5;">
${VALIDATION_VIDEO_TUTORIAL_MESSAGE}
</p>
  <video
    id="videoTutorial"
    title="Tutorial Video"
    style="background-color: rgb(255, 255, 255); width: 640px; height: 400px;"
    src="../assets/videos/validation-video.mp4"
    autoplay
    muted
    loop
  ></video>

</div>`;