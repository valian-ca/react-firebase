# Gemini Code Assistant Context

This document provides context for the Gemini code assistant to understand the `@valian/react-firestore` project.

## Project Overview

This is a TypeScript project that provides a set of React hooks for using Firebase Firestore. The project is managed with pnpm.

The main hooks are:

- `useCollection`: Subscribes to a Firestore collection and provides real-time updates.
- `useDocument`: Subscribes to a single Firestore document.

## Building and Running

The following scripts are available in the `package.json` and can be run with `pnpm <script>`:

- `pnpm build`: Build the project using Rollup.
- `pnpm test`: Run all tests for the package.
- `pnpm eslint`: Lint the entire project with ESLint.
- `pnpm type-check`: Run the TypeScript compiler to check for type errors.

## Development Conventions

- **Package Management**: This project uses `pnpm` for package management. Please use `pnpm` for all package-related operations.
- **Linting**: The project uses ESLint for code style and formatting. Please ensure that all new code conforms to the project's linting rules.
- **Testing**: The project uses Jest for testing. All new features should be accompanied by tests.
- **TypeScript**: The project is written in TypeScript. Please use TypeScript for all new code.
