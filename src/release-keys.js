import { ParameterType } from 'jspsych';
import { KEYS_TO_HOLD, RELEASE_KEYS_MESSAGE } from './constants';
/**
 * @class ReleaseKeysPlugin
 * @description A custom jsPsych plugin that creates a trial where participants are instructed to release specific keys before proceeding.
 *
 * The trial includes:
 * - Displaying a stimulus (message) that instructs participants to release specific keys.
 * - Monitoring the specified keys to detect when they are released.
 * - Ending the trial automatically when all specified keys are released or when the "Enter" key is pressed.
 * - Optionally setting a duration for the stimulus display or the entire trial.
 *
 * @param {Object} jsPsych - The jsPsych instance used to control the experiment's flow.
 *
 * @method trial - Executes the trial, handling UI setup, key event monitoring, and trial termination.
 *
 * Parameters:
 * - `stimulus` (HTML_STRING): The message displayed to the participant instructing them to release the keys.
 * - `valid_responses` (KEYS[]): The keys that are monitored during the trial to ensure they are released.
 * - `stimulus_duration` (INT): The duration the stimulus is displayed before it is removed (optional).
 * - `trial_duration` (INT): The duration of the entire trial before it ends automatically (optional).
 * - `allow_held_key` (BOOL): A flag indicating whether held keys are allowed (default is true).
 *
 * @method handleKeyUp - Handles the `keyup` event, updating the keys' state and checking if all monitored keys have been released.
 * @method handleKeyDown - Handles the `keydown` event, updating the keys' state if they are pressed again.
 * @method checkIfAllKeysReleased - Checks if all specified keys have been released and ends the trial if they have.
 * @method endTrial - Ends the trial, cleans up event listeners, and sends the recorded data to jsPsych.
 */
export class ReleaseKeysPlugin {
    constructor(jsPsych) {
        this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
        let keysState = {};
        KEYS_TO_HOLD.forEach((key) => {
            keysState[key.toLowerCase()] = true;
        });
        let errorOccurred = false;
        display_element.innerHTML = trial.stimulus;
        const handleKeyUp = (event) => {
            if (KEYS_TO_HOLD.includes(event.key.toLowerCase())) {
                keysState[event.key.toLowerCase()] = false;
                checkIfAllKeysReleased();
            }
            if (event.key === 'Enter') {
                endTrial();
            }
        };
        const handleKeyDown = (event) => {
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
            document.removeEventListener('keyup', handleKeyUp);
            document.removeEventListener('keydown', handleKeyDown);
            display_element.innerHTML = '';
            this.jsPsych.finishTrial({ errorOccurred });
        };
        checkIfAllKeysReleased();
        document.addEventListener('keyup', handleKeyUp);
        document.addEventListener('keydown', handleKeyDown);
    }
}
ReleaseKeysPlugin.info = {
    name: 'release-keys',
    version: '1.0',
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
export const releaseKeysStep = {
    type: ReleaseKeysPlugin,
    valid_responses: KEYS_TO_HOLD,
};
