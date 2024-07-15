import { ParameterType } from 'jspsych';
import { stimulus } from './stimulus';
import { BOUND_OPTIONS, PREMATURE_KEY_RELEASE_ERROR_TIME, PREMATURE_KEY_RELEASE_ERROR_MESSAGE, KEYS_TO_HOLD, KEY_TO_PRESS, AUTO_DECREASE_AMOUNT, AUTO_DECREASE_RATE} from './constants';

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
        default: AUTO_DECREASE_AMOUNT,
      },
      autoDecreaseRate: {
        type: ParameterType.INT,
        default: AUTO_DECREASE_RATE,
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
    this.mercuryHeight = 0;
  }

  trial(display_element, trial) {


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
      this.mercuryHeight = Math.min(this.mercuryHeight + amount, 100);
      updateUI();
    };

    const getRandomDelay = () => {
      const [min, max] = trial.randomDelay;
      return Math.random() * (max - min) + min;
    };

    const updateUI = () => {
      if (trial.showThermometer) {
        const mercuryElement = document.getElementById('mercury');
        if (mercuryElement) mercuryElement.style.height = `${this.mercuryHeight}%`;
        
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
      const startMessageElement = document.getElementById('start-message');

      if (startMessageElement) {
        startMessageElement.style.display = areKeysHeld ? 'block' : 'none';
      }
      if (!areKeysHeld) {
        setError(`${PREMATURE_KEY_RELEASE_ERROR_MESSAGE}`);
        trial.keysReleasedFlag = true; // Set the flag
        setTimeout(() => stopRunning(true), PREMATURE_KEY_RELEASE_ERROR_TIME);

      }
    };

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (KEYS_TO_HOLD.includes(key)) {
        keysState[key] = true;
        setAreKeysHeld();
      } else if (key === KEY_TO_PRESS && isRunning) {
        tapCount++;
        if (trial.data.task === 'demo' || trial.data.task === 'block') {
          setTimeout(() => increaseMercury(), getRandomDelay());
        } else {
          increaseMercury();
        }
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (KEYS_TO_HOLD.includes(key)) {
        keysState[key] = false;
        setAreKeysHeld();
        if (!keysState.a && !keysState.w && !keysState.e && !trialEnded) {
        }
      }
    };

    const startRunning = () => {
      isRunning = true;
      startTime = this.jsPsych.getTotalTime();
      const startMessageElement = document.getElementById('start-message');
      if (startMessageElement) startMessageElement.style.visibility = 'hidden';
      tapCount = 0;
      this.mercuryHeight = 0;
      error = '';
      updateUI();

      intervalRef = setInterval(decreaseMercury, trial.autoDecreaseRate);
      timerRef = setTimeout(() => {
        stopRunning();
      }, trial.duration);
    };

    const stopRunning = (errorFlag = false) => {
      if (trialEnded) return; // Prevent multiple stops
      trialEnded = true; // Set the flag to true
      endTime = this.jsPsych.getTotalTime();
      isRunning = false;
      clearInterval(timerRef);
      clearInterval(intervalRef);
      timerRef = null;
      intervalRef = null;
      errorOccurred = errorFlag;


      // Update the UI to remove the hold keys message if ending due to error
      display_element.innerHTML = stimulus(
        trial.showThermometer,
        this.mercuryHeight,
        trial.bounds[0],
        trial.bounds[1],
        error,
        !errorFlag // Pass false if errorFlag is true
      );

      end_trial();
      updateUI();
    };


    const decreaseMercury = () => {
/*       mercuryHeight = Math.max(mercuryHeight - trial.autoDecreaseAmount, 0);
 */      this.mercuryHeight = (this.mercuryHeight - trial.autoDecreaseAmount);
      updateUI();
    };

    const setError = (message) => {
      error = message;
      updateUI();
    };

    // Was trial successful 
    const isSuccess = () => {
      return this.mercuryHeight >= trial.bounds[0] && this.mercuryHeight <= trial.bounds[1] && !trial.keysReleasedFlag;
    };

    display_element.innerHTML = stimulus(
      trial.showThermometer,
      this.mercuryHeight,
      trial.bounds[0],
      trial.bounds[1],
      error
    );

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    const end_trial = () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      display_element.innerHTML = '';

      const trial_data = {
        tapCount,
        startTime,
        endTime,
        mercuryHeight: this.mercuryHeight,
        error,
        bounds: trial.bounds,
        reward: trial.reward,
        task: trial.task,
        errorOccurred,
        keysReleasedFlag: trial.keysReleasedFlag,
        success: isSuccess()
      };

      this.jsPsych.finishTrial(trial_data); // Use this.jsPsych
      console.log(trial_data);
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
