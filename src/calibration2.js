import { ParameterType } from "jspsych";
import { calibration2Stimulus } from "./stimulus";  // <-- Added this line

class Calibration2Plugin {
    static info = {
        name: 'calibration2-task',
        parameters: {
            targetHeight: {
                type: ParameterType.FLOAT,
                default: 25
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
        let mercuryHeight = 0;
        let isRunning = true;
        const autoDecrease = window.autoDecrease || 1; // Default to 1 if autoDecrease is not set
        const intervalTime = 100; // Interval for auto-decrease in ms
        const intervalSteps = (autoDecrease / (5000 / intervalTime));

        const autoDecreaseFn = () => {
            if (isRunning) {
                mercuryHeight = Math.max(0, mercuryHeight - intervalSteps);
                document.getElementById('mercury').style.height = `${mercuryHeight}%`;
                if (mercuryHeight >= trial.targetHeight) {
                    stopRunning();
                }
                setTimeout(autoDecreaseFn, intervalTime);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'r' && isRunning) {
                tapCount++;
                mercuryHeight = Math.min(100, mercuryHeight + 5); // Adjust this value as necessary
                document.getElementById('mercury').style.height = `${mercuryHeight}%`;
                if (mercuryHeight >= trial.targetHeight) {
                    stopRunning();
                }
            }
        };

        const stopRunning = () => {
            isRunning = false;
            document.removeEventListener('keydown', handleKeyDown);
            end_trial();
        };

        const end_trial = () => {
            display_element.innerHTML = '';

            // Gather data to save for the trial
            const trial_data = {
                tapCount,
                targetHeight: trial.targetHeight
            };

            this.jsPsych.finishTrial(trial_data);
        };

        // Setup UI
        display_element.innerHTML = calibration2Stimulus(trial.trialNum, trial.targetHeight, mercuryHeight);  // <-- Use calibration2Stimulus function

        // Start the auto-decrease process
        autoDecreaseFn();

        // Event listener for key presses
        document.addEventListener('keydown', handleKeyDown);
    }

    static calculateAutoDecrease(data) {
        const tapCounts = data.map(trial => trial.tapCount);
        const averageTaps = tapCounts.reduce((a, b) => a + b, 0) / tapCounts.length;
        // Assuming they should be able to hit the highest target in 5 seconds
        return averageTaps / 5;
    }
}

export default Calibration2Plugin;
