module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(css|scss|sass)$': 'jest-transform-stub',  // Handle CSS and SCSS imports
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/*.d.ts'],
  verbose: true,
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    '/node_modules/(?!fast-cartesian|simple-keyboard/)',
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'jest-transform-stub',  // Mock CSS imports
  },
};
