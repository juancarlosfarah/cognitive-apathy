const hq = require("alias-hq");

module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': '@sucrase/jest-plugin',
    '^.+\\.(css|scss|sass)$': 'jest-transform-stub',  // Handle CSS and SCSS imports
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/*.d.ts'],
  verbose: true,
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    fetchExternalResources: true,
    pretendToBeVisual: true,
    url: 'http://localhost/',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!fast-cartesian|simple-keyboard/)',
  ],
  moduleNameMapper: hq.load(__dirname + '/tsconfig.json').get('jest'),
  displayName: {
    name: 'your-package-name',
    color: 'white',
  },
};
