import Keyboard from 'simple-keyboard';
import 'simple-keyboard/build/css/index.css';
export function createKeyboard(displayElement) {
    console.log('Creating keyboard...');
    const keyboardContainer = document.createElement('div');
    keyboardContainer.id = 'keyboard-container';
    keyboardContainer.style.position = 'fixed';
    keyboardContainer.style.bottom = '0';
    keyboardContainer.style.width = '75%';
    keyboardContainer.style.backgroundColor = '#fff';
    keyboardContainer.style.zIndex = '1000';
    displayElement.appendChild(keyboardContainer);
    console.log('Keyboard container created and appended.');
    const keyboardDiv = document.createElement('div');
    keyboardDiv.className = 'simple-keyboard';
    keyboardDiv.style.width = '100%';
    keyboardDiv.style.boxSizing = 'border-box';
    keyboardDiv.style.minHeight = '100px';
    keyboardDiv.style.backgroundColor = 'lightgray';
    keyboardContainer.appendChild(keyboardDiv);
    console.log('Keyboard div created and appended.');
    const keyboard = new Keyboard(keyboardDiv, {
        onChange: (input) => {
            document.querySelector('.input').value = input;
            console.log('Input changed', input);
        },
        onKeyPress: (button) => {
            console.log('Button pressed', button);
            if (button === '{shift}' || button === '{lock}')
                handleShift(keyboard);
        },
        theme: 'hg-theme-default hg-layout-default myTheme',
    });
    console.log('Keyboard initialized.');
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
//# sourceMappingURL=keyboard.js.map