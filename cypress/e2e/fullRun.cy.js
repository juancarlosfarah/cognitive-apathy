/// <reference types="cypress" />

import { COUNTDOWN_DIRECTIONS, HOLD_KEYS_MESSAGE, KEYS_TO_HOLD, KEY_TO_PRESS, NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS, RELEASE_KEYS_MESSAGE, NUM_CALIBRATION_WITH_FEEDBACK_TRIALS} from '../../src/constants';

const numberOfPresses = 15;

describe('Run Through Loop Testing Successfully', () => {

  it('Should run the practice trial and show the following directions', () => {
    cy.visit('http://localhost:3000/');
    cy.window().should('have.property', 'appReady', true);
    cy.get('.jspsych-btn', { timeout: 20000 }).should('be.visible').should('not.be.disabled').click();
    cy.taskSuccessful('#no_stimuli_calibration', numberOfPresses);
    cy.get('.loading-bar-container', { timeout: 10000 }).should('not.exist');
    cy.get('#jspsych-html-keyboard-response-stimulus', { timeout: 15000 }).invoke('text')
      .should('include', 'You will perform the same task as you did in the practice');
    cy.get('body').type('{enter}');
  });

  it('Should run through calibration part 1', () => {
    Cypress._.times(NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS, () => {
      cy.taskSuccessful('#no_stimuli_calibration', numberOfPresses);
    });
  });

  it('Should run through calibration part 2', () => {
    cy.get('.jspsych-btn', { timeout: 20000 }).should('be.visible').should('not.be.disabled').click();
    Cypress._.times(NUM_CALIBRATION_WITH_FEEDBACK_TRIALS, () => {
      cy.taskSuccessful('#thermometer', numberOfPresses);
    });
  });

  it('Should run through validation', () => {
    cy.get('.jspsych-btn', { timeout: 20000 }).should('be.visible').should('not.be.disabled').click();
    cy.trialTaskSuccessful('#thermometer', numberOfPresses);
  });
});


