# AI Agent Context - @valian/rxjs-firebase

This document provides detailed context for AI coding assistants working on the `@valian/rxjs-firebase` package.

## Package Overview

RxJS utilities and operators for Firebase, providing reactive streams for Firestore and Firebase Authentication with comprehensive state management.

### Purpose

Enable reactive programming patterns with Firebase by providing:

- Observable streams from Firestore queries and documents
- RxJS operators for state transformation
- Authentication state observables
- Advanced state management with subjects

### Key Exports

**Data Sources**

- `fromQuery(query)` - Create observable from Firestore query
- `fromDocumentRef(docRef)` - Create observable from document reference
- `authState(auth)` - Observable of authentication state changes

**State Operators**

- `queryState()` - Transform query snapshots to `{ loading, error, data }` state
- `documentState()` - Transform document snapshots to state objects
- `querySnapshotState()` - More detailed query state transformation
- `documentSnapshotState()` - Detailed document state transformation

**Advanced State Management**

- `DocumentSnapshotSubject` - Subject for document state with manual control
- `QuerySnapshotSubject` - Subject for query state with manual control

## Tech Stack

- **Language**: TypeScript 5+
- **Build Tool**: tsdown (modern TS bundler)
- **Testing**: Vitest
- **Linting**: ESLint
- **Firebase**: Firebase JS SDK v9+ modular API
- **RxJS**: RxJS 7+ (peer dependency)

## Project Structure

```
packages/rxjs-firebase/
├── src/
│   ├── observables/
│   │   ├── fromQuery.ts           # Query observable factory
│   │   ├── fromDocumentRef.ts     # Document observable factory
│   │   └── authState.ts           # Auth state observable
│   ├── operators/
│   │   ├── queryState.ts          # Query state operator
│   │   ├── documentState.ts       # Document state operator
│   │   ├── querySnapshotState.ts
│   │   └── documentSnapshotState.ts
│   ├── subjects/
│   │   ├── DocumentSnapshotSubject.ts
│   │   └── QuerySnapshotSubject.ts
│   ├── types.ts                   # TypeScript type definitions
│   └── index.ts                   # Main export file
├── __tests__/
│   ├── observables/
│   ├── operators/
│   └── subjects/
├── dist/                          # Build output (git-ignored)
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
cd packages/rxjs-firebase

pnpm build           # Build the package with tsdown
pnpm test            # Run tests with Vitest
pnpm test:watch      # Run tests in watch mode
pnpm eslint          # Lint the package
pnpm type-check      # TypeScript type checking
```

### Using pnpm Filters

```bash
# From repository root
pnpm --filter @valian/rxjs-firebase build
pnpm --filter @valian/rxjs-firebase test
```

## Development Guidelines

### RxJS Best Practices

- Always complete or unsubscribe from observables
- Use operators for transformations, not imperative code
- Handle errors in the observable stream
- Consider memory leaks and cleanup
- Use appropriate schedulers when needed

### TypeScript Usage

- Strict mode enabled
- Generic types for observables: `fromQuery<UserType>(query)`
- Proper null/undefined handling
- Type-safe operator chains
- Export all public types from main index

### Testing Approach

- Mock Firebase SDK using Vitest mocks
- Test observable emissions and completion
- Test error handling and edge cases
- Verify proper cleanup and unsubscription
- Use marble testing for complex operator behavior
- See `.cursor/rules/tests.mdc` for detailed guidelines

### Firebase Integration

- Use Firebase modular API (v9+)
- Handle snapshot conversions properly
- Manage listener lifecycle correctly
- Support Firebase data converters

## API Patterns

### Observable Factory Pattern

Functions that create observables:

```typescript
function fromQuery<T>(query: Query): Observable<QuerySnapshot<T>>
```

### Operator Pattern

RxJS operators for stream transformation:

```typescript
function queryState<T>(): OperatorFunction<QuerySnapshot<T>, State<T[]>>
```

### State Object Pattern

Consistent state representation:

```typescript
interface State<T> {
  loading: boolean
  error: Error | undefined
  data: T | undefined
}
```

### Subject Pattern

Stateful observables with imperative control:

```typescript
class QuerySnapshotSubject<T> extends BehaviorSubject<State<T[]>> {
  // Manual state management with RxJS benefits
}
```

## Common Tasks

### Adding a New Observable Source

1. Create `src/observables/fromNewSource.ts`
2. Implement observable factory with proper cleanup
3. Add TypeScript types and JSDoc
4. Export from `src/index.ts`
5. Create test file `__tests__/observables/fromNewSource.test.ts`
6. Test emissions, errors, and completion

