// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
import {
  COUNTDOWN_DIRECTIONS,
  GO_DURATION,
  GO_MESSAGE,
  HOLD_KEYS_MESSAGE,
  KEYS_TO_HOLD,
  KEY_TO_PRESS,
  PREMATURE_KEY_RELEASE_ERROR_MESSAGE,
  PREMATURE_KEY_RELEASE_ERROR_TIME,
  RELEASE_KEYS_MESSAGE,
  TRIAL_DURATION,
} from '../../src/constants';

Cypress.Commands.add('taskSuccessful', () => {
  const numberOfPresses = 15; // Total number of presses during the key hold

  // Wait for the button to appear, ensure it's not disabled, and click it

  // Hold KEYS_TO_HOLD
  KEYS_TO_HOLD.forEach((key) => {
    cy.get('body').trigger('keydown', { key, keyCode: key.charCodeAt(0) });
  });

  // Wait for the element with id="jspsych-html-keyboard-response-stimulus" to appear
  cy.get('no_stimuli_calibration', { timeout: 10000 }).should('be.visible');

  // Tap KEY_TO_PRESS repeatedly
  Cypress._.times(numberOfPresses, () => {
    cy.get('body').trigger('keyup', {
      key: KEY_TO_PRESS,
      keyCode: KEY_TO_PRESS.charCodeAt(0),
    });
  });

  // Wait for the text "Release the keys" to appear
  cy.get('#jspsych-content', { timeout: TRIAL_DURATION }).should(
    'contain.text',
    RELEASE_KEYS_MESSAGE,
  );

  // Release the KEYS_TO_HOLD
  KEYS_TO_HOLD.forEach((key) => {
    cy.get('body').trigger('keyup', { key, keyCode: key.charCodeAt(0) });
  });

  cy.get('.loading-bar-container', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('taskReleaseKeysEarly', () => {
  // Hold KEYS_TO_HOLD
  KEYS_TO_HOLD.forEach((key) => {
    cy.get('body').trigger('keydown', { key, keyCode: key.charCodeAt(0) });
  });

  cy.get('#jspsych-content', { timeout: 2000 }).should(
    'contain.text',
    GO_MESSAGE,
  );

  // Release the KEYS_TO_HOLD
  KEYS_TO_HOLD.forEach((key) => {
    cy.get('body').trigger('keydown', { key, keyCode: key.charCodeAt(0) });
  });

  // Check for the released keys early message
  cy.get('#jspsych-content').should(
    'contain.text',
    PREMATURE_KEY_RELEASE_ERROR_MESSAGE,
  );

  // Wait for the loading bar to disappear
  cy.get('.loading-bar-container', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('taskKeyTappedEarly', () => {
  const pressInterval = 325; // Interval between key presses in milliseconds
  const numberOfPresses = 5; // Total number of presses during the key hold

  // Wait for the button to appear, ensure it's not disabled, and click it

  // Hold KEYS_TO_HOLD
  KEYS_TO_HOLD.forEach((key) => {
    cy.get('body').trigger('keydown', { key, keyCode: key.charCodeAt(0) });
  });

  // Tap early
  cy.get('body').trigger('keydown', {
    key: KEY_TO_PRESS,
    keyCode: KEY_TO_PRESS.charCodeAt(0),
  });

  // Wait for the element with id="jspsych-html-keyboard-response-stimulus" to appear
  cy.get('#jspsych-content', { timeout: 2000 }).should(
    'contain.text',
    GO_MESSAGE,
  );

  // Check for the released keys early message
  cy.get('#jspsych-content').should('contain.text', KEY_TAPPED_EARLY_MESSAGE);
  // Release the KEYS_TO_HOLD
  KEYS_TO_HOLD.forEach((key) => {
    cy.get('body').trigger('keyup', { key, keyCode: key.charCodeAt(0) });
  });

  // Check for the released keys early message
  cy.get('#jspsych-content').should(
    'contain.text',
    PREMATURE_KEY_RELEASE_ERROR_MESSAGE,
  );
});
