export function generateStimulus(isAcceptStep, reward, targetHeight, mercuryHeight, error) {

    let messages = `<p id="hold-keys-message">Hold the <b>A</b>, <b>W</b>, and <b>E</b> keys!</p>
            <p id="start-message" style="display: none;">Hit <b>Enter</b> to start! Then tap the <b>R</b> key.</p>`

    if (isAcceptStep) {
        messages = `<p>Do you accept the trial? (Arrow Left = Yes, Arrow Right = No)<p/>`;
    }

    return `
          <div id="cognitive-agency-task" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
    <h2 id="reward">Reward: $${reward.toFixed(2)}</h2>
    ${messages}
    <div id="thermometer-container" style="display: flex; justify-content: center; align-items: center; height: 300px; width: 100px; border: 1px solid #000;">
        <div id="thermometer" style="position: relative; width: 100%; height: 100%; background-color: #e0e0e0;">
            <div id="mercury" style="height: ${mercuryHeight}%; background-color: red;"></div>
            <div id="target-bar" style="position: absolute; bottom: ${targetHeight}%; width: 100%; height: 2px; background-color: black;"></div>
        </div>
    </div>
    <div id="status">
        <div id="error-message" style="color: red;">${error}</div>
    </div>
</div>

        `;
}
export function calibration1Stimulus(trialNum) {
    return `
        <div id="calibration-task" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
            <h2>Calibration Task</h2>
            <p id="hold-keys-message">Hold the <b>A</b> key with pinky, <b>W</b> key with ring finger, and <b>E</b> key with middle finger!
            <p id="start-message" style="display: none;">Hit <b>Enter</b> to start! Then tap the <b>R</b> key with your index finger as fast as possible.</p>
            <div id="circle-container" style="position: relative; width: 100px; height: 100px;">
                <div id="blink-circle" style="width: 100px; height: 100px; border: 3px solid black; border-radius: 50%; position: absolute; top: 0; left: 0;">
                    <div id="inner-circle" style="width: 80px; height: 80px; background-color: red; border-radius: 50%; position: absolute; top: 10px; left: 10px; visibility: hidden;"></div>
                </div>
            </div>
            <p>Trial ${trialNum} of 15</p>
        </div>
    `;
}

export const calibrationWelcomeMessage = "<p>Welcome to the Calibration Task!<p/><p><b>Please press any key to start the calibration.</b></p>";

export const experimentWelcomeMessage = "<p>Welcome to Cognitive Apathy!<p/><p><b>Please press any key to start the experiment.</b></p>";