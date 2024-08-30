import { ParameterType } from 'jspsych';
import { createKeyboard } from './keyboard';
import { COUNTDOWN_TIME, HOLD_KEYS_MESSAGE, KEYS_TO_HOLD, KEY_TO_PRESS, COUNTDOWN_TIMER_MESSAGE } from './constants';
/**
 * @class CountdownTrialPlugin
 * @description A custom jsPsych plugin that creates a trial where participants must hold specified keys for a countdown period before proceeding.
 *
 * The trial includes:
 * - Holding down specified keys (`keysToHold`).
 * - Displaying a countdown timer while the keys are held.
 * - Detecting if a specific key (`keyToPress`) is pressed too early, setting a flag (`keyTappedEarlyFlag`) if so.
 * - Optionally displaying an on-screen keyboard that synchronizes with the physical keyboard input.
 *
 * @param {Object} jsPsych - The jsPsych instance used to control the experiment's flow.
 *
 * @method trial - Executes the trial, handling UI setup, key events, and the countdown timer.
 *
 * Parameters:
 * - `keysToHold` (STRING[]): The keys that must be held down during the countdown.
 * - `keyToPress` (STRING): The key that should not be pressed during the countdown.
 * - `message` (HTML_STRING): The initial message displayed to the participant.
 * - `waitTime` (INT): The duration of the countdown in seconds.
 * - `initialText` (STRING): The initial text displayed above the countdown timer.
 * - `allow_held_key` (BOOL): Whether holding the key(s) is allowed.
 * - `keyTappedEarlyFlag` (BOOL): A flag indicating if the key was pressed too early.
 * - `showKeyboard` (BOOL): A flag indicating whether to display an on-screen keyboard (for tutorial trials)
 *
 * @method formatTime - Formats the remaining time in the countdown into MM:SS format.
 * @method startCountdown - Starts the countdown timer when all specified keys are held.
 * @method endTrial - Ends the trial and sends the recorded data to jsPsych.
 * @method setAreKeysHeld - Checks if the required keys are being held down and starts or resets the countdown as needed.
 * @method setError - Logs error messages to the console.
 */
export class CountdownTrialPlugin {
    constructor(jsPsych) {
        this.jsPsych = jsPsych;
    }
    trial(displayElement, trial) {
        let keysState = {};
        (trial.keysToHold || []).forEach((key) => (keysState[key.toLowerCase()] = false));
        let areKeysHeld = false;
        let interval = null;
        let inputElement;
        let keyboardInstance;
        // Create a specific container for the message
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
        // Show keyboard if showKeyboard parameter is set to true
        if (trial.showKeyboard) {
            const { keyboard } = createKeyboard(displayElement);
            keyboardInstance = keyboard;
            inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.className = 'input';
            inputElement.style.position = 'absolute';
            inputElement.style.top = '-9999px';
            document.body.appendChild(inputElement);
        }
        const setAreKeysHeld = () => {
            areKeysHeld = (trial.keysToHold || []).every((key) => keysState[key.toLowerCase()]);
            if (areKeysHeld && !interval) {
                messageContainer.innerHTML = ''; // Hide the initial message
                startCountdown();
            }
            else if (!areKeysHeld && interval) {
                clearInterval(interval);
                interval = null;
                setError('You stopped holding the keys!');
                messageContainer.innerHTML = trial.message; // Reset the display message
                directionsContainer.innerHTML = ''; // Clear the directions
                timerContainer.innerHTML = ''; // Clear the timer
                trial.keyTappedEarlyFlag = false;
            }
        };
        const handleKeyDown = (event) => {
            const key = event.key.toLowerCase();
            if ((trial.keysToHold || []).includes(key)) {
                keysState[key] = true;
                setAreKeysHeld();
            }
            if (key === trial.keyToPress.toLowerCase() && interval) {
                trial.keyTappedEarlyFlag = true;
            }
        };
        const handleKeyUp = (event) => {
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
                    clearInterval(interval);
                    interval = null;
                    endTrial();
                }
                else {
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
                keyTappedEarlyFlag: trial.keyTappedEarlyFlag,
                task: 'countdown',
            };
            displayElement.innerHTML = ''; // Clear the DOM
            this.jsPsych.finishTrial(trialData);
        };
        const setError = (message) => {
            console.error(message);
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    }
}
CountdownTrialPlugin.info = {
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
export const countdownStep = {
    timeline: [
        {
            type: CountdownTrialPlugin,
            data: {
                task: 'countdown',
            },
        },
    ],
};
