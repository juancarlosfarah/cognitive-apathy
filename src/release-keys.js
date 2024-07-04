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

    let areKeysHeld = false;
    let keysState = { a: false, w: false, e: false };

    // Display the stimulus
    display_element.innerHTML = trial.stimulus;

    // Handle key up events
    const handleKeyUp = (event) => {
      if (['a', 'w', 'e'].includes(event.key.toLowerCase())) {
        keysState[event.key.toLowerCase()] = true;
        setAreKeysHeld();
      }
    };


    // Check if all specified keys are released
    const setAreKeysHeld = () => {
      console.log(keysState.a || keysState.w || keysState.e),
      areKeysHeld = keysState.a || keysState.w || keysState.e;
      if (areKeysHeld) {
        end_trial();
      }
    };

    // End the trial
    const end_trial = () => {
      document.removeEventListener('keyup', handleKeyUp);
      display_element.innerHTML = '';
      this.jsPsych.finishTrial();
    };

    // Add event listeners
    document.addEventListener('keyup', handleKeyUp);

    // Initial check if keys are held down
    setTimeout(() => {
      setAreKeysHeld();
    }, 0);
  }
}

export default ReleaseKeysPlugin;
