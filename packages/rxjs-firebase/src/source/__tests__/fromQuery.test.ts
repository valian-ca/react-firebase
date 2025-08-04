import { onSnapshot, type Query, type QuerySnapshot, type SnapshotListenOptions } from '@firebase/firestore'
import { anyFunction, mock } from 'jest-mock-extended'
import { Observable } from 'rxjs'

import { fromQuery } from '../fromQuery'

jest.mock('@firebase/firestore', () => ({
  onSnapshot: jest.fn(),
}))

describe('fromQuery', () => {
  let mockQuery: Query
  let mockSnapshot: QuerySnapshot
  let mockUnsubscribe: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    mockUnsubscribe = jest.fn()
    mockQuery = mock<Query>()
    mockSnapshot = mock<QuerySnapshot>()

    jest.mocked(onSnapshot).mockReturnValue(mockUnsubscribe)
  })

  it('should create an Observable from a Query', () => {
    const observable = fromQuery(mockQuery)

    expect(observable).toBeInstanceOf(Observable)

    // Subscribe to trigger the onSnapshot call
    const subscription = observable.subscribe()
    subscription.unsubscribe()

    expect(onSnapshot).toHaveBeenCalledWith(
      mockQuery,
      { includeMetadataChanges: false },
      {
        next: anyFunction(),
        error: anyFunction(),
        complete: anyFunction(),
      },
    )
  })

  it('should use default options when none provided', () => {
    const observable = fromQuery(mockQuery)

    // Subscribe to trigger the onSnapshot call
    const subscription = observable.subscribe()
    subscription.unsubscribe()

    expect(onSnapshot).toHaveBeenCalledWith(mockQuery, { includeMetadataChanges: false }, expect.any(Object))
  })

  it('should use custom options when provided', () => {
    const customOptions: SnapshotListenOptions = {
      includeMetadataChanges: true,
    }

    const observable = fromQuery(mockQuery, customOptions)

    // Subscribe to trigger the onSnapshot call
    const subscription = observable.subscribe()
    subscription.unsubscribe()

    expect(onSnapshot).toHaveBeenCalledWith(mockQuery, customOptions, expect.any(Object))
  })

  it('should emit snapshot data when subscribed', (done) => {
    const observable = fromQuery(mockQuery)

    observable.subscribe({
      next: (snapshot) => {
        expect(snapshot).toBe(mockSnapshot)
        done()
      },
      error: done,
    })

    // Simulate Firebase calling the next callback
    const callbacks = jest.mocked(onSnapshot).mock.calls[0][2] as unknown as {
      next: (snapshot: QuerySnapshot) => void
      error: (error: Error) => void
      complete: () => void
    }
    callbacks.next(mockSnapshot)
  })

  it('should emit error when Firebase reports an error', (done) => {
    const testError = new Error('Firebase error')
    const observable = fromQuery(mockQuery)

    observable.subscribe({
      next: () => {},
      error: (error) => {
        expect(error).toBe(testError)
        done()
      },
    })

    // Simulate Firebase calling the error callback
    const callbacks = jest.mocked(onSnapshot).mock.calls[0][2] as unknown as {
      next: (snapshot: QuerySnapshot) => void
      error: (error: Error) => void
      complete: () => void
    }
    callbacks.error(testError)
  })

  it('should complete when Firebase completes', (done) => {
    const observable = fromQuery(mockQuery)

    observable.subscribe({
      complete: () => {
        expect(1).toBe(1) // Just to ensure complete is called
        done()
      },
    })

    // Simulate Firebase calling the complete callback
    const callbacks = jest.mocked(onSnapshot).mock.calls[0][2] as unknown as {
      next: (snapshot: QuerySnapshot) => void
      error: (error: Error) => void
      complete: () => void
    }
    callbacks.complete()
  })

  it('should unsubscribe from Firebase when Observable is unsubscribed', () => {
    const observable = fromQuery(mockQuery)
    const subscription = observable.subscribe()

    subscription.unsubscribe()

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple emissions correctly', (done) => {
    const observable = fromQuery(mockQuery)
    const emissions: QuerySnapshot[] = []

    observable.subscribe({
      next: (snapshot) => {
        emissions.push(snapshot)
        if (emissions.length === 2) {
          expect(emissions).toHaveLength(2)
          expect(emissions[0]).toBe(mockSnapshot)
          expect(emissions[1]).toBe(mockSnapshot)
          done()
        }
      },
      error: done,
    })

    const callbacks = jest.mocked(onSnapshot).mock.calls[0][2] as unknown as {
      next: (snapshot: QuerySnapshot) => void
      error: (error: Error) => void
      complete: () => void
    }
    callbacks.next(mockSnapshot)
    callbacks.next(mockSnapshot)
  })

  it('should work with generic types', () => {
    interface TestData {
      name: string
      age: number
    }

    const typedQuery = mock<Query<TestData, TestData>>()
    const observable = fromQuery<TestData, TestData>(typedQuery)

    // Subscribe to trigger the onSnapshot call
    const subscription = observable.subscribe()
    subscription.unsubscribe()

    expect(observable).toBeInstanceOf(Observable)
    expect(onSnapshot).toHaveBeenCalledWith(typedQuery, { includeMetadataChanges: false }, expect.any(Object))
  })

  it('should return unsubscribe function from Observable subscription', () => {
    const observable = fromQuery(mockQuery)

    const subscription = observable.subscribe()

    expect(typeof subscription.unsubscribe).toBe('function')
    subscription.unsubscribe()
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple subscribers correctly', () => {
    const observable = fromQuery(mockQuery)
    const subscription1 = observable.subscribe()
    const subscription2 = observable.subscribe()

    subscription1.unsubscribe()
    subscription2.unsubscribe()

    // Each subscription should call onSnapshot once
    expect(onSnapshot).toHaveBeenCalledTimes(2)
    expect(mockUnsubscribe).toHaveBeenCalledTimes(2)
  })

  it('should handle complex query options', () => {
    const complexOptions: SnapshotListenOptions = {
      includeMetadataChanges: true,
    }

    const observable = fromQuery(mockQuery, complexOptions)

    // Subscribe to trigger the onSnapshot call
    const subscription = observable.subscribe()
    subscription.unsubscribe()

    expect(onSnapshot).toHaveBeenCalledWith(mockQuery, complexOptions, expect.any(Object))
  })
})
