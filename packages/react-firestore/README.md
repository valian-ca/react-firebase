# @valian/react-firestore

React hooks for Firebase Firestore with real-time updates and TypeScript support

[![npm version](https://badge.fury.io/js/@valian%2Freact-firestore.svg)](https://badge.fury.io/js/@valian%2Freact-firestore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Description

`@valian/react-firestore` is a lightweight React hooks library that provides seamless integration with Firebase Firestore. It offers real-time data synchronization, TypeScript support, and comprehensive state management for your React applications.

### Key Features

- 🔄 **Real-time updates** - Automatic synchronization with Firestore using `onSnapshot`
- 📘 **Full TypeScript support** - Type-safe hooks with generic type parameters
- 🎯 **Simple API** - Easy-to-use hooks that handle loading, error, and data states
- ⚡ **Lightweight** - Minimal bundle size with zero dependencies
- 🛡️ **Error handling** - Built-in error management with optional custom error handlers
- 🔧 **Flexible** - Works with any Firestore query or document reference

## Getting Started

### Installation

```bash
pnpm add @valian/react-firestore
```

### Prerequisites

This library requires the following peer dependencies:

- `react` ^18 || ^19
- `react-dom` ^18 || ^19
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

### useCollection Hook

The `useCollection` hook subscribes to a Firestore collection and provides real-time updates.

#### Basic Usage

```typescript
import { useCollection } from '@valian/react-firestore'
import { collection, query, where } from 'firebase/firestore'
import { db } from './firebase'

function TodoList() {
  const todosQuery = query(
    collection(db, 'todos'),
    where('completed', '==', false)
  )

  const { data, isLoading, hasError } = useCollection({ query: todosQuery })

  if (isLoading) return <div>Loading...</div>
  if (hasError) return <div>Error loading todos</div>

  return (
    <ul>
      {data.map((todo, index) => (
        <li key={index}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

#### With TypeScript

```typescript
interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: Date
}

function TypedTodoList() {
  const todosQuery = query(collection(db, 'todos'))

  const { data, isLoading, empty, size } = useCollection<Todo>({
    query: todosQuery
  })

  return (
    <div>
      <h2>Todos ({size})</h2>
      {empty ? (
        <p>No todos found</p>
      ) : (
        <ul>
          {data.map((todo) => (
            <li key={todo.id}>
              {todo.title} - {todo.completed ? '✓' : '○'}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

#### With Error Handling

```typescript
function TodoListWithErrorHandling() {
  const [errorMessage, setErrorMessage] = useState<string>('')

  const todosQuery = query(collection(db, 'todos'))

  const { data, isLoading, hasError } = useCollection({
    query: todosQuery,
    onError: (error) => {
      console.error('Firestore error:', error)
      setErrorMessage('Failed to load todos. Please try again.')
    }
  })

  if (isLoading) return <div>Loading todos...</div>
  if (hasError) return <div className="error">{errorMessage}</div>

  return (
    <ul>
      {data.map((todo, index) => (
        <li key={index}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

### useDocument Hook

The `useDocument` hook subscribes to a single Firestore document.

#### Basic Usage

```typescript
import { useDocument } from '@valian/react-firestore'
import { doc } from 'firebase/firestore'
import { db } from './firebase'

function UserProfile({ userId }: { userId: string }) {
  const userRef = doc(db, 'users', userId)
  const { data, isLoading, exists } = useDocument({ ref: userRef })

  if (isLoading) return <div>Loading user...</div>
  if (!exists) return <div>User not found</div>

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  )
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

function TypedUserProfile({ userId }: { userId: string }) {
  const userRef = doc(db, 'users', userId)
  const { data, isLoading, exists, hasError } = useDocument<User>({
    ref: userRef
  })

  if (isLoading) return <div>Loading...</div>
  if (hasError) return <div>Error loading user</div>
  if (!exists) return <div>User not found</div>

  return (
    <div className="user-profile">
      {data.avatar && <img src={data.avatar} alt={data.name} />}
      <h1>{data.name}</h1>
      <p>{data.email}</p>
      <small>Member since {data.createdAt.toLocaleDateString()}</small>
    </div>
  )
}
```

#### Conditional Document Loading

```typescript
function ConditionalUserProfile({ userId }: { userId?: string }) {
  // Pass null when you don't want to subscribe yet
  const userRef = userId ? doc(db, 'users', userId) : null
  const { data, isLoading, exists, isDisabled } = useDocument({ ref: userRef })

  if (isDisabled) return <div>Please select a user</div>
  if (isLoading) return <div>Loading...</div>
  if (!exists) return <div>User not found</div>

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  )
}
```

## API Reference

### useCollection

```typescript
const result = useCollection<AppModelType, DbModelType>({
  query: Query<AppModelType, DbModelType> | null,
  onError?: (error: unknown) => void
})
```

#### Parameters

- `query`: Firestore query object or `null` to disable the subscription
- `onError`: Optional error handler function

#### Returns

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

### useDocument

```typescript
const result = useDocument<AppModelType, DbModelType>({
  ref: DocumentReference<AppModelType, DbModelType> | null | undefined,
  onError?: (error: unknown) => void
})
```

#### Parameters

- `ref`: Firestore document reference, `null`, or `undefined` to disable
- `onError`: Optional error handler function

#### Returns

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

## Advanced Usage

### Dynamic Queries

```typescript
function FilteredTodos({ userId, completed }: { userId: string; completed?: boolean }) {
  const query = useMemo(() => {
    let q = query(collection(db, 'todos'), where('userId', '==', userId))

    if (completed !== undefined) {
      q = query(q, where('completed', '==', completed))
    }

    return q
  }, [userId, completed])

  const { data, isLoading } = useCollection({ query })

  // Component implementation...
}
```

### Combining Multiple Hooks

```typescript
function TodoApp({ userId }: { userId: string }) {
  // Get user info
  const userRef = doc(db, 'users', userId)
  const user = useDocument<User>({ ref: userRef })

  // Get user's todos
  const todosQuery = query(
    collection(db, 'todos'),
    where('userId', '==', userId)
  )
  const todos = useCollection<Todo>({ query: todosQuery })

  if (user.isLoading || todos.isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>{user.data?.name}'s Todos</h1>
      <TodoList todos={todos.data} />
    </div>
  )
}
```

## License

MIT © [Valian](https://valian.ca)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/valian-ca/react-firebase/issues) on GitHub.
