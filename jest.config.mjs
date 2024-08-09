import { createRequire } from 'module';
import hq from 'alias-hq';

const require = createRequire(import.meta.url);
const packageJson = require('./package.json');

export default {
  transform: {
    '\\.[jt]sx?$': 'babel-jest',  // Use babel-jest to handle TypeScript and JavaScript files
  },
    transformIgnorePatterns: [
    "/node_modules/(?!fast-cartesian)",  // Transpile fast-cartesian even though it's in node_modules
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],  // Specify which file extensions to treat as ESM
  moduleNameMapper: hq.load(new URL('./tsconfig.json', import.meta.url).pathname).get('jest'),
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    fetchExternalResources: true,
    pretendToBeVisual: true,
    url: 'http://localhost/',
  },
  displayName: {
    name: packageJson.name.replace('@jspsych/', ''),
    color: packageJson.name === 'jspsych' ? 'white' : 'cyanBright',
  },
};
