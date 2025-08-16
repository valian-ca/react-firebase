# @valian/zustand-firestore

Zustand stores for Firebase Firestore document and query snapshots with real-time updates and TypeScript support.

[![npm version](https://badge.fury.io/js/@valian%2Fzustand-firestore.svg)](https://badge.fury.io/js/@valian%2Fzustand-firestore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
pnpm add @valian/zustand-firestore
```

### Peer dependencies

Make sure these peers are installed in your app:

- `react` ^18 || ^19
- `react-dom` ^18 || ^19
- `firebase` ^11 || ^12
- `rxjs` ^7.8.0
- `zustand` ^5

## Usage

### useQueryStore

Subscribe to a Firestore query and read state from a Zustand store.

```typescript
import { useQueryStore } from '@valian/zustand-firestore'
import { useStore } from 'zustand'
import { collection, query, where } from 'firebase/firestore'
import { db } from './firebase'

interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: Date
}

export function TodoList() {
  const todosQuery = query(
    collection(db, 'todos'),
    where('completed', '==', false),
  )

  const store = useQueryStore<Todo>({
    query: todosQuery,
    onError: (error) => console.error('Firestore error:', error),
  })

  const { data, isLoading, empty, size, hasError } = useStore(store)

  if (isLoading) return <div>Loading...</div>
  if (hasError) return <div>Error loading todos</div>
  if (empty) return <div>No todos</div>

  return (
    <ul>
      {data.map((todo, index) => (
        <li key={index}>{todo.title}</li>
      ))}
      <li>Total: {size}</li>
    </ul>
  )
}
```

You can pass Firestore `SnapshotListenOptions` as props (e.g. `includeMetadataChanges: true`).

### useDocumentStore

Subscribe to a single document and read its state from a Zustand store.

```typescript
import { useDocumentStore } from '@valian/zustand-firestore'
import { useStore } from 'zustand'
import { doc } from 'firebase/firestore'
import { db } from './firebase'

interface User {
  name: string
  email: string
  avatar?: string
  createdAt: Date
}

export function UserProfile({ userId }: { userId: string }) {
  const ref = doc(db, 'users', userId)
  const store = useDocumentStore<User>({
    ref,
    onError: (error) => console.error('Firestore error:', error),
  })

  const { data, isLoading, exists, hasError } = useStore(store)

  if (isLoading) return <div>Loading...</div>
  if (hasError) return <div>Error loading user</div>
  if (!exists) return <div>User not found</div>

  return (
    <div>
      <h1>{data?.name}</h1>
      <p>{data?.email}</p>
    </div>
  )
}
```

#### Conditional subscription

Disable the subscription by passing `null` or `undefined`.

```typescript
export function MaybeUserProfile({ userId }: { userId?: string }) {
  const ref = userId ? doc(db, 'users', userId) : null
  const store = useDocumentStore<User>({ ref })
  const { data, isLoading, exists, disabled } = useStore(store)

  if (disabled) return <div>Select a user</div>
  if (isLoading) return <div>Loading...</div>
  if (!exists) return <div>User not found</div>

  return <div>{data?.name}</div>
}
```

## API (shapes)

Both stores expose the same state shapes as `@valian/rxjs-firebase`:

- Query store state includes: `data[]`, `size`, `empty`, `isLoading`, `hasError`, `disabled`, and `snapshot`.
- Document store state includes: `data?`, `exists?`, `isLoading`, `hasError`, `disabled`, and `snapshot`.

## License

MIT © [Valian](https://valian.ca)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please open an issue in the repository.
