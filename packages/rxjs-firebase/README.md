# RxJS Firebase

A collection of RxJS operators and utilities for working with Firebase.

## Operators

### queryState

Transforms a `QuerySnapshot` observable into a `QuerySnapshotState` observable with loading, error, and data states.

```typescript
import { fromQuery, queryState } from 'rxjs-firebase'

const query$ = fromQuery(collectionRef)
const state$ = query$.pipe(
  queryState({
    onSnapshot: (state) => console.log('State updated:', state),
    onError: (error) => console.error('Error:', error),
  }),
)

state$.subscribe((state) => {
  if (state.isLoading) {
    console.log('Loading...')
  } else if (state.hasError) {
    console.log('Error occurred')
  } else {
    console.log('Data:', state.data)
  }
})
```

### documentState

Transforms a `DocumentSnapshot` observable into a `DocumentSnapshotState` observable with loading, error, and data states.

```typescript
import { fromDocumentRef, documentState } from 'rxjs-firebase'

const doc$ = fromDocumentRef(documentRef)
const state$ = doc$.pipe(
  documentState({
    onSnapshot: (state) => console.log('State updated:', state),
    onError: (error) => console.error('Error:', error),
  }),
)

state$.subscribe((state) => {
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
```

## Source Functions

### fromQuery

Creates an observable from a Firestore query.

```typescript
import { fromQuery } from 'rxjs-firebase'

const query$ = fromQuery(collectionRef)
```

### fromDocumentRef

Creates an observable from a Firestore document reference.

```typescript
import { fromDocumentRef } from 'rxjs-firebase'

const doc$ = fromDocumentRef(documentRef)
```

### authState

Creates an observable from Firebase Auth state changes.

```typescript
import { authState } from 'rxjs-firebase'

const auth$ = authState()
```

## Subjects

### DocumentSnapshotSubject

A `BehaviorSubject` that manages document snapshot state with loading, error, and data states. Provides convenient methods for working with document data.

```typescript
import { fromDocumentRef, DocumentSnapshotSubject } from 'rxjs-firebase'

const doc$ = fromDocumentRef(documentRef)
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
const exists = await subject.exsits(5000) // 5 second timeout

// Clean up when done
subject.close()
```

#### Methods

- **`data`**: Getter that returns the current document data
- **`exsits(timeout?: number)`**: Returns a Promise that resolves to `true` if the document exists, `false` otherwise. Default timeout is 10 seconds.
- **`close()`**: Unsubscribes from the underlying observable and completes the subject

### QuerySnapshotSubject

A `BehaviorSubject` that manages query snapshot state with loading, error, and data states. Provides convenient methods for working with query results.

```typescript
import { fromQuery, QuerySnapshotSubject } from 'rxjs-firebase'

const query$ = fromQuery(collectionRef)
const subject = new QuerySnapshotSubject(query$, {
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
  }
})

// Access current data directly
const currentData = subject.data

// Clean up when done
subject.close()
```

#### Methods

- **`data`**: Getter that returns the current query results as an array
- **`close()`**: Unsubscribes from the underlying observable and completes the subject
