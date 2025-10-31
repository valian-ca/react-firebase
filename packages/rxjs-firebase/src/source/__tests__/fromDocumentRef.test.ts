import {
  type DocumentReference,
  type DocumentSnapshot,
  onSnapshot,
  type SnapshotListenOptions,
  type Unsubscribe,
} from '@firebase/firestore'
import { Observable } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { anyFunction, mock } from 'vitest-mock-extended'

import { fromDocumentRef } from '../fromDocumentRef'

vi.mock('@firebase/firestore', () => ({
  onSnapshot: vi.fn(),
}))

describe('fromDocumentRef', () => {
  let mockRef: DocumentReference
  let mockSnapshot: DocumentSnapshot
  let mockUnsubscribe: ReturnType<typeof vi.fn<Unsubscribe>>

  beforeEach(() => {
    mockUnsubscribe = vi.fn()
    mockRef = mock<DocumentReference>()
    mockSnapshot = mock<DocumentSnapshot>()

    vi.mocked(onSnapshot).mockReturnValue(mockUnsubscribe)
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

  it('should emit snapshot data when subscribed', async () => {
    const observable = fromDocumentRef(mockRef)
    await new Promise<void>((resolve, reject) => {
      const subscription = observable.subscribe({
        next: (snapshot) => {
          expect(snapshot).toBe(mockSnapshot)
          subscription.unsubscribe()
          resolve()
        },
        error: reject,
      })

      const callbacks = vi.mocked(onSnapshot).mock.calls.at(-1)?.[2] as unknown as {
        next: (snapshot: DocumentSnapshot) => void
        error: (error: Error) => void
        complete: () => void
      }
      callbacks.next(mockSnapshot)
    })
  })

  it('should emit error when Firebase reports an error', async () => {
    const testError = new Error('Firebase error')
    const observable = fromDocumentRef(mockRef)

    await new Promise<void>((resolve) => {
      const subscription = observable.subscribe({
        error: (error) => {
          expect(error).toBe(testError)
          subscription.unsubscribe()
          resolve()
        },
      })

      const callbacks = vi.mocked(onSnapshot).mock.calls.at(-1)?.[2] as unknown as {
        next: (snapshot: DocumentSnapshot) => void
        error: (error: Error) => void
        complete: () => void
      }
      callbacks.error(testError)
    })
  })

  it('should complete when Firebase completes', async () => {
    const observable = fromDocumentRef(mockRef)

    await new Promise<void>((resolve, reject) => {
      const subscription = observable.subscribe({
        complete: () => {
          expect(1).toBe(1)
          subscription.unsubscribe()
          resolve()
        },
        error: reject,
      })

      const callbacks = vi.mocked(onSnapshot).mock.calls.at(-1)?.[2] as unknown as {
        next: (snapshot: DocumentSnapshot) => void
        error: (error: Error) => void
        complete: () => void
      }
      callbacks.complete()
    })
  })

  it('should unsubscribe from Firebase when Observable is unsubscribed', () => {
    const observable = fromDocumentRef(mockRef)
    const subscription = observable.subscribe()

    subscription.unsubscribe()

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple emissions correctly', async () => {
    const observable = fromDocumentRef(mockRef)
    const emissions: DocumentSnapshot[] = []

    await new Promise<void>((resolve, reject) => {
      const subscription = observable.subscribe({
        next: (snapshot) => {
          emissions.push(snapshot)
          if (emissions.length === 2) {
            expect(emissions).toHaveLength(2)
            expect(emissions[0]).toEqual(mockSnapshot)
            expect(emissions[1]).toEqual(mockSnapshot)
            subscription.unsubscribe()
            resolve()
          }
        },
        error: reject,
      })

      const callbacks = vi.mocked(onSnapshot).mock.calls.at(-1)?.[2] as unknown as {
        next: (snapshot: DocumentSnapshot) => void
        error: (error: Error) => void
        complete: () => void
      }
      callbacks.next(mockSnapshot)
      callbacks.next(mockSnapshot)
    })
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
