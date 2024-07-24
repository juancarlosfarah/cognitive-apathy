"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationVideo = exports.stimuliVideo = exports.noStimuliVideo = exports.loadingBar = exports.videoStimulus = exports.acceptanceThermometer = void 0;
exports.stimulus = stimulus;
const constants_1 = require("./constants");
function stimulus(showThermometer, mercuryHeight, lowerBound, upperBound, error) {
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
const acceptanceThermometer = (bounds, reward) => `
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
  <p style="text-align: center;"> ${constants_1.REWARD_TRIAL_MESSAGE}${reward.toFixed(2)}</p>
  <p style="text-align: center;">${constants_1.ACCEPTANCE_TRIAL_MESSAGE}</p>
</div>
`;
exports.acceptanceThermometer = acceptanceThermometer;
const videoStimulus = (message) => {
    let stimulusHTML = `<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; text-align: center;">
                        <p style="margin-bottom: 20px;">${message}</p>`;
    stimulusHTML += '</div>';
    return stimulusHTML;
};
exports.videoStimulus = videoStimulus;
const loadingBar = () => `
  <div class="loading-bar-container">
    <h1>${constants_1.LOADING_BAR_MESSAGE}</h1>
    <br>
    <div class="bar">
      <div class="progress"></div>
    </div>
    <div class="percentage">0</div>
    <link rel="stylesheet" type="text/css" href="import '../styles/main.scss';">
  </div>
`;
exports.loadingBar = loadingBar;
exports.noStimuliVideo = `
<div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
<p style=font-size: 18px; color: #333; max-width: 80%; line-height: 1.5;">
${constants_1.NO_STIMULI_VIDEO_TUTORIAL_MESSAGE}
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
exports.stimuliVideo = `
<div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
<p style=font-size: 18px; color: #333; max-width: 80%; line-height: 1.5;">
${constants_1.STIMULI_VIDEO_TUTORIAL_MESSAGE}
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
exports.validationVideo = `
<div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
<p style=font-size: 18px; color: #333; max-width: 80%; line-height: 1.5;">
${constants_1.VALIDATION_VIDEO_TUTORIAL_MESSAGE}
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
