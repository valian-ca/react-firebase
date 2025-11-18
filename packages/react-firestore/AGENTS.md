# AI Agent Context - @valian/react-firestore

This document provides detailed context for AI coding assistants working on the `@valian/react-firestore` package.

## Package Overview

React hooks library for seamless Firebase Firestore integration with real-time updates, loading states, and TypeScript support.

### Purpose

Simplify Firestore data access in React applications by providing:

- Automatic subscription management
- Built-in loading and error states
- Type-safe data access
- React lifecycle-aware cleanup

### Key Exports

**`useCollection(query, options?)`**

- Subscribe to a Firestore collection/query
- Returns: `{ data: T[] | undefined, loading: boolean, error: Error | undefined }`
- Automatically updates on data changes
- Handles unsubscribe on unmount

**`useDocument(docRef, options?)`**

- Subscribe to a single Firestore document
- Returns: `{ data: T | undefined, loading: boolean, error: Error | undefined }`
- Real-time updates when document changes
- Proper cleanup on component unmount

## Tech Stack

- **Language**: TypeScript 5+
- **Build Tool**: tsdown (modern TS bundler)
- **Testing**: Vitest
- **Linting**: ESLint with React hooks rules
- **Firebase**: Firebase JS SDK v9+ modular API
- **React**: React 18+ (peer dependency)

## Project Structure

```
packages/react-firestore/
├── src/
│   ├── useCollection.ts    # Collection hook implementation
│   ├── useDocument.ts      # Document hook implementation
│   ├── types.ts            # TypeScript type definitions
│   └── index.ts            # Main export file
├── __tests__/
│   ├── useCollection.test.ts
│   └── useDocument.test.ts
├── dist/                   # Build output (git-ignored)
├── package.json
├── tsconfig.json
├── vitest.config.mjs
├── eslint.config.mjs
└── tsdown.config.mjs
```

## Development Commands

All commands should be run from the package directory or using pnpm filters:

### From Package Directory

```bash
cd packages/react-firestore

pnpm build           # Build the package with tsdown
pnpm test            # Run tests with Vitest
pnpm test:watch      # Run tests in watch mode
pnpm eslint          # Lint the package
pnpm type-check      # TypeScript type checking
```

### Using pnpm Filters

```bash
# From repository root
pnpm --filter @valian/react-firestore build
pnpm --filter @valian/react-firestore test
```

## Development Guidelines

### Code Style

- Follow React hooks best practices
- Use `useEffect` and `useState` appropriately
- Handle cleanup in effect return functions
- Keep hooks pure and side-effect free when possible

### TypeScript Usage

- Strict mode enabled
- Generic types for user data: `useCollection<UserType>(query)`
- Proper null/undefined handling
- Export all public types from main index

### Testing Approach

- Mock Firebase SDK using Vitest mocks
- Test hook behavior with `@testing-library/react-hooks`
- Test loading states, error states, and data states
- Test cleanup and unsubscription
- See `.cursor/rules/tests.mdc` for detailed guidelines

### Firebase Integration

- Accept Firestore query and document references
- Use Firebase modular API (v9+)
- Handle snapshot conversions properly
- Manage listener subscriptions carefully

## API Patterns

### Hook Return Pattern

All hooks follow consistent return signature:

```typescript
{
  data: T | undefined,      // undefined when loading or no data
  loading: boolean,         // true during initial load
  error: Error | undefined  // set when operation fails
}
```

### Options Pattern

Hooks accept optional configuration:

```typescript
interface HookOptions {
  suspense?: boolean // For React Suspense support
  converter?: FirestoreDataConverter<T> // Custom data conversion
}
```

### Lifecycle Management

- Subscribe in `useEffect`
- Return cleanup function to unsubscribe
- Prevent updates on unmounted components
- Handle rapid ref/query changes

## Common Tasks

### Adding a New Hook

1. Create `src/useNewHook.ts`
2. Implement hook following existing patterns
3. Add TypeScript types and JSDoc comments
4. Export from `src/index.ts`
5. Create test file `__tests__/useNewHook.test.ts`
6. Write comprehensive tests
7. Update package README if applicable

### Updating Dependencies

```bash
# Update Firebase SDK
pnpm add firebase@latest

# Update dev dependencies
pnpm add -D vitest@latest
```

### Debugging Tips

- Use React DevTools for hook state inspection
- Enable Firebase debug logging: `firebase.setLogLevel('debug')`
- Check for memory leaks with unsubscribed listeners
- Verify correct TypeScript types in IDE

## Build Configuration

### tsdown.config.mjs

- Builds ESM and CJS formats
- Generates TypeScript declarations
- Tree-shakeable output
- Preserves TypeScript types

### Output Structure

```
dist/
├── index.js           # ESM bundle
├── index.cjs          # CommonJS bundle
├── index.d.ts         # Type declarations
└── (other artifacts)
```

## Testing Configuration

### vitest.config.mjs

- Test environment: jsdom (for React)
- Firebase SDK mocks configured
- Coverage thresholds defined
- Watch mode with intelligent re-runs

### Test Patterns

```typescript
describe('useCollection', () => {
  it('should handle loading state', () => { ... });
  it('should update on data changes', () => { ... });
  it('should handle errors', () => { ... });
  it('should cleanup on unmount', () => { ... });
});
```

## Dependencies

### Peer Dependencies

- `react` - The hooks are React-specific
- `firebase` - User provides Firebase instance

### Direct Dependencies

- Minimal runtime dependencies
- Firebase types included

### Dev Dependencies

- Build and test tooling
- Type definitions for testing

## Integration Examples

### Basic Usage

```typescript
import { useCollection } from '@valian/react-firestore';
import { collection, query, where } from 'firebase/firestore';

function MyComponent() {
  const { data, loading, error } = useCollection(
    query(collection(db, 'users'), where('active', '==', true))
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>Users: {data?.length}</div>;
}
```

### With TypeScript

```typescript
interface User {
  name: string
  email: string
}

const { data } = useCollection<User>(userQuery)
// data is User[] | undefined
```

## Publishing

- Automated via root-level GitHub Actions
- Version bumped based on conventional commits
- Built artifacts published to npm
- Git tags created for releases

## Troubleshooting

### "Cannot find module" errors

- Run `pnpm build` to generate dist files
- Check tsconfig paths are correct

### React hooks rules violations

- Ensure hooks are only called at top level
- Don't call hooks inside conditions or loops

### Firebase permission errors

- Check Firestore security rules
- Verify user authentication state

### Type errors with Firebase

- Ensure Firebase types are installed
- Check TypeScript version compatibility

## Related Documentation

- Root monorepo AGENTS.md for overall architecture
- `@valian/rxjs-firebase` for RxJS-based alternatives
- [Firebase Firestore Docs](https://firebase.google.com/docs/firestore)
- [React Hooks Docs](https://react.dev/reference/react)

## Notes for AI Assistants

- This package focuses on React-specific patterns
- Hooks must follow React rules (ESLint enforces this)
- Consider performance implications of subscriptions
- Be mindful of React rendering behavior
- Test both mount, update, and unmount scenarios
- Respect semantic versioning for API changes
