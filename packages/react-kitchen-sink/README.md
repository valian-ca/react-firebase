# @valian/react-kitchen-sink

Kitchen-sink helpers that combine `@valian/rxjs-firebase` and `@valian/zustand-firestore` with React Query, Sentry, and zod-firebase. Includes ready-to-use subjects, React Query options, and schema-aware hooks.

[![npm version](https://badge.fury.io/js/@valian%2Freact-kitchen-sink.svg)](https://badge.fury.io/js/@valian%2Freact-kitchen-sink)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
pnpm add @valian/react-kitchen-sink
```

### Peer dependencies

Ensure these peers are installed as required by your setup:

- `react` ^18 || ^19
- `react-dom` ^18 || ^19
- `firebase` ^11 || ^12
- `rxjs` ^7.8.0
- `zustand` ^5
- `@tanstack/react-query` ^5.80.0
- `@sentry/core` ^9 || ^10
- `@sentry/react` ^9 || ^10
- `zod-firebase` ^1.7.0 (only for schema utilities)

## Setup

Initialize Firebase in your app:

```typescript
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  // your config
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
```

## Usage

### React Query integration

Use React Query options that keep cache entries in sync with Firestore subscriptions. Subscriptions are closed automatically when queries are removed from cache via `FirestoreSnaphotManager`.

```typescript
import { QueryClient, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { doc } from 'firebase/firestore'
import { db } from './firebase'
import { documentSnapshotQueryOptions, FirestoreSnaphotManager } from '@valian/react-kitchen-sink/react-query'

export function UserProfile({ userId }: { userId: string }) {
  const client = useQueryClient()
  const manager = new FirestoreSnaphotManager(client)

  const ref = doc(db, 'users', userId)
  const query = documentSnapshotQueryOptions(manager, {
    ref,
    waitForData: true,
  })

  const { data } = useSuspenseQuery(query)

  if (!data.exists) return <div>User not found</div>
  return (
    <div>
      <h1>{data.data?.name}</h1>
      <p>{data.data?.email}</p>
    </div>
  )
}
```

### Schema-aware hooks (zod-firebase)

Hooks that produce Zustand stores for schema-validated documents and queries.

```typescript
import { useStore } from 'zustand'
import { useSchemaDocumentStore, useSchemaQueryStore } from '@valian/react-kitchen-sink/hooks'
import { createFirestoreFactory, collectionSchema } from 'zod-firebase'

const Todos = collectionSchema({
  name: 'todos',
  schema: (z) =>
    z.object({
      title: z.string(),
      completed: z.boolean().default(false),
      createdAt: z.date(),
      userId: z.string(),
    }),
})

const factory = createFirestoreFactory(Todos)

export function TypedTodos({ userId }: { userId: string }) {
  const queryStore = useSchemaQueryStore({
    factory,
    query: { where: [['userId', '==', userId]] },
  })
  const { data, isLoading } = useStore(queryStore)
  if (isLoading) return <div>Loading...</div>
  return (
    <ul>
      {data.map((todo, i) => (
        <li key={i}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

## License

MIT © [Valian](https://valian.ca)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please open an issue in the repository.
