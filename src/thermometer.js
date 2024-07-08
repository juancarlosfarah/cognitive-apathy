import { ParameterType } from 'jspsych';
import { calibrationStimulus } from './stimulus';
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
      targetHeight: {
        type: ParameterType.INT,
        default: 50,
      },
      reward: {
        type: ParameterType.FLOAT,
        default: 0.5,
      },
    },
  };

  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(display_element, trial) {
    console.log("Trial started");

    let mercuryHeight = 0;
    let tapCount = 0;
    let startTime = 0;
    let endTime = 0;
    let error = '';
    let keysState = { a: true, w: true, e: true }; // Assume keys are pressed
    let timerRef = null;
    let intervalRef = null;
    let errorOccurred = false;
    let isRunning = false;
    let trialEnded = false; // Flag to prevent multiple endings

    // create variation in reward and stimulus
    const targetVariation = 0; // Math.random() * 10 - 5;
    const rewardVariation = 0; // Math.random() * 4 - 2;

    const targetHeight = trial.targetHeight + targetVariation;
    const reward = (trial.reward + rewardVariation) / 100;

    const increaseMercury = (amount = trial.autoIncreaseAmount) => {
      mercuryHeight = Math.min(mercuryHeight + amount, 100);
      updateUI();
    };

    const getRandomDelay = () => {
      const [min, max] = trial.randomDelay;
      return Math.random() * (max - min) + min;
    };

    const updateUI = () => {
      if (trial.showThermometer) {
        const mercuryElement = document.getElementById('mercury');
        if (mercuryElement) mercuryElement.style.height = `${mercuryHeight}%`;
        const targetBarElement = document.getElementById('target-bar');
        if (targetBarElement) targetBarElement.style.bottom = `${targetHeight}%`;
      }
      const errorMessageElement = document.getElementById('error-message');
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
        setTimeout(() => increaseMercury(), getRandomDelay());
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (['a', 'w', 'e'].includes(key)) {
        keysState[key] = false;
        setAreKeysHeld();
        if (!keysState.a && !keysState.w && !keysState.e && !trialEnded) {
          console.log("All keys released, ending trial.");
          stopRunning(true);
        }
      }
    };

    const setAreKeysHeld = () => {
      if (trialEnded) return; // Prevent the function from running if the trial has ended

      const areKeysHeld = keysState.a && keysState.w && keysState.e;
      const holdKeysMessageElement = document.getElementById('hold-keys-message');
      const startMessageElement = document.getElementById('start-message');

      if (holdKeysMessageElement) {
        holdKeysMessageElement.style.display = !areKeysHeld ? 'block' : 'none';
      }
      if (startMessageElement) {
        startMessageElement.style.display = areKeysHeld ? 'block' : 'none';
      }

      if (!areKeysHeld) {
        setError('You stopped holding the keys!');
        console.log("Keys not held, setting error and stopping trial.");
        stopRunning(true);
      }
    };

    const startRunning = () => {
      console.log("Starting trial run");
      isRunning = true;
      startTime = this.jsPsych.getTotalTime();
      const startMessageElement = document.getElementById('start-message');
      if (startMessageElement) startMessageElement.style.visibility = 'hidden';
      tapCount = 0;
      mercuryHeight = 0;
      error = '';
      updateUI();

      intervalRef = setInterval(decreaseMercury, trial.autoDecreaseRate);
      timerRef = setTimeout(() => {
        console.log("Trial duration ended, stopping trial.");
        stopRunning();
      }, trial.duration);
    };

    const stopRunning = (errorFlag = false) => {
      if (trialEnded) return; // Prevent multiple stops
      console.log("Stopping trial run");
      trialEnded = true; // Set the flag to true
      endTime = this.jsPsych.getTotalTime();
      isRunning = false;
      clearInterval(timerRef);
      clearInterval(intervalRef);
      timerRef = null;
      intervalRef = null;
      errorOccurred = errorFlag;

      // Hide the hold keys message immediately
      const holdKeysMessageElement = document.getElementById('hold-keys-message');
      if (holdKeysMessageElement) {
        holdKeysMessageElement.style.display = 'none';
      }

      // Update the UI to remove the hold keys message if ending due to error
      display_element.innerHTML = calibrationStimulus(
        trial.showThermometer,
        mercuryHeight,
        targetHeight,
        error,
        !errorFlag // Pass false if errorFlag is true
      );

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

    display_element.innerHTML = calibrationStimulus(
      trial.showThermometer,
      mercuryHeight,
      targetHeight,
      error
    );

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    const end_trial = () => {
      console.log("Ending trial");
      setTimeout(() => {
        console.log("Cleaning up trial");
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        display_element.innerHTML = '';

        const trial_data = {
          tapCount,
          startTime,
          endTime,
          mercuryHeight,
          error,
          targetHeight,
          errorOccurred,
        };

        console.log("Finishing trial with data:", trial_data);
        this.jsPsych.finishTrial(trial_data); // Use this.jsPsych
      }, 1000);
    };

    trial.on_load = () => {
      console.log("Trial loaded");
      setAreKeysHeld(); // Initial check to update the UI based on assumed key states
      startRunning(); // Start running as the trial loads
    };
  }
}

export default ThermometerPlugin;
