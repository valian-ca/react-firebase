import { config } from '@valian/eslint-config'

export default [
  ...config.base,
  ...config.typescript,
  ...config.importSort,
  ...config.react,
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
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    },
  },
]
