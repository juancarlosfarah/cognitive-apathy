/// <reference types="cypress" />

import { COUNTDOWN_DIRECTIONS, HOLD_KEYS_MESSAGE, KEYS_TO_HOLD, KEY_TO_PRESS, RELEASE_KEYS_MESSAGE } from '../../src/constants';

describe('Full Run Through Loop Testing', () => {
  const pressInterval = 200; // Interval between key presses in milliseconds
  const numberOfPresses = 5; // Total number of presses during the key hold

  beforeEach(() => {
    cy.visit('http://localhost:3000/'); // Update with the correct URL
  });

  it('should click the button, hold keys, and tap another key based on display content', () => {
    // Wait for the button to appear and click it
    cy.get('.jspsych-btn').should('be.visible').click();

    // Hold KEYS_TO_HOLD
    KEYS_TO_HOLD.forEach(key => {
      cy.get('body').trigger('keydown', { key, keyCode: key.charCodeAt(0) });
    });

    // Wait for the element with id="jspsych-html-keyboard-response-stimulus" to appear
    cy.get('#jspsych-html-keyboard-response-stimulus').should('be.visible');

    // Tap KEY_TO_PRESS repeatedly
    Cypress._.times(numberOfPresses, () => {
      cy.get('body').trigger('keydown', { key: KEY_TO_PRESS, keyCode: KEY_TO_PRESS.charCodeAt(0) });
      cy.wait(pressInterval / 2); // Wait for half of the interval
      cy.get('body').trigger('keyup', { key: KEY_TO_PRESS, keyCode: KEY_TO_PRESS.charCodeAt(0) });
      cy.wait(pressInterval / 2); // Wait for the other half of the interval
    });

    // Wait for the text "Release the keys" to appear
    cy.get('#jspsych-content').should('contain.text', RELEASE_KEYS_MESSAGE);

    // Release the KEYS_TO_HOLD
    KEYS_TO_HOLD.forEach(key => {
      cy.get('body').trigger('keyup', { key, keyCode: key.charCodeAt(0) });
    });

    // Check the state of the message and directions containers
    cy.get('#message-container').should('be.empty');
    cy.get('#directions-container').should('contain.text', COUNTDOWN_DIRECTIONS);

    // Validate that the message container has the HOLD_KEYS_MESSAGE again
    cy.get('#message-container').should('contain.text', HOLD_KEYS_MESSAGE);
    cy.get('#directions-container').should('be.empty');
    cy.get('#timer-container').should('be.empty');
  });
});
