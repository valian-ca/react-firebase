# AI Agent Context - react-firebase Monorepo

This document provides comprehensive context for AI coding assistants working with the `react-firebase` monorepo.

## Project Overview

This is a TypeScript monorepo providing utilities for integrating Firebase with React and RxJS applications. The project delivers production-ready libraries for real-time data synchronization and state management.

### Monorepo Structure

```
react-firebase/
├── packages/
│   ├── react-firestore/          # React hooks for Firestore
│   ├── rxjs-firebase/             # RxJS utilities for Firebase
│   ├── react-query-observable/    # React Query + RxJS integration
│   ├── zustand-firestore/         # Zustand stores for Firestore
│   └── react-kitchen-sink/        # Comprehensive package combining all utilities
└── (root configs)
```

### Packages

**`@valian/react-firestore`**

- React hooks for Firestore integration
- Main exports: `useCollection`, `useDocument`
- Handles real-time updates and loading states
- TypeScript-first with full type inference

**`@valian/rxjs-firebase`**

- RxJS operators and observables for Firebase
- Main exports: `fromQuery`, `fromDocumentRef`, `authState`, state operators
- Provides reactive streams for Firestore and Auth
- Advanced state management with subjects

**`@valian/react-query-observable`**

- Bridge between React Query and RxJS observables
- Main exports: `observableQueryOptions`, `observableQueryFn`
- Enables using observables as React Query data sources
- Seamless integration with TanStack Query

**`@valian/zustand-firestore`**

- Zustand store integration for Firestore
- State management for Firestore queries and documents
- Built on top of rxjs-firebase
- React hooks for Zustand stores with Firestore

**`@valian/react-kitchen-sink`**

- Comprehensive package combining all utilities
- Includes: React Query integration, Zustand stores, RxJS subjects
- Additional features: Sentry error tracking, Zod schema validation
- Advanced: Schema-based Firestore converters, error handling utilities
- One-stop solution for complex Firebase + React applications

## Tech Stack

- **Build System**: Nx 21.4.1 monorepo orchestration
- **Package Manager**: pnpm with workspaces
- **Language**: TypeScript (strict mode)
- **Testing**: Jest for unit tests
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions
- **Versioning**: Conventional commits with semantic versioning

## Development Setup

### Prerequisites

- Node.js (check `.nvmrc` or `package.json` engines)
- pnpm (specified in `package.json` packageManager field)

### Initial Setup

```bash
pnpm install              # Install all dependencies
pnpm type-check          # Verify TypeScript compilation
pnpm test                # Run all tests
```

## Available Commands

### Root Level Commands

Run these from the repository root:

- `pnpm eslint` - Lint all packages with ESLint
- `pnpm prettier` - Check code formatting across the monorepo
- `pnpm lint:md` - Lint all Markdown files
- `pnpm test` - Run all tests for all packages
- `pnpm type-check` - Type-check all TypeScript files

### Nx Commands

```bash
nx graph                 # Visualize project dependencies
nx run-many --target=build --all   # Build all packages
nx affected --target=test          # Test affected projects
```

## Development Guidelines

### Code Standards

- **TypeScript**: All code must be TypeScript with strict type checking
- **No `any`**: Use proper types or `unknown` with type guards
- **Naming**: Follow conventions in `.cursor/rules/naming-conventions-rule.mdc`
- **Formatting**: Code is auto-formatted with Prettier (see `.prettierrc`)

### Testing Requirements

- All new features require tests
- Test files: `*.test.ts` or `*.spec.ts`
- Use Jest for unit tests
- See `.cursor/rules/tests.mdc` for testing guidelines
- Aim for high coverage on public APIs

### Commit Convention

- Follow Conventional Commits specification
- Format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Example: `feat(react-firestore): add useCollectionGroup hook`

### Pull Requests

- CI checks must pass (linting, tests, type-check)
- Commitlint validates commit messages
- GitHub Actions workflows in `.github/workflows/`

## Architecture Patterns

### Package Architecture & Dependencies

The monorepo follows a layered architecture:

**Foundation Layer: `rxjs-firebase`**

- Core RxJS utilities for Firebase
- No dependencies on other workspace packages
- Pure reactive programming patterns
- Base for all other packages

**Integration Layer**

