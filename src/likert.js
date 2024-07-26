import surveyLikert from '@jspsych/plugin-survey-likert';
import { LIKERT_PREAMBLE, CONTINUE_BUTTON_MESSAGE, LIKERT_SURVEY_1_QUESTIONS, LIKERT_SURVEY_2_QUESTIONS, LIKERT_RESPONSES } from './constants';
// ALL LIKERT STILL NEEDS TO BE TRANSLATED BUT AM WAIT ON JEVITA QUESTIONS + ANSWERS TO TRANSLATE
export const likertQuestions1 = [
    {
        type: surveyLikert,
        questions: [
            {
                prompt: `${LIKERT_PREAMBLE}<br><br>${LIKERT_SURVEY_1_QUESTIONS.QUESTION_1}`,
                labels: [
                    LIKERT_RESPONSES.STRONGLY_DISAGREE,
                    LIKERT_RESPONSES.DISAGREE,
                    LIKERT_RESPONSES.NEUTRAL,
                    LIKERT_RESPONSES.AGREE,
                    LIKERT_RESPONSES.STRONGLY_AGREE,
                ],
                name: LIKERT_SURVEY_1_QUESTIONS.QUESTION_1,
                required: true,
            },
        ],
        randomize_question_order: false,
        button_label: CONTINUE_BUTTON_MESSAGE,
    },
    {
        type: surveyLikert,
        questions: [
            {
                prompt: `${LIKERT_PREAMBLE}<br><br>${LIKERT_SURVEY_1_QUESTIONS.QUESTION_2}`,
                labels: [
                    LIKERT_RESPONSES.STRONGLY_DISAGREE,
                    LIKERT_RESPONSES.DISAGREE,
                    LIKERT_RESPONSES.NEUTRAL,
                    LIKERT_RESPONSES.AGREE,
                    LIKERT_RESPONSES.STRONGLY_AGREE,
                ],
                name: LIKERT_SURVEY_1_QUESTIONS.QUESTION_2,
                required: true,
            },
        ],
        randomize_question_order: false,
        button_label: CONTINUE_BUTTON_MESSAGE,
    },
    {
        type: surveyLikert,
        questions: [
            {
                prompt: `${LIKERT_PREAMBLE}<br><br>${LIKERT_SURVEY_1_QUESTIONS.QUESTION_3}`,
                labels: [
                    LIKERT_RESPONSES.STRONGLY_DISAGREE,
                    LIKERT_RESPONSES.DISAGREE,
                    LIKERT_RESPONSES.NEUTRAL,
                    LIKERT_RESPONSES.AGREE,
                    LIKERT_RESPONSES.STRONGLY_AGREE,
                ],
                name: LIKERT_SURVEY_1_QUESTIONS.QUESTION_3,
                required: true,
            },
        ],
        randomize_question_order: false,
        button_label: CONTINUE_BUTTON_MESSAGE,
    },
];
export const likertQuestions2 = [
    {
        type: surveyLikert,
        questions: [
            {
                prompt: `${LIKERT_PREAMBLE}<br><br>${LIKERT_SURVEY_2_QUESTIONS.QUESTION_1}`,
                labels: [
                    LIKERT_RESPONSES.STRONGLY_DISAGREE,
                    LIKERT_RESPONSES.DISAGREE,
                    LIKERT_RESPONSES.NEUTRAL,
                    LIKERT_RESPONSES.AGREE,
                    LIKERT_RESPONSES.STRONGLY_AGREE,
                ],
                name: LIKERT_SURVEY_2_QUESTIONS.QUESTION_1,
                required: true,
            },
        ],
        randomize_question_order: false,
        button_label: CONTINUE_BUTTON_MESSAGE,
    },
    {
        type: surveyLikert,
        questions: [
            {
                prompt: `${LIKERT_PREAMBLE}<br><br>${LIKERT_SURVEY_2_QUESTIONS.QUESTION_2}`,
                labels: [
                    LIKERT_RESPONSES.STRONGLY_DISAGREE,
                    LIKERT_RESPONSES.DISAGREE,
                    LIKERT_RESPONSES.NEUTRAL,
                    LIKERT_RESPONSES.AGREE,
                    LIKERT_RESPONSES.STRONGLY_AGREE,
                ],
                name: LIKERT_SURVEY_2_QUESTIONS.QUESTION_2,
                required: true,
            },
        ],
        randomize_question_order: false,
        button_label: CONTINUE_BUTTON_MESSAGE,
    },
    {
        type: surveyLikert,
        questions: [
            {
                prompt: `${LIKERT_PREAMBLE}<br><br>${LIKERT_SURVEY_2_QUESTIONS.QUESTION_3}`,
                labels: [
                    LIKERT_RESPONSES.STRONGLY_DISAGREE,
                    LIKERT_RESPONSES.DISAGREE,
                    LIKERT_RESPONSES.NEUTRAL,
                    LIKERT_RESPONSES.AGREE,
                    LIKERT_RESPONSES.STRONGLY_AGREE,
                ],
                name: LIKERT_SURVEY_2_QUESTIONS.QUESTION_3,
                required: true,
            },
        ],
        randomize_question_order: false,
        button_label: CONTINUE_BUTTON_MESSAGE,
    },
    {
        type: surveyLikert,
        questions: [
            {
                prompt: `${LIKERT_PREAMBLE}<br><br>${LIKERT_SURVEY_2_QUESTIONS.QUESTION_4}`,
                labels: [
                    LIKERT_RESPONSES.STRONGLY_DISAGREE,
                    LIKERT_RESPONSES.DISAGREE,
                    LIKERT_RESPONSES.NEUTRAL,
                    LIKERT_RESPONSES.AGREE,
                    LIKERT_RESPONSES.STRONGLY_AGREE,
                ],
                name: LIKERT_SURVEY_2_QUESTIONS.QUESTION_4,
                required: true,
            },
        ],
        randomize_question_order: false,
        button_label: CONTINUE_BUTTON_MESSAGE,
    },
    {
        type: surveyLikert,
        questions: [
            {
                prompt: `${LIKERT_PREAMBLE}<br><br>${LIKERT_SURVEY_2_QUESTIONS.QUESTION_5}`,
                labels: [
                    LIKERT_RESPONSES.STRONGLY_DISAGREE,
                    LIKERT_RESPONSES.DISAGREE,
                    LIKERT_RESPONSES.NEUTRAL,
                    LIKERT_RESPONSES.AGREE,
                    LIKERT_RESPONSES.STRONGLY_AGREE,
                ],
                name: LIKERT_SURVEY_2_QUESTIONS.QUESTION_5,
                required: true,
            },
        ],
        randomize_question_order: false,
        button_label: CONTINUE_BUTTON_MESSAGE,
    },
];
//# sourceMappingURL=likert.js.map