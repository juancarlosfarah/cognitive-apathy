"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jspsych_1 = require("jspsych");
const constants_1 = require("./constants");
const keyboard_1 = require("./keyboard");
const stimulus_1 = require("./stimulus");
class TaskPlugin {
    constructor(jsPsych) {
        this.jsPsych = jsPsych;
        this.mercuryHeight = 0;
        this.isKeyDown = false;
    }
    trial(display_element, trial) {
        let tapCount = 0;
        let startTime = 0;
        let endTime = 0;
        let error = '';
        let keysState = { a: true, w: true, e: true };
        let timerRef = null;
        let intervalRef = null;
        let errorOccurred = false;
        let isRunning = false;
        let trialEnded = false;
        let keyboardInstance;
        let inputElement;
        let success = false;
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
            if (trialEnded)
                return;
            const areKeysHeld = keysState.a && keysState.w && keysState.e;
            const startMessageElement = document.getElementById('start-message');
            if (startMessageElement) {
                startMessageElement.style.display = areKeysHeld ? 'block' : 'none';
            }
            if (!areKeysHeld) {
                setError(`${constants_1.PREMATURE_KEY_RELEASE_ERROR_MESSAGE}`);
                display_element.innerHTML = `
          <div id="status" style="margin-top: 50px;">
            <div id="error-message" style="color: red;">${constants_1.PREMATURE_KEY_RELEASE_ERROR_MESSAGE}</div>
          </div>
        `;
                trial.keysReleasedFlag = true;
                setTimeout(() => stopRunning(true), constants_1.PREMATURE_KEY_RELEASE_ERROR_TIME);
            }
        };
        const increaseMercury = (amount = trial.autoIncreaseAmount) => {
            this.mercuryHeight = Math.min(this.mercuryHeight + amount, 100);
            updateUI();
        };
        const handleKeyDown = (event) => {
            const key = event.key.toLowerCase();
            if (constants_1.KEYS_TO_HOLD.includes(key)) {
                keysState[key] = true;
                setAreKeysHeld();
            }
            else if (key === constants_1.KEY_TO_PRESS && isRunning && !this.isKeyDown) {
                this.isKeyDown = true;
            }
        };
        const handleKeyUp = (event) => {
            const key = event.key.toLowerCase();
            if (constants_1.KEYS_TO_HOLD.includes(key)) {
                keysState[key] = false;
                setAreKeysHeld();
            }
            else if (key === constants_1.KEY_TO_PRESS && isRunning) {
                this.isKeyDown = false;
                tapCount++;
                if (trial.data.task === 'demo' || trial.data.task === 'block') {
                    setTimeout(() => increaseMercury(), getRandomDelay());
                }
                else {
                    increaseMercury();
                }
            }
        };
        const startRunning = () => {
            isRunning = true;
            startTime = this.jsPsych.getTotalTime();
            const startMessageElement = document.getElementById('start-message');
            if (startMessageElement)
                startMessageElement.style.visibility = 'hidden';
            tapCount = 0;
            this.mercuryHeight = 0;
            error = '';
            updateUI();
            intervalRef = window.setInterval(decreaseMercury, trial.autoDecreaseRate);
            timerRef = window.setTimeout(() => {
                stopRunning();
            }, trial.duration);
        };
        const stopRunning = (errorFlag = false) => {
            if (trialEnded)
                return;
            trialEnded = true;
            endTime = this.jsPsych.getTotalTime();
            isRunning = false;
            clearInterval(timerRef);
            clearInterval(intervalRef);
            timerRef = null;
            intervalRef = null;
            errorOccurred = errorFlag;
            display_element.innerHTML = (0, stimulus_1.stimulus)(trial.showThermometer, this.mercuryHeight, trial.bounds[0], trial.bounds[1], error);
            end_trial();
            updateUI();
        };
        const decreaseMercury = () => {
            this.mercuryHeight = Math.max(this.mercuryHeight - trial.autoDecreaseAmount, 0);
            updateUI();
        };
        const setError = (message) => {
            error = message;
            updateUI();
        };
        const isSuccess = () => {
            return (this.mercuryHeight >= trial.bounds[0] &&
                this.mercuryHeight <= trial.bounds[1] &&
                !trial.keysReleasedFlag &&
                !trial.keyTappedEarlyFlag);
        };
        if (trial.keyTappedEarlyFlag) {
            display_element.innerHTML = `
        <div id="status" style="margin-top: 50px;">
          <div id="error-message" style="color: red;">${constants_1.KEY_TAPPED_EARLY_MESSAGE}</div>
        </div>
      `;
            setTimeout(() => {
                this.jsPsych.finishTrial({
                    keyTappedEarlyFlag: true,
                    keysReleasedFlag: false,
                    success: isSuccess(),
                });
            }, constants_1.KEY_TAPPED_EARLY_ERROR_TIME);
            return;
        }
        display_element.innerHTML = (0, stimulus_1.stimulus)(trial.showThermometer, this.mercuryHeight, trial.bounds[0], trial.bounds[1], error);
        if (trial.showKeyboard) {
            const { keyboard, keyboardDiv } = (0, keyboard_1.createKeyboard)(display_element);
            keyboardInstance = keyboard;
            inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.className = 'input';
            inputElement.style.position = 'absolute';
            inputElement.style.top = '-9999px';
            document.body.appendChild(inputElement);
            document.addEventListener('keydown', (event) => {
                const key = event.key.toLowerCase();
                if (constants_1.KEYS_TO_HOLD.includes(key) || key === constants_1.KEY_TO_PRESS) {
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
                    button.style.backgroundColor = '';
                    button.style.color = '';
                }
            });
            inputElement.addEventListener('input', (event) => {
                keyboardInstance.setInput(event.target.value);
            });
        }
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        const end_trial = () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            display_element.innerHTML = '';
            const trialData = {
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
                keyTappedEarlyFlag: false,
            };
            this.jsPsych.finishTrial(trialData);
            console.log(trialData);
        };
        trial.on_load = () => {
            console.log('Trial loaded');
            setAreKeysHeld();
            startRunning();
        };
    }
}
TaskPlugin.info = {
    name: 'task-plugin',
    parameters: {
        task: {
            type: jspsych_1.ParameterType.STRING,
            default: '',
        },
        autoDecreaseAmount: {
            type: jspsych_1.ParameterType.FLOAT,
            default: constants_1.AUTO_DECREASE_AMOUNT,
        },
        autoDecreaseRate: {
            type: jspsych_1.ParameterType.INT,
            default: constants_1.AUTO_DECREASE_RATE,
        },
        autoIncreaseAmount: {
            type: jspsych_1.ParameterType.INT,
            default: 10,
        },
        showThermometer: {
            type: jspsych_1.ParameterType.BOOL,
            default: true,
        },
        bounds: {
            type: jspsych_1.ParameterType.INT,
            array: true,
            default: [20, 40],
        },
        duration: {
            type: jspsych_1.ParameterType.INT,
            default: 5000,
        },
        keysReleasedFlag: {
            type: jspsych_1.ParameterType.BOOL,
            default: false,
        },
        randomDelay: {
            type: jspsych_1.ParameterType.INT,
            array: true,
            default: [0, 0],
        },
        reward: {
            type: jspsych_1.ParameterType.FLOAT,
            default: 0,
        },
        keyTappedEarlyFlag: {
            type: jspsych_1.ParameterType.BOOL,
            default: false,
        },
        showKeyboard: {
            type: jspsych_1.ParameterType.BOOL,
            default: false,
        },
    },
};
exports.default = TaskPlugin;
