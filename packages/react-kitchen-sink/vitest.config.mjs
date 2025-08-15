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
      exclude: ['src/**/index.ts', 'src/hooks/**/*.ts'],
      thresholds: {
        statements: 99.5,
        branches: 95,
        functions: 100,
        lines: 99.5,
      },
    },
    sequence: {
      hooks: 'list',
    },
  },
})