- `react-firestore` - Direct React hooks (minimal dependencies)
- `react-query-observable` - React Query + RxJS bridge (no workspace deps)
- `zustand-firestore` - Zustand stores (depends on rxjs-firebase)

**Comprehensive Layer: `react-kitchen-sink`**

- Combines all packages above
- Adds Sentry integration, Zod validation
- Production-ready batteries-included solution

### React Hooks Pattern (react-firestore)

- Hooks manage subscriptions and cleanup automatically
- Return objects with `{ data, loading, error }` pattern
- Handle Firebase snapshot conversions internally
- Optimized for React component lifecycle

### Observable Pattern (rxjs-firebase)

- Pure RxJS observables for reactive programming
- State operators transform snapshots to state objects
- Subjects for advanced state management scenarios
- Memory-efficient with proper cleanup

### React Query Integration (react-query-observable)

- Adapts RxJS observables to React Query's expectations
- Handles observable lifecycle within Query's caching system
- Enables powerful caching, refetching, and synchronization

### Zustand Pattern (zustand-firestore)

- Zustand stores backed by Firestore real-time data
- Combines Zustand's simplicity with Firebase's real-time updates
- Hooks and context providers for easy React integration

## Common Workflows

## Important Files

- `nx.json` - Nx workspace configuration
- `pnpm-workspace.yaml` - pnpm workspace definitions
- `tsconfig.json` - Root TypeScript configuration
- `packages/*/tsconfig.json` - Package-specific TS configs
- `.cursor/rules/*.mdc` - Coding rules and conventions
- `.github/workflows/` - CI/CD automation

## Firebase Context

### Firestore Usage

- Works with Firebase JS SDK v9+ (modular API)
- Requires initialized Firebase app instance
- Supports real-time listeners and one-time reads
- Handles snapshot conversions and data extraction

### Authentication

- `authState` observable for auth state changes (rxjs-firebase)
- Compatible with all Firebase Auth providers
- Reactive user state management
- Auth hooks available in react-kitchen-sink

### State Management Integrations

- **React Query**: Observable-based query functions for caching and synchronization
- **Zustand**: Real-time Firestore data in Zustand stores
- Both integrate seamlessly with rxjs-firebase observables

### Schema Validation (react-kitchen-sink)

- Zod schema integration with Firestore
- Type-safe data converters using zod-firebase
- Automatic validation of Firestore documents
- Schema-based queries and documents

### Error Tracking (react-kitchen-sink)

- Sentry integration for Firebase operations
- Automatic error capture with context
- Custom error handling utilities
- Production-ready error monitoring

## Troubleshooting

### Type Errors

- Ensure all packages are built: `pnpm -r build`
- Check TypeScript version consistency across packages
- Verify Firebase SDK types are installed

### Test Failures

- Check Firebase mocks are properly configured
- Ensure test environment has required dependencies
- Review test isolation and cleanup

### Build Issues

- Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
- Clear Nx cache: `nx reset`
- Check for circular dependencies

## Related Documentation

### Package-Specific Documentation

- `packages/react-firestore/AGENTS.md` - React hooks for Firestore
- `packages/rxjs-firebase/AGENTS.md` - RxJS utilities for Firebase
- `packages/react-query-observable/` - React Query + RxJS integration
- `packages/zustand-firestore/` - Zustand stores for Firestore
- `packages/react-kitchen-sink/` - Comprehensive utilities package

### External Documentation

- Firebase Documentation: https://firebase.google.com/docs
- RxJS Documentation: https://rxjs.dev
- React Documentation: https://react.dev
- TanStack Query: https://tanstack.com/query
- Zustand: https://zustand-demo.pmnd.rs/

## Notes for AI Assistants

- This is an active monorepo with strict typing and linting
- Always use pnpm, never npm or yarn
- Respect conventional commits format
- Check Nx workspace rules before suggesting architecture changes
- Consider all 5 packages when making cross-cutting changes
- Test changes in relevant package contexts
- `react-kitchen-sink` depends on all other packages - changes to core packages may affect it
- Package dependency order: `rxjs-firebase` → `react-firestore`/`react-query-observable`/`zustand-firestore` → `react-kitchen-sink`
- Some packages have peer dependencies (React Query, Zustand, Sentry, Zod) - be aware of version compatibility

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->
