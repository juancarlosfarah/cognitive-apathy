import { ParameterType } from 'jspsych';

class ReleaseKeysPlugin {
  static info = {
    name: 'release-keys',
    parameters: {
      stimulus: {
        type: ParameterType.HTML_STRING,
        default: '<p>Release the Keys</p>',
      },
      valid_responses: {
        type: ParameterType.KEYS,
        array: true,
        default: ['a', 'w', 'e'],
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
    let keysState = { a: false, w: false, e: false };
    let errorOccurred = false;

    // Display the stimulus
    display_element.innerHTML = trial.stimulus;

    // Handle key up events
    const handleKeyUp = (event) => {
      if (['a', 'w', 'e'].includes(event.key.toLowerCase())) {
        keysState[event.key.toLowerCase()] = true;
        setAreKeysHeld();
      }
    };

    // Handle key down events
    const handleKeyDown = (event) => {
      if (['a', 'w', 'e'].includes(event.key.toLowerCase())) {
        keysState[event.key.toLowerCase()] = false;
      }
    };

    // Check if all specified keys are released
    const setAreKeysHeld = () => {
      const areKeysHeld = keysState.a || keysState.w || keysState.e;
      if (areKeysHeld) {
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
