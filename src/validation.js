import { FAILED_VALIDATION_MESSAGE, PASSED_VALIDATION_MESSAGE } from "./constants";

export const validationResults = {
  easy: 0,
  medium: 0,
  hard: 0,
  extraValidation: 0
};

export const extraValidationLogic = () => {
  return () => {
    for (let i = 0; i < 3; i++) {
      const levels = ['easy', 'medium', 'hard'];
      if (validationResults[levels[i]] > 2) {
        return true;
      }
    }
    return false;
  };
};

export const getMessages = () => {
  if (validationResults.extraValidation <= 2) {
    return {
      message: PASSED_VALIDATION_MESSAGE,
      endExperiment: false
    };
  } else {
    return {
      message: FAILED_VALIDATION_MESSAGE,
      endExperiment: true
    };
  }
};

