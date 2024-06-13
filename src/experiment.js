/**
 * @title Cognitive Apathy
 * @description 
 * @version 0.1.0
 *
 * @assets assets/
 */

// You can import stylesheets (.scss or .css).
import "../styles/main.scss";

import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import ThermometerPlugin from "./thermometer";
import PreloadPlugin from "@jspsych/plugin-preload";
import {initJsPsych, ParameterType} from "jspsych";
import {generateStimulus} from "./stimulus";

/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */
export async function run({ assetPaths, input = {}, environment, title, version }) {
  const jsPsych = initJsPsych();

  const targetOptions = [25, 50, 90];
  const rewardOptions = [5, 20, 50];

  const targetBase = targetOptions[Math.floor(Math.random() * targetOptions.length)];
  const rewardBase = rewardOptions[Math.floor(Math.random() * rewardOptions.length)];

  const targetVariation = (Math.random() * 10) - 5;
  const rewardVariation = (Math.random() * 4) - 2;

  const targetHeight = targetBase + targetVariation;
  const reward = (rewardBase + rewardVariation) / 100;

  const timeline = [];

  // Preload assets
  timeline.push({
    type: PreloadPlugin,
    images: assetPaths.images,
    audio: assetPaths.audio,
    video: assetPaths.video,
  });

  // calibration

  // accept trial object
  const acceptStep = {
    type: HtmlKeyboardResponsePlugin,
    choices: ['arrowright', 'arrowleft']
  }

  // perform trial object
  const performStep = {
    type: ThermometerPlugin,
  };
  const conditionalPerformStep = {
    timeline: [performStep],
    conditional_function: function() {
      // get the data from the previous trial,
      // and check which key was pressed
      const data = jsPsych.data.get().last(1).values()[0];
      return jsPsych.pluginAPI.compareKeys(data.response, 'arrowleft');
    }
  }

  const questionnaireStep = {

  }

  //
  const trial = {
    autoDecreaseAmount: 5,
    randomDelay: [0, 0],
    reward: 0.25,
    targetHeight: 25,
    timeline: [
        {
          ...acceptStep,
          stimulus: generateStimulus(true,0.25, 25, 0, ''),
        },
      conditionalPerformStep,
    ],
  }

  // start
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: "<p>Welcome to Cognitive Apathy!<p/><p><b>Please press any key to start the experiment.</b></p>",
  });

  // Switch to fullscreen
  // timeline.push({
  //   type: FullscreenPlugin,
  //   fullscreen_mode: true,
  // });

  timeline.push(trial);

  await jsPsych.run(timeline);

  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  return jsPsych;
}
