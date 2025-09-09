import { type DocumentReference, type DocumentSnapshot, type SnapshotListenOptions } from '@firebase/firestore'
import { type Observer } from 'rxjs'
import { TestScheduler } from 'rxjs/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { fromDocumentRef } from '../../source'
import { type DocumentSnapshotState } from '../../states'
import { documentSnapshot } from '../documentSnapshot'

vi.mock('../../source/fromDocumentRef')

describe('documentSnapshot operator', () => {
  let testScheduler: TestScheduler

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected)
    })
    vi.clearAllMocks()
  })

  it('emits loading and data states when ref is provided', () => {
    testScheduler.run(({ cold, flush }) => {
      const ref = mock<DocumentReference>()
      const snapshot = mock<DocumentSnapshot>()
      const testData = { id: '1', name: 'Doc' }
      snapshot.exists.mockReturnValue(true)
      snapshot.data.mockReturnValue(testData)

      vi.mocked(fromDocumentRef).mockReturnValue(cold('-s|', { s: snapshot }))

      const source$ = cold('a----|', { a: ref })
      const result$ = source$.pipe(documentSnapshot())

      const loading: DocumentSnapshotState = { isLoading: true, hasError: false, disabled: false }
      const withData: DocumentSnapshotState = {
        snapshot,
        exists: true,
        isLoading: false,
        hasError: false,
        disabled: false,
        data: testData,
      }

      const mockObserver = mock<Observer<DocumentSnapshotState>>()
      result$.subscribe(mockObserver)

      flush()

      expect(mockObserver.next).toHaveBeenNthCalledWith(1, loading)
      expect(mockObserver.next).toHaveBeenNthCalledWith(2, withData)
      expect(mockObserver.complete).toHaveBeenCalledAfter(mockObserver.next)
    })
  })

  it('emits disabled state when input ref is null or undefined', () => {
    testScheduler.run(({ cold, flush }) => {
      const source$ = cold('ab|', { a: null, b: undefined })
      const result$ = source$.pipe(documentSnapshot())

      const disabled: DocumentSnapshotState = { isLoading: false, hasError: false, disabled: true }

      const mockObserver = mock<Observer<DocumentSnapshotState>>()
      result$.subscribe(mockObserver)

      flush()

      expect(mockObserver.next).toHaveBeenNthCalledWith(1, disabled)
      expect(mockObserver.next).toHaveBeenNthCalledWith(2, disabled)
      expect(mockObserver.complete).toHaveBeenCalledAfter(mockObserver.next)
    })
  })

  it('forwards options to fromDocumentRef', () => {
    testScheduler.run(({ cold, flush }) => {
      const ref = mock<DocumentReference>()
      const snapshot = mock<DocumentSnapshot>()
      snapshot.exists.mockReturnValue(false)

      const options: SnapshotListenOptions = { includeMetadataChanges: true }

      const spy = vi.mocked(fromDocumentRef).mockReturnValue(cold('-s|', { s: snapshot }))

      const source$ = cold('a----|', { a: ref })
      const result$ = source$.pipe(documentSnapshot(undefined, options))

      const loading: DocumentSnapshotState = { isLoading: true, hasError: false, disabled: false }
      const notExists: DocumentSnapshotState = {
        snapshot,
        exists: false,
        isLoading: false,
        hasError: false,
        disabled: false,
      }

      const events: DocumentSnapshotState[] = []
      let completed = false
      result$.subscribe({
        next: (v) => events.push(v),
        complete: () => {
          completed = true
        },
      })

      flush()
      expect(events).toEqual([loading, notExists])
      expect(completed).toBe(true)
      expect(spy).toHaveBeenCalledWith(ref, options)
    })
  })

  it('invokes listener callbacks (onSnapshot and onComplete); onError is invoked on errors', () => {
    testScheduler.run(({ cold, flush }) => {
      const ref = mock<DocumentReference>()
      const snapshot = mock<DocumentSnapshot>()
      const testData = { id: '1' }
      snapshot.exists.mockReturnValue(true)
      snapshot.data.mockReturnValue(testData)

      const onSnapshot = vi.fn()
      const onError = vi.fn()
      const onComplete = vi.fn()

      vi.mocked(fromDocumentRef).mockReturnValue(cold('s|', { s: snapshot }))

      const source$ = cold('a---|', { a: ref })
      const result$ = source$.pipe(documentSnapshot({ onSnapshot, onError, onComplete }))

      const loading: DocumentSnapshotState = { isLoading: true, hasError: false, disabled: false }

      const events: DocumentSnapshotState[] = []
      let completed = false
      result$.subscribe({
        next: (v) => events.push(v),
        complete: () => {
          completed = true
        },
      })

      flush()

      expect(events[0]).toEqual(loading)
      expect(events[1]).toEqual(
        expect.objectContaining({ exists: true, isLoading: false, hasError: false, data: testData }),
      )
      expect(completed).toBe(true)

      expect(onSnapshot).toHaveBeenCalledWith(
        expect.objectContaining({ exists: true, isLoading: false, hasError: false, data: testData }),
      )
      expect(onComplete).toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    })
  })

  it('handles inner errors and produces error state while calling onError', () => {
    testScheduler.run(({ cold, flush }) => {
      const ref = mock<DocumentReference>()
      const error = new Error('boom')

      const onError = vi.fn()

      vi.mocked(fromDocumentRef).mockReturnValue(cold('#', {}, error))

      const source$ = cold('a---|', { a: ref })
      const result$ = source$.pipe(documentSnapshot({ onError }))

      const errorState: DocumentSnapshotState = { isLoading: false, hasError: true, disabled: false }

      const events: DocumentSnapshotState[] = []
      let completed = false
      result$.subscribe({
        next: (v) => events.push(v),
        complete: () => {
          completed = true
        },
      })

      flush()

      expect(events[0]).toEqual({ isLoading: true, hasError: false, disabled: false })
      expect(events[1]).toEqual(errorState)
      expect(completed).toBe(false)
      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    })
  })
})
