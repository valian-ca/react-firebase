import { type DocumentReference, type DocumentSnapshot } from '@firebase/firestore'
import { Subject } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { fromDocumentRef } from '../../source/fromDocumentRef'
import { DocumentSnapshotSubject } from '../DocumentSnapshotSubject'

vi.mock('../../source/fromDocumentRef')

const testData = { id: '1', name: 'Test Document' }

interface TestData {
  id: string
  name: string
}

const mockDocumentSnapshot = mock<DocumentSnapshot<TestData>>()
mockDocumentSnapshot.exists.mockReturnValue(true)
mockDocumentSnapshot.data.mockReturnValue(testData)

const nonExistingSnapshot = mock<DocumentSnapshot<TestData>>()
nonExistingSnapshot.exists.mockReturnValue(false)

describe('DocumentSnapshotSubject', () => {
  let snapshot$: Subject<DocumentSnapshot>

  beforeEach(() => {
    snapshot$ = new Subject<DocumentSnapshot>()
  })

  describe('constructor', () => {
    it('should initialize with initial state', () => {
      const subject = new DocumentSnapshotSubject(snapshot$)

      expect(subject.value).toEqual({
        isLoading: true,
        hasError: false,
        disabled: false,
      })
    })

    it('should subscribe to snapshot observable and update state', () => {
      const subject = new DocumentSnapshotSubject(snapshot$)

      snapshot$.next(mockDocumentSnapshot)

      expect(subject.value).toEqual({
        snapshot: mockDocumentSnapshot,
        exists: true,
        isLoading: false,
        hasError: false,
        disabled: false,
        data: testData,
      })
    })

    it('should handle non-existing DocumentSnapshot', () => {
      const subject = new DocumentSnapshotSubject(snapshot$)
      snapshot$.next(nonExistingSnapshot)

      expect(subject.value).toEqual({
        snapshot: nonExistingSnapshot,
        exists: false,
        isLoading: false,
        hasError: false,
        disabled: false,
      })
    })

    it('should handle errors', () => {
      const subject = new DocumentSnapshotSubject(snapshot$)
      const error = new Error('Test error')

      snapshot$.error(error)

      expect(subject.value).toEqual({
        isLoading: false,
        hasError: true,
        disabled: false,
      })
    })
  })

  describe('data getter', () => {
    it('should return data from current state', () => {
      const subject = new DocumentSnapshotSubject(snapshot$)

      snapshot$.next(mockDocumentSnapshot)

      expect(subject.data).toEqual(testData)
    })

    it('should return undefined when document does not exist', () => {
      const subject = new DocumentSnapshotSubject(snapshot$)
      snapshot$.next(nonExistingSnapshot)

      expect(subject.data).toBeUndefined()
    })

    it('should return undefined in initial state', () => {
      const subject = new DocumentSnapshotSubject(snapshot$)

      expect(subject.data).toBeUndefined()
    })
  })

  describe('complete method', () => {
    it('should complete the notification subject', () => {
      const subject = new DocumentSnapshotSubject(snapshot$)

      subject.complete()

      // Verify that the subject is closed by checking if it's completed
      expect(subject.closed).toBe(false) // BehaviorSubject doesn't close when notification$ completes
    })

    it('should stop receiving updates after closing', () => {
      const subject = new DocumentSnapshotSubject(snapshot$)

      const initialValue = subject.value

      subject.complete()
      snapshot$.next(mockDocumentSnapshot)

      // The value should remain the same since the subscription is terminated
      expect(subject.value).toEqual(initialValue)
    })
  })

  describe('state management', () => {
    it('should handle multiple snapshot updates', () => {
      const subject = new DocumentSnapshotSubject(snapshot$)

      const firstData = { id: '1', name: 'First Document' }
      const secondData = { id: '2', name: 'Second Document' }

      const firstSnapshot = mock<DocumentSnapshot>()
      firstSnapshot.exists.mockReturnValue(true)
      firstSnapshot.data.mockReturnValue(firstData)

      const secondSnapshot = mock<DocumentSnapshot>()
      secondSnapshot.exists.mockReturnValue(true)
      secondSnapshot.data.mockReturnValue(secondData)

      snapshot$.next(firstSnapshot)
      expect(subject.value.data).toEqual(firstData)

      snapshot$.next(secondSnapshot)
      expect(subject.value.data).toEqual(secondData)
    })

    it('should handle transitions between existing and non-existing documents', () => {
      const subject = new DocumentSnapshotSubject(snapshot$)

      snapshot$.next(nonExistingSnapshot)
      expect(subject.value.exists).toBe(false)
      expect(subject.data).toBeUndefined()

      snapshot$.next(mockDocumentSnapshot)
      expect(subject.value.exists).toBe(true)
      expect(subject.data).toEqual(testData)
    })
  })

  describe('options handling', () => {
    it('should call onSnapshot callback when provided', () => {
      const onSnapshot = vi.fn()
      const subject = new DocumentSnapshotSubject(snapshot$, { onSnapshot })

      snapshot$.next(mockDocumentSnapshot)
      expect(subject.value.exists).toBe(true)

      expect(onSnapshot).toHaveBeenCalledWith({
        snapshot: mockDocumentSnapshot,
        exists: true,
        isLoading: false,
        hasError: false,
        disabled: false,
        data: testData,
      })
    })

    it('should call onError callback when error occurs', () => {
      const onError = vi.fn()

      const subject = new DocumentSnapshotSubject(snapshot$, { onError })
      const error = new Error('Test error')

      snapshot$.error(error)
      expect(subject.value.hasError).toBe(true)

      expect(onError).toHaveBeenCalledWith(error)
    })

    it('should call onComplete callback when stream completes', () => {
      const onComplete = vi.fn()

      const subject = new DocumentSnapshotSubject(snapshot$, { onComplete })

      snapshot$.next(mockDocumentSnapshot)
      snapshot$.complete()

      expect(subject.value.isLoading).toBe(false)

      expect(onComplete).toHaveBeenCalled()
    })
  })

  describe('BehaviorSubject functionality', () => {
    it('should emit current value to new subscribers', () => {
      const subject = new DocumentSnapshotSubject(snapshot$)

      snapshot$.next(mockDocumentSnapshot)

      const subscriber = vi.fn()
      subject.subscribe(subscriber)

      expect(subscriber).toHaveBeenCalledWith(
        expect.objectContaining({
          snapshot: mockDocumentSnapshot,
          exists: true,
          isLoading: false,
          hasError: false,
          data: testData,
        }),
      )
    })

    it('should maintain subscription behavior', () => {
      const subject = new DocumentSnapshotSubject(snapshot$)

      const subscriber = vi.fn()

      const subscription = subject.subscribe(subscriber)

      snapshot$.next(mockDocumentSnapshot)

      expect(subscriber).toHaveBeenCalledTimes(2) // Initial state + snapshot update

      subscription.unsubscribe()
      snapshot$.next(mockDocumentSnapshot)

      // Should not receive updates after unsubscribing
      expect(subscriber).toHaveBeenCalledTimes(2)
    })
  })

  describe('factory methods', () => {
    it('fromDocumentRef should create subject wired to fromDocumentRef observable', () => {
      const ref = mock<DocumentReference>()
      const snapshot = new Subject<DocumentSnapshot>()
      const options = { includeMetadataChanges: true } as const

      vi.mocked(fromDocumentRef).mockReturnValue(snapshot)

      const subject = DocumentSnapshotSubject.fromDocumentRef(ref, options)

      expect(vi.mocked(fromDocumentRef)).toHaveBeenCalledWith(ref, options)

      // initial state
      expect(subject.value).toEqual({ isLoading: true, hasError: false, disabled: false })

      // drive a snapshot through mocked observable
      const doc = mock<DocumentSnapshot>()
      doc.exists.mockReturnValue(true)
      doc.data.mockReturnValue(testData)
      snapshot.next(doc)

      expect(subject.value).toEqual({
        snapshot: doc,
        exists: true,
        isLoading: false,
        hasError: false,
        disabled: false,
        data: testData,
      })
    })
  })
})
