import { ParameterType } from "jspsych";
import { calibration1Stimulus } from "./stimulus";  // <-- Added this line

class CalibrationPlugin {
    static info = {
        name: 'calibration-task',
        parameters: {
            duration: {
                type: ParameterType.INT,
                default: 5000
            },
            trialNum: {
                type: ParameterType.INT,
                default: 1
            }
        }
    }

    constructor(jsPsych) {
        this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
        let tapCount = 0;
        let isRunning = false;
        let startTime = 0;
        let endTime = 0;
        let areKeysHeld = false;
        let keysState = { a: false, w: false, e: false };
        let timerRef = null;

        // Helper functions
        const blinkCircle = () => {
            const innerCircle = document.getElementById('inner-circle');
            innerCircle.style.visibility = 'visible';
            setTimeout(() => {
                innerCircle.style.visibility = 'hidden';
            }, 200);
        };

        // Event handlers
        const handleKeyDown = (event) => {
            if (event.key === 'Enter' && areKeysHeld && !isRunning) {
                startRunning();
            }
            if (event.key === 'r' && isRunning) {
                tapCount++;
                blinkCircle();
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
            document.getElementById('hold-keys-message').style.display = (!areKeysHeld || isRunning) ? 'block' : 'none';
            document.getElementById('start-message').style.display = (areKeysHeld && !isRunning) ? 'block' : 'none';
            if (!areKeysHeld && isRunning) {
                stopRunning();
            }
        };

        const startRunning = () => {
            isRunning = true;
            startTime = this.jsPsych.getTotalTime();
            document.getElementById('start-message').style.visibility = 'hidden';
            tapCount = 0;

            timerRef = setTimeout(stopRunning, trial.duration);
        };

        const stopRunning = () => {
            endTime = this.jsPsych.getTotalTime();
            isRunning = false;
            clearTimeout(timerRef);
            end_trial();
        };

        // Setup UI
        display_element.innerHTML = calibration1Stimulus(trial.trialNum);  // <-- Use calibrationStimulus function with trialNum

        // Event listeners
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        // cleanup function
        const end_trial = () => {
            setTimeout(() => {
                document.removeEventListener('keydown', handleKeyDown);
                document.removeEventListener('keyup', handleKeyUp);
                display_element.innerHTML = '';

                // Gather data to save for the trial
                const trial_data = {
                    tapCount,
                    startTime,
                    endTime
                };

                this.jsPsych.finishTrial(trial_data);
            }, 1000);
        };
    }
    
    static calculateAverageTaps(data) {
        const tapCounts = data.map(trial => trial.tapCount);
        const averageTaps = tapCounts.reduce((a, b) => a + b, 0) / tapCounts.length;
        return averageTaps;
    }
}

export default CalibrationPlugin;
