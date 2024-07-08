/**
 * @title Cognitive Apathy
 * @description
 * @version 0.1.0
 *
 * @assets assets/
 */
// You can import stylesheets (.scss or .css).
import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import PreloadPlugin from '@jspsych/plugin-preload';
import { ParameterType, initJsPsych } from 'jspsych';

import '../styles/main.scss';
import CalibrationPlugin from './calibration';
import {
  AUTO_DECREASE_RATE,
  AUTO_INCREASE_AMOUNT,
  EXPECTED_MAXIMUM_PERCENTAGE,
  EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION,
  MINIMUM_AUTO_DECREASE_AMOUNT,
  NUM_CALIBRATION_TRIALS,
  NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
  NUM_CALIBRATION_WITH_FEEDBACK_TRIALS,
  PARAMETER_COMBINATIONS,
  RELEASE_KEYS_STIMULUS_DURATION,
  RELEASE_KEYS_TRIAL_DURATION,
  REWARD_OPTIONS,
  TARGET_OPTIONS,
  TRIAL_DURATION,
} from './constants';
import {
  blockWelcomeMessage,
  calibrationPartIIWelcomeMessage,
  calibrationPartIWelcomeMessage,
  calibrationWelcomeMessage,
  experimentWelcomeMessage,
  generateStimulus,
  synchronousBlockWelcomeMessage,
  validationWelcomeMessage,
} from './stimulus';
import ThermometerPlugin from './thermometer';
import ReleaseKeysPlugin from './release-keys';
import CountdownTrialPlugin from './countdown';
import KeyHoldPlugin from './key-hold-plugin';

