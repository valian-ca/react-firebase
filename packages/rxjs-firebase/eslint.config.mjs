import { base } from '@valian/eslint-config/base'
import { importSort } from '@valian/eslint-config/import-sort'
import { react } from '@valian/eslint-config/react'
import { typescript } from '@valian/eslint-config/typescript'
import { vitest } from '@valian/eslint-config/vitest'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  ...base,
  ...typescript,
  ...importSort,
  ...react,
  ...vitest,
  globalIgnores(['coverage/', 'dist/', 'lib/']),
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
])
