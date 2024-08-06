import surveyLikert from '@jspsych/plugin-survey-likert';

import { LIKERT_PREAMBLE, CONTINUE_BUTTON_MESSAGE, LIKERT_SURVEY_1_QUESTIONS, LIKERT_SURVEY_2_QUESTIONS, LIKERT_RESPONSES, LIKERT_PREAMBLE_DEMO, LIKERT_INTRO, LIKERT_INTRO_DEMO} from './constants';
import { JsPsych } from 'jspsych';
import htmlButtonResponse from '@jspsych/plugin-html-button-response';


// ALL LIKERT STILL NEEDS TO BE TRANSLATED BUT AM WAIT ON JEVITA QUESTIONS + ANSWERS TO TRANSLATE

export const likertIntro = {
  type: htmlButtonResponse,
  choices: [CONTINUE_BUTTON_MESSAGE],
  stimulus: [LIKERT_INTRO],
}

export const likertIntroDemo= {
  type: htmlButtonResponse,
  choices: [CONTINUE_BUTTON_MESSAGE],
  stimulus: [LIKERT_INTRO_DEMO],
}
export const likertQuestions1 = 
  {
    type: surveyLikert,
    questions: [
      {
        prompt: `${LIKERT_PREAMBLE_DEMO}<br><br><b>${LIKERT_SURVEY_1_QUESTIONS.QUESTION_1}</b>`,
        labels: [
          LIKERT_RESPONSES.STRONGLY_DISAGREE,
          LIKERT_RESPONSES.SOMEWHAT_DISAGREE,
          LIKERT_RESPONSES.DISAGREE,
          LIKERT_RESPONSES.NEUTRAL,
          LIKERT_RESPONSES.AGREE,
          LIKERT_RESPONSES.SOMEWHAT_AGREE,
          LIKERT_RESPONSES.STRONGLY_AGREE,
        ],
        name: LIKERT_SURVEY_1_QUESTIONS.QUESTION_1,
        required: true,
      },
    ],
    randomize_question_order: false,
    button_label: CONTINUE_BUTTON_MESSAGE,
  };

export const likertQuestions2 = [
  {
    type: surveyLikert,
    questions: [
      {
        prompt: `${LIKERT_PREAMBLE}<br><br><b>${LIKERT_SURVEY_2_QUESTIONS.QUESTION_1}</b>`,
        labels: [
          LIKERT_RESPONSES.STRONGLY_DISAGREE,
          LIKERT_RESPONSES.SOMEWHAT_DISAGREE,
          LIKERT_RESPONSES.DISAGREE,
          LIKERT_RESPONSES.NEUTRAL,
          LIKERT_RESPONSES.AGREE,
          LIKERT_RESPONSES.SOMEWHAT_AGREE,
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
        prompt: `${LIKERT_PREAMBLE}<br><br><b>${LIKERT_SURVEY_2_QUESTIONS.QUESTION_2}</b>`,
        labels: [
          LIKERT_RESPONSES.STRONGLY_DISAGREE,
          LIKERT_RESPONSES.SOMEWHAT_DISAGREE,
          LIKERT_RESPONSES.DISAGREE,
          LIKERT_RESPONSES.NEUTRAL,
          LIKERT_RESPONSES.AGREE,
          LIKERT_RESPONSES.SOMEWHAT_AGREE,
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
        prompt: `${LIKERT_PREAMBLE}<br><br><b>${LIKERT_SURVEY_2_QUESTIONS.QUESTION_3}</b>`,
        labels: [
          LIKERT_RESPONSES.STRONGLY_DISAGREE,
          LIKERT_RESPONSES.SOMEWHAT_DISAGREE,
          LIKERT_RESPONSES.DISAGREE,
          LIKERT_RESPONSES.NEUTRAL,
          LIKERT_RESPONSES.AGREE,
          LIKERT_RESPONSES.SOMEWHAT_AGREE,
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
        prompt: `${LIKERT_PREAMBLE}<br><br><b>${LIKERT_SURVEY_2_QUESTIONS.QUESTION_4}</b>`,
        labels: [
          LIKERT_RESPONSES.STRONGLY_DISAGREE,
          LIKERT_RESPONSES.SOMEWHAT_DISAGREE,
          LIKERT_RESPONSES.DISAGREE,
          LIKERT_RESPONSES.NEUTRAL,
          LIKERT_RESPONSES.AGREE,
          LIKERT_RESPONSES.SOMEWHAT_AGREE,
          LIKERT_RESPONSES.STRONGLY_AGREE,
        ],
        name: LIKERT_SURVEY_2_QUESTIONS.QUESTION_4,
        required: true,
      },
    ],
    randomize_question_order: false,
    button_label: CONTINUE_BUTTON_MESSAGE,
  },
];

export const likertFinalQuestion = [
{
  type: surveyLikert,
  questions: [
    {
      prompt: `<b>${LIKERT_SURVEY_2_QUESTIONS.QUESTION_5}</b>`,
      labels: [
        LIKERT_RESPONSES.STRONGLY_DISAGREE,
        LIKERT_RESPONSES.SOMEWHAT_DISAGREE,
        LIKERT_RESPONSES.DISAGREE,
        LIKERT_RESPONSES.NEUTRAL,
        LIKERT_RESPONSES.AGREE,
        LIKERT_RESPONSES.SOMEWHAT_AGREE,
        LIKERT_RESPONSES.STRONGLY_AGREE,
      ],
      name: LIKERT_SURVEY_2_QUESTIONS.QUESTION_5,
      required: true,
    },
  ],
  randomize_question_order: false,
  button_label: CONTINUE_BUTTON_MESSAGE,
},
]
export const likertQuestions2Randomized = (jsPsych: JsPsych) => jsPsych.randomization.sampleWithoutReplacement(likertQuestions2, 4);
