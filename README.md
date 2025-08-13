# @valian/firebase-utilities

Modern Firebase tooling for React and RxJS in a pnpm monorepo.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
![pnpm workspace](https://img.shields.io/badge/pnpm-monorepo-F69220?logo=pnpm&logoColor=white)
![node >= 22](https://img.shields.io/badge/node-%3E%3D%2022-339933?logo=node.js&logoColor=white)

## Packages

| Package                                                       | NPM                                                                                                                             | Description                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [`@valian/react-firestore`](./packages/react-firestore)       | [![npm](https://img.shields.io/npm/v/%40valian%2Freact-firestore)](https://www.npmjs.com/package/@valian/react-firestore)       | React hooks for Firebase Firestore                              |
| [`@valian/rxjs-firebase`](./packages/rxjs-firebase)           | [![npm](https://img.shields.io/npm/v/%40valian%2Frxjs-firebase)](https://www.npmjs.com/package/@valian/rxjs-firebase)           | RxJS operators and subjects for Firestore and Auth              |
| [`@valian/zustand-firestore`](./packages/zustand-firestore)   | [![npm](https://img.shields.io/npm/v/%40valian%2Fzustand-firestore)](https://www.npmjs.com/package/@valian/zustand-firestore)   | Zustand stores for Firestore document/query snapshots           |
| [`@valian/react-kitchen-sink`](./packages/react-kitchen-sink) | [![npm](https://img.shields.io/npm/v/%40valian%2Freact-kitchen-sink)](https://www.npmjs.com/package/@valian/react-kitchen-sink) | Integration utilities for React Query, Sentry, and zod-firebase |

See each package README for installation and TypeScript usage examples.

## Development

Monorepo managed with pnpm and Nx.

### Prerequisites

- [pnpm](https://pnpm.io/)
- [Node.js](https://nodejs.org/) >= 22

### Install dependencies

```bash
pnpm install
```

### Useful commands

- Build all packages: `pnpm -r build`
- Run tests across packages: `pnpm test`
- Type-check across packages: `pnpm run type-check`
- Lint (ESLint via Nx): `pnpm eslint`
- Lint Markdown: `pnpm run lint:md`
- Check Prettier formatting: `pnpm run lint:prettier`

## Contributing

Contributions are welcome! Please:

- Use the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format
- Run tests and linters before submitting a PR
- Add or update package-level README usage where relevant

## License

[MIT](./LICENSE)
