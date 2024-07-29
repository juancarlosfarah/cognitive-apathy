describe('Run Through Loop Testing Successfully', () => {
  const pressInterval = 325; // Interval between key presses in milliseconds
  const numberOfPresses = 5; // Total number of presses during the key hold

  beforeEach(() => {
    cy.visit('http://localhost:3000/'); // Update with the correct URL
  });

  
  it('Should run the practice trial and show the following directions', () => {
    cy.get('.jspsych-btn', { timeout: 10000 }).should('be.visible').should('not.be.disabled').click();
    cy.taskSuccessful();
    cy.get('#jspsych-content', { timeout: 15000 }).should('contain.text', CALIBRATION_PART_1_DIRECTIONS);
  });  
});


describe('Run Through Calibration Part 1', () => {
  const pressInterval = 325; // Interval between key presses in milliseconds
  const numberOfPresses = 5; // Total number of presses during the key hold


  it('Should run the practice trial and show the following directions', () => {
    cy.get('#jspsych-content', { timeout: 15000 }).should('contain.text', CALIBRATION_PART_1_DIRECTIONS);
    cy.get('.jspsych-btn', { timeout: 10000 }).should('be.visible').should('not.be.disabled').click();
    cy.taskSuccessful();
    cy.get('#jspsych-content', { timeout: 15000 }).should('contain.text', CALIBRATION_PART_1_DIRECTIONS);
  });  
});
const { TUTORIAL_MESSAGE_1, INTERACTIVE_KEYBOARD_TUTORIAL_MESSAGE, PREMATURE_KEY_RELEASE_ERROR_TIME, CALIBRATION_PART_1_DIRECTIONS } = require("../../src/constants");

describe('Run Through Loop Testing With the keys released early', () => {
  const pressInterval = 325; // Interval between key presses in milliseconds
  const numberOfPresses = 5; // Total number of presses during the key hold

  beforeEach(() => {
    cy.visit('http://localhost:3000/'); // Update with the correct URL
  });

  
  it('Should run the practice trial, release the keys early, and loop', () => {
    cy.get('.jspsych-btn', { timeout: 10000 }).should('be.visible').should('not.be.disabled').click();
    cy.taskReleaseKeysEarly();
    cy.get('#message-container', { timeout: 10000 })
    .invoke('text')
    .should('include', 'PRACTICE');    
    cy.taskReleaseKeysEarly()
  });  
});