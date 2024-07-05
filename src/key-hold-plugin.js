import { ParameterType } from 'jspsych';

class KeyHoldPlugin {
  static info = {
    name: 'key-hold-plugin',
    parameters: {
      keys: {
        type: ParameterType.STRING,
        array: true,
        default: ['a', 'w', 'e'],
      },
      message: {
        type: ParameterType.HTML_STRING,
        default: '<p>Hold the keys</p>',
      },
    },
  };

  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(display_element, trial) {
    let keysState = {};
    trial.keys.forEach(key => keysState[key] = false);

    const setAreKeysHeld = () => {
      const areKeysHeld = trial.keys.every(key => keysState[key]);
      if (areKeysHeld) {
        end_trial();
      }
    };

    const handleKeyDown = (event) => {
      if (trial.keys.includes(event.key.toLowerCase())) {
        keysState[event.key.toLowerCase()] = true;
        setAreKeysHeld();
      }
    };

    const handleKeyUp = (event) => {
      if (trial.keys.includes(event.key.toLowerCase())) {
        keysState[event.key.toLowerCase()] = false;
        setAreKeysHeld();
      }
    };

    const end_trial = () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);

      const trial_data = {
        keys_held: true,
      };

      display_element.innerHTML = '';

      this.jsPsych.finishTrial(trial_data);
    };

    display_element.innerHTML = trial.message;

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
  }
}

export default KeyHoldPlugin;
