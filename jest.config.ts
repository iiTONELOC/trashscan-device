import type {JestConfigWithTsJest} from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^react/jsx-runtime$': 'preact/jsx-runtime',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  setupFiles: ['./src/scripts/envLoader.ts'],
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.vite',
    '<rootDir>/dist/',
    '<rootDir>/coverage/',
    '<rootDir>/_db',
  ],
};

export default jestConfig;
