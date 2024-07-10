import { ParameterType } from 'jspsych';
import { calibrationStimulus } from './stimulus';
import { BOUND_OPTIONS } from './constants';

class TaskPlugin {
  static info = {
    name: 'task-plugin',
    parameters: {
      taskType: {
        type: ParameterType.STRING,
        default: 'calibration', // 'calibration' or 'thermometer' or 'validation'
      },
      autoDecreaseAmount: {
        type: ParameterType.FLOAT,
        default: 0,
      },
      autoDecreaseRate: {
        type: ParameterType.INT,
        default: 0,
      },
      autoIncreaseAmount: {
        type: ParameterType.INT,
        default: 10,
      },
      showThermometer: {
        type: ParameterType.BOOL,
        default: true,
      },
      bounds: {
        type: ParameterType.ARRAY,
        default: [20, 40],
      },
      duration: {
        type: ParameterType.INT,
        default: 5000,
      },
      keysReleasedFlag: {
        type: ParameterType.BOOL,
        default: false,
      },
      randomDelay: {
        type: ParameterType.INT,
        array: true,
        default: [0, 0],
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
    let mainBlock = false;

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
        
        const lowerBoundElement = document.getElementById('lower-bound');
        const upperBoundElement = document.getElementById('upper-bound');
        if (lowerBoundElement) lowerBoundElement.style.bottom = `${trial.bounds[0]}%`;
        if (upperBoundElement) upperBoundElement.style.bottom = `${trial.bounds[1]}%`;
      }
      const errorMessageElement = document.getElementById('error-message');
      if (errorMessageElement) {
        errorMessageElement.innerText = error;
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
        trial.keysReleasedFlag = true; // Set the flag
        console.log("Inside task.js - keysReleasedFlag:", trial.keysReleasedFlag);
        setTimeout(() => stopRunning(true), 1000);

      }
    };

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (['a', 'w', 'e'].includes(key)) {
        keysState[key] = true;
        setAreKeysHeld();
      } else if (key === 'r' && isRunning) {
        tapCount++;
        if (trial.taskType === 'thermometer') {
          setTimeout(() => increaseMercury(), getRandomDelay());
        } else {
          increaseMercury();
        }
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (['a', 'w', 'e'].includes(key)) {
        keysState[key] = false;
        setAreKeysHeld();
        if (!keysState.a && !keysState.w && !keysState.e && !trialEnded) {
          console.log("All keys released, ending trial.");
        }
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
        trial.bounds[0],
        trial.bounds[1],
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

    // Was trial successful 
    const isSuccess = () => {
      return mercuryHeight >= trial.bounds[0] && mercuryHeight <= trial.bounds[1] && !trial.keysReleasedFlag;
    };

    display_element.innerHTML = calibrationStimulus(
      trial.showThermometer,
      mercuryHeight,
      trial.bounds[0],
      trial.bounds[1],
      error
    );

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    const end_trial = () => {
      console.log("Ending trial");
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      display_element.innerHTML = '';

      const trial_data = {
        tapCount,
        startTime,
        endTime,
        mercuryHeight,
        error,
        bounds: trial.bounds,
        reward: trial.reward,
        task: trial.task,
        errorOccurred,
        keysReleasedFlag: trial.keysReleasedFlag,
        success: isSuccess()
      };

      console.log("Finishing trial with data:", trial_data);
      this.jsPsych.finishTrial(trial_data); // Use this.jsPsych
    };

    trial.on_load = () => {
      console.log("Trial loaded");
      setAreKeysHeld(); // Initial check to update the UI based on assumed key states
      startRunning(); // Start running as the trial loads
    };
  }

/*   static calculateAverageTaps(data) {
    const tapCounts = data.map((trial) => trial.tapCount);
    return tapCounts.reduce((a, b) => a + b, 0) / tapCounts.length;
  } */
}

export default TaskPlugin;
