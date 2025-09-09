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
- `@tanstack/react-query` ^5.80.0
- `@sentry/core` ^9 || ^10
- `@sentry/react` ^9 || ^10
- `zod` ^3.23 || ^4
- `zod-firebase` ^2
- `zustand` ^5 (optional)

## Usage

### React Query integration (snapshot-aware options)

Use the provided options builders to integrate Firestore snapshots with TanStack Query. Subscriptions are automatically unsubscribed when queries are removed from the cache.

#### Document snapshot

```typescript
import { doc } from '@firebase/firestore'
import { useSuspenseQuery } from '@tanstack/react-query'
import { documentSnapshotQueryOptions } from '@valian/react-kitchen-sink/react-query'

export function UserProfile({ userId }: { userId: string }) {
  const { data } = useSuspenseQuery(
    documentSnapshotQueryOptions({
      queryKey: ['user', userId],
      ref: doc(db, 'users', userId),
    }),
  )

  if (!data.exists) return <div>User not found</div>
  return (
    <div>
      <h1>{data.data?.name}</h1>
      <p>{data.data?.email}</p>
    </div>
  )
}
```

Disable when there is no ref:

```typescript
const { data } = useSuspenseQuery(
  documentSnapshotQueryOptions({ queryKey: ['user', userId], ref: userId ? doc(db, 'users', userId) : null }),
)
```

#### Query snapshot

```typescript
import { collection, query, where } from '@firebase/firestore'
import { useQuery } from '@tanstack/react-query'
import { querySnapshotQueryOptions } from '@valian/react-kitchen-sink'

export function Todos({ userId }: { userId: string }) {
  const q = query(collection(db, 'todos'), where('userId', '==', userId))
  const { data } = useQuery(
    querySnapshotQueryOptions({
      queryKey: ['todos', userId],
      query: q,
    }),
  )

  if (data.isLoading) return <div>Loading…</div>
  if (data.empty) return <div>No todos</div>
  return (
    <ul>
      {data.data.map((t, i) => (
        <li key={i}>{t.title}</li>
      ))}
    </ul>
  )
}
```

#### Schema-aware variants (zod-firebase)

```typescript
import { z } from 'zod'
import { createFirestoreFactory } from 'zod-firebase'
import { useSuspenseQuery } from '@tanstack/react-query'
import { schemaDocumentSnapshotQueryOptions, schemaQuerySnapshotQueryOptions } from '@valian/react-kitchen-sink'

const User = z.object({ name: z.string(), email: z.string().email() })
const Users = createFirestoreFactory({ collection: 'users', zod: User })

export function SchemaUser({ userId }: { userId: string }) {
  const { data } = useSuspenseQuery(
    schemaDocumentSnapshotQueryOptions({
      queryKey: ['user', userId],
      factory: Users,
      id: userId,
    }),
  )
  return <div>{data.exists ? data.data?.name : 'Not found'}</div>
}

export function SchemaTodos({ userId }: { userId: string }) {
  const { data } = useSuspenseQuery(
    schemaQuerySnapshotQueryOptions({
      queryKey: ['todos', userId],
      factory: Users.query,
      query: { where: [['userId', '==', userId]] },
    }),
  )
  return <div>{data.size}</div>
}
```

### RxJS subjects integration

```typescript
import { doc } from '@firebase/firestore'
import { documentSnapshotSubject } from '@valian/react-kitchen-sink'

const subject = documentSnapshotSubject(doc(db, 'users', 'user123'))
const sub = subject.subscribe((state) => {
  if (state.isLoading) return
  if (!state.exists) return
  console.log(state.data)
})
sub.unsubscribe()
subject.complete()
```

Schema query subject:

```typescript
import { schemaQuerySnapshotSubject } from '@valian/react-kitchen-sink'

const subject = schemaQuerySnapshotSubject(Users.query, { where: [['userId', '==', userId]] })
```

### Zustand stores integration

Hooks that produce Zustand stores for schema-validated documents and queries.

```typescript
import { useStore } from 'zustand'
import { useSchemaDocumentStore, useSchemaQueryStore } from '@valian/react-kitchen-sink'

export function TypedTodos({ userId }: { userId: string }) {
  const queryStore = useSchemaQueryStore({
    factory: Users.query,
    query: { where: [['userId', '==', userId]] },
  })
  const { data, isLoading } = useStore(queryStore)
  if (isLoading) return <div>Loading…</div>
  return (
    <ul>
      {data.map((todo, i) => (
        <li key={i}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

### Schema helpers

- `firestoreDataConverter`
- `ZodSchemaError`

## License

MIT © [Valian](https://valian.ca)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please open an issue in the repository.
