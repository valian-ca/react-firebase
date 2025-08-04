# @valian/rxjs-firebase

RxJS operators and utilities for Firebase with real-time updates and TypeScript support

[![npm version](https://badge.fury.io/js/@valian%2Frxjs-firebase.svg)](https://badge.fury.io/js/@valian%2Frxjs-firebase)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Description

`@valian/rxjs-firebase` is a lightweight RxJS library that provides seamless integration with Firebase services. It offers real-time data synchronization, TypeScript support, and comprehensive state management for your RxJS-based applications.

### Key Features

- 🔄 **Real-time updates** - Automatic synchronization with Firebase using `onSnapshot`
- 📘 **Full TypeScript support** - Type-safe operators and utilities with generic type parameters
- 🎯 **Simple API** - Easy-to-use operators that handle loading, error, and data states
- ⚡ **Lightweight** - Minimal bundle size with zero dependencies
- 🛡️ **Error handling** - Built-in error management with optional custom error handlers
- 🔧 **Flexible** - Works with any Firebase query, document reference, or auth state
- 📊 **State management** - Comprehensive state objects with loading, error, and data states

## Getting Started

### Installation

```bash
pnpm add @valian/rxjs-firebase
```

### Prerequisites

This library requires the following peer dependencies:

- `rxjs` ^7 || ^8
- `firebase` ^11 || ^12

### Setup

Make sure you have Firebase initialized in your project:

```typescript
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  // your config
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
```

## Usage Examples

### queryState Operator

The `queryState` operator transforms a `QuerySnapshot` observable into a `QuerySnapshotState` observable with loading, error, and data states.

#### Basic Usage

```typescript
import { fromQuery, queryState } from '@valian/rxjs-firebase'
import { collection, query, where } from 'firebase/firestore'
import { db } from './firebase'

const todosQuery = query(collection(db, 'todos'), where('completed', '==', false))

const todos$ = fromQuery(todosQuery).pipe(queryState())

todos$.subscribe((state) => {
  if (state.isLoading) {
    console.log('Loading todos...')
  } else if (state.hasError) {
    console.log('Error loading todos')
  } else {
    console.log('Todos:', state.data)
    console.log('Count:', state.size)
  }
})
```

#### With TypeScript

```typescript
interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: Date
}

const todosQuery = query(collection(db, 'todos'))

const todos$ = fromQuery<Todo>(todosQuery).pipe(queryState<Todo>())

todos$.subscribe((state) => {
  if (state.isLoading) {
    console.log('Loading...')
  } else if (state.hasError) {
    console.log('Error occurred')
  } else if (state.empty) {
    console.log('No todos found')
  } else {
    console.log(`Found ${state.size} todos:`)
    state.data.forEach((todo) => {
      console.log(`- ${todo.title} (${todo.completed ? '✓' : '○'})`)
    })
  }
})
```

#### With Error Handling

```typescript
const todos$ = fromQuery(todosQuery).pipe(
  queryState({
    onSnapshot: (state) => console.log('State updated:', state),
    onError: (error) => {
      console.error('Firestore error:', error)
      // Handle error appropriately
    },
  }),
)
```

### documentState Operator

The `documentState` operator transforms a `DocumentSnapshot` observable into a `DocumentSnapshotState` observable with loading, error, and data states.

#### Basic Usage

```typescript
import { fromDocumentRef, documentState } from '@valian/rxjs-firebase'
import { doc } from 'firebase/firestore'
import { db } from './firebase'

function getUserProfile(userId: string) {
  const userRef = doc(db, 'users', userId)
  const user$ = fromDocumentRef(userRef).pipe(documentState())

  return user$.subscribe((state) => {
    if (state.isLoading) {
      console.log('Loading user...')
    } else if (state.hasError) {
      console.log('Error loading user')
    } else if (!state.exists) {
      console.log('User not found')
    } else {
      console.log('User data:', state.data)
    }
  })
}
```

#### With TypeScript

```typescript
interface User {
  name: string
  email: string
  avatar?: string
  createdAt: Date
}

function getTypedUserProfile(userId: string) {
  const userRef = doc(db, 'users', userId)
  const user$ = fromDocumentRef<User>(userRef).pipe(documentState<User>())

  return user$.subscribe((state) => {
    if (state.isLoading) {
      console.log('Loading...')
    } else if (state.hasError) {
      console.log('Error loading user')
    } else if (!state.exists) {
      console.log('User not found')
    } else {
      const user = state.data
      console.log(`User: ${user.name} (${user.email})`)
      if (user.avatar) {
        console.log(`Avatar: ${user.avatar}`)
      }
    }
  })
}
```

### Source Functions

#### fromQuery

Creates an observable from a Firestore query.

```typescript
import { fromQuery } from '@valian/rxjs-firebase'
import { collection, query, where, orderBy } from '@firebase/firestore'

// Basic collection
const todos$ = fromQuery(collection(db, 'todos'))

// With filters and ordering
const activeTodos$ = fromQuery(
  query(collection(db, 'todos'), where('completed', '==', false), orderBy('createdAt', 'desc')),
)
```

#### fromDocumentRef

Creates an observable from a Firestore document reference.

```typescript
import { fromDocumentRef } from '@valian/rxjs-firebase'
import { doc } from 'firebase/firestore'

const user$ = fromDocumentRef(doc(db, 'users', 'user123'))
```

#### authState

Creates an observable from Firebase Auth state changes.

```typescript
import { authState } from '@valian/rxjs-firebase'

const auth$ = authState()

auth$.subscribe((user) => {
  if (user) {
    console.log('User signed in:', user.uid)
  } else {
    console.log('User signed out')
  }
})
```

### Subjects

#### DocumentSnapshotSubject

A `BehaviorSubject` that manages document snapshot state with loading, error, and data states. Provides convenient methods for working with document data.

```typescript
import { fromDocumentRef, DocumentSnapshotSubject } from '@valian/rxjs-firebase'
import { doc } from 'firebase/firestore'

const userRef = doc(db, 'users', 'user123')
const doc$ = fromDocumentRef(userRef)

const subject = new DocumentSnapshotSubject(doc$, {
  onSnapshot: (state) => console.log('State updated:', state),
  onError: (error) => console.error('Error:', error),
})

// Subscribe to state changes
subject.subscribe((state) => {
  if (state.isLoading) {
    console.log('Loading...')
  } else if (state.hasError) {
    console.log('Error occurred')
  } else if (state.exists) {
    console.log('Document data:', state.data)
  } else {
    console.log('Document does not exist')
  }
})

// Access current data directly
const currentData = subject.data

// Wait for document to exist (with timeout)
const exists = await subject.exists(5000) // 5 second timeout

// Clean up when done
subject.close()
```

#### QuerySnapshotSubject

A `BehaviorSubject` that manages query snapshot state with loading, error, and data states. Provides convenient methods for working with query results.

```typescript
import { fromQuery, QuerySnapshotSubject } from '@valian/rxjs-firebase'
import { collection } from 'firebase/firestore'

const todos$ = fromQuery(collection(db, 'todos'))

const subject = new QuerySnapshotSubject(todos$, {
  onSnapshot: (state) => console.log('State updated:', state),
  onError: (error) => console.error('Error:', error),
})

// Subscribe to state changes
subject.subscribe((state) => {
  if (state.isLoading) {
    console.log('Loading...')
  } else if (state.hasError) {
    console.log('Error occurred')
  } else {
    console.log('Query results:', state.data)
    console.log('Count:', state.size)
  }
})

// Access current data directly
const currentData = subject.data

// Clean up when done
subject.close()
```

## API Reference

### queryState

```typescript
const state$ = query$.pipe(
  queryState<AppModelType, DbModelType>({
    onSnapshot?: (state: QuerySnapshotState<AppModelType>) => void,
    onError?: (error: unknown) => void
  })
)
```

#### Parameters

- `onSnapshot`: Optional callback function called when state updates
- `onError`: Optional error handler function

#### Returns

An observable that emits `QuerySnapshotState<AppModelType>` objects with:

```typescript
{
  data: AppModelType[]        // Array of documents
  snapshot?: QuerySnapshot    // Firestore snapshot
  isLoading: boolean         // True while loading
  isDisabled: boolean        // True when query is null
  hasError: boolean          // True if error occurred
  empty: boolean            // True if collection is empty
  size: number              // Number of documents
}
```

### documentState

```typescript
const state$ = doc$.pipe(
  documentState<AppModelType, DbModelType>({
    onSnapshot?: (state: DocumentSnapshotState<AppModelType>) => void,
    onError?: (error: unknown) => void
  })
)
```

#### Parameters

- `onSnapshot`: Optional callback function called when state updates
- `onError`: Optional error handler function

#### Returns

An observable that emits `DocumentSnapshotState<AppModelType>` objects with:

```typescript
{
  data?: AppModelType          // Document data (undefined if loading/error/not exists)
  snapshot?: DocumentSnapshot  // Firestore snapshot
  isLoading: boolean          // True while loading
  isDisabled: boolean         // True when ref is null/undefined
  hasError: boolean           // True if error occurred
  exists?: boolean            // True if document exists
}
```

### fromQuery

```typescript
const query$ = fromQuery<AppModelType, DbModelType>(
  query: Query<AppModelType, DbModelType>
)
```

Creates an observable that emits `QuerySnapshot` objects when the query results change.

### fromDocumentRef

```typescript
const doc$ = fromDocumentRef<AppModelType, DbModelType>(
  ref: DocumentReference<AppModelType, DbModelType>
)
```

Creates an observable that emits `DocumentSnapshot` objects when the document changes.

### authState

```typescript
const auth$ = authState()
```

Creates an observable that emits the current user or `null` when authentication state changes.

### DocumentSnapshotSubject

```typescript
class DocumentSnapshotSubject<AppModelType> extends BehaviorSubject<DocumentSnapshotState<AppModelType>>
```

#### Methods

- **`data`**: Getter that returns the current document data
- **`exists(timeout?: number)`**: Returns a Promise that resolves to `true` if the document exists, `false` otherwise. Default timeout is 10 seconds.
- **`close()`**: Unsubscribes from the underlying observable and completes the subject

### QuerySnapshotSubject

```typescript
class QuerySnapshotSubject<AppModelType> extends BehaviorSubject<QuerySnapshotState<AppModelType>>
```

#### Methods

- **`data`**: Getter that returns the current query results as an array
- **`close()`**: Unsubscribes from the underlying observable and completes the subject

## Advanced Usage

### Dynamic Queries

```typescript
import { combineLatest, switchMap } from 'rxjs'
import { fromQuery, queryState } from '@valian/rxjs-firebase'

function createFilteredTodos(userId$: Observable<string>, completed$: Observable<boolean>) {
  return combineLatest([userId$, completed$]).pipe(
    switchMap(([userId, completed]) => {
      const query = query(collection(db, 'todos'), where('userId', '==', userId), where('completed', '==', completed))

      return fromQuery(query).pipe(queryState())
    }),
  )
}
```

### Combining Multiple Observables

```typescript
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'
import { fromDocumentRef, fromQuery, documentState, queryState } from '@valian/rxjs-firebase'

function getUserWithTodos(userId: string) {
  const user$ = fromDocumentRef(doc(db, 'users', userId)).pipe(documentState<User>())

  const todos$ = fromQuery(query(collection(db, 'todos'), where('userId', '==', userId))).pipe(queryState<Todo>())

  return combineLatest([user$, todos$]).pipe(
    map(([userState, todosState]) => ({
      user: userState.data,
      todos: todosState.data,
      isLoading: userState.isLoading || todosState.isLoading,
      hasError: userState.hasError || todosState.hasError,
    })),
  )
}
```

### Error Recovery

```typescript
import { catchError, retry } from 'rxjs/operators'
import { fromQuery, queryState } from '@valian/rxjs-firebase'

const todos$ = fromQuery(todosQuery).pipe(
  queryState({
    onError: (error) => console.error('Query error:', error),
  }),
  catchError((error) => {
    console.error('Recovering from error:', error)
    // Return a default state or re-throw
    return of({ data: [], isLoading: false, hasError: true, empty: true, size: 0 })
  }),
  retry(3), // Retry up to 3 times
)
```

## License

MIT © [Valian](https://valian.ca)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/valian-ca/react-firebase/issues) on GitHub.
