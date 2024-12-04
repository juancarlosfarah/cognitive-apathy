import { ParameterType, JsPsych } from 'jspsych';
import { KEYS_TO_HOLD, KEY_TAPPED_EARLY_ERROR_TIME, KEY_TAPPED_EARLY_MESSAGE, PREMATURE_KEY_RELEASE_ERROR_MESSAGE, PREMATURE_KEY_RELEASE_ERROR_TIME } from './constants';

export class ErrorMessagePlugin {
  static info = {
    name: 'error-message',
    parameters: {
      message: {
        type: ParameterType.HTML_STRING,
        default: PREMATURE_KEY_RELEASE_ERROR_MESSAGE
      },
      trial_duration: {
        type: ParameterType.INT,
        default: PREMATURE_KEY_RELEASE_ERROR_TIME, // default display time in milliseconds
      },
      keysToCheck: {
        type: ParameterType.STRING,
        array: true,
        default: KEYS_TO_HOLD, // default keys to check
      },
    },
  };

  jsPsych: JsPsych;
  constructor(jsPsych: JsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(displayElement: HTMLElement, trial: any) {
    console.log('Trial started with parameters:', trial);

    let keysState: { [key: string]: boolean } = {};
    (trial.keysToCheck || []).forEach(
      (key: string) => (keysState[key.toLowerCase()] = true), // Initialize as true (held down)
    );

    // Create a container for the trial message
    const messageContainer = document.createElement('div');
    messageContainer.id = 'message-container';
    messageContainer.innerHTML = trial.message;
    displayElement.appendChild(messageContainer);

    const setAreKeysHeld = () => {
      const areKeysHeld = (trial.keysToCheck || []).every(
        (key: string) => keysState[key.toLowerCase()],
      );
      if (!areKeysHeld) {
        endTrial();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((trial.keysToCheck || []).includes(key)) {
        keysState[key] = false;
        setAreKeysHeld();
      }
    };

    const endTrial = () => {
      document.removeEventListener('keyup', handleKeyUp);

      const trialData = {
        task: 'error-message',
      };

      displayElement.innerHTML = ''; // Clear the DOM
      this.jsPsych.finishTrial(trialData);
    };

    document.addEventListener('keyup', handleKeyUp);

    // End trial automatically after the specified duration
    this.jsPsych.pluginAPI.setTimeout(endTrial, trial.trial_duration);
  }
}

export const keysReleasedErrorMessage = {
  timeline: [
    {
      type: ErrorMessagePlugin,
      data: {
        task: 'error-message',
      },
      message: PREMATURE_KEY_RELEASE_ERROR_MESSAGE,
      trial_duration: PREMATURE_KEY_RELEASE_ERROR_TIME
    }
  ]
}

export const keyTappedEarlyErrorMessage = {
  timeline: [
    {
      type: ErrorMessagePlugin,
      data: {
        task: 'error-message',
      },
      message: KEY_TAPPED_EARLY_MESSAGE,
      trial_duration: KEY_TAPPED_EARLY_ERROR_TIME
    }
  ]
}
