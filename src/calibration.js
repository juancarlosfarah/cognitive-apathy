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
    let tapCount = 0;
    let startTime = 0;
    let endTime = 0;
    let error = '';
    let keysState = { a: true, w: true, e: true }; // Assume keys are pressed
    let timerRef = null;
    let intervalRef = null;

    const increaseMercury = (amount = trial.autoIncreaseAmount) => {
      mercuryHeight = Math.min(mercuryHeight + amount, 100);
      updateUI();
    };

    const updateUI = () => {
      if (trial.showThermometer) {
        document.getElementById('mercury').style.height = `${mercuryHeight}%`;
      }
      if (trial.targetHeight) {
        document.getElementById('target-bar').style.bottom = `${trial.targetHeight}%`;
      }
      if (error) {
        document.getElementById('error-message').innerText = error;
      } else {
        document.getElementById('error-message').innerText = '';
      }
    };

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (['a', 'w', 'e'].includes(key)) {
        keysState[key] = true;
        setAreKeysHeld();
      } else if (key === 'r') {
        tapCount++;
        increaseMercury();
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
      document.getElementById('hold-keys-message').style.display = !areKeysHeld ? 'block' : 'none';
      document.getElementById('start-message').style.display = areKeysHeld ? 'block' : 'none';
      if (!areKeysHeld) {
        stopRunning();
        setError('You stopped holding the keys!');
      }
    };

    const startRunning = () => {
      startTime = this.jsPsych.getTotalTime();
      document.getElementById('start-message').style.visibility = 'hidden';
      tapCount = 0;
      mercuryHeight = 0;
      error = '';
      updateUI();

      intervalRef = setInterval(decreaseMercury, trial.autoDecreaseRate);
      timerRef = setTimeout(stopRunning, trial.duration);
    };

    const stopRunning = () => {
      endTime = this.jsPsych.getTotalTime();
      clearInterval(timerRef);
      clearInterval(intervalRef);
      timerRef = null;
      intervalRef = null;
      end_trial();
      updateUI();
    };

    const decreaseMercury = () => {
      mercuryHeight = Math.max(mercuryHeight - trial.autoDecreaseAmount, 0);
      updateUI();
    };

    const setError = (message) => {
      error = message;
      updateUI();
    };

    display_element.innerHTML = calibrationStimulus(trial.showThermometer, mercuryHeight, trial.targetHeight, error);

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
        };

        this.jsPsych.finishTrial(trial_data);
      }, 1000);
    };

    trial.on_load = function () {
      setAreKeysHeld(); // Initial check to update the UI based on assumed key states
      startRunning(); // Start running as the trial loads
    };
  }

  static calculateAverageTaps(data) {
    const tapCounts = data.map((trial) => trial.tapCount);
    return tapCounts.reduce((a, b) => a + b, 0) / tapCounts.length;
  }
}

export default CalibrationPlugin;
