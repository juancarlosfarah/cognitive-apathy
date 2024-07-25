/// <reference types="cypress" />

import { COUNTDOWN_DIRECTIONS, HOLD_KEYS_MESSAGE, KEYS_TO_HOLD } from '../../src/constants'

describe('CountdownTrialPlugin', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/'); // Replace with the URL of the page containing the CountdownTrialPlugin
  });

  it('should activate setAreKeysHeld when KEYS_TO_HOLD are held', () => {
    // Trigger keydown events for each key in KEYS_TO_HOLD
    KEYS_TO_HOLD.forEach((key) => {
      cy.get('body').trigger('keydown', { key, keyCode: key.charCodeAt(0) });
    });

    // Wait for a short duration to simulate holding the keys
    cy.wait(2000); // Wait for 2 seconds

    // Check that the message container is empty, and directions container contains the COUNTDOWN_DIRECTIONS
    cy.get('#message-container').should('be.empty');
    cy.get('#directions-container').should('contain.text', COUNTDOWN_DIRECTIONS);

    // Trigger keyup events for each key in KEYS_TO_HOLD
    KEYS_TO_HOLD.forEach((key) => {
      cy.get('body').trigger('keyup', { key, keyCode: key.charCodeAt(0) });
    });

    // Check that the message container has the HOLD_KEYS_MESSAGE again
    cy.get('#message-container').should('contain.text', HOLD_KEYS_MESSAGE);
    cy.get('#directions-container').should('be.empty');
    cy.get('#timer-container').should('be.empty');
  });
});
