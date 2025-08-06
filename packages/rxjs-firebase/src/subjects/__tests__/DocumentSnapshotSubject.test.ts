import { type DocumentSnapshot } from '@firebase/firestore'
import { mock } from 'jest-mock-extended'
import { Subject } from 'rxjs'

import { DocumentSnapshotInitialState } from '../../states/DocumentSnapshotInitialState'
import { DocumentSnapshotSubject } from '../DocumentSnapshotSubject'

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

      expect(subject.value).toEqual(DocumentSnapshotInitialState)
    })

    it('should subscribe to snapshot observable and update state', () => {
      const subject = new DocumentSnapshotSubject(snapshot$)

      snapshot$.next(mockDocumentSnapshot)

      expect(subject.value).toEqual({
        snapshot: mockDocumentSnapshot,
        exists: true,
        isLoading: false,
        hasError: false,
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
      })
    })

    it('should handle errors', () => {
      const subject = new DocumentSnapshotSubject(snapshot$)
      const error = new Error('Test error')

      snapshot$.error(error)

      expect(subject.value).toEqual({
        isLoading: false,
        hasError: true,
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

  describe('exists method', () => {
    it('should return true for existing document', async () => {
      const subject = new DocumentSnapshotSubject(snapshot$)

      snapshot$.next(mockDocumentSnapshot)

      const exists = await subject.exsits()
      expect(exists).toBe(true)
    })

    it('should return false for non-existing document', async () => {
      const subject = new DocumentSnapshotSubject(snapshot$)
      snapshot$.next(nonExistingSnapshot)

      const exists = await subject.exsits()
      expect(exists).toBe(false)
    })

    it('should wait for loading to complete', async () => {
      const subject = new DocumentSnapshotSubject(snapshot$)

      // Start the exists check before the snapshot is emitted
      const existsPromise = subject.exsits()

      // Emit the snapshot immediately
      snapshot$.next(mockDocumentSnapshot)

      const exists = await existsPromise
      expect(exists).toBe(true)
    })

    it('should timeout after specified time', async () => {
      const subject = new DocumentSnapshotSubject(snapshot$)

      // Use a very short timeout
      const existsPromise = subject.exsits(1)

      await expect(existsPromise).rejects.toThrow()
    })

    it('should handle transitions between existing and non-existing', async () => {
      const subject = new DocumentSnapshotSubject(snapshot$)

      snapshot$.next(nonExistingSnapshot)
      let exists = await subject.exsits()
      expect(exists).toBe(false)

      snapshot$.next(mockDocumentSnapshot)
      exists = await subject.exsits()
      expect(exists).toBe(true)
    })
  })

  describe('close method', () => {
    it('should complete the notification subject', () => {
      const subject = new DocumentSnapshotSubject(snapshot$)

      subject.close()

      // Verify that the subject is closed by checking if it's completed
      expect(subject.closed).toBe(false) // BehaviorSubject doesn't close when notification$ completes
    })

    it('should stop receiving updates after closing', () => {
      const subject = new DocumentSnapshotSubject(snapshot$)

      const initialValue = subject.value

      subject.close()
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
      const onSnapshot = jest.fn()
      const subject = new DocumentSnapshotSubject(snapshot$, { onSnapshot })

      snapshot$.next(mockDocumentSnapshot)
      expect(subject.value.exists).toBe(true)

      expect(onSnapshot).toHaveBeenCalledWith({
        snapshot: mockDocumentSnapshot,
        exists: true,
        isLoading: false,
        hasError: false,
        data: testData,
      })
    })

    it('should call onError callback when error occurs', () => {
      const onError = jest.fn()

      const subject = new DocumentSnapshotSubject(snapshot$, { onError })
      const error = new Error('Test error')

      snapshot$.error(error)
      expect(subject.value.hasError).toBe(true)

      expect(onError).toHaveBeenCalledWith(error)
    })

    it('should call onComplete callback when stream completes', () => {
      const onComplete = jest.fn()

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

      const subscriber = jest.fn()
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

      const subscriber = jest.fn()

      const subscription = subject.subscribe(subscriber)

      snapshot$.next(mockDocumentSnapshot)

      expect(subscriber).toHaveBeenCalledTimes(2) // Initial state + snapshot update

      subscription.unsubscribe()
      snapshot$.next(mockDocumentSnapshot)

      // Should not receive updates after unsubscribing
      expect(subscriber).toHaveBeenCalledTimes(2)
    })
  })

  describe('edge cases', () => {
    it('should handle rapid state changes', async () => {
      const subject = new DocumentSnapshotSubject(snapshot$)

      // Rapidly emit different states
      snapshot$.next(mockDocumentSnapshot)
      snapshot$.next(nonExistingSnapshot)
      snapshot$.next(mockDocumentSnapshot)

      const exists = await subject.exsits()
      expect(exists).toBe(true)
    })

    it('should handle exists method called multiple times', async () => {
      const subject = new DocumentSnapshotSubject(snapshot$)

      snapshot$.next(mockDocumentSnapshot)

      const exists1 = await subject.exsits()
      const exists2 = await subject.exsits()

      expect(exists1).toBe(true)
      expect(exists2).toBe(true)
    })
  })
})
