import { SUCCESS_SCREEN_DURATION, TRIAL_SUCCEEDED, TRIAL_FAILED, KEYS_TO_HOLD } from "./constants";
import { ParameterType } from "jspsych";
class SuccessScreenPlugin {
    constructor(jsPsych) {
        this.jsPsych = jsPsych;
    }
    trial(display_element) {
        let keysState = {};
        KEYS_TO_HOLD.forEach(key => {
            keysState[key] = true;
        });
        const handleKeyUp = (event) => {
            console.log('keyup');
            const key = event.key.toLowerCase();
            if (KEYS_TO_HOLD.includes(key)) {
                keysState[key] = false;
            }
        };
        const isSuccess = () => {
            const previousTrial = this.jsPsych.data.get().last(1).values()[0];
            return previousTrial.success;
        };
        const end_trial = () => {
            console.log('successScreen keys state');
            console.log(keysState);
            console.log('trial success?');
            console.log(isSuccess());
            console.log(keysState);
            document.removeEventListener('keyup', handleKeyUp);
            const trialData = {
                keysState: keysState,
                task: 'success',
                success: isSuccess()
            };
            this.jsPsych.finishTrial(trialData);
        };
        document.addEventListener('keyup', handleKeyUp);
        const stimulusHTML = isSuccess()
            ? `<p style="color: green; font-size: 48px;">${TRIAL_SUCCEEDED}</p>`
            : `<p style="color: red; font-size: 48px;">${TRIAL_FAILED}</p>`;
        display_element.innerHTML = stimulusHTML;
        this.jsPsych.pluginAPI.setTimeout(() => {
            end_trial();
        }, SUCCESS_SCREEN_DURATION);
    }
}
SuccessScreenPlugin.info = {
    name: 'success-screen-plugin',
    parameters: {
        trial_duration: {
            type: ParameterType.INT,
            default: SUCCESS_SCREEN_DURATION,
        },
        task: {
            type: ParameterType.STRING,
            default: 'success'
        },
        success: {
            type: ParameterType.BOOL,
            default: false,
        }
    },
};
export default SuccessScreenPlugin;
export const successScreen = (jsPsych) => ({
    type: SuccessScreenPlugin,
    task: 'success',
    success: function () {
        const previousTrial = jsPsych.data.get().last(1).values()[0];
        return previousTrial.success;
    },
    trial_duration: SUCCESS_SCREEN_DURATION,
});
