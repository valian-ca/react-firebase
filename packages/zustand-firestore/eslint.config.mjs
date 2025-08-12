import { config } from '@valian/eslint-config'
// eslint-disable-next-line import-x/no-rename-default
import vitest from '@vitest/eslint-plugin'

export default [
  ...config.base,
  ...config.typescript,
  ...config.importSort,
  ...config.react,
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
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    },
  },
  {
    files: ['**/*.test.ts'],
    ...vitest.configs.recommended,
  },
]
