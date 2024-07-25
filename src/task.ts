import { ParameterType, JsPsych } from 'jspsych';
import {
  AUTO_DECREASE_AMOUNT,
  AUTO_DECREASE_RATE,
  KEYS_TO_HOLD,
  KEY_TAPPED_EARLY_ERROR_TIME,
  KEY_TAPPED_EARLY_MESSAGE,
  KEY_TO_PRESS,
  PREMATURE_KEY_RELEASE_ERROR_MESSAGE,
  PREMATURE_KEY_RELEASE_ERROR_TIME,
} from './constants';
import { createKeyboard } from './keyboard';
import { stimulus } from './stimulus';
import { TaskTrialData } from './types';
import { TRIAL_DURATION } from './constants';

class TaskPlugin {
  static info = {
    name: 'task-plugin',
    parameters: {
      task: {
        type: ParameterType.STRING,
        default: '',
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
        type: ParameterType.INT,
        array: true,
        default: [20, 40],
      },
      trial_duration: {
        type: ParameterType.INT,
        default: TRIAL_DURATION,
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
        default: 0,
      },
      keyTappedEarlyFlag: {
        type: ParameterType.BOOL,
        default: false,
      },
      showKeyboard: {
        type: ParameterType.BOOL,
        default: false,
      },
    },
  };

  jsPsych: JsPsych;
  mercuryHeight: number;
  isKeyDown: boolean;

  constructor(jsPsych: JsPsych) {
    this.jsPsych = jsPsych;
    this.mercuryHeight = 0;
    this.isKeyDown = false;
  }

