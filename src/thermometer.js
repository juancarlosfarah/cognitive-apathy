import { ParameterType } from "jspsych";
import {generateStimulus} from "./stimulus";

class ThermometerPlugin {
    static info = {
        name: 'cognitive-agency-task',
        parameters: {
            autoDecreaseAmount: {
                type: ParameterType.INT,
                default: 1
            },
            reward: {
                type: ParameterType.FLOAT,
                default: 0.50
            },
            targetHeight: {
                type: ParameterType.INT,
                default: 50
            },
            randomDelay: {
                type: ParameterType.INT,
                array: true,
                default: [0, 1000]
            },
            duration: {
                type: ParameterType.INT,
                default: 5000
            }
        }
    }

    constructor(jsPsych){
        this.jsPsych = jsPsych;
    }

    trial(display_element, trial){
        let mercuryHeight = 0;
        let autoDecreaseAmount = trial.autoDecreaseAmount;
        let tapCount = 0;
        let isRunning = false;
        let isOvertime = false;
        let startTime = 0;
        let endTime = 0;
        let error = '';
        let areKeysHeld = false;
        let keysState = { a: false, w: false, e: false };
        let randomDelay = trial.randomDelay;
        let timerRef = null;
        let intervalRef = null;

        // Helper functions
        const increaseMercury = (amount = 10) => {
            mercuryHeight = Math.min(mercuryHeight + amount, 100);
            updateUI();
        };

        const getRandomDelay = (min, max) => {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        const updateUI = () => {
            document.getElementById('mercury').style.height = `${mercuryHeight}%`;
            document.getElementById('reward').innerText = `Reward: $${trial.reward.toFixed(2)}`;
            document.getElementById('target-bar').style.bottom = `${trial.targetHeight}%`;

            if (error) {
                document.getElementById('error-message').innerText = error;
            } else {
                document.getElementById('error-message').innerText = '';
            }
        };

        // Event handlers
        const handleKeyDown = (event) => {
            // todo: don't allow enter at the end of a trial
            if (event.key === 'Enter' && areKeysHeld && !isRunning) {
                startRunning();
            }
            if (event.key === 'r' && isRunning) {
                tapCount++;
                const delay = getRandomDelay(randomDelay[0], randomDelay[1]);
                setTimeout(increaseMercury, delay);
            } else if (['a', 'w', 'e'].includes(event.key.toLowerCase())) {
                keysState[event.key.toLowerCase()] = true;
                setAreKeysHeld();
            }
        };

        const handleKeyUp = (event) => {
            if (['a', 'w', 'e'].includes(event.key.toLowerCase())) {
                keysState[event.key.toLowerCase()] = false;
                setAreKeysHeld();
            }
        };

        const setAreKeysHeld = () => {
            areKeysHeld = keysState.a && keysState.w && keysState.e;
            document.getElementById('hold-keys-message').style.display = (!areKeysHeld || isRunning || isOvertime) ? 'block' : 'none';
            document.getElementById('start-message').style.display = (areKeysHeld && !isRunning) ? 'block' : 'none';
            if (!areKeysHeld && isRunning) {
                stopRunning();
                setError('You stopped holding the keys!');
            }
        };

        const startRunning = () => {
            isRunning = true;
            startTime = this.jsPsych.getTotalTime();
            document.getElementById('start-message').style.visibility = 'hidden';
            tapCount = 0;
            mercuryHeight = 0;
            error = '';
            updateUI();

            intervalRef = setInterval(decreaseMercury, 100);

            // todo: handle overtime
            timerRef = setTimeout(stopRunning, trial.duration);
        };

        const stopRunning = () => {
            endTime = this.jsPsych.getTotalTime();
            isRunning = false;
            clearInterval(timerRef);
            clearInterval(intervalRef);
            timerRef = null;
            intervalRef = null;
            end_trial();
            updateUI();
        };

        const decreaseMercury = () => {
            mercuryHeight = Math.max(mercuryHeight - autoDecreaseAmount, 0);
            updateUI();
        };

        const setError = (message) => {
            error = message;
            updateUI();
        };

        // Setup UI
        display_element.innerHTML = generateStimulus(false, trial.reward, trial.targetHeight, mercuryHeight, error);

        // Event listeners
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        // cleanup function
        const end_trial = () => {
            setTimeout(() => {
                document.removeEventListener('keydown', handleKeyDown);
                document.removeEventListener('keyup', handleKeyUp);
                clearInterval(timerRef);
                clearInterval(intervalRef);
                display_element.innerHTML = '';

                // Gather data to save for the trial
                const trial_data = {
                    mercuryHeight,
                    startTime,
                    endTime,
                    tapCount,
                    error,
                };

                this.jsPsych.finishTrial(trial_data); },
            1000);
        };
    };
}


export default ThermometerPlugin;