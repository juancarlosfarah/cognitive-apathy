"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.releaseKeysStep = exports.ReleaseKeysPlugin = void 0;
const jspsych_1 = require("jspsych");
const constants_1 = require("./constants");
class ReleaseKeysPlugin {
    constructor(jsPsych) {
        this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
        let keysState = {};
        constants_1.KEYS_TO_HOLD.forEach((key) => {
            keysState[key.toLowerCase()] = true;
        });
        let errorOccurred = false;
        display_element.innerHTML = trial.stimulus;
        const handleKeyUp = (event) => {
            if (constants_1.KEYS_TO_HOLD.includes(event.key.toLowerCase())) {
                keysState[event.key.toLowerCase()] = false;
                checkIfAllKeysReleased();
            }
        };
        const handleKeyDown = (event) => {
            if (constants_1.KEYS_TO_HOLD.includes(event.key.toLowerCase())) {
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
exports.ReleaseKeysPlugin = ReleaseKeysPlugin;
ReleaseKeysPlugin.info = {
    name: 'release-keys',
    parameters: {
        stimulus: {
            type: jspsych_1.ParameterType.HTML_STRING,
            default: `<p>${constants_1.RELEASE_KEYS_MESSAGE}</p>`,
        },
        valid_responses: {
            type: jspsych_1.ParameterType.KEYS,
            array: true,
            default: constants_1.KEYS_TO_HOLD,
        },
        stimulus_duration: {
            type: jspsych_1.ParameterType.INT,
            default: null,
        },
        trial_duration: {
            type: jspsych_1.ParameterType.INT,
            default: null,
        },
        allow_held_key: {
            type: jspsych_1.ParameterType.BOOL,
            default: true,
        },
    },
};
exports.releaseKeysStep = {
    type: ReleaseKeysPlugin,
    valid_responses: constants_1.KEYS_TO_HOLD,
};