  trial(display_element: HTMLElement, trial: any) {
    let tapCount = 0;
    let startTime = 0;
    let endTime = 0;
    let error = '';
    let keysState: { [key: string]: boolean } = { a: true, w: true, e: true };
    let errorOccurred = false;
    let isRunning = false;
    let trialEnded = false;
    let keyboardInstance: any;
    let inputElement: HTMLInputElement | undefined;

    const getRandomDelay = () => {
      const [min, max] = trial.randomDelay;
      return Math.random() * (max - min) + min;
    };

    const updateUI = () => {
      if (trial.showThermometer) {
        const mercuryElement = document.getElementById('mercury');
        if (mercuryElement)
          mercuryElement.style.height = `${this.mercuryHeight}%`;

        const lowerBoundElement = document.getElementById('lower-bound');
        const upperBoundElement = document.getElementById('upper-bound');
        if (lowerBoundElement)
          lowerBoundElement.style.bottom = `${trial.bounds[0]}%`;
        if (upperBoundElement)
          upperBoundElement.style.bottom = `${trial.bounds[1]}%`;
      }
      const errorMessageElement = document.getElementById('error-message');
      if (errorMessageElement) {
        errorMessageElement.innerText = error;
      }
    };

    const setAreKeysHeld = () => {
      if (trialEnded) return;

      const areKeysHeld = keysState.a && keysState.w && keysState.e;
      const startMessageElement = document.getElementById('start-message');

      if (startMessageElement) {
        startMessageElement.style.display = areKeysHeld ? 'block' : 'none';
      }
      if (!areKeysHeld) {
        setError(PREMATURE_KEY_RELEASE_ERROR_MESSAGE);
        trial.keysReleasedFlag = true;
        display_element.innerHTML = `
          <div id="status" style="margin-top: 50px;">
            <div id="error-message" style="color: red;">${PREMATURE_KEY_RELEASE_ERROR_MESSAGE}</div>
          </div>
        `;
        setTimeout(() => stopRunning(true), PREMATURE_KEY_RELEASE_ERROR_TIME);
      }
    };

    const increaseMercury = (amount = trial.autoIncreaseAmount) => {
      this.mercuryHeight = Math.min(this.mercuryHeight + amount, 100);
      updateUI();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (KEYS_TO_HOLD.includes(key)) {
        keysState[key] = true;
        setAreKeysHeld();
      } else if (key === KEY_TO_PRESS && isRunning && !this.isKeyDown) {
        this.isKeyDown = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (KEYS_TO_HOLD.includes(key)) {
        keysState[key] = false;
        setAreKeysHeld();
      } else if (key === KEY_TO_PRESS && isRunning) {
        this.isKeyDown = false;
        tapCount++;
        if (trial.task === 'demo' || trial.task === 'block') {
          this.jsPsych.pluginAPI.setTimeout(() => increaseMercury(), getRandomDelay());
        } else {
          increaseMercury();
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

      const decreaseInterval = () => {
        this.mercuryHeight = Math.max(this.mercuryHeight - trial.autoDecreaseAmount, 0);
        updateUI();
        if (isRunning) {
          this.jsPsych.pluginAPI.setTimeout(decreaseInterval, trial.autoDecreaseRate);
        }
      };
      decreaseInterval();
    };

    const stopRunning = (errorFlag = false) => {
      if (trialEnded) return;
      trialEnded = true;
      endTime = this.jsPsych.getTotalTime();
      isRunning = false;
      errorOccurred = errorFlag;

      display_element.innerHTML = stimulus(
        trial.showThermometer,
        this.mercuryHeight,
        trial.bounds[0],
        trial.bounds[1],
        error,
      );

      updateUI();
      end_trial();
    };

    const setError = (message: string) => {
      error = message;
      updateUI();
    };

    const isSuccess = () => {
      return (
        this.mercuryHeight >= trial.bounds[0] &&
        this.mercuryHeight <= trial.bounds[1] &&
        !trial.keysReleasedFlag &&
        !trial.keyTappedEarlyFlag
      );
    };

    const end_trial = () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);

      const trialData: TaskTrialData = {
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
        success: isSuccess(),
        keyTappedEarlyFlag: trial.keyTappedEarlyFlag,
      };

      this.jsPsych.finishTrial(trialData);
      console.log(trialData);
    };

    if (trial.keyTappedEarlyFlag) {
      console.log('keyTappedEarlyActive');
      display_element.innerHTML = `
        <div id="status" style="margin-top: 50px;">
          <div id="error-message" style="color: red;">${KEY_TAPPED_EARLY_MESSAGE}</div>
        </div>
      `;
      setTimeout(() => stopRunning(true), KEY_TAPPED_EARLY_ERROR_TIME);
      return;
    }

    display_element.innerHTML = stimulus(
      trial.showThermometer,
      this.mercuryHeight,
      trial.bounds[0],
      trial.bounds[1],
      error,
    );

    if (trial.showKeyboard) {
      const { keyboard, keyboardDiv } = createKeyboard(display_element);
      keyboardInstance = keyboard;
      inputElement = document.createElement('input');
      inputElement.type = 'text';
      inputElement.className = 'input';
      inputElement.style.position = 'absolute';
      inputElement.style.top = '-9999px';
      document.body.appendChild(inputElement);

      document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();
        if (KEYS_TO_HOLD.includes(key) || key === KEY_TO_PRESS) {
          keyboardInstance.setInput(inputElement!.value + key);
          const button = keyboardDiv.querySelector(`[data-skbtn="${key}"]`);
          if (button) {
            button.classList.add('hg-activeButton');
          }
        }
      });

      document.addEventListener('keyup', (event) => {
        const key = event.key.toLowerCase();
        const button = keyboardDiv.querySelector(`[data-skbtn="${key}"]`);
        if (button && button instanceof HTMLElement) {
          button.classList.remove('hg-activeButton');
          button.style.backgroundColor = '';
          button.style.color = '';
        }
      });

      inputElement.addEventListener('input', (event) => {
        keyboardInstance.setInput((event.target as HTMLInputElement).value);
      });
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    startRunning();

    this.jsPsych.pluginAPI.setTimeout(() => {
      stopRunning();
    }, trial.trial_duration);
  }
}

export default TaskPlugin;
