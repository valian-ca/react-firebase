module.exports = {
  preset: 'ts-jest',
  clearMocks: true,
  testEnvironment: 'jsdom',
  modulePathIgnorePatterns: ['<rootDir>/__integration-tests__/'],
  collectCoverageFrom: ['src/**/*.ts', 'src/**/*.tsx', '!src/**/index.ts'],
  coverageReporters: ['text', 'cobertura'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        jsx: 'react-jsx',
      },
    ],
  },
}
