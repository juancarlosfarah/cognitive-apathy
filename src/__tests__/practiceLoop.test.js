import { __awaiter } from "tslib";
import { initJsPsych } from 'jspsych';
import { describe, test, expect, jest } from '@jest/globals';
import { practiceLoop } from '../tutorial'; // Adjust the import path to your actual file
import { checkFlag } from '../utils';
import { MINIMUM_CALIBRATION_MEDIAN } from '../constants';
// Mock the checkFlag function to control the test conditions
jest.mock('../utils', () => ({
    checkFlag: jest.fn(),
}));
describe('practiceLoop', () => {
    test('should repeat the timeline if keys were released early or number of taps is less than MINIMUM_CALIBRATION_MEDIAN', () => __awaiter(void 0, void 0, void 0, function* () {
        const jsPsych = initJsPsych();
        const mockData = {
            get: jest.fn().mockReturnValue({
                filter: jest.fn().mockReturnThis(),
                last: jest.fn().mockReturnThis(),
                values: jest.fn().mockReturnValue([{ tapCount: 0 }]), // Simulate tap count less than MINIMUM_CALIBRATION_MEDIAN
            }),
        };
        jsPsych.data = mockData;
        checkFlag.mockImplementation((task, flag) => {
            if (task === 'countdown' && flag === 'keyTappedEarlyFlag') {
                return true; // Simulate keyTappedEarlyFlag being true
            }
            if (task === 'practice' && flag === 'keysReleasedFlag') {
                return false; // Simulate keysReleasedFlag being false
            }
            return false;
        });
        const timeline = practiceLoop(jsPsych);
        // Verify that the loop_function condition was checked and should return true
        expect(timeline.loop_function()).toBe(true);
    }));
    test('should not repeat the timeline if conditions are not met', () => __awaiter(void 0, void 0, void 0, function* () {
        const jsPsych = initJsPsych();
        const mockData = {
            get: jest.fn().mockReturnValue({
                filter: jest.fn().mockReturnThis(),
                last: jest.fn().mockReturnThis(),
                values: jest.fn().mockReturnValue([{ tapCount: MINIMUM_CALIBRATION_MEDIAN }]), // Simulate tap count equal to MINIMUM_CALIBRATION_MEDIAN
            }),
        };
        jsPsych.data = mockData;
        checkFlag.mockImplementation((task, flag) => {
            if (task === 'countdown' && flag === 'keyTappedEarlyFlag') {
                return false; // Simulate keyTappedEarlyFlag being false
            }
            if (task === 'practice' && flag === 'keysReleasedFlag') {
                return false; // Simulate keysReleasedFlag being false
            }
            return false;
        });
        const timeline = practiceLoop(jsPsych);
        // Verify that the loop_function condition was checked and should return false
        expect(timeline.loop_function()).toBe(false);
    }));
});
//# sourceMappingURL=practiceLoop.test.js.map