/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */
export async function run({
  assetPaths,
  input = {},
  environment,
  title,
  version,
}) {
  const jsPsych = initJsPsych();

  const randomReward = function () {
    return jsPsych.randomization.sampleWithReplacement(REWARD_OPTIONS, 1)[0];
  };

  const randomTargetHeight = function () {
    return jsPsych.randomization.sampleWithReplacement(TARGET_OPTIONS, 1)[0];
  };

  const timeline = [];

  // Preload assets
  timeline.push({
    type: PreloadPlugin,
    images: assetPaths.images,
    audio: assetPaths.audio,
    video: assetPaths.video,
  });

  const releaseKeysStep = {
    type: ReleaseKeysPlugin,
    stimulus: `<p>Release the Keys</p>`,
    valid_responses: ['a', 'w', 'e'],
  };

  const countdownStep = {
    type: CountdownTrialPlugin,
  };

/*   // Function to dynamically create a timeline step based on the previous trial's outcome
  const createCalibrationTrial = (showThermometer, targetHeight) => {
    return {
      timeline: [
        countdownStep,
        {
          type: CalibrationPlugin,
          duration: TRIAL_DURATION,
          showThermometer: showThermometer,
          targetHeight: targetHeight,
        },
        {
          timeline: [releaseKeysStep],
          conditional_function: function () {
            const skipReleaseKeysStep = jsPsych.data.get().last(1).values()[0].skipReleaseKeysStep;
            return !skipReleaseKeysStep;
          },
        },
      ],
      repetitions: NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS,
    };
  };
  
  
  

  // Calibration trials without feedback
  const calibrationWithoutFeedback = createCalibrationTrial(false, 0);
  timeline.push(calibrationWithoutFeedback);

  // Calibration trials with feedback
  const calibrationWithFeedback = createCalibrationTrial(true, 50);
  timeline.push(calibrationWithFeedback);

  // Display average taps
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: function () {
      const trials = jsPsych.data.get().filter({ trial_type: 'calibration-task' }).values();
      const averageTaps = CalibrationPlugin.calculateAverageTaps(trials);
      return `<p><b>Internal Check</b></p><p>Average Tap Count: ${averageTaps}</p><p><b>Press "Enter" to continue.</b></p>`;
    },
  });

  // Validation step
  const validationTrials = TARGET_OPTIONS.map((targetHeight) => ({
    timeline: [
      countdownStep,
      {
        type: CalibrationPlugin,
        duration: TRIAL_DURATION,
        showThermometer: true,
        targetHeight: targetHeight,
      },
      {
        timeline: [releaseKeysStep],
        conditional_function: function () {
          const lastTrialData = jsPsych.data.getLastTrialData().values()[0];
          return !lastTrialData.errorOccurred;
        },
      },
    ],
    repetitions: 4,
  }));

  timeline.push(...validationTrials);

  // Check if any condition failed more than twice
  const checkValidation = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: function () {
      const trials = jsPsych.data.get().filter({ trial_type: 'calibration-task' }).values();
      const failedConditions = TARGET_OPTIONS.filter(targetHeight => {
        const conditionTrials = trials.filter(trial => trial.targetHeight === targetHeight);
        return conditionTrials.filter(trial => trial.tapCount < 2).length > 2;
      });
      if (failedConditions.length > 0) {
        return `<p>You failed one or more conditions more than twice. Press Enter to retry the 90% condition.</p>`;
      } else {
        return `<p>You passed the validation step. Press Enter to continue.</p>`;
      }
    },
    choices: ['enter'],
  };

  timeline.push(checkValidation);

  // Additional validation for 90% condition
  const additionalValidationTrials = {
    timeline: [
      countdownStep,
      {
        type: CalibrationPlugin,
        duration: TRIAL_DURATION,
        showThermometer: true,
        targetHeight: 90,
      },
      {
        timeline: [releaseKeysStep],
        conditional_function: function () {
          const lastTrialData = jsPsych.data.getLastTrialData().values()[0];
          return !lastTrialData.errorOccurred;
        },
      },
    ],
    repetitions: 3,
    conditional_function: function () {
      const trials = jsPsych.data.get().filter({ trial_type: 'calibration-task' }).values();
      const failedConditions = TARGET_OPTIONS.filter(targetHeight => {
        const conditionTrials = trials.filter(trial => trial.targetHeight === targetHeight);
        return conditionTrials.filter(trial => trial.tapCount < 2).length > 2;
      });
      return failedConditions.length > 0;
    },
  };

  timeline.push(additionalValidationTrials);

  // Final check if failed additional validation
  const finalCheck = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: function () {
      const trials = jsPsych.data.get().filter({ trial_type: 'calibration-task' }).values();
      const conditionTrials = trials.filter(trial => trial.targetHeight === 90);
      const failed = conditionTrials.filter(trial => trial.tapCount < 2).length >= 3;
      if (failed) {
        return `<p>You failed the additional validation. The experiment will now end.</p>`;
      } else {
        return `<p>You passed the validation step. Press Enter to continue.</b>`;
      }
    },
    choices: ['enter'],
    on_finish: function (data) {
      const trials = jsPsych.data.get().filter({ trial_type: 'calibration-task' }).values();
      const conditionTrials = trials.filter(trial => trial.targetHeight === 90);
      const failed = conditionTrials.filter(trial => trial.tapCount < 2).length >= 3;
      if (failed) {
        jsPsych.endExperiment('You failed the validation step.');
      }
    },
  };

  timeline.push(finalCheck); */

  // Synchronous block

   // Synchronous block
// Synchronous block
const acceptRejectStep = {
  type: HtmlKeyboardResponsePlugin,
  stimulus: function() {
    const reward = randomReward()/100;
    return `<p>Reward: $${reward.toFixed(2)}</p>
            <p>Do you accept the trial? (Arrow Left = Yes, Arrow Right = No)<p/>`;
  },
  choices: ['arrowleft', 'arrowright']
};

const performStep = {
  timeline: [
    countdownStep,
    {
      type: ThermometerPlugin,
      duration: TRIAL_DURATION,
      showThermometer: true,
      targetHeight: randomTargetHeight, // Use randomTargetHeight function
    },
    releaseKeysStep,
  ],
};

const conditionalPerformStep = {
  timeline: [performStep],
  conditional_function: function () {
    const data = jsPsych.data.get().last(1).values()[0];
    return jsPsych.pluginAPI.compareKeys(data.response, 'arrowleft');
  },
};

const synchronousBlock = {
  timeline: [
    acceptRejectStep,
    {
      timeline: [conditionalPerformStep],
      conditional_function: function () {
        const data = jsPsych.data.get().last(1).values()[0];
        return jsPsych.pluginAPI.compareKeys(data.response, 'arrowright');
      },
    },
    conditionalPerformStep,
  ],
  repetitions: 10, // Define the number of repetitions as needed
};

timeline.push({
  type: HtmlKeyboardResponsePlugin,
  choices: ['enter'],
  stimulus: blockWelcomeMessage('Synchronous Block'),
});

timeline.push(synchronousBlock);

// Narrow Asynchronous block
const narrowAsynchronousPerformStep = {
  timeline: [
    countdownStep,
    {
      type: ThermometerPlugin,
      duration: TRIAL_DURATION,
      showThermometer: true,
      randomDelay: [400, 600], // Narrow asynchronous delay
      targetHeight: randomTargetHeight, // Use randomTargetHeight function
    },
    releaseKeysStep,
  ],
};

const narrowAsynchronousConditionalPerformStep = {
  timeline: [narrowAsynchronousPerformStep],
  conditional_function: function () {
    const data = jsPsych.data.get().last(1).values()[0];
    return jsPsych.pluginAPI.compareKeys(data.response, 'arrowleft');
  },
};

const narrowAsynchronousBlock = {
  timeline: [
    acceptRejectStep,
    {
      timeline: [conditionalPerformStep],
      conditional_function: function () {
        const data = jsPsych.data.get().last(1).values()[0];
        return jsPsych.pluginAPI.compareKeys(data.response, 'arrowright');
      },
    },
    {
      timeline: [
        countdownStep,
        {
          type: ThermometerPlugin,
          duration: TRIAL_DURATION,
          showThermometer: true,
          randomDelay: [400, 600], // Narrow asynchronous delay
          targetHeight: randomTargetHeight, // Use randomTargetHeight function
        },
        {
          timeline: [releaseKeysStep],
          conditional_function: function () {
            const lastTrialData = jsPsych.data.getLastTrialData().values()[0];
            return !lastTrialData.errorOccurred;
          },
        },
      ],
    },
  ],
  repetitions: 10, // Define the number of repetitions as needed
};

timeline.push({
  type: HtmlKeyboardResponsePlugin,
  choices: ['enter'],
  stimulus: blockWelcomeMessage('Narrow Asynchronous Block'),
});

timeline.push(narrowAsynchronousBlock);

// Wide Asynchronous block
const wideAsynchronousPerformStep = {
  timeline: [
    countdownStep,
    {
      type: ThermometerPlugin,
      duration: TRIAL_DURATION,
      showThermometer: true,
      randomDelay: [0, 1000], // Wide asynchronous delay
      targetHeight: randomTargetHeight, // Use randomTargetHeight function
    },
    releaseKeysStep,
  ],
};

const wideAsynchronousConditionalPerformStep = {
  timeline: [wideAsynchronousPerformStep],
  conditional_function: function () {
    const data = jsPsych.data.get().last(1).values()[0];
    return jsPsych.pluginAPI.compareKeys(data.response, 'arrowleft');
  },
};

const wideAsynchronousBlock = {
  timeline: [
    acceptRejectStep,
    {
      timeline: [conditionalPerformStep],
      conditional_function: function () {
        const data = jsPsych.data.get().last(1).values()[0];
        return jsPsych.pluginAPI.compareKeys(data.response, 'arrowright');
      },
    },
    {
      timeline: [
        countdownStep,
        {
          type: ThermometerPlugin,
          duration: TRIAL_DURATION,
          showThermometer: true,
          randomDelay: [0, 1000], // Wide asynchronous delay
          targetHeight: randomTargetHeight, // Use randomTargetHeight function
        },
        {
          timeline: [releaseKeysStep],
          conditional_function: function () {
            const lastTrialData = jsPsych.data.getLastTrialData().values()[0];
            return !lastTrialData.errorOccurred;
          },
        },
      ],
    },
  ],
  repetitions: 10, // Define the number of repetitions as needed
};

timeline.push({
  type: HtmlKeyboardResponsePlugin,
  choices: ['enter'],
  stimulus: blockWelcomeMessage('Wide Asynchronous Block'),
});

timeline.push(wideAsynchronousBlock);


  // Start
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    choices: ['enter'],
    stimulus: experimentWelcomeMessage,
  });

  // Switch to fullscreen
  timeline.push({
    type: FullscreenPlugin,
    fullscreen_mode: true,
  });

  await jsPsych.run(timeline);

  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  return jsPsych;
}
