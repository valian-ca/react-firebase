import { base } from '@valian/eslint-config/base'
import { importSort } from '@valian/eslint-config/import-sort'
import { node } from '@valian/eslint-config/node'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([...base, ...importSort, ...node, globalIgnores(['packages/'])])
