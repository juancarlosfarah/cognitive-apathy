import { ParameterType } from 'jspsych';

import {
  COUNTDOWN_TIME,
  HOLD_KEYS_MESSAGE,
  KEYS_TO_HOLD,
  KEY_TO_PRESS,
} from './constants';

class CountdownTrialPlugin {
  static info = {
    name: 'countdown-trial',
    parameters: {
      keystoHold: {
        type: ParameterType.STRING,
        array: true,
        default: KEYS_TO_HOLD,
      },
      keyToPress: {
        type: ParameterType.STRING,
        array: false,
        default: KEY_TO_PRESS,
      },
      message: {
        type: ParameterType.HTML_STRING,
        default: HOLD_KEYS_MESSAGE,
      },
      waitTime: {
        type: ParameterType.INT,
        default: COUNTDOWN_TIME, // in seconds
      },
      initialText: {
        type: ParameterType.STRING,
        default: 'The next part of the experiment will start in ',
      },
      allow_held_key: {
        type: ParameterType.BOOL,
        default: true,
      },
      keyTappedEarlyFlag: {
        type: ParameterType.BOOL,
        default: false,
      },
    },
  };

  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(displayElement, trial) {
    let keysState = {};
    (trial.keystoHold || []).forEach(
      (key) => (keysState[key.toLowerCase()] = false),
    );

    let areKeysHeld = false;
    let interval = null;

    const setAreKeysHeld = () => {
      areKeysHeld = (trial.keystoHold || []).every(
        (key) => keysState[key.toLowerCase()],
      );
      if (areKeysHeld && !interval) {
        startCountdown();
      } else if (!areKeysHeld && interval) {
        clearInterval(interval);
        interval = null;
        setError('You stopped holding the keys!');
        displayElement.innerHTML = trial.message; // Reset the display message
      }
    };

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if ((trial.keystoHold || []).includes(key)) {
        keysState[key] = true;
        setAreKeysHeld();
      }
      if (key === trial.keyToPress.toLowerCase()) {
        trial.keyTappedEarlyFlag = true;
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if ((trial.keystoHold || []).includes(key)) {
        keysState[key] = false;
        setAreKeysHeld();
      }
    };

    const startCountdown = () => {
      const waitTime = trial.waitTime * 1000; // convert to milliseconds
      const initialText = trial.initialText;
      const startTime = performance.now();

      displayElement.innerHTML = `
        <p>${initialText}<span id="clock">${formatTime(waitTime)}</span></p>
      `;
      const clockElement = document.getElementById('clock');

      interval = setInterval(() => {
        const timeLeft = waitTime - (performance.now() - startTime);
        if (timeLeft <= 0) {
          clearInterval(interval);
          interval = null;
          endTrial();
        } else {
          clockElement.innerHTML = formatTime(timeLeft);
        }
      }, 250);
    };

    const formatTime = (time) => {
      const minutes = Math.floor(time / 1000 / 60);
      const seconds = Math.floor((time - minutes * 1000 * 60) / 1000);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const endTrial = () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);

      const trialData = {
        keys_held: areKeysHeld,
        keyTappedEarlyFlag: trial.keyTappedEarlyFlag,
      };

      displayElement.innerHTML = '';
      this.jsPsych.finishTrial(trialData);
    };

    const setError = (message) => {
      console.error(message);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Initial UI setup
    displayElement.innerHTML = trial.message;
  }
}

export default CountdownTrialPlugin;
