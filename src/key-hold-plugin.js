import { ParameterType } from 'jspsych';

class KeyHoldPlugin {
  static info = {
    name: 'key-hold',
    parameters: {},
  };

  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(display_element, trial) {
    let keysState = { a: false, w: false, e: false };

    const setAreKeysHeld = () => {
      const areKeysHeld = keysState.a && keysState.w && keysState.e;
      const holdKeysMessageElement = document.getElementById('hold-keys-message');

      if (holdKeysMessageElement) {
        holdKeysMessageElement.style.display = !areKeysHeld ? 'block' : 'none';
      }

      if (areKeysHeld) {
        end_trial();
      }
    };

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (['a', 'w', 'e'].includes(key)) {
        keysState[key] = true;
        setAreKeysHeld();
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (['a', 'w', 'e'].includes(key)) {
        keysState[key] = false;
        setAreKeysHeld();
      }
    };

    const end_trial = () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      this.jsPsych.finishTrial();
    };

    display_element.innerHTML = `
      <p id="hold-keys-message">Hold the <b>A</b>, <b>W</b>, and <b>E</b> keys!</p>
      <p id="start-message" style="display: none;">Hit <b>Enter</b> to start!</p>
    `;

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
  }
}

export default KeyHoldPlugin;
