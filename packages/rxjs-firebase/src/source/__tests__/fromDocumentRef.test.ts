import {
  type DocumentReference,
  type DocumentSnapshot,
  onSnapshot,
  type SnapshotListenOptions,
} from '@firebase/firestore'
import { anyFunction, mock } from 'jest-mock-extended'
import { Observable } from 'rxjs'

import { fromDocumentRef } from '../fromDocumentRef'

jest.mock('@firebase/firestore', () => ({
  onSnapshot: jest.fn(),
}))

describe('fromDocumentRef', () => {
  let mockRef: DocumentReference
  let mockSnapshot: DocumentSnapshot
  let mockUnsubscribe: jest.Mock

  beforeEach(() => {
    mockUnsubscribe = jest.fn()
    mockRef = mock<DocumentReference>()
    mockSnapshot = mock<DocumentSnapshot>()

    jest.mocked(onSnapshot).mockReturnValue(mockUnsubscribe)
  })

  it('should create an Observable from a DocumentReference', () => {
    const observable = fromDocumentRef(mockRef)

    expect(observable).toBeInstanceOf(Observable)

    // Subscribe to trigger the onSnapshot call
    const subscription = observable.subscribe()
    subscription.unsubscribe()

    expect(onSnapshot).toHaveBeenCalledWith(
      mockRef,
      { includeMetadataChanges: false },
      {
        next: anyFunction(),
        error: anyFunction(),
        complete: anyFunction(),
      },
    )
  })

  it('should use default options when none provided', () => {
    const observable = fromDocumentRef(mockRef)

    // Subscribe to trigger the onSnapshot call
    const subscription = observable.subscribe()
    subscription.unsubscribe()

    expect(onSnapshot).toHaveBeenCalledWith(mockRef, { includeMetadataChanges: false }, expect.any(Object))
  })

  it('should use custom options when provided', () => {
    const customOptions: SnapshotListenOptions = {
      includeMetadataChanges: true,
    }

    const observable = fromDocumentRef(mockRef, customOptions)

    // Subscribe to trigger the onSnapshot call
    const subscription = observable.subscribe()
    subscription.unsubscribe()

    expect(onSnapshot).toHaveBeenCalledWith(mockRef, customOptions, expect.any(Object))
  })

  it('should emit snapshot data when subscribed', (done) => {
    const observable = fromDocumentRef(mockRef)

    observable.subscribe({
      next: (snapshot) => {
        expect(snapshot).toBe(mockSnapshot)
        done()
      },
      error: done,
    })

    // Simulate Firebase calling the next callback
    const callbacks = jest.mocked(onSnapshot).mock.calls[0][2] as unknown as {
      next: (snapshot: DocumentSnapshot) => void
      error: (error: Error) => void
      complete: () => void
    }
    callbacks.next(mockSnapshot)
  })

  it('should emit error when Firebase reports an error', (done) => {
    const testError = new Error('Firebase error')
    const observable = fromDocumentRef(mockRef)

    observable.subscribe({
      next: () => {},
      error: (error) => {
        expect(error).toBe(testError)
        done()
      },
    })

    // Simulate Firebase calling the error callback
    const callbacks = jest.mocked(onSnapshot).mock.calls[0][2] as unknown as {
      next: (snapshot: DocumentSnapshot) => void
      error: (error: Error) => void
      complete: () => void
    }
    callbacks.error(testError)
  })

  it('should complete when Firebase completes', (done) => {
    const observable = fromDocumentRef(mockRef)

    observable.subscribe({
      complete: () => {
        expect(1).toBe(1) // Just to ensure complete is called
        done()
      },
    })

    // Simulate Firebase calling the complete callback
    const callbacks = jest.mocked(onSnapshot).mock.calls[0][2] as unknown as {
      next: (snapshot: DocumentSnapshot) => void
      error: (error: Error) => void
      complete: () => void
    }
    callbacks.complete()
  })

  it('should unsubscribe from Firebase when Observable is unsubscribed', () => {
    const observable = fromDocumentRef(mockRef)
    const subscription = observable.subscribe()

    subscription.unsubscribe()

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple emissions correctly', (done) => {
    const observable = fromDocumentRef(mockRef)
    const emissions: DocumentSnapshot[] = []

    observable.subscribe({
      next: (snapshot) => {
        emissions.push(snapshot)
        if (emissions.length === 2) {
          expect(emissions).toHaveLength(2)
          expect(emissions[0]).toEqual(mockSnapshot)
          expect(emissions[1]).toEqual(mockSnapshot)
          done()
        }
      },
      error: done,
    })

    const callbacks = jest.mocked(onSnapshot).mock.calls[0][2] as unknown as {
      next: (snapshot: DocumentSnapshot) => void
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

    const typedRef = mock<DocumentReference<TestData, TestData>>()
    const observable = fromDocumentRef<TestData, TestData>(typedRef)

    // Subscribe to trigger the onSnapshot call
    const subscription = observable.subscribe()
    subscription.unsubscribe()

    expect(observable).toBeInstanceOf(Observable)
    expect(onSnapshot).toHaveBeenCalledWith(typedRef, { includeMetadataChanges: false }, expect.any(Object))
  })

  it('should return unsubscribe function from Observable subscription', () => {
    const observable = fromDocumentRef(mockRef)

    const subscription = observable.subscribe()

    expect(typeof subscription.unsubscribe).toBe('function')
    subscription.unsubscribe()
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
  })
})
