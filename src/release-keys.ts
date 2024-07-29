import { ParameterType, JsPsych } from 'jspsych';
import { KEYS_TO_HOLD, RELEASE_KEYS_MESSAGE, RELEASE_KEYS_BACKUP_MESSAGE } from './constants';

export class ReleaseKeysPlugin {
  static info = {
    name: 'release-keys',
    parameters: {
      stimulus: {
        type: ParameterType.HTML_STRING,
        default: `<p>${RELEASE_KEYS_MESSAGE}</p>`,
      },
      valid_responses: {
        type: ParameterType.KEYS,
        array: true,
        default: KEYS_TO_HOLD,
      },
      stimulus_duration: {
        type: ParameterType.INT,
        default: null,
      },
      trial_duration: {
        type: ParameterType.INT,
        default: null,
      },
      allow_held_key: {
        type: ParameterType.BOOL,
        default: true,
      },
    },
  };

  jsPsych: JsPsych;
  constructor(jsPsych: JsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(display_element: HTMLElement, trial: any) {
    let keysState: { [key: string]: boolean } = {};
    KEYS_TO_HOLD.forEach((key) => {
      keysState[key.toLowerCase()] = true;
    });
    let errorOccurred = false;
    let activeTrial = true;

    display_element.innerHTML = trial.stimulus;

    const handleKeyUp = (event: KeyboardEvent) => {
      if (KEYS_TO_HOLD.includes(event.key.toLowerCase())) {
        keysState[event.key.toLowerCase()] = false;
        checkIfAllKeysReleased();
      }
      if (event.key === 'Enter') {
        endTrial();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (KEYS_TO_HOLD.includes(event.key.toLowerCase())) {
        keysState[event.key.toLowerCase()] = true;
      }
    };

    const checkIfAllKeysReleased = () => {
      const allReleased = !Object.values(keysState).includes(true);
      if (allReleased) {
        endTrial();
      }
    };

    const endTrial = () => {
      activeTrial = false;
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('keydown', handleKeyDown);
      display_element.innerHTML = '';
      this.jsPsych.finishTrial({ errorOccurred });
    };

    checkIfAllKeysReleased();
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('keydown', handleKeyDown);


    // Add backup in case trial does not end as it should
    setTimeout(() => {
      if (activeTrial) { // Ensure the trial is still active
        const backupMessageElement = document.createElement('div');
        backupMessageElement.style.position = 'absolute';
        backupMessageElement.style.bottom = '10px';
        backupMessageElement.style.width = '100%';
        backupMessageElement.style.textAlign = 'center';
        backupMessageElement.style.fontSize = 'xx-large';
        backupMessageElement.style.color = 'red';
        backupMessageElement.innerHTML = `<p>${RELEASE_KEYS_BACKUP_MESSAGE}</p>`;
        display_element.appendChild(backupMessageElement);
      }
    }, 1000);
  }
}

export const releaseKeysStep = {
  type: ReleaseKeysPlugin,
  valid_responses: KEYS_TO_HOLD,
};
