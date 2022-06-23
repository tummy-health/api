export default {
  moduleNameMapper: {
    '^@src(.*)$': '<rootDir>/src$1',
    '^@test(.*)$': '<rootDir>/test$1',
  },
  preset: 'ts-jest',
  setupFiles: ['dotenv/config'],
  testPathIgnorePatterns: ['/node_modules/', '.*.integration.test.ts'],
};
