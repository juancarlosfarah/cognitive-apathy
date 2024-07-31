import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import { ParameterType, JsPsych } from 'jspsych';

import {
  COUNTDOWN_DIRECTIONS,
  COUNTDOWN_TIME,
  GO_DURATION,
  HOLD_KEYS_MESSAGE,
  KEYS_TO_HOLD,
  KEY_TO_PRESS,
  GO_MESSAGE,
  COUNTDOWN_TIMER_MESSAGE
} from './constants';
import { createKeyboard } from './keyboard';
import { State } from './types';

export class CountdownTrialPlugin {
  static info = {
    name: 'countdown-trial',
    parameters: {
      keysToHold: {
        type: ParameterType.STRING,
        array: true,
        default: KEYS_TO_HOLD,
      },
      keyToPress: {
        type: ParameterType.STRING,
        array: false,
        default: KEY_TO_PRESS,
      },
      message: {
        type: ParameterType.HTML_STRING,
        default: HOLD_KEYS_MESSAGE,
      },
      waitTime: {
        type: ParameterType.INT,
        default: COUNTDOWN_TIME,
      },
      initialText: {
        type: ParameterType.STRING,
        default: COUNTDOWN_TIMER_MESSAGE,
      },
      allow_held_key: {
        type: ParameterType.BOOL,
        default: true,
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
  constructor(jsPsych: JsPsych) {
    this.jsPsych = jsPsych;
  
  }

  trial(displayElement: HTMLElement, trial: any) {
    console.log('Trial started with parameters:', trial);

    let keysState: { [key: string]: boolean } = {};
    (trial.keysToHold || []).forEach(
      (key: string) => (keysState[key.toLowerCase()] = false),
    );

    let areKeysHeld = false;
    let interval: number | null = null;
    let keyboardInstance: any;
    let inputElement: HTMLInputElement | undefined;

    // Create a specific container for the trial message
    const messageContainer = document.createElement('div');
    messageContainer.id = 'message-container';
    messageContainer.innerHTML = trial.message;
    displayElement.appendChild(messageContainer);

    const directionsContainer = document.createElement('div');
    directionsContainer.id = 'directions-container';
    displayElement.appendChild(directionsContainer);

    const timerContainer = document.createElement('div');
    timerContainer.id = 'timer-container';
    displayElement.appendChild(timerContainer);

    if (trial.showKeyboard) {
      const { keyboard, keyboardDiv } = createKeyboard(displayElement);
      keyboardInstance = keyboard;
      inputElement = document.createElement('input');
      inputElement.type = 'text';
      inputElement.className = 'input';
      inputElement.style.position = 'absolute';
      inputElement.style.top = '-9999px';
      document.body.appendChild(inputElement);

      // Event listeners to sync physical keyboard with on-screen keyboard
      document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();
        if (trial.keysToHold.includes(key) && inputElement) {
          keyboardInstance.setInput(inputElement.value + key);
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
          button.style.backgroundColor = ''; // Remove inline style
          button.style.color = ''; // Remove inline style
        }
      });

      // Event listener for input changes
      inputElement.addEventListener('input', (event) => {
        keyboardInstance.setInput((event.target as HTMLInputElement).value);
      });
    }

    const setAreKeysHeld = () => {
      areKeysHeld = (trial.keysToHold || []).every(
        (key: string) => keysState[key.toLowerCase()],
      );
      if (areKeysHeld && !interval) {
        messageContainer.innerHTML = ''; // Hide the initial message
        directionsContainer.innerHTML = `<p>${COUNTDOWN_DIRECTIONS}</p>`;
        startCountdown();
      } else if (!areKeysHeld && interval) {
        clearInterval(interval);
        interval = null;
        setError('You stopped holding the keys!');
        messageContainer.innerHTML = trial.message; // Reset the display message
        directionsContainer.innerHTML = ''; // Clear the directions
        timerContainer.innerHTML = ''; // Clear the timer
        trial.keyTappedEarlyFlag = false;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((trial.keysToHold || []).includes(key)) {
        keysState[key] = true;
        setAreKeysHeld();
      }
      if (key === trial.keyToPress.toLowerCase()) {
        trial.keyTappedEarlyFlag = true;
        state.keyTappedEarlyFlag = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((trial.keysToHold || []).includes(key)) {
        keysState[key] = false;
        setAreKeysHeld();
      }
    };

    const startCountdown = () => {
      const waitTime = trial.waitTime * 1000; // convert to milliseconds
      const initialText = trial.initialText;
      const startTime = performance.now();

      timerContainer.innerHTML = `
        <p>${initialText}<span id="clock">${formatTime(waitTime)}</span></p>
      `;

      const clockElement = document.getElementById('clock');

      interval = window.setInterval(() => {
        const timeLeft = waitTime - (performance.now() - startTime);
        if (timeLeft <= 0) {
          clearInterval(interval!);
          interval = null;
          endTrial();
        } else {
          clockElement!.innerHTML = formatTime(timeLeft);
        }
      }, 250);
    };

    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 1000 / 60);
      const seconds = Math.floor((time - minutes * 1000 * 60) / 1000);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const endTrial = () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);

      const trialData = {
        keyTappedEarlyFlag: trial.keyTappedEarlyFlag,
        task: 'countdown',
      };

      displayElement.innerHTML = ''; // Clear the DOM
      this.jsPsych.finishTrial(trialData);
    };

    const setError = (message: string) => {
      console.error(message);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    console.log('Initial UI setup complete.');
  }
}



export const countdownStep = (state: State) => ({
  timeline: [
    {
      type: CountdownTrialPlugin,
      data: {
        task: 'countdown',
      },
    },
    {
      type: HtmlKeyboardResponsePlugin,
      stimulus: `<p style="color: green; font-size: 48px;">${GO_MESSAGE}</p>`,
      choices: 'NO_KEYS',
      trial_duration: GO_DURATION, // Display "GO" for 1 second
      data: {
        task: 'go_screen',
      },
    },
  ],
});