### Adding a New Operator

1. Create `src/operators/newOperator.ts`
2. Implement using RxJS `pipe` and existing operators
3. Ensure type safety through generics
4. Export from `src/index.ts`
5. Create comprehensive tests
6. Document usage patterns

### Updating Dependencies

```bash
# Update Firebase SDK
pnpm add firebase@latest

# Update RxJS (careful with major versions)
pnpm add rxjs@latest
```

## Build Configuration

### tsdown.config.mjs

- Builds ESM and CJS formats
- Generates TypeScript declarations
- Tree-shakeable output
- Preserves RxJS imports for bundler optimization

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

- Test environment: node (RxJS doesn't need DOM)
- Firebase SDK mocks configured
- Coverage thresholds for operators and observables
- Fast refresh for test development

### Test Patterns

```typescript
describe('fromQuery', () => {
  it('should emit snapshots on data changes', () => { ... });
  it('should handle query errors', () => { ... });
  it('should complete on unsubscribe', () => { ... });
  it('should cleanup Firebase listeners', () => { ... });
});

describe('queryState operator', () => {
  it('should transform snapshots to state objects', () => { ... });
  it('should set loading state initially', () => { ... });
  it('should handle errors in stream', () => { ... });
});
```

## Dependencies

### Peer Dependencies

- `rxjs` - Core RxJS library (user provides)
- `firebase` - Firebase SDK (user provides)

### Direct Dependencies

- Minimal runtime dependencies
- Firebase types included

### Dev Dependencies

- Build and test tooling
- RxJS testing utilities
- Type definitions

## Integration Examples

### Basic Observable Usage

```typescript
import { fromQuery, queryState } from '@valian/rxjs-firebase'
import { collection, query, where } from 'firebase/firestore'

const users$ = fromQuery(query(collection(db, 'users'), where('active', '==', true))).pipe(queryState())

users$.subscribe({
  next: ({ loading, data, error }) => {
    if (loading) console.log('Loading...')
    if (error) console.error(error)
    if (data) console.log('Users:', data)
  },
})
```

### With TypeScript

```typescript
interface User {
  name: string
  email: string
}

const users$ = fromQuery<User>(userQuery).pipe(queryState())
// Emits State<User[]>
```

### Advanced State Management

```typescript
import { QuerySnapshotSubject } from '@valian/rxjs-firebase'

const usersSubject = new QuerySnapshotSubject(userQuery)

// Imperative control when needed
usersSubject.next({ loading: true, data: undefined, error: undefined })

// Still reactive
usersSubject.subscribe((state) => console.log(state))
```

## Performance Considerations

### Memory Management

- Unsubscribe from observables when done
- Be cautious with long-lived subscriptions
- Use `take` or `first` operators for one-time reads

### Firebase Optimization

- Consider query indexes for complex queries
- Use document listeners sparingly
- Implement pagination for large collections
- Cache data when appropriate

### RxJS Optimization

- Use `shareReplay` for expensive operations
- Avoid nested subscriptions (use `switchMap`, `mergeMap`)
- Consider cold vs. hot observables

## Publishing

- Automated via root-level GitHub Actions
- Version bumped based on conventional commits
- Built artifacts published to npm
- Git tags created for releases

## Troubleshooting

### Observable not emitting

- Check Firebase listener is attached
- Verify query/document exists
- Check for errors in stream

### Memory leaks

- Ensure all subscriptions are unsubscribed
- Check for retained Firebase listeners
- Use RxJS tools to debug subscriptions

### Type errors

- Ensure RxJS types are installed
- Check generic type parameters
- Verify Firebase types compatibility

### Operator behavior issues

- Test operators in isolation
- Use marble diagrams for complex cases
- Check operator ordering in pipe

## Related Documentation

- Root monorepo AGENTS.md for overall architecture
- `@valian/react-firestore` for React-specific hooks
- [RxJS Documentation](https://rxjs.dev)
- [Firebase Firestore Docs](https://firebase.google.com/docs/firestore)
- [RxJS Marble Testing](https://rxjs.dev/guide/testing/marble-testing)

## Notes for AI Assistants

- This package follows pure functional reactive programming
- Observables are the core abstraction - maintain their purity
- Always consider subscription lifecycle and cleanup
- RxJS operators should be composable and side-effect free
- Test asynchronous behavior thoroughly
- Consider both hot and cold observable patterns
- Respect RxJS best practices and conventions
- Be mindful of breaking changes in RxJS APIs
- Document observable behavior clearly (completion, errors, timing)
