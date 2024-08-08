import fastCartesian from 'fast-cartesian';
import i18n from './i18n';
export const LOADING_BAR_SPEED_NO = 50;
export const LOADING_BAR_SPEED_YES = 5;
export const AUTO_DECREASE_AMOUNT = 2;
export const AUTO_DECREASE_RATE = 100;
export const AUTO_INCREASE_AMOUNT = 10;
export const MAXIMUM_THERMOMETER_HEIGHT = 100;
export const EXPECTED_MAXIMUM_PERCENTAGE = 100;
export const KEYS_TO_HOLD = ['a', 'w', 'e'];
export const KEY_TO_PRESS = 'r';
export const NUM_TAPS_WITHOUT_DELAY = 5;
export const LOW_REWARDS = [0.01, 0.02, 0.03];
export const MEDIUM_REWARDS = [0.05, 0.06, 0.07];
export const HIGH_REWARDS = [0.10, 0.11, 0.12];
export const REWARD_OPTIONS = [LOW_REWARDS, MEDIUM_REWARDS, HIGH_REWARDS];
export const EASY_BOUNDS = [30, 50];
export const MEDIUM_BOUNDS = [50, 70];
export const HARD_BOUNDS = [70, 90];
export const BOUND_OPTIONS = [EASY_BOUNDS, MEDIUM_BOUNDS, HARD_BOUNDS];
export const NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS = 2; //4 default
export const NUM_CALIBRATION_WITH_FEEDBACK_TRIALS = 1; //3 default
export const NUM_CALIBRATION_TRIALS = NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS +
    NUM_CALIBRATION_WITH_FEEDBACK_TRIALS;
