import { ParameterType } from 'jspsych';
import Keyboard from 'simple-keyboard';
import 'simple-keyboard/build/css/index.css';

class KeyboardInteractionPlugin {
  static info = {
    name: 'keyboard-interaction',
    parameters: {
      message: {
        type: ParameterType.HTML_STRING,
        default: 'Type the following text using the on-screen keyboard:',
      },
      targetText: {
        type: ParameterType.STRING,
        default: '',
      },
      allowInput: {
        type: ParameterType.BOOL,
        default: true,
      },
    },
  };

  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(displayElement, trial) {
    // Create a div for the message
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = trial.message;
    displayElement.appendChild(messageDiv);

    // Create an input element for displaying the typed text
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.className = 'input';
    inputElement.readOnly = !trial.allowInput;
    displayElement.appendChild(inputElement);

    // Create a div for the keyboard
    const keyboardDiv = document.createElement('div');
    keyboardDiv.className = 'simple-keyboard';
    displayElement.appendChild(keyboardDiv);

    // Initialize the keyboard
    const keyboard = new Keyboard({
      onChange: (input) => this.onChange(input, inputElement),
      onKeyPress: (button) => this.onKeyPress(button, keyboard),
    });

    // Function to handle input change
    this.onChange = (input, inputElement) => {
      inputElement.value = input;
      console.log('Input changed', input);
      checkCompletion();
    };

    // Function to handle key press
    this.onKeyPress = (button, keyboard) => {
      console.log('Button pressed', button);

      // Handle shift and caps lock
      if (button === '{shift}' || button === '{lock}') this.handleShift(keyboard);
    };

    // Function to handle shift and caps lock
    this.handleShift = (keyboard) => {
      let currentLayout = keyboard.options.layoutName;
      let shiftToggle = currentLayout === 'default' ? 'shift' : 'default';

      keyboard.setOptions({
        layoutName: shiftToggle,
      });
    };

    // End the trial when the target text is matched
    const checkCompletion = () => {
      if (inputElement.value === trial.targetText) {
        endTrial();
      }
    };

    // Store the trial start time
    const startTime = performance.now();

    // Function to handle keyboard response
    const afterResponse = (info) => {
      const responseTime = performance.now() - startTime;
      console.log(`Key pressed: ${info.key} at ${responseTime}ms`);

      // Check if the pressed key matches the target text
      if (jsPsych.pluginAPI.compareKeys(info.key, trial.targetText)) {
        endTrial();
      }
    };

    // Setup keyboard listener
    const keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: afterResponse,
      valid_responses: 'ALL_KEYS',
      rt_method: 'performance',
      persist: true,
      allow_held_key: false,
    });

    // End the trial and save data
    const endTrial = () => {
      cleanup();
      displayElement.innerHTML = '';
      this.jsPsych.finishTrial({
        typed_text: inputElement.value,
      });
    };

    // Cleanup function to remove event listeners
    const cleanup = () => {
      jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      inputElement.removeEventListener('input', checkCompletion);
    };

    // Setup event listener for input changes
    inputElement.addEventListener('input', checkCompletion);
  }
}

export default KeyboardInteractionPlugin;
