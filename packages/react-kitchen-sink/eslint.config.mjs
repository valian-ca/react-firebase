import { base } from '@valian/eslint-config/base'
import { importSort } from '@valian/eslint-config/import-sort'
import { react } from '@valian/eslint-config/react'
import { typescript } from '@valian/eslint-config/typescript'
import { vitest } from '@valian/eslint-config/vitest'
import { zod } from '@valian/eslint-config/zod'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  ...base,
  ...typescript,
  ...importSort,
  ...react,
  ...vitest,
  ...zod,
  globalIgnores(['coverage/', 'dist/', 'lib/']),
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      'max-classes-per-file': 'off',
    },
  },
])
