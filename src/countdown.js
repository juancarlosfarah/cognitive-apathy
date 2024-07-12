import { ParameterType } from 'jspsych';
import { COUNTDOWN_TIME, KEYS_TO_HOLD } from './constants';

class CountdownTrialPlugin {
  static info = {
    name: 'countdown-trial',
    parameters: {
      keys: {
        type: ParameterType.STRING,
        array: true,
        default: KEYS_TO_HOLD,
      },
      message: {
        type: ParameterType.HTML_STRING,
        default: '<p>Hold the <b>A</b>, <b>W</b>, and <b>E</b> keys!</p>',
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
      keysReleasedFlag: {
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
    (trial.keys || []).forEach(key => keysState[key] = false);

    let areKeysHeld = false;
    let interval = null;

    const setAreKeysHeld = () => {
      areKeysHeld = (trial.keys || []).every(key => keysState[key]);
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
      if ((trial.keys || []).includes(event.key.toLowerCase())) {
        keysState[event.key.toLowerCase()] = true;
        setAreKeysHeld();
      }
    };

    const handleKeyUp = (event) => {
      if ((trial.keys || []).includes(event.key.toLowerCase())) {
        keysState[event.key.toLowerCase()] = false;
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
          console.log('hello')
          clearInterval(interval);
          interval = null;
          clockElement.innerHTML = '<span style="color: green;">GO</span>';
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

      const trial_data = {
        keys_held: areKeysHeld,
      };

      displayElement.innerHTML = '';
      this.jsPsych.finishTrial(trial_data);
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
