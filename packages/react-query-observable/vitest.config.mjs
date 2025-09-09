import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    clearMocks: true,
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'cobertura'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/index.ts'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
    sequence: {
      hooks: 'list',
    },
  },
})
