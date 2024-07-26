/// <reference types="cypress" />

import { COUNTDOWN_DIRECTIONS, HOLD_KEYS_MESSAGE, KEYS_TO_HOLD, KEY_TO_PRESS } from '../../src/constants';


describe('Full Run Through Loop Testing', () => {
  const holdDuration = 3000; // Hold duration in milliseconds
  const pressInterval = 200; // Interval between key presses in milliseconds
  const numberOfPresses = 5; // Total number of presses during the key hold
  const 

  beforeEach(() => {
    cy.visit('http://localhost:3000/'); // Update with the correct URL
  });

  it('should click the button, hold keys for 3 seconds, and tap another key', () => {
    cy.get('.jspsych-btn').click();

    // Hold KEYS_TO_HOLD for the specified duration
    KEYS_TO_HOLD.forEach(key => {
      cy.get('body').trigger('keydown', { key, keyCode: key.charCodeAt(0) });
    });
    cy.wait(holdDuration); // Wait for the specified hold duration

    // Tap KEY_TO_PRESS repeatedly
    Cypress._.times(numberOfPresses, () => {
      cy.get('body').trigger('keydown', { key: KEY_TO_PRESS, keyCode: KEY_TO_PRESS.charCodeAt(0) });
      cy.wait(pressInterval / 2); // Wait for half of the interval
      cy.get('body').trigger('keyup', { key: KEY_TO_PRESS, keyCode: KEY_TO_PRESS.charCodeAt(0) });
      cy.wait(pressInterval / 2); // Wait for the other half of the interval
    });

    // Release the KEYS_TO_HOLD
    KEYS_TO_HOLD.forEach(key => {
      cy.get('body').trigger('keyup', { key, keyCode: key.charCodeAt(0) });
    });

  });
});
