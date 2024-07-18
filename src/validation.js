import {
  BOUND_OPTIONS,
  NUM_EXTRA_VALIDATION_TRIALS,
  NUM_VALIDATION_TRIALS,
} from './constants';

// Initialize validationFailures with each bound option set to 0
export const validationFailures = BOUND_OPTIONS.reduce((acc, bounds) => {
  acc[JSON.stringify(bounds)] = 0;
  return acc;
}, {});

let validationExtraFailures = 0; // Initialize the counter for extra validation failures

/**
 * Handle the logic for finishing a validation trial.
 *
 * @param {Object} data - The data object from the trial
 * @param {String} validationName - The name of the validation trial
 * @param {Array} bounds - The bounds used in the validation trial
 * @param {Object} validationFailures - The object tracking validation failures
 * @param {Array} validationExtraCount - The count of extra validation trials
 *
 * @returns {Object} - An object containing extraValidationRequired, validationSuccess, and validationExtraFailures
 */
export const handleValidationFinish = (
  data,
  validationName,
  bounds,
  validationFailures,
  validationExtraCount,
) => {
  let extraValidationRequired = false;
  let validationSuccess = true;

  if (validationName !== 'validationExtra') {
    if (!data.success) {
      validationFailures[JSON.stringify(bounds)]++; // Increment the failure count if trial was not successful
      //  If any of the validations levels have 3/4 or more failures, ensure extra validation follows.
      if (
        Object.values(validationFailures).some(
          (failures) => failures >= Math.floor(0.75 * NUM_VALIDATION_TRIALS),
        )
      ) {
        extraValidationRequired = true;
      }
    }
  } else {
    // If the trial is an extra validation trial and it was not successful
    if (!data.success) {
      validationExtraFailures++; // Increment the counter for extra validation failures
    }

    // Check if there have been 3 or more extra validation trials
    if (validationExtraCount.length >= NUM_EXTRA_VALIDATION_TRIALS) {
      // Set validation success if the user passed at least 1 extra validation trial
      validationSuccess =
        validationExtraFailures <= NUM_EXTRA_VALIDATION_TRIALS - 1;
    }
  }

  return {
    extraValidationRequired,
    validationSuccess,
    validationExtraFailures,
  };
};
