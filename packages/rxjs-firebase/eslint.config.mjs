import { config } from '@valian/eslint-config'

export default [
  ...config.base,
  ...config.typescript,
  ...config.importSort,
  ...config.jest,
  {
    ignores: ['coverage/', 'dist/', 'lib/'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      'unicorn/filename-case': ['error', { cases: { camelCase: true, pascalCase: true } }],
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      'jest/no-done-callback': 'off',
      'jest/no-conditional-expect': 'off',
      'jest/expect-expect': ['error', { assertFunctionNames: ['expect', 'expectObservable'] }],
    },
  },
]
