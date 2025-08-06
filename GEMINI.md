# Gemini Code Assistant Context

This document provides context for the Gemini code assistant to understand the `react-firebase` project.

## Project Overview

This is a TypeScript monorepo that provides a set of utilities for using Firebase with React and RxJS. The project is managed with pnpm, Lerna, and Nx.

The monorepo contains two main packages:

- `@valian/react-firestore`: A collection of React hooks for interacting with Firebase Firestore. The main hooks are `useCollection` and `useDocument`.
- `@valian/rxjs-firebase`: A set of RxJS operators and utilities for working with Firebase. This includes operators like `documentSnapshotState` and `querySnapshotState`, and data sources like `authState`, `fromDocumentRef`, and `fromQuery`.

## Building and Running

The following scripts are available in the root `package.json` and can be run with `pnpm <script>`:

- `pnpm eslint`: Lint the entire project with ESLint.
- `pnpm prettier`: Check for formatting errors with Prettier.
- `pnpm lint:md`: Lint all Markdown files.
- `pnpm test`: Run all tests for all packages.
- `pnpm type-check`: Run the TypeScript compiler to check for type errors.

Each individual package also has its own `build`, `test`, and `type-check` scripts that can be run from the package's directory.

## Development Conventions

- **Package Management**: This project uses `pnpm` for package management. Please use `pnpm` for all package-related operations.
- **Linting**: The project uses ESLint and Prettier for code style and formatting. Please ensure that all new code conforms to the project's linting rules.
- **Testing**: The project uses Jest for testing. All new features should be accompanied by tests.
- **Commits**: The project uses conventional commits. Please follow the conventional commit format for all commit messages.
- **TypeScript**: The project is written in TypeScript. Please use TypeScript for all new code.