export const NUM_FINAL_CALIBRATION_TRIALS_PART_1 = 3;
export const NUM_FINAL_CALIBRATION_TRIALS_PART_2 = 3;
export const MINIMUM_CALIBRATION_MEDIAN = 15;
export const EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION = 50;
export const NUM_VALIDATION_TRIALS = 4; //4 default
export const NUM_EXTRA_VALIDATION_TRIALS = 3; //3 default
export const NUM_DEMO_TRIALS = 3; //3 default
export const MINIMUM_DEMO_TAPS = 10;
export const FAILED_MINIMUM_DEMO_TAPS_DURATION = 3000;
export const NUM_TRIALS = 63; //63 default 
export const TRIAL_DURATION = 5000; //7000 default
export const PARAMETER_COMBINATIONS = fastCartesian([
    REWARD_OPTIONS,
    BOUND_OPTIONS,
]).map(([reward, bounds]) => ({
    reward,
    bounds,
}));
export const PARAMETER_COMBINATIONS_TOTAL = Math.floor(NUM_TRIALS / PARAMETER_COMBINATIONS.length);
export const GO_DURATION = 500;
export const SUCCESS_SCREEN_DURATION = 500;
export const COUNTDOWN_TIME = 3;
export const PREMATURE_KEY_RELEASE_ERROR_TIME = 1000;
export const KEY_TAPPED_EARLY_ERROR_TIME = 3000;
export const KEYBOARD_LAYOUT = '';
// Messages
export const PASSED_VALIDATION_MESSAGE = i18n.t('PASSED_VALIDATION_MESSAGE');
export const FAILED_VALIDATION_MESSAGE = i18n.t('FAILED_VALIDATION_MESSAGE');
export const TUTORIAL_INTRODUCTION_MESSAGE = i18n.t("TUTORIAL_INTRODUCTION_MESSAGE");
export const CALIBRATION_SECTION_MESSAGE = i18n.t('CALIBRATION_SECTION_MESSAGE');
export const CALIBRATION_PART_1_DIRECTIONS = i18n.t('CALIBRATION_PART_1_DIRECTIONS', {
    KEYS_TO_HOLD_0: KEYS_TO_HOLD[0].toUpperCase(),
    KEYS_TO_HOLD_1: KEYS_TO_HOLD[1].toUpperCase(),
    KEYS_TO_HOLD_2: KEYS_TO_HOLD[2].toUpperCase(),
    KEY_TO_PRESS: KEY_TO_PRESS.toUpperCase(),
});
export const ADDITIONAL_CALIBRATION_PART_1_DIRECTIONS = i18n.t('ADDITIONAL_CALIBRATION_PART_1_DIRECTIONS', {
    KEYS_TO_HOLD_0: KEYS_TO_HOLD[0].toUpperCase(),
    KEYS_TO_HOLD_1: KEYS_TO_HOLD[1].toUpperCase(),
    KEYS_TO_HOLD_2: KEYS_TO_HOLD[2].toUpperCase(),
    KEY_TO_PRESS: KEY_TO_PRESS.toUpperCase(),
});
export const CALIBRATION_PART_1_ENDING_MESSAGE = i18n.t('CALIBRATION_PART_1_ENDING_MESSAGE');
export const CALIBRATION_PART_2_DIRECTIONS = i18n.t('CALIBRATION_PART_2_DIRECTIONS');
export const TRIAL_BLOCKS_DIRECTIONS = i18n.t('TRIAL_BLOCKS_DIRECTIONS');
export const CALIBRATION_PART_2_ENDING_MESSAGE = i18n.t('CALIBRATION_PART_2_ENDING_MESSAGE');
export const CALIBRATION_FINISHED_DIRECTIONS = i18n.t('CALIBRATION_FINISHED_DIRECTIONS');
export const FINAL_CALIBRATION_SECTION_DIRECTIONS_PART_1 = i18n.t('FINAL_CALIBRATION_SECTION_DIRECTIONS_PART_1', {
    KEYS_TO_HOLD_0: KEYS_TO_HOLD[0].toUpperCase(),
    KEYS_TO_HOLD_1: KEYS_TO_HOLD[1].toUpperCase(),
    KEYS_TO_HOLD_2: KEYS_TO_HOLD[2].toUpperCase(),
    KEY_TO_PRESS: KEY_TO_PRESS.toUpperCase(),
});
export const FINAL_CALIBRATION_SECTION_DIRECTIONS_PART_2 = i18n.t('FINAL_CALIBRATION_SECTION_DIRECTIONS_PART_2', {
    KEYS_TO_HOLD_0: KEYS_TO_HOLD[0].toUpperCase(),
    KEYS_TO_HOLD_1: KEYS_TO_HOLD[1].toUpperCase(),
    KEYS_TO_HOLD_2: KEYS_TO_HOLD[2].toUpperCase(),
    KEY_TO_PRESS: KEY_TO_PRESS.toUpperCase(),
});
export const VALIDATION_DIRECTIONS = i18n.t('VALIDATION_DIRECTIONS');
export const PREMATURE_KEY_RELEASE_ERROR_MESSAGE = i18n.t('PREMATURE_KEY_RELEASE_ERROR_MESSAGE');
export const LIKERT_PREAMBLE = i18n.t('LIKERT_PREAMBLE');
export const LIKERT_PREAMBLE_DEMO = i18n.t('LIKERT_PREAMBLE_DEMO');
export const LIKERT_INTRO = i18n.t('LIKERT_INTRO');
export const LIKERT_INTRO_DEMO = i18n.t('LIKERT_INTRO_DEMO');
export const FAILED_MINIMUM_DEMO_TAPS_MESSAGE = i18n.t('FAILED_MINIMUM_DEMO_TAPS_MESSAGE');
export const HOLD_KEYS_MESSAGE = i18n.t('HOLD_KEYS_MESSAGE', {
    KEYS_TO_HOLD_0: KEYS_TO_HOLD[0].toUpperCase(),
    KEYS_TO_HOLD_1: KEYS_TO_HOLD[1].toUpperCase(),
    KEYS_TO_HOLD_2: KEYS_TO_HOLD[2].toUpperCase()
});
export const KEY_TAPPED_EARLY_MESSAGE = i18n.t('KEY_TAPPED_EARLY_MESSAGE');
export const RELEASE_KEYS_MESSAGE = i18n.t('RELEASE_KEYS_MESSAGE');
export const REWARD_TOTAL_MESSAGE = (totalSuccessfulReward) => i18n.t('REWARD_TOTAL_MESSAGE', { totalSuccessfulReward });
export const EXPERIMENT_BEGIN_MESSAGE = i18n.t('EXPERIMENT_BEGIN_MESSAGE');
export const NO_STIMULI_VIDEO_TUTORIAL_MESSAGE = i18n.t('NO_STIMULI_VIDEO_TUTORIAL_MESSAGE', {
    KEYS_TO_HOLD_0: KEYS_TO_HOLD[0].toUpperCase(),
    KEYS_TO_HOLD_1: KEYS_TO_HOLD[1].toUpperCase(),
    KEYS_TO_HOLD_2: KEYS_TO_HOLD[2].toUpperCase(),
    KEY_TO_PRESS: KEY_TO_PRESS.toUpperCase(),
});
export const STIMULI_VIDEO_TUTORIAL_MESSAGE = i18n.t('STIMULI_VIDEO_TUTORIAL_MESSAGE', {
    KEYS_TO_HOLD_0: KEYS_TO_HOLD[0].toUpperCase(),
    KEYS_TO_HOLD_1: KEYS_TO_HOLD[1].toUpperCase(),
    KEYS_TO_HOLD_2: KEYS_TO_HOLD[2].toUpperCase(),
    KEY_TO_PRESS: KEY_TO_PRESS.toUpperCase(),
});
export const VALIDATION_VIDEO_TUTORIAL_MESSAGE = i18n.t('VALIDATION_VIDEO_TUTORIAL_MESSAGE', {
    KEYS_TO_HOLD_0: KEYS_TO_HOLD[0].toUpperCase(),
    KEYS_TO_HOLD_1: KEYS_TO_HOLD[1].toUpperCase(),
    KEYS_TO_HOLD_2: KEYS_TO_HOLD[2].toUpperCase(),
    KEY_TO_PRESS: KEY_TO_PRESS.toUpperCase(),
});
export const INTERACTIVE_KEYBOARD_TUTORIAL_MESSAGE = i18n.t('INTERACTIVE_KEYBOARD_TUTORIAL_MESSAGE', {
    KEYS_TO_HOLD_0: KEYS_TO_HOLD[0].toUpperCase(),
    KEYS_TO_HOLD_1: KEYS_TO_HOLD[1].toUpperCase(),
    KEYS_TO_HOLD_2: KEYS_TO_HOLD[2].toUpperCase(),
    KEY_TO_PRESS: KEY_TO_PRESS.toUpperCase(),
});
export const DEMO_TRIAL_MESSAGE = i18n.t('DEMO_TRIAL_MESSAGE', {
    NUM_DEMO_TRIALS: NUM_DEMO_TRIALS,
    NUM_TRIALS: NUM_TRIALS,
    KEY_TO_PRESS: KEY_TO_PRESS.toUpperCase(),
    KEYS_TO_HOLD_0: KEYS_TO_HOLD[0].toUpperCase(),
    KEYS_TO_HOLD_1: KEYS_TO_HOLD[1].toUpperCase(),
    KEYS_TO_HOLD_2: KEYS_TO_HOLD[2].toUpperCase()
});
export const ACCEPTANCE_TRIAL_MESSAGE = i18n.t('ACCEPTANCE_TRIAL_MESSAGE');
export const DOMINANT_HAND_MESSAGE = i18n.t('DOMINANT_HAND_MESSAGE');
export const TRIAL_FAILED = i18n.t('TRIAL_FAILED');
export const TRIAL_SUCCEEDED = i18n.t('TRIAL_SUCCEEDED');
export const GO_MESSAGE = i18n.t('GO_MESSAGE');
export const LOADING_BAR_MESSAGE = i18n.t('LOADING_BAR_MESSAGE');
export const CONTINUE_BUTTON_MESSAGE = i18n.t('CONTINUE_BUTTON_MESSAGE');
export const START_BUTTON_MESSAGE = i18n.t('START_BUTTON_MESSAGE');
export const FINISH_BUTTON_MESSAGE = i18n.t('FINISH_BUTTON_MESSAGE');
export const COUNTDOWN_TIMER_MESSAGE = i18n.t('COUNTDOWN_TIMER_MESSAGE');
export const REWARD_TRIAL_MESSAGE = i18n.t('REWARD_TRIAL_MESSAGE');
export const LIKERT_RESPONSES = {
    STRONGLY_DISAGREE: i18n.t('LIKERT_RESPONSES.STRONGLY_DISAGREE'),
    SOMEWHAT_DISAGREE: i18n.t('LIKERT_RESPONSES.SOMEWHAT_DISAGREE'),
    DISAGREE: i18n.t('LIKERT_RESPONSES.DISAGREE'),
    NEUTRAL: i18n.t('LIKERT_RESPONSES.NEUTRAL'),
    AGREE: i18n.t('LIKERT_RESPONSES.AGREE'),
    SOMEWHAT_AGREE: i18n.t('LIKERT_RESPONSES.SOMEWHAT_AGREE'),
    STRONGLY_AGREE: i18n.t('LIKERT_RESPONSES.STRONGLY_AGREE')
};
export const LIKERT_SURVEY_1_QUESTIONS = {
    QUESTION_1: i18n.t('LIKERT_SURVEY_1_QUESTIONS.QUESTION_1'),
};
export const LIKERT_SURVEY_2_QUESTIONS = {
    QUESTION_1: i18n.t('LIKERT_SURVEY_2_QUESTIONS.QUESTION_1'),
    QUESTION_2: i18n.t('LIKERT_SURVEY_2_QUESTIONS.QUESTION_2'),
    QUESTION_3: i18n.t('LIKERT_SURVEY_2_QUESTIONS.QUESTION_3'),
    QUESTION_4: i18n.t('LIKERT_SURVEY_2_QUESTIONS.QUESTION_4'),
    QUESTION_5: i18n.t('LIKERT_SURVEY_2_QUESTIONS.QUESTION_5')
};
export const END_EXPERIMENT_MESSAGE = i18n.t('END_EXPERIMENT_MESSAGE');
export const PROGRESS_BAR = {
    PROGRESS_BAR_INTRODUCTION: i18n.t('PROGRESS_BAR.PROGRESS_BAR_INTRODUCTION'),
    PROGRESS_BAR_PRACTICE: i18n.t('PROGRESS_BAR.PROGRESS_BAR_PRACTICE'),
    PROGRESS_BAR_CALIBRATION: i18n.t('PROGRESS_BAR.PROGRESS_BAR_CALIBRATION'),
    PROGRESS_BAR_TRIAL_BLOCKS: i18n.t('PROGRESS_BAR.PROGRESS_BAR_TRIAL_BLOCKS')
};
export const EXPERIMENT_HAS_ENDED_MESSAGE = i18n.t('EXPERIMENT_HAS_ENDED_MESSAGE');
export const CLICK_BUTTON_TO_PROCEED_MESSAGE = i18n.t('CLICK_BUTTON_TO_PROCEED_MESSAGE');
export const ENABLE_BUTTON_AFTER_TIME = 0; // default is 15000 ms
