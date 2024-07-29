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
  AUTO_DECREASE_AMOUNT,
  COUNTDOWN_DIRECTIONS,
  EXPECTED_MAXIMUM_PERCENTAGE,
  GO_DURATION,
  GO_MESSAGE,
  HOLD_KEYS_MESSAGE,
  KEYS_TO_HOLD,
  KEY_TO_PRESS,
  PREMATURE_KEY_RELEASE_ERROR_MESSAGE,
  PREMATURE_KEY_RELEASE_ERROR_TIME,
  RELEASE_KEYS_MESSAGE,
  TRIAL_DURATION,
  AUTO_DECREASE_RATE
} from '../../src/constants';
import { autoIncreaseAmount } from '../../src/utils';

Cypress.Commands.add('taskSuccessful', (stimuli, numberOfPresses) => {

  // Wait for the button to appear, ensure it's not disabled, and click it

  // Hold KEYS_TO_HOLD
  KEYS_TO_HOLD.forEach((key) => {
    cy.get('body').trigger('keydown', { key, keyCode: key.charCodeAt(0) });
  });

  // Wait for the element with id="jspsych-html-keyboard-response-stimulus" to appear
  cy.get(stimuli, { timeout: 10000 }).should('exist');

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

  cy.get('.loading-bar-container', { timeout: 10000 }).should('not.exist');
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
  cy.get('.loading-bar-container', { timeout: 10000 }).should('not.exist');
});

Cypress.Commands.add('taskKeyTappedEarly', () => {

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

// Function to calculate the interval between taps and number of taps
function calculateTapsAndInterval(autoIncreaseAmount, TRIAL_DURATION,lower,upper) {


  // Calculate the target mercury level
  const targetMercury = (lower + upper) / 2;

  // Calculate the number of taps needed
  const numberOfTaps = Math.ceil(targetMercury / autoIncreaseAmount);

  // Calculate the interval between taps
  const intervalBetweenTaps = TRIAL_DURATION / numberOfTaps;

  return {
    numberOfTaps: numberOfTaps,
    intervalBetweenTaps: intervalBetweenTaps
  };
}



Cypress.Commands.add('trialTaskSuccessful', (stimuli, numberOfPresses) => {
  const EXPECTED_MAXIMUM_PERCENTAGE = 100; // Define this value based on your requirements
  const TRIAL_DURATION = 10000; // Define this value based on your requirements
  const AUTO_DECREASE_RATE = 1; // Define this value based on your requirements
  const AUTO_DECREASE_AMOUNT = 1; // Define this value based on your requirements
  const KEY_TO_PRESS = 'r'; // Define the key to press
  const KEYS_TO_HOLD = ['a', 'w', 'e']; // Define keys to hold
  const RELEASE_KEYS_MESSAGE = 'Release the keys'; // Define the message to wait for

  // Calculate the increase per tap
  const increasePerTap = autoIncreaseAmount(
    EXPECTED_MAXIMUM_PERCENTAGE,
    TRIAL_DURATION,
    AUTO_DECREASE_RATE,
    AUTO_DECREASE_AMOUNT,
    numberOfPresses
  );

  // Hold KEYS_TO_HOLD
  KEYS_TO_HOLD.forEach((key) => {
    cy.get('body').trigger('keydown', { key, keyCode: key.charCodeAt(0) });
  });

  // Wait for the element with id="jspsych-html-keyboard-response-stimulus" to appear
  cy.get(stimuli, { timeout: 10000 }).should('exist');
  let result;
  // Access the lower and upper bound elements and calculate their bottom values
  cy.window().then((win) => {
    const lowerBoundElement = win.document.getElementById('lower-bound');
    const upperBoundElement = win.document.getElementById('upper-bound');
    
      const lowerBoundBottom = parseFloat(win.getComputedStyle(lowerBoundElement).bottom);
      const upperBoundBottom = parseFloat(win.getComputedStyle(upperBoundElement).bottom);

      // Calculate the target mercury level
      const targetMercury = (lowerBoundBottom + upperBoundBottom) / 2;

      result = calculateTapsAndInterval(targetMercury, increasePerTap, TRIAL_DURATION);
    });
      // Tap KEY_TO_PRESS repeatedly
      Cypress._.times(result.numberOfTaps, () => {
        cy.get('body').trigger('keydown', {
          key: KEY_TO_PRESS,
          keyCode: KEY_TO_PRESS.charCodeAt(0),
        });
        cy.wait(result.intervalBetweenTaps); // Use cy.wait() for interval
        cy.get('body').trigger('keyup', {
          key: KEY_TO_PRESS,
          keyCode: KEY_TO_PRESS.charCodeAt(0),
        });
      });

      // Wait for the text "Release the keys" to appear
      cy.get('#jspsych-content', { timeout: TRIAL_DURATION }).should(
        'contain.text',
        RELEASE_KEYS_MESSAGE
      );

      // Release the KEYS_TO_HOLD
      KEYS_TO_HOLD.forEach((key) => {
        cy.get('body').trigger('keyup', { key, keyCode: key.charCodeAt(0) });
      });

      cy.get('.loading-bar-container', { timeout: 10000 }).should('not.exist');
  });