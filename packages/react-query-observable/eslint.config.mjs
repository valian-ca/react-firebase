import { config } from '@valian/eslint-config'

export default [
  ...config.base,
  ...config.typescript,
  ...config.importSort,
  ...config.vitest,
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
      'vitest/no-conditional-expect': 'off',
      'vitest/expect-expect': ['error', { assertFunctionNames: ['expect', 'expectObservable'] }],
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      'unicorn/filename-case': ['error', { cases: { kebabCase: true } }],
    },
  },
]
