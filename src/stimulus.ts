import {
  ACCEPTANCE_TRIAL_MESSAGE,
  NO_STIMULI_VIDEO_TUTORIAL_MESSAGE,
  STIMULI_VIDEO_TUTORIAL_MESSAGE,
  VALIDATION_VIDEO_TUTORIAL_MESSAGE,
  LOADING_BAR_MESSAGE,
  REWARD_TRIAL_MESSAGE,
  GO_MESSAGE,
  FINAL_CALIBRATION_SECTION_DIRECTIONS_PART_1,
  FINAL_CALIBRATION_SECTION_DIRECTIONS_PART_2,
  CLICK_BUTTON_TO_PROCEED_MESSAGE
} from './constants';

export function stimulus(
  showThermometer: boolean,
  mercuryHeight: number,
  lowerBound: number,
  upperBound: number,
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
  : `<div id="no_stimuli_calibration" style="position: relative; display: flex; justify-content: center; align-items: center; height: 300px; width: 100px;">
       <p style="font-size: 48px; position: absolute;">+</p>
     </div>`;
     return `
     <div id="go-message" style="position: absolute; top: 20%; font-size: 160px; color: green; visibility: hidden; transform: translateX(-50%); left: 50%; white-space: nowrap;">${GO_MESSAGE}</div>
     <div id="task-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; position: relative; padding: 0 20px;">
       ${thermometer}
     </div>
   `;
   
}


export const acceptanceThermometer = (bounds: number[], reward: number) => `
<div
  id="acceptance-container"
  style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%;"
>
  <div
    id="thermometer-container"
    style="display: flex; justify-content: center; align-items: center; height: 300px; width: 100px; border: 1px solid #000; margin-bottom: 10px; box-sizing: border-box;"
  >
    <div
      id="thermometer"
      style="position: relative; width: 100%; height: 100%; background-color: #e0e0e0; box-sizing: border-box;"
    >
      <div
        id="blue-area"
        style="position: absolute; bottom: ${bounds[0]}%; height: ${bounds[1] - bounds[0]}%; width: 100%; background-color: blue;"
      ></div>
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
  <p style="text-align: center;">${REWARD_TRIAL_MESSAGE} CHF ${reward.toFixed(2)}</p>
  <p style="text-align: center;">${ACCEPTANCE_TRIAL_MESSAGE}</p>
</div>
`;




export const videoStimulus = (message: string) => {
  let stimulusHTML = `<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                        <p style="margin-bottom: 20px;">${message}</p>`;
  stimulusHTML += '</div>';
  return stimulusHTML;
};

export const loadingBar = () => `
  <div class="loading-bar-container">
    <h1>${LOADING_BAR_MESSAGE}</h1>
    <br>
    <div class="bar">
      <div class="progress"></div>
    </div>
    <div class="percentage">0</div>
    <link rel="stylesheet" type="text/css" href="import '../styles/main.scss';">
  </div>
`;

export const noStimuliVideo = `
<div style="overflow: hidden; height: calc(100vh - 200px); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 10px 0;">
  <div style="text-align: center; margin-bottom: 2%;">
    <p style="font-size: 1.5vw; color: #333; max-width: 80%; margin: 0 auto; line-height: 1.5;">
      ${NO_STIMULI_VIDEO_TUTORIAL_MESSAGE}
    </p>
  </div>
  <div style="flex-grow: 1; display: flex; justify-content: center; align-items: center;">
    <div style="width: 60%; max-width: 640px; height: auto; background-color: rgb(255, 255, 255);">
      <video
        id="videoTutorial"
        title="Tutorial Video"
        style="width: 100%; height: auto;"
        src="./assets/videos/calibration-part1.mp4"
        autoplay
        muted
        loop
      ></video>
    </div>
  </div>
  <div style="text-align: center; margin-top: 2%;">
    <p>
      ${CLICK_BUTTON_TO_PROCEED_MESSAGE}
    </p>
  </div>
</div>`;

export const stimuliVideo = `
<div style="overflow: hidden; height: calc(100vh - 200px); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 10px 0;">
  <div style="text-align: center; margin-bottom: 2%;">
    <p>
      ${STIMULI_VIDEO_TUTORIAL_MESSAGE}
    </p>
  </div>
  <div style="flex-grow: 1; display: flex; justify-content: center; align-items: center;">
    <div style="width: 40%; max-width: 700px; height: auto; background-color: rgb(255, 255, 255);">
      <video
        id="videoTutorial"
        title="Tutorial Video"
        style="width: 100%; height: auto;"
        src="./assets/videos/calibration-part2.mp4"
        autoplay
        muted
        loop
      ></video>
    </div>
  </div>
  <div style="text-align: center; margin-top: 2%;">
    <p>
      ${CLICK_BUTTON_TO_PROCEED_MESSAGE}
    </p>
  </div>
</div>`;

export const validationVideo = `
<div style="overflow: hidden; height: calc(100vh - 200px); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 10px 0;">
  <div style="text-align: center; margin-bottom: 2%;">
    <p>
      ${VALIDATION_VIDEO_TUTORIAL_MESSAGE}
    </p>
  </div>
  <div style="flex-grow: 1; display: flex; justify-content: center; align-items: center;">
    <div style="width: 100%; max-width: 500px; height: auto; background-color: rgb(255, 255, 255);">
      <video
        id="videoTutorial"
        title="Tutorial Video"
        style="width: 100%; height: auto;"
        src="./assets/videos/validation.mp4"
        autoplay
        muted
        loop
      ></video>
    </div>
  </div>
  <div style="text-align: center; margin-top: 2%;">
    <p>
      ${CLICK_BUTTON_TO_PROCEED_MESSAGE}
    </p>
  </div>
</div>`;

export const finalNoStimuliVideo = `
<div style="overflow: hidden; height: calc(100vh - 200px); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 10px 0;">
  <div style="text-align: center; margin-bottom: 2%;">
    <p">
      ${FINAL_CALIBRATION_SECTION_DIRECTIONS_PART_1}
    </p>
  </div>
  <div style="flex-grow: 1; display: flex; justify-content: center; align-items: center;">
    <div style="width: 70%; max-width: 500px; height: auto; background-color: rgb(255, 255, 255);">
      <video
        id="videoTutorial"
        title="Tutorial Video"
        style="width: 100%; height: auto;"
        src="./assets/videos/calibration-part1.mp4"
        autoplay
        muted
        loop
      ></video>
    </div>
  </div>
  <div style="text-align: center; margin-top: 2%;">
    <p>
      ${CLICK_BUTTON_TO_PROCEED_MESSAGE}
    </p>
  </div>
</div>`;

export const finalStimuliVideo = `
<div style="overflow: hidden; height: calc(100vh - 200px); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 10px 0;">
  <div style="text-align: center; margin-bottom: 2%;">
    <p">
      ${FINAL_CALIBRATION_SECTION_DIRECTIONS_PART_2}
    </p>
  </div>
  <div style="flex-grow: 1; display: flex; justify-content: center; align-items: center;">
    <div style="width: 70%; max-width: 500px; height: auto; background-color: rgb(255, 255, 255);">
      <video
        id="videoTutorial"
        title="Tutorial Video"
        style="width: 100%; height: auto;"
        src="./assets/videos/calibration-part2.mp4"
        autoplay
        muted
        loop
      ></video>
    </div>
  </div>
  <div style="text-align: center; margin-top: 2%;">
    <p style="color: #333; max-width: 80%; margin: 0 auto; line-height: 1.5;">
      ${CLICK_BUTTON_TO_PROCEED_MESSAGE}
    </p>
  </div>
</div>`;
