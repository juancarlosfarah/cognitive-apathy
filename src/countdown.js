import { ParameterType } from 'jspsych';
import { createKeyboard } from './keyboard';

import {
  COUNTDOWN_TIME,
  HOLD_KEYS_MESSAGE,
  KEYS_TO_HOLD,
  KEY_TO_PRESS,
} from './constants';

class CountdownTrialPlugin {
  static info = {
    name: 'countdown-trial',
    parameters: {
      keystoHold: {
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
        default: COUNTDOWN_TIME, // in seconds
      },
      initialText: {
        type: ParameterType.STRING,
        default: 'The next part of the experiment will start in ',
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

  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(displayElement, trial) {
    console.log('Trial started with parameters:', trial);

    let keysState = {};
    (trial.keystoHold || []).forEach(
      (key) => (keysState[key.toLowerCase()] = false),
    );

    let areKeysHeld = false;
    let interval = null;
    let keyboardInstance;
    let inputElement;

    // Create a specific container for the trial message
    const messageContainer = document.createElement('div');
    messageContainer.id = 'message-container';
    messageContainer.innerHTML = trial.message;
    displayElement.appendChild(messageContainer);

    if (trial.showKeyboard) {
      console.log('Setting up keyboard...');
      const { keyboard, keyboardDiv } = createKeyboard(displayElement);
      keyboardInstance = keyboard;
      inputElement = document.createElement('input');
      inputElement.type = 'text';
      inputElement.className = 'input';
      inputElement.style.position = 'absolute';
      inputElement.style.top = '-9999px';
      document.body.appendChild(inputElement);
      console.log('Keyboard setup complete.');
    
      // Event listeners to sync physical keyboard with on-screen keyboard
      document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();
        if (trial.keystoHold.includes(key)) {
          keyboardInstance.setInput(inputElement.value + key);
          const button = keyboardDiv.querySelector(`[data-skbtn="${key}"]`);
          if (button) {
            button.classList.add('hg-activeButton');
            button.style.backgroundColor = '#008000'; // Apply inline style
            button.style.color = '#ffffff'; // Optional: Change text color
          }
        }
      });
    
      document.addEventListener('keyup', (event) => {
        const key = event.key.toLowerCase();
        const button = keyboardDiv.querySelector(`[data-skbtn="${key}"]`);
        if (button) {
          button.classList.remove('hg-activeButton');
          button.style.backgroundColor = ''; // Remove inline style
          button.style.color = ''; // Remove inline style
        }
      });
    
      // Event listener for input changes
      inputElement.addEventListener('input', (event) => {
        keyboardInstance.setInput(event.target.value);
      });
    }

    const setAreKeysHeld = () => {
      areKeysHeld = (trial.keystoHold || []).every(
        (key) => keysState[key.toLowerCase()],
      );
      if (areKeysHeld && !interval) {
        startCountdown();
      } else if (!areKeysHeld && interval) {
        clearInterval(interval);
        interval = null;
        setError('You stopped holding the keys!');
        messageContainer.innerHTML = trial.message; // Reset the display message
      }
    };

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      console.log('Key down:', key);
      if ((trial.keystoHold || []).includes(key)) {
        keysState[key] = true;
        setAreKeysHeld();
      }
      if (key === trial.keyToPress.toLowerCase()) {
        trial.keyTappedEarlyFlag = true;
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      console.log('Key up:', key);
      if ((trial.keystoHold || []).includes(key)) {
        keysState[key] = false;
        setAreKeysHeld();
      }
    };

    const startCountdown = () => {
      const waitTime = trial.waitTime * 1000; // convert to milliseconds
      const initialText = trial.initialText;
      const startTime = performance.now();

      messageContainer.innerHTML = `
        <p>${initialText}<span id="clock">${formatTime(waitTime)}</span></p>
      `;
      const clockElement = document.getElementById('clock');

      interval = setInterval(() => {
        const timeLeft = waitTime - (performance.now() - startTime);
        if (timeLeft <= 0) {
          clearInterval(interval);
          interval = null;
          endTrial();
        } else {
          clockElement.innerHTML = formatTime(timeLeft);
        }
      }, 250);
    };

    const formatTime = (time) => {
      const minutes = Math.floor(time / 1000 / 60);
      const seconds = Math.floor((time - minutes * 1000 * 60) / 1000);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const endTrial = () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);

      const trialData = {
        keys_held: areKeysHeld,
        keyTappedEarlyFlag: trial.keyTappedEarlyFlag,
      };

      displayElement.innerHTML = '';
      this.jsPsych.finishTrial(trialData);
      console.log('Trial ended with data:', trialData);
    };

    const setError = (message) => {
      console.error(message);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    console.log('Initial UI setup complete.');
  }
}

export default CountdownTrialPlugin;
