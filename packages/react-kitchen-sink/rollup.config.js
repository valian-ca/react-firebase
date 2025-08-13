import typescript from '@rollup/plugin-typescript'
import { dts } from 'rollup-plugin-dts'

const external = [
  '@sentry/core',
  '@sentry/react',
  '@tanstack/react-query',
  '@valian/rxjs-firebase',
  '@valian/zustand-firestore',
  'firebase/firestore',
  '@firebase/firestore',
  'observable-hooks',
  'react',
  'rxjs',
  'zod-firebase',
  'zustand',
]

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'lib/index.cjs',
        format: 'cjs',
      },
      {
        file: 'lib/index.mjs',
        format: 'esm',
      },
    ],
    external,
    plugins: [typescript({})],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'lib/index.d.ts',
      },
      {
        file: 'lib/index.d.cts',
      },
      {
        file: 'lib/index.d.mts',
      },
    ],
    external,
    plugins: [
      dts({
        respectExternal: true,
        compilerOptions: {
          strict: false,
        },
      }),
    ],
  },
]
