import { JsPsych } from 'jspsych';
import '../styles/main.scss';
import './i18n';
/**
 * @function run
 * @description Main function to run the experiment
 * @param {Object} config - Configuration object for the experiment
 */
export declare function run({ assetPaths, input, environment, title, version, }: any): Promise<JsPsych>;
