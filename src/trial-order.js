import { narrowAsyncBlock, syncBlock, wideAsyncBlock, trialsArray } from "./trials";
/**
 * @function trialOrders
 * @description Defines a set of predefined trial orders for different user IDs. Each order consists of a series of trial blocks
 * that are constructed based on the type of trials (synchronous, narrow asynchronous, and wide asynchronous).
 *
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {State} state - An object for storing and tracking state data during the trials.
 *
 * @returns {TrialOrdersType} - An object mapping user IDs to their respective trial order arrays.
 */
export const trialOrders = (jsPsych, state) => ({
    S01: [
        narrowAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
    ],
    S02: [
        narrowAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
    ],
    S03: [
        narrowAsyncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
    ],
    S04: [
        syncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
    ],
    S05: [
        wideAsyncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
    ],
    S06: [
        syncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
    ],
    S07: [
        wideAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
    ],
    S08: [
        syncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
    ],
    S09: [
        narrowAsyncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
    ],
    S10: [
        syncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
    ],
    S11: [
        wideAsyncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
    ],
    S12: [
        narrowAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
    ],
    S13: [
        wideAsyncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
    ],
    S14: [
        syncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
    ],
    S15: [
        narrowAsyncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
    ],
    S16: [
        syncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
    ],
    S17: [
        wideAsyncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
    ],
    S18: [
        narrowAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
    ],
    S19: [
        wideAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
    ],
    S20: [
        wideAsyncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
    ],
    S21: [
        narrowAsyncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
    ],
    S22: [
        syncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
        narrowAsyncBlock(jsPsych, state),
        syncBlock(jsPsych, state),
        wideAsyncBlock(jsPsych, state),
    ],
});
/**
 * @function sampledArray
 * @description Randomly samples six trial blocks from the 3x3x3 factorial design, resulting in a total of 378 trials.
 *
 * This function includes:
 * - Randomly selecting two blocks of synchronous trials, two blocks of narrow asynchronous trials, and two blocks of wide asynchronous trials.
 * - Ensuring that no trial blocks are repeated by sampling without replacement.
 *
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {Object} state - An object for storing and tracking state data during the trials.
 *
 * @returns {Array} - An array containing the sampled trial blocks, ready to be used in the experiment's timeline.
 */
export const sampledArray = (jsPsych, state) => jsPsych.randomization.sampleWithoutReplacement(trialsArray(jsPsych, state), 6);
/**
 * @function userTrialOrder
 * @description Generates an array of conditional timeline nodes based on user IDs. Each timeline node is only executed if the
 * user ID matches the one specified in the conditional function. This function is used to ensure that the correct trial
 * order is used based on the user ID provided at the start of the experiment.
 *
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {State} state - An object for storing and tracking state data during the trials.
 *
 * @returns {Array} - An array of timeline nodes with conditional execution based on the user ID.
 */
export const userTrialOrder = (jsPsych, state) => {
    return Object.keys(trialOrders(jsPsych, state)).map((userID) => {
        return {
            timeline: trialOrders(jsPsych, state)[userID].flat(),
            conditional_function: function () {
                if (state.userID === userID) {
                    console.log(`Match found: ${state.userID} = ${userID}`);
                    trialOrders(jsPsych, state)[state.userID].flat().forEach((trial, index) => {
                        console.log(`Trial ${index + 1}:`, trial);
                    });
                }
                return state.userID === userID;
            },
        };
    });
};
/**
 * @function randomTrialOrder
 * @description Generates a fallback timeline node that randomly samples trial blocks in cases where the user ID
 * does not match any of the predefined trial orders. This ensures that the experiment can continue even if the
 * user ID is not recognized.
 *
 * @param {JsPsych} jsPsych - The jsPsych instance used to control the experiment's flow.
 * @param {State} state - An object for storing and tracking state data during the trials.
 *
 * @returns {Object} - A timeline node that samples random trials if no matching user ID is found.
 */
export const randomTrialOrder = (jsPsych, state) => ({
    timeline: sampledArray(jsPsych, state).flat(),
    conditional_function: function () {
        // This will run only if the user ID doesn't match any predefined ID
        return !Object.keys(trialOrders(jsPsych, state)).includes(state.userID);
    }
});
