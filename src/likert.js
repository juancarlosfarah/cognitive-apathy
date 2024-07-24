"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.likertQuestions2 = exports.likertQuestions1 = void 0;
const plugin_survey_likert_1 = __importDefault(require("@jspsych/plugin-survey-likert"));
const constants_1 = require("./constants");
// ALL LIKERT STILL NEEDS TO BE TRANSLATED BUT AM WAIT ON JEVITA QUESTIONS + ANSWERS TO TRANSLATE
exports.likertQuestions1 = [
    {
        type: plugin_survey_likert_1.default,
        questions: [
            {
                prompt: `${constants_1.LIKERT_PREAMBLE}<br><br>${constants_1.LIKERT_SURVEY_1_QUESTIONS.QUESTION_1}`,
                labels: [
                    constants_1.LIKERT_RESPONSES.STRONGLY_DISAGREE,
                    constants_1.LIKERT_RESPONSES.DISAGREE,
                    constants_1.LIKERT_RESPONSES.NEUTRAL,
                    constants_1.LIKERT_RESPONSES.AGREE,
                    constants_1.LIKERT_RESPONSES.STRONGLY_AGREE,
                ],
                name: constants_1.LIKERT_SURVEY_1_QUESTIONS.QUESTION_1,
                required: true,
            },
        ],
        randomize_question_order: false,
        button_label: constants_1.CONTINUE_BUTTON_MESSAGE,
    },
    {
        type: plugin_survey_likert_1.default,
        questions: [
            {
                prompt: `${constants_1.LIKERT_PREAMBLE}<br><br>${constants_1.LIKERT_SURVEY_1_QUESTIONS.QUESTION_2}`,
                labels: [
                    constants_1.LIKERT_RESPONSES.STRONGLY_DISAGREE,
                    constants_1.LIKERT_RESPONSES.DISAGREE,
                    constants_1.LIKERT_RESPONSES.NEUTRAL,
                    constants_1.LIKERT_RESPONSES.AGREE,
                    constants_1.LIKERT_RESPONSES.STRONGLY_AGREE,
                ],
                name: constants_1.LIKERT_SURVEY_1_QUESTIONS.QUESTION_2,
                required: true,
            },
        ],
        randomize_question_order: false,
        button_label: constants_1.CONTINUE_BUTTON_MESSAGE,
    },
    {
        type: plugin_survey_likert_1.default,
        questions: [
            {
                prompt: `${constants_1.LIKERT_PREAMBLE}<br><br>${constants_1.LIKERT_SURVEY_1_QUESTIONS.QUESTION_3}`,
                labels: [
                    constants_1.LIKERT_RESPONSES.STRONGLY_DISAGREE,
                    constants_1.LIKERT_RESPONSES.DISAGREE,
                    constants_1.LIKERT_RESPONSES.NEUTRAL,
                    constants_1.LIKERT_RESPONSES.AGREE,
                    constants_1.LIKERT_RESPONSES.STRONGLY_AGREE,
                ],
                name: constants_1.LIKERT_SURVEY_1_QUESTIONS.QUESTION_3,
                required: true,
            },
        ],
        randomize_question_order: false,
        button_label: constants_1.CONTINUE_BUTTON_MESSAGE,
    },
];
exports.likertQuestions2 = [
    {
        type: plugin_survey_likert_1.default,
        questions: [
            {
                prompt: `${constants_1.LIKERT_PREAMBLE}<br><br>${constants_1.LIKERT_SURVEY_2_QUESTIONS.QUESTION_1}`,
                labels: [
                    constants_1.LIKERT_RESPONSES.STRONGLY_DISAGREE,
                    constants_1.LIKERT_RESPONSES.DISAGREE,
                    constants_1.LIKERT_RESPONSES.NEUTRAL,
                    constants_1.LIKERT_RESPONSES.AGREE,
                    constants_1.LIKERT_RESPONSES.STRONGLY_AGREE,
                ],
                name: constants_1.LIKERT_SURVEY_2_QUESTIONS.QUESTION_1,
                required: true,
            },
        ],
        randomize_question_order: false,
        button_label: constants_1.CONTINUE_BUTTON_MESSAGE,
    },
    {
        type: plugin_survey_likert_1.default,
        questions: [
            {
                prompt: `${constants_1.LIKERT_PREAMBLE}<br><br>${constants_1.LIKERT_SURVEY_2_QUESTIONS.QUESTION_2}`,
                labels: [
                    constants_1.LIKERT_RESPONSES.STRONGLY_DISAGREE,
                    constants_1.LIKERT_RESPONSES.DISAGREE,
                    constants_1.LIKERT_RESPONSES.NEUTRAL,
                    constants_1.LIKERT_RESPONSES.AGREE,
                    constants_1.LIKERT_RESPONSES.STRONGLY_AGREE,
                ],
                name: constants_1.LIKERT_SURVEY_2_QUESTIONS.QUESTION_2,
                required: true,
            },
        ],
        randomize_question_order: false,
        button_label: constants_1.CONTINUE_BUTTON_MESSAGE,
    },
    {
        type: plugin_survey_likert_1.default,
        questions: [
            {
                prompt: `${constants_1.LIKERT_PREAMBLE}<br><br>${constants_1.LIKERT_SURVEY_2_QUESTIONS.QUESTION_3}`,
                labels: [
                    constants_1.LIKERT_RESPONSES.STRONGLY_DISAGREE,
                    constants_1.LIKERT_RESPONSES.DISAGREE,
                    constants_1.LIKERT_RESPONSES.NEUTRAL,
                    constants_1.LIKERT_RESPONSES.AGREE,
                    constants_1.LIKERT_RESPONSES.STRONGLY_AGREE,
                ],
                name: constants_1.LIKERT_SURVEY_2_QUESTIONS.QUESTION_3,
                required: true,
            },
        ],
        randomize_question_order: false,
        button_label: constants_1.CONTINUE_BUTTON_MESSAGE,
    },
    {
        type: plugin_survey_likert_1.default,
        questions: [
            {
                prompt: `${constants_1.LIKERT_PREAMBLE}<br><br>${constants_1.LIKERT_SURVEY_2_QUESTIONS.QUESTION_4}`,
                labels: [
                    constants_1.LIKERT_RESPONSES.STRONGLY_DISAGREE,
                    constants_1.LIKERT_RESPONSES.DISAGREE,
                    constants_1.LIKERT_RESPONSES.NEUTRAL,
                    constants_1.LIKERT_RESPONSES.AGREE,
                    constants_1.LIKERT_RESPONSES.STRONGLY_AGREE,
                ],
                name: constants_1.LIKERT_SURVEY_2_QUESTIONS.QUESTION_4,
                required: true,
            },
        ],
        randomize_question_order: false,
        button_label: constants_1.CONTINUE_BUTTON_MESSAGE,
    },
    {
        type: plugin_survey_likert_1.default,
        questions: [
            {
                prompt: `${constants_1.LIKERT_PREAMBLE}<br><br>${constants_1.LIKERT_SURVEY_2_QUESTIONS.QUESTION_5}`,
                labels: [
                    constants_1.LIKERT_RESPONSES.STRONGLY_DISAGREE,
                    constants_1.LIKERT_RESPONSES.DISAGREE,
                    constants_1.LIKERT_RESPONSES.NEUTRAL,
                    constants_1.LIKERT_RESPONSES.AGREE,
                    constants_1.LIKERT_RESPONSES.STRONGLY_AGREE,
                ],
                name: constants_1.LIKERT_SURVEY_2_QUESTIONS.QUESTION_5,
                required: true,
            },
        ],
        randomize_question_order: false,
        button_label: constants_1.CONTINUE_BUTTON_MESSAGE,
    },
];
