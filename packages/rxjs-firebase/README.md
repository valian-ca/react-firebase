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

---

## documentSnapshotState and querySnapshotState

These are the primary operators that map Firestore snapshots into well-typed state objects.

### documentSnapshotState

```typescript
import { doc } from '@firebase/firestore'
import { fromDocumentRef, documentSnapshotState } from '@valian/rxjs-firebase'

const userRef = doc(db, 'users', userId)
const userState$ = fromDocumentRef(userRef).pipe(
  documentSnapshotState({
    onSnapshot: (state) => console.log('exists', state.exists),
    onError: (error) => console.error(error),
  }),
)
```

With an immediate loading emission:

```typescript
import { fromDocumentRef, documentSnapshotState, startWithDocumentSnapshotLoadingState } from '@valian/rxjs-firebase'

const userState$ = fromDocumentRef(userRef).pipe(documentSnapshotState(), startWithDocumentSnapshotLoadingState())
```

This is useful when you want subscribers to get an initial `{ isLoading: true }` state synchronously before Firestore returns the first snapshot.

### querySnapshotState

```typescript
import { collection, query, where } from '@firebase/firestore'
import { fromQuery, querySnapshotState } from '@valian/rxjs-firebase'

const todosQuery = query(collection(db, 'todos'), where('userId', '==', userId))
const todosState$ = fromQuery(todosQuery).pipe(
  querySnapshotState({
    onSnapshot: (state) => console.log('size', state.size),
  }),
)
```

With an immediate loading emission:

```typescript
import { fromQuery, querySnapshotState, startWithQuerySnapshotLoadingState } from '@valian/rxjs-firebase'

const todosState$ = fromQuery(todosQuery).pipe(querySnapshotState(), startWithQuerySnapshotLoadingState())
```

When queries or refs can be null/undefined at times, prefer the `documentSnapshot` / `querySnapshot` operators below.

---

## Source functions

### fromDocumentRef

Creates an observable of `DocumentSnapshot`.

```typescript
import { doc } from '@firebase/firestore'
import { fromDocumentRef } from '@valian/rxjs-firebase'

const user$ = fromDocumentRef(doc(db, 'users', 'user123'))
```

### fromQuery

Creates an observable of `QuerySnapshot`.

```typescript
import { collection, orderBy, query, where } from '@firebase/firestore'
import { fromQuery } from '@valian/rxjs-firebase'

const base = query(collection(db, 'todos'))
const todos$ = fromQuery(base)

const activeTodos$ = fromQuery(
  query(collection(db, 'todos'), where('completed', '==', false), orderBy('createdAt', 'desc')),
)
```

### authState

Creates an observable of Firebase Auth user.

```typescript
import { authState } from '@valian/rxjs-firebase'

const auth$ = authState()
```

---

## Subjects

### DocumentSnapshotSubject

`BehaviorSubject` that tracks a document state.

```typescript
import { doc } from '@firebase/firestore'
import { DocumentSnapshotSubject } from '@valian/rxjs-firebase'

const subject = DocumentSnapshotSubject.fromDocumentRef(doc(db, 'users', 'user123'))

const sub = subject.subscribe((state) => {
  if (state.isLoading) return
  if (!state.exists) return console.log('Not found')
  console.log(state.data)
})

sub.unsubscribe()
subject.complete()
```

### QuerySnapshotSubject

`BehaviorSubject` that tracks a query state.

```typescript
import { collection, query } from '@firebase/firestore'
import { QuerySnapshotSubject } from '@valian/rxjs-firebase'

const subject = QuerySnapshotSubject.fromQuery(query(collection(db, 'todos')))

const sub = subject.subscribe((state) => {
  if (state.isLoading) return
  console.log(state.size, state.data)
})

sub.unsubscribe()
subject.complete()
```

---

## Nullable-aware operators and async helpers

### documentSnapshot

Takes a stream of `DocumentReference | null | undefined` and emits a `DocumentSnapshotState`, yielding a `disabled` state when the ref is null/undefined.

```typescript
import { of } from 'rxjs'
import { documentSnapshot } from '@valian/rxjs-firebase'

of(userRef /* or null */)
  .pipe(documentSnapshot())
  .subscribe((state) => {
    if (state.disabled) return
    if (!state.exists) return
    console.log(state.data)
  })
```

### querySnapshot

Takes a stream of `Query | null | undefined` and emits a `QuerySnapshotState`, yielding a `disabled` state when the query is null/undefined.

```typescript
import { of } from 'rxjs'
import { querySnapshot } from '@valian/rxjs-firebase'

of(todosQuery /* or null */)
  .pipe(querySnapshot())
  .subscribe((state) => {
    if (state.disabled) return
    console.log(state.size)
  })
```

### documentExists

Wait until a document exists or time out.

```typescript
import { doc } from '@firebase/firestore'
import { documentExists, documentSnapshotState, fromDocumentRef } from '@valian/rxjs-firebase'

const exists = await documentExists(fromDocumentRef(doc(db, 'users', userId)).pipe(documentSnapshotState()), 5_000)
```

### waitForData

Await the first non-loading, non-disabled state for either document or query streams.

```typescript
import { waitForData } from '@valian/rxjs-firebase'

const ready = await waitForData(state$)
```

---

## Advanced Usage

### Dynamic Queries

```typescript
import { combineLatest, switchMap } from 'rxjs'
import { fromQuery, querySnapshotState } from '@valian/rxjs-firebase'

function createFilteredTodos(userId$: Observable<string>, completed$: Observable<boolean>) {
  return combineLatest([userId$, completed$]).pipe(
    switchMap(([userId, completed]) => {
      const q = query(collection(db, 'todos'), where('userId', '==', userId), where('completed', '==', completed))
      return fromQuery(q).pipe(querySnapshotState())
    }),
  )
}
```

### Combining Multiple Observables

```typescript
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'
import { fromDocumentRef, fromQuery, documentSnapshotState, querySnapshotState } from '@valian/rxjs-firebase'

function getUserWithTodos(userId: string) {
  const user$ = fromDocumentRef(doc(db, 'users', userId)).pipe(documentSnapshotState<User>())
  const todos$ = fromQuery(query(collection(db, 'todos'), where('userId', '==', userId))).pipe(
    querySnapshotState<Todo>(),
  )

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

---

## License

MIT © [Valian](https://valian.ca)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/valian-ca/react-firebase/issues) on GitHub.
