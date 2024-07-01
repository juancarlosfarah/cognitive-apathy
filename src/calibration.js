import { ParameterType } from 'jspsych';

import { calibrationStimulus } from './stimulus';

class CalibrationPlugin {
  static info = {
    name: 'calibration-task',
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
      reward: {
        type: ParameterType.FLOAT,
        default: 0.5,
      },
      showThermometer: {
        type: ParameterType.BOOL,
        default: true,
      },
      targetHeight: {
        type: ParameterType.INT,
        default: 50,
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
    let timerRef = null;
    let intervalRef = null;

    // helper functions
    const increaseMercury = (amount = trial.autoIncreaseAmount) => {
      mercuryHeight = Math.min(mercuryHeight + amount, 100);
      updateUI();
    };

    const updateUI = () => {
      if (trial.showThermometer) {
        document.getElementById('mercury').style.height = `${mercuryHeight}%`;
      }
      if (trial.targetHeight) {
        document.getElementById('target-bar').style.bottom =
          `${trial.targetHeight}%`;
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
        increaseMercury();
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
      document.getElementById('hold-keys-message').style.display =
        !areKeysHeld || isRunning ? 'block' : 'none';
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

    // setup ui
    display_element.innerHTML = calibrationStimulus(
      trial.showThermometer,
      mercuryHeight,
      trial.targetHeight,
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
        display_element.innerHTML = '';

        // Gather data to save for the trial
        const trial_data = {
          tapCount,
          startTime,
          endTime,
          mercuryHeight,
          error,
          targetHeight: trial.targetHeight,
        };

        this.jsPsych.finishTrial(trial_data);
      }, 1000);
    };
  }

  static calculateAverageTaps(data) {
    const tapCounts = data.map((trial) => trial.tapCount);
    return tapCounts.reduce((a, b) => a + b, 0) / tapCounts.length;
  }
}

export default CalibrationPlugin;
