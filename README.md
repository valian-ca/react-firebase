# @valian/firebase-utilities

A monorepo of modern Firebase tools for React and RxJS.

## Packages

| Name                                                  | Description                        |
| ----------------------------------------------------- | ---------------------------------- |
| [`@valian/react-firestore`](/packages/react-firebase) | React hooks for Firebase Firestore |
| [`@valian/rxjs-firebase`](/packages/rxjs-firebase)    | RxJS operators for Firebase        |

## Development

This project is a monorepo managed with pnpm and Nx.

### Prerequisites

- [pnpm](httpshttps://pnpm.io/)
- [Node.js](https://nodejs.org/) >= 22

### Installation

```bash
pnpm install
```

### Build

To build all packages, run the following command from the root of the project:

```bash
pnpm build
```

### Test

To run the tests for all packages, run the following command from the root of the project:

```bash
pnpm test
```

### Lint

To lint the entire project, run the following command from the root of the project:

```bash
pnpm eslint
```

## Contributing

Contributions are welcome! Please follow the [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) format for all commit messages.

## License

[MIT](/LICENSE)
