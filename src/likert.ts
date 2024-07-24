import surveyLikert from '@jspsych/plugin-survey-likert';

import { LIKERT_PREAMBLE } from './constants';

export const likertQuestions1 = [
  {
    type: surveyLikert,
    questions: [
      {
        prompt: `${LIKERT_PREAMBLE}<br><br>Placeholder question 1`,
        labels: [
          'Strongly Disagree',
          'Disagree',
          'Neutral',
          'Agree',
          'Strongly Agree',
        ],
        name: 'Q1',
        required: true,
      },
    ],
    randomize_question_order: false,
    button_label: 'Continue',
  },
  {
    type: surveyLikert,
    questions: [
      {
        prompt: `${LIKERT_PREAMBLE}<br><br>Placeholder question 2`,
        labels: [
          'Strongly Disagree',
          'Disagree',
          'Neutral',
          'Agree',
          'Strongly Agree',
        ],
        name: 'Q2',
        required: true,
      },
    ],
    randomize_question_order: false,
    button_label: 'Continue',
  },
  {
    type: surveyLikert,
    questions: [
      {
        prompt: `${LIKERT_PREAMBLE}<br><br>Placeholder question 3`,
        labels: [
          'Strongly Disagree',
          'Disagree',
          'Neutral',
          'Agree',
          'Strongly Agree',
        ],
        name: 'Q3',
        required: true,
      },
    ],
    randomize_question_order: false,
    button_label: 'Continue',
  },
];

export const likertQuestions2 = [
  {
    type: surveyLikert,
    questions: [
      {
        prompt: `${LIKERT_PREAMBLE}<br><br>Placeholder question 1`,
        labels: [
          'Strongly Disagree',
          'Disagree',
          'Neutral',
          'Agree',
          'Strongly Agree',
        ],
        name: 'Q1',
        required: true,
      },
    ],
    randomize_question_order: false,
    button_label: 'Continue',
  },
  {
    type: surveyLikert,
    questions: [
      {
        prompt: `${LIKERT_PREAMBLE}<br><br>Placeholder question 2`,
        labels: [
          'Strongly Disagree',
          'Disagree',
          'Neutral',
          'Agree',
          'Strongly Agree',
        ],
        name: 'Q2',
        required: true,
      },
    ],
    randomize_question_order: false,
    button_label: 'Continue',
  },
  {
    type: surveyLikert,
    questions: [
      {
        prompt: `${LIKERT_PREAMBLE}<br><br>Placeholder question 3`,
        labels: [
          'Strongly Disagree',
          'Disagree',
          'Neutral',
          'Agree',
          'Strongly Agree',
        ],
        name: 'Q3',
        required: true,
      },
    ],
    randomize_question_order: false,
    button_label: 'Continue',
  },
  {
    type: surveyLikert,
    questions: [
      {
        prompt: `${LIKERT_PREAMBLE}<br><br>Placeholder question 4`,
        labels: [
          'Strongly Disagree',
          'Disagree',
          'Neutral',
          'Agree',
          'Strongly Agree',
        ],
        name: 'Q4',
        required: true,
      },
    ],
    randomize_question_order: false,
    button_label: 'Continue',
  },
  {
    type: surveyLikert,
    questions: [
      {
        prompt: `${LIKERT_PREAMBLE}<br><br>Placeholder question 5`,
        labels: [
          'Strongly Disagree',
          'Disagree',
          'Neutral',
          'Agree',
          'Strongly Agree',
        ],
        name: 'Q5',
        required: true,
      },
    ],
    randomize_question_order: false,
    button_label: 'Continue',
  },
];
