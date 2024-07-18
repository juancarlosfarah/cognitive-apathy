import { ParameterType } from 'jspsych';

import { KEYS_TO_HOLD, RELEASE_KEYS_MESSAGE } from './constants';

class ReleaseKeysPlugin {
  static info = {
    name: 'release-keys',
    parameters: {
      stimulus: {
        type: ParameterType.HTML_STRING,
        default: `<p>${RELEASE_KEYS_MESSAGE}</p>`,
      },
      valid_responses: {
        type: ParameterType.KEYS,
        array: true,
        default: KEYS_TO_HOLD,
      },
      stimulus_duration: {
        type: ParameterType.INT,
        default: null,
      },
      trial_duration: {
        type: ParameterType.INT,
        default: null,
      },
      allow_held_key: {
        type: ParameterType.BOOL,
        default: true,
      },
    },
  };

  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(display_element, trial) {
    let keysState = {};
    trial.valid_responses.forEach((key) => {
      keysState[key.toLowerCase()] = false;
    });
    let errorOccurred = false;

    // Display the stimulus
    display_element.innerHTML = trial.stimulus;

    // Handle key up events
    const handleKeyUp = (event) => {
      if (trial.valid_responses.includes(event.key.toLowerCase())) {
        keysState[event.key.toLowerCase()] = false;
        checkIfAllKeysReleased();
      }
    };

    // Handle key down events
    const handleKeyDown = (event) => {
      if (trial.valid_responses.includes(event.key.toLowerCase())) {
        keysState[event.key.toLowerCase()] = true;
      }
    };

    // Check if all specified keys are released
    const checkIfAllKeysReleased = () => {
      const allReleased = !Object.values(keysState).includes(true);
      if (allReleased) {
        endTrial();
      }
    };

    // End the trial
    const endTrial = () => {
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('keydown', handleKeyDown);
      display_element.innerHTML = '';
      this.jsPsych.finishTrial({ errorOccurred });
    };

    // Add event listeners
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('keydown', handleKeyDown);
  }
}

export default ReleaseKeysPlugin;
