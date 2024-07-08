import { ParameterType } from 'jspsych';
import { generateStimulus } from './stimulus';
import { randomNumberBm } from './utils';

class ThermometerPlugin {
  static info = {
    name: 'cognitive-agency-task',
    parameters: {
      autoDecreaseAmount: {
        type: ParameterType.FLOAT,
        default: 1,
      },
      autoDecreaseRate: {
        type: ParameterType.INT,
        default: 100,
      },
      autoIncreaseAmount: {
        type: ParameterType.INT,
        default: 10,
      },
      randomDelay: {
        type: ParameterType.INT,
        array: true,
        default: [0, 0],
      },
      duration: {
        type: ParameterType.INT,
        default: 5000,
      },
    },
  };

  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(display_element, trial) {
    let mercuryHeight = 0;
    let autoDecreaseAmount = trial.autoDecreaseAmount;
    let tapCount = 0;
    let isRunning = false;
    let startTime = 0;
    let endTime = 0;
    let error = '';
    let keysState = { a: true, w: true, e: true }; // Assume keys are pressed
    let timerRef = null;
    let intervalRef = null;
    let errorOccurred = false;

    const increaseMercury = (amount = trial.autoIncreaseAmount) => {
      mercuryHeight = Math.min(mercuryHeight + amount, 100);
      updateUI();
    };

    const updateUI = () => {
      const mercuryElement = document.getElementById('mercury');
      const targetBarElement = document.getElementById('target-bar');
      const rewardElement = document.getElementById('reward');
      const errorMessageElement = document.getElementById('error-message');

      if (mercuryElement) {
        mercuryElement.style.height = `${mercuryHeight}%`;
      }
      if (targetBarElement) {
        targetBarElement.style.bottom = `${trial.targetHeight}%`;
      }
      if (rewardElement) {
        rewardElement.innerText = `Reward: $${trial.reward.toFixed(2)}`;
      }
      if (errorMessageElement) {
        errorMessageElement.innerText = error;
      }
    };

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (['a', 'w', 'e'].includes(key)) {
        keysState[key] = true;
        setAreKeysHeld();
      } else if (key === 'r' && isRunning) {
        tapCount++;
        const delay = getRandomDelay(trial.randomDelay[0], trial.randomDelay[1]);
        setTimeout(increaseMercury, delay);
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (['a', 'w', 'e'].includes(key)) {
        keysState[key] = false;
        setAreKeysHeld();
      }
    };

    const setAreKeysHeld = () => {
      const areKeysHeld = keysState.a && keysState.w && keysState.e;
      const holdKeysMessageElement = document.getElementById('hold-keys-message');
      const startMessageElement = document.getElementById('start-message');

      if (holdKeysMessageElement) {
        holdKeysMessageElement.style.display = !areKeysHeld ? 'block' : 'none';
      }
      if (startMessageElement) {
        startMessageElement.style.display = areKeysHeld ? 'block' : 'none';
      }

      if (!areKeysHeld && isRunning) {
        setError('You stopped holding the keys!');
        stopRunning(true);
      }
    };

    const startRunning = () => {
      isRunning = true;
      startTime = this.jsPsych.getTotalTime();
      const startMessageElement = document.getElementById('start-message');
      if (startMessageElement) {
        startMessageElement.style.visibility = 'hidden';
      }
      tapCount = 0;
      mercuryHeight = 0;
      error = '';
      updateUI();

      intervalRef = setInterval(decreaseMercury, trial.autoDecreaseRate);
      timerRef = setTimeout(stopRunning, trial.duration);
    };

    const stopRunning = (errorFlag = false) => {
      endTime = this.jsPsych.getTotalTime();
      isRunning = false;
      clearInterval(timerRef);
      clearInterval(intervalRef);
      timerRef = null;
      intervalRef = null;
      errorOccurred = errorFlag;
      end_trial();
      updateUI();
    };

    const decreaseMercury = () => {
      mercuryHeight = Math.max(mercuryHeight - autoDecreaseAmount, 0);
      updateUI();
    };

    const setError = (message) => {
      error = message;
      updateUI();
    };

    const getRandomDelay = (min, max) => {
      return randomNumberBm(min, max);
    };

    display_element.innerHTML = generateStimulus(
      false,
      trial.reward,
      trial.targetHeight,
      mercuryHeight,
      error,
    );

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    const end_trial = () => {
      setTimeout(() => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        display_element.innerHTML = '';

        const trial_data = {
          tapCount,
          startTime,
          endTime,
          mercuryHeight,
          error,
          targetHeight: trial.targetHeight,
          errorOccurred,
        };

        this.jsPsych.finishTrial(trial_data);
      }, 1000);
    };

    trial.on_load = function () {
      setAreKeysHeld(); // Initial check to update the UI based on assumed key states
      startRunning(); // Start running as the trial loads
    };
  }
}

export default ThermometerPlugin;

