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
  AUTO_DECREASE_RATE,
  TRIAL_SUCCEEDED,
  SUCCESS_SCREEN_DURATION,
  TRIAL_FAILED,
} from '../../src/constants';
import { autoIncreaseAmount } from '../../src/utils';

Cypress.Commands.add('taskSuccessful', (stimuli, numberOfPresses) => {

  // Wait for the button to appear, ensure it's not disabled, and click it

  // Hold KEYS_TO_HOLD
  KEYS_TO_HOLD.forEach((key) => {
    cy.get('body').trigger('keydown', { key, keyCode: key.charCodeAt(0) });
  });


  // Wait for the element with id="jspsych-html-keyboard-response-stimulus" to appear
  cy.get('#jspsych-content', { timeout: 4000 }).should(($el) => {
    const text = $el.text();
    expect(text).to.equal(GO_MESSAGE); // Ensure the text exactly matches GO_MESSAGE
  });

  // Tap KEY_TO_PRESS repeatedly
  Cypress._.times(numberOfPresses, () => {
    cy.get('body').trigger('keyup', { key: KEY_TO_PRESS, keyCode: KEY_TO_PRESS.charCodeAt(0) });
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
function calculateTapsAndInterval(autoIncreaseAmount, lowerBound, upperBound) {


  // Calculate the target mercury level
  const targetMercury = (lowerBound + upperBound) / 2;
  const numberOfTaps = (targetMercury+((TRIAL_DURATION/AUTO_DECREASE_RATE)*AUTO_DECREASE_AMOUNT))/autoIncreaseAmount
  // Calculate the number of taps needed 

  // Calculate the interval between taps

  return {
    numberOfTaps: numberOfTaps,
  };
}


Cypress.Commands.add('trialTaskSuccessful', (stimuli, numberOfPresses) => {

  const increasePerTap = autoIncreaseAmount(
    EXPECTED_MAXIMUM_PERCENTAGE,
    TRIAL_DURATION,
    AUTO_DECREASE_RATE,
    AUTO_DECREASE_AMOUNT,
    numberOfPresses
  );

  KEYS_TO_HOLD.forEach((key) => {
    cy.get('body').trigger('keydown', { key, keyCode: key.charCodeAt(0) });
  });

  cy.get(stimuli, { timeout: 10000 }).should('exist');

  cy.get('#lower-bound').then(($el) => {
    const lowerBound = parseFloat($el.css('bottom')) / 3;
    cy.log('Lower Bound:', lowerBound);

    cy.get('#upper-bound').then(($el) => {
      const upperBound = parseFloat($el.css('bottom')) / 3;
      cy.log('Upper Bound:', upperBound);

      const result = calculateTapsAndInterval(increasePerTap, lowerBound, upperBound);
      cy.log(result)

    
      // Tap KEY_TO_PRESS repeatedly
      Cypress._.times(result.numberOfTaps, () => {
        cy.get('body').trigger('keyup', { key: KEY_TO_PRESS, keyCode: KEY_TO_PRESS.charCodeAt(0) });
      });

      cy.get('#jspsych-content', { timeout: 10000 }).should('contain.text', TRIAL_SUCCEEDED);

      cy.get('#jspsych-content', { timeout: TRIAL_DURATION }).should('contain.text', RELEASE_KEYS_MESSAGE);

      KEYS_TO_HOLD.forEach((key) => {
        cy.get('body').trigger('keyup', { key, keyCode: key.charCodeAt(0) });
      });

      cy.get('.loading-bar-container', { timeout: 10000 }).should('not.exist');
    });
  });
});