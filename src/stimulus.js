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