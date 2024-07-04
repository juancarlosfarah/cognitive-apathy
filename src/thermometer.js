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
    let isOvertime = false;
    let startTime = 0;
    let endTime = 0;
    let error = '';
    let areKeysHeld = false;
    let keysState = { a: false, w: false, e: false };
    let randomDelay = trial.randomDelay;
    let timerRef = null;
    let intervalRef = null;
    let holdStartTime = null;

    // create variation in reward and stimulus
    const targetVariation = 0; // Math.random() * 10 - 5;
    const rewardVariation = 0; // Math.random() * 4 - 2;

    const targetHeight =
      this.jsPsych.timelineVariable('targetHeight') + targetVariation;
    const reward =
      (this.jsPsych.timelineVariable('reward') + rewardVariation) / 100;

    // helper functions
    const increaseMercury = (amount = trial.autoIncreaseAmount) => {
      mercuryHeight = Math.min(mercuryHeight + amount, 100);
      updateUI();
    };

    const getRandomDelay = (min, max) => {
      return randomNumberBm(min, max);
    };

    const updateUI = () => {
      document.getElementById('mercury').style.height = `${mercuryHeight}%`;
      document.getElementById('target-bar').style.bottom = `${targetHeight}%`;

      // only show reward if there is one
      if (trial.reward) {
        document.getElementById('reward').innerText =
          `Reward: $${reward.toFixed(2)}`;
      }

      if (error) {
        document.getElementById('error-message').innerText = error;
      } else {
        document.getElementById('error-message').innerText = '';
      }
    };

    // event handlers
    const handleKeyDown = (event) => {
      // todo: don't allow enter at the end of a trial
      if (event.key === 'Enter' && areKeysHeld && !isRunning) {
        startRunning();
      }
      if (event.key === 'r' && isRunning) {
        tapCount++;
        const delay = getRandomDelay(randomDelay[0], randomDelay[1]);
        setTimeout(increaseMercury, delay);
      } else if (['a', 'w', 'e'].includes(event.key.toLowerCase())) {
        keysState[event.key.toLowerCase()] = true;
        setAreKeysHeld();
      }
    };

    const handleKeyUp = (event) => {
      if (['a', 'w', 'e'].includes(event.key.toLowerCase())) {
        keysState[event.key.toLowerCase()] = false;
        setAreKeysHeld();
      }
    };

    const setAreKeysHeld = () => {
      areKeysHeld = keysState.a && keysState.w && keysState.e;
      areKeysHeldForStartTime = true //put logic here for if it is held for 3 seconds then start running
      document.getElementById('hold-keys-message').style.display =
        !areKeysHeld || isRunning || isOvertime ? 'block' : 'none';
      document.getElementById('start-message').style.display =
        areKeysHeld && !isRunning ? 'block' : 'none';
      if (!areKeysHeld && isRunning) {
        stopRunning();
        setError('You stopped holding the keys!');
      }
    };

    const startRunning = () => {
      isRunning = true;
      startTime = this.jsPsych.getTotalTime();
      document.getElementById('start-message').style.visibility = 'hidden';
      tapCount = 0;
      mercuryHeight = 0;
      error = '';
      updateUI();

      intervalRef = setInterval(decreaseMercury, trial.autoDecreaseRate);

      // todo: handle overtime
      timerRef = setTimeout(stopRunning, trial.duration);
    };

    const stopRunning = () => {
      endTime = this.jsPsych.getTotalTime();
      isRunning = false;
      clearInterval(timerRef);
      clearInterval(intervalRef);
      timerRef = null;
      intervalRef = null;
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

    // Setup UI
    display_element.innerHTML = generateStimulus(
      false,
      reward,
      targetHeight,
      mercuryHeight,
      error,
    );

    // Event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // cleanup function
    const end_trial = () => {
      setTimeout(() => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        clearInterval(timerRef);
        clearInterval(intervalRef);
        display_element.innerHTML = '';

        // Gather data to save for the trial
        const trial_data = {
          autoDecreaseAmount,
          mercuryHeight,
          startTime,
          endTime,
          tapCount,
          error,
          reward,
          targetHeight,
        };

        this.jsPsych.finishTrial(trial_data);
      }, 1000);
    };
  }
}

export default ThermometerPlugin;
