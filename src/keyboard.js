import Keyboard from 'simple-keyboard';
import 'simple-keyboard/build/css/index.css';


export function createKeyboard(displayElement) {
  console.log('Creating keyboard...');

  // Create a container for the keyboard
  const keyboardContainer = document.createElement('div');
  keyboardContainer.id = 'keyboard-container';
  keyboardContainer.style.position = 'fixed';
  keyboardContainer.style.bottom = '0';
  keyboardContainer.style.width = '50%';
  keyboardContainer.style.backgroundColor = '#fff';
  keyboardContainer.style.zIndex = '1000';
  displayElement.appendChild(keyboardContainer);

  console.log('Keyboard container created and appended.');

  // Create a div for the keyboard
  const keyboardDiv = document.createElement('div');
  keyboardDiv.className = 'simple-keyboard';
  keyboardDiv.style.width = '100%';
  keyboardDiv.style.boxSizing = 'border-box';
  keyboardDiv.style.minHeight = '100px'; // Ensure some height for visibility
  keyboardDiv.style.backgroundColor = 'lightgray'; // Set a background color
  keyboardContainer.appendChild(keyboardDiv);

  console.log('Keyboard div created and appended.');

  // Initialize the keyboard
  const keyboard = new Keyboard(keyboardDiv, {
    onChange: input => {
      document.querySelector('.input').value = input;
      console.log('Input changed', input);
    },
    onKeyPress: button => {
      console.log('Button pressed', button);

      // Handle shift and caps lock
      if (button === '{shift}' || button === '{lock}') handleShift(keyboard);
    },
    theme: 'hg-theme-default hg-layout-default myTheme',
  });

  console.log('Keyboard initialized.');


  // Function to handle shift and caps lock
  const handleShift = (keyboard) => {
    let currentLayout = keyboard.options.layoutName;
    let shiftToggle = currentLayout === 'default' ? 'shift' : 'default';

    keyboard.setOptions({
      layoutName: shiftToggle,
    });
  };

  console.log('Keyboard setup complete.');

  return { keyboard, keyboardDiv };
}
