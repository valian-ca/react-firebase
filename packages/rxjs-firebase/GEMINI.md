# Gemini Code Assistant Context

This document provides context for the Gemini code assistant to understand the `@valian/rxjs-firebase` project.

## Project Overview

This is a TypeScript library that provides a set of utilities for using Firebase with RxJS. The project is part of a larger monorepo, but this document focuses on the `@valian/rxjs-firebase` package.

The library provides RxJS operators and utilities for Firebase with real-time updates and TypeScript support. The main features are:

- `queryState` and `documentState` operators to manage loading, error, and data states.
- `fromQuery` and `fromDocumentRef` to create observables from Firestore queries and document references.
- `authState` to create an observable for Firebase Authentication state changes.
- `DocumentSnapshotSubject` and `QuerySnapshotSubject` for more complex state management.

## Building and Running

The following scripts are available in the `package.json` and can be run with `pnpm <script>`:

- `pnpm build`: Builds the library for production.
- `pnpm test`: Runs the tests using Jest.
- `pnpm eslint`: Lints the codebase with ESLint.
- `pnpm type-check`: Runs the TypeScript compiler to check for type errors.

## Development Conventions

- **Package Management**: This project uses `pnpm` for package management.
- **Linting**: The project uses ESLint for code style and formatting.
- **Testing**: The project uses Jest for testing.
- **TypeScript**: The project is written in TypeScript.
