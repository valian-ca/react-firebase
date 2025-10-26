import { config } from '@valian/eslint-config'

export default [
  ...config.base,
  ...config.importSort,
  {
    ignores: ['**/dist/', '**/lib', '**/coverage/', 'packages/**'],
  },
]
