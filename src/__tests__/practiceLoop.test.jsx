import { run } from './src/experiment/'
import { checkFlag } from './utils/';
import { MINIMUM_CALIBRATION_MEDIAN } from './constants';
import { initJsPsych } from 'jspsych'; 
import '@jspsych/plugin-fullscreen';
import '@jspsych/plugin-preload';
import '@jspsych/plugin-html-button-response';
import '@jspsych/plugin-html-keyboard-response';

// Mock the necessary parts
jest.mock('./utils/', () => ({
  checkFlag: jest.fn(),
}));

jest.mock('jspsych', () => ({
  initJsPsych: jest.fn(() => ({
    data: {
      get: jest.fn().mockReturnThis(),
      filter: jest.fn().mockReturnThis(),
      last: jest.fn().mockReturnThis(),
      values: jest.fn(),
    },
    getDisplayElement: jest.fn(() => ({
      innerHTML: '',
    })),
    run: jest.fn(),
  })),
}));

describe('Cognitive Apathy Experiment', () => {
  let jsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  it('should loop in practiceLoop if keysReleasedFlag is true', async () => {
    checkFlag.mockImplementation((task, flag) => {
      if (flag === 'keysReleasedFlag') {
        return true;
      }
      return false;
    });
    jsPsych.data.values.mockReturnValue([{ tapCount: MINIMUM_CALIBRATION_MEDIAN }]);

    const config = {
      assetPaths: { audio: [], video: [] },
      input: {},
      environment: {},
      title: 'Cognitive Apathy Experiment',
      version: '0.1.0',
    };

    await run(config);

    const practiceLoop = jsPsych.run.mock.calls[0][0].find(
      (trial) => trial.timeline && trial.timeline[0].type === 'CountdownTrialPlugin'
    );

    expect(practiceLoop).toBeDefined();
    expect(practiceLoop.loop_function()).toBe(true);
  });

  it('should loop in practiceLoop if keyTappedEarlyFlag is true', async () => {
    checkFlag.mockImplementation((task, flag) => {
      if (flag === 'keyTappedEarlyFlag') {
        return true;
      }
      return false;
    });
    jsPsych.data.values.mockReturnValue([{ tapCount: MINIMUM_CALIBRATION_MEDIAN }]);

    const config = {
      assetPaths: { audio: [], video: [] },
      input: {},
      environment: {},
      title: 'Cognitive Apathy Experiment',
      version: '0.1.0',
    };

    await run(config);

    const practiceLoop = jsPsych.run.mock.calls[0][0].find(
      (trial) => trial.timeline && trial.timeline[0].type === 'CountdownTrialPlugin'
    );

    expect(practiceLoop).toBeDefined();
    expect(practiceLoop.loop_function()).toBe(true);
  });

  it('should loop in practiceLoop if numberOfTaps is less than MINIMUM_CALIBRATION_MEDIAN', async () => {
    checkFlag.mockReturnValue(false);
    jsPsych.data.values.mockReturnValue([{ tapCount: MINIMUM_CALIBRATION_MEDIAN - 1 }]);

    const config = {
      assetPaths: { audio: [], video: [] },
      input: {},
      environment: {},
      title: 'Cognitive Apathy Experiment',
      version: '0.1.0',
    };

    await run(config);

    const practiceLoop = jsPsych.run.mock.calls[0][0].find(
      (trial) => trial.timeline && trial.timeline[0].type === 'CountdownTrialPlugin'
    );

    expect(practiceLoop).toBeDefined();
    expect(practiceLoop.loop_function()).toBe(true);
  });

  it('should not loop in practiceLoop if no flags are true and minimum taps are reached', async () => {
    checkFlag.mockReturnValue(false);
    jsPsych.data.values.mockReturnValue([{ tapCount: MINIMUM_CALIBRATION_MEDIAN }]);

    const config = {
      assetPaths: { audio: [], video: [] },
      input: {},
      environment: {},
      title: 'Cognitive Apathy Experiment',
      version: '0.1.0',
    };

    await run(config);

    const practiceLoop = jsPsych.run.mock.calls[0][0].find(
      (trial) => trial.timeline && trial.timeline[0].type === 'CountdownTrialPlugin'
    );

    expect(practiceLoop).toBeDefined();
    expect(practiceLoop.loop_function()).toBe(false);
  });
});
