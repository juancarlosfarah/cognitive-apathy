/// <reference types="cypress" />

import { COUNTDOWN_DIRECTIONS, HOLD_KEYS_MESSAGE, KEYS_TO_HOLD, KEY_TO_PRESS, RELEASE_KEYS_MESSAGE } from '../../src/constants';


describe('Run Through Loop Testing Successfully', () => {
  const pressInterval = 325; // Interval between key presses in milliseconds
  const numberOfPresses = 5; // Total number of presses during the key hold

  it('Should run the practice trial and show the following directions', () => {
    cy.visit('http://localhost:3000/')
    cy.get('.jspsych-btn', { timeout: 10000 }).should('be.visible').should('not.be.disabled').click();
    cy.taskSuccessful();
    //Run through calibration part 1
    cy.get('body').then(($body) => {
      if ($body.find('.loading-bar-container').length > 0) {
        cy.get('.loading-bar-container', { timeout: 10000 }).should('not.be.visible');
      }
    });
    cy.get('#jspsych-html-keyboard-response-stimulus', { timeout: 15000 }).invoke('text')
    .should('include', 'You will perform the same task as you did in the practice');    
    cy.taskSuccessful();
  });  
});

