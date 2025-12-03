import { base } from '@valian/eslint-config/base'
import { importSort } from '@valian/eslint-config/import-sort'
import { json } from '@valian/eslint-config/json'
import { node } from '@valian/eslint-config/node'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([base, importSort, json, node, globalIgnores(['packages/', '.nx/'])])
