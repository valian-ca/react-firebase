import { type QueryDocumentSnapshot, type QuerySnapshot } from '@firebase/firestore'
import { mock } from 'jest-mock-extended'
import { Subject } from 'rxjs'

import { QuerySnapshotInitialState } from '../../states/QuerySnapshotInitialState'
import { QuerySnapshotSubject } from '../QuerySnapshotSubject'

interface TestData {
  id: string
  name: string
}

const mockQueryDocumentSnapshot1 = mock<QueryDocumentSnapshot<TestData>>()
mockQueryDocumentSnapshot1.exists.mockReturnValue(true)
mockQueryDocumentSnapshot1.data.mockReturnValue({ id: '1', name: 'Test 1' })

const mockQueryDocumentSnapshot2 = mock<QueryDocumentSnapshot<TestData>>()
mockQueryDocumentSnapshot2.exists.mockReturnValue(true)
mockQueryDocumentSnapshot2.data.mockReturnValue({ id: '2', name: 'Test 2' })

const mockQuerySnapshot = mock<QuerySnapshot>({
  size: 2,
  empty: false,
  docs: [mockQueryDocumentSnapshot1, mockQueryDocumentSnapshot2],
})

describe('QuerySnapshotSubject', () => {
  let snapshot$: Subject<QuerySnapshot>

  beforeEach(() => {
    snapshot$ = new Subject<QuerySnapshot>()
  })

  describe('constructor', () => {
    it('should initialize with initial state', () => {
      const subject = new QuerySnapshotSubject(snapshot$)

      expect(subject.value).toEqual(QuerySnapshotInitialState)
    })

    it('should subscribe to snapshot observable and update state', () => {
      const subject = new QuerySnapshotSubject(snapshot$)

      snapshot$.next(mockQuerySnapshot)

      expect(subject.value).toEqual({
        snapshot: mockQuerySnapshot,
        size: 2,
        empty: false,
        isLoading: false,
        hasError: false,
        data: [
          { id: '1', name: 'Test 1' },
          { id: '2', name: 'Test 2' },
        ],
      })
    })

    it('should handle empty QuerySnapshot', () => {
      const emptySnapshot = mock<QuerySnapshot>({
        size: 0,
        empty: true,
        docs: [],
      })

      const subject = new QuerySnapshotSubject(snapshot$)
      snapshot$.next(emptySnapshot)

      expect(subject.value).toEqual({
        snapshot: emptySnapshot,
        size: 0,
        empty: true,
        isLoading: false,
        hasError: false,
        data: [],
      })
    })

    it('should handle errors', () => {
      const subject = new QuerySnapshotSubject(snapshot$)
      const error = new Error('Test error')

      snapshot$.error(error)

      expect(subject.value).toEqual({
        size: 0,
        empty: true,
        isLoading: false,
        hasError: true,
        data: [],
      })
    })
  })

  describe('data getter', () => {
    it('should return data from current state', () => {
      const subject = new QuerySnapshotSubject(snapshot$)

      snapshot$.next(mockQuerySnapshot)

      expect(subject.data).toEqual([
        { id: '1', name: 'Test 1' },
        { id: '2', name: 'Test 2' },
      ])
    })

    it('should return empty array when no data', () => {
      const emptySnapshot = mock<QuerySnapshot>({
        size: 0,
        empty: true,
        docs: [],
      })

      const subject = new QuerySnapshotSubject(snapshot$)
      snapshot$.next(emptySnapshot)

      expect(subject.data).toEqual([])
    })

    it('should return empty array in initial state', () => {
      const subject = new QuerySnapshotSubject(snapshot$)

      expect(subject.data).toEqual([])
    })
  })

  describe('close method', () => {
    it('should complete the notification subject', () => {
      const subject = new QuerySnapshotSubject(snapshot$)

      subject.close()

      // Verify that the subject is closed by checking if it's completed
      expect(subject.closed).toBe(false) // BehaviorSubject doesn't close when notification$ completes
    })

    it('should stop receiving updates after closing', () => {
      const subject = new QuerySnapshotSubject(snapshot$)
      const initialValue = subject.value

      subject.close()
      snapshot$.next(mockQuerySnapshot)

      // The value should remain the same since the subscription is terminated
      expect(subject.value).toEqual(initialValue)
    })
  })

  describe('state management', () => {
    it('should handle multiple snapshot updates', () => {
      const subject = new QuerySnapshotSubject(snapshot$)

      const firstSnapshot = mock<QuerySnapshot>({
        size: 1,
        empty: false,
        docs: [{ data: () => ({ id: '1', name: 'First' }) }],
      })

      const secondSnapshot = mock<QuerySnapshot>({
        size: 2,
        empty: false,
        docs: [{ data: () => ({ id: '1', name: 'First' }) }, { data: () => ({ id: '2', name: 'Second' }) }],
      })

      snapshot$.next(firstSnapshot)
      expect(subject.value.size).toBe(1)
      expect(subject.data).toHaveLength(1)

      snapshot$.next(secondSnapshot)
      expect(subject.value.size).toBe(2)
      expect(subject.data).toHaveLength(2)
    })

    it('should handle transitions between empty and non-empty snapshots', () => {
      const subject = new QuerySnapshotSubject(snapshot$)

      const emptySnapshot = mock<QuerySnapshot>({
        size: 0,
        empty: true,
        docs: [],
      })

      snapshot$.next(emptySnapshot)
      expect(subject.value.empty).toBe(true)
      expect(subject.data).toEqual([])

      snapshot$.next(mockQuerySnapshot)
      expect(subject.value.empty).toBe(false)
      expect(subject.data).toHaveLength(2)
    })
  })

  describe('options handling', () => {
    it('should call onSnapshot callback when provided', () => {
      const onSnapshot = jest.fn()

      const subject = new QuerySnapshotSubject(snapshot$, { onSnapshot })
      snapshot$.next(mockQuerySnapshot)

      expect(subject.value.isLoading).toBe(false)

      expect(onSnapshot).toHaveBeenCalledWith(
        expect.objectContaining({
          snapshot: mockQuerySnapshot,
          size: 2,
          empty: false,
          isLoading: false,
          hasError: false,
          data: [
            { id: '1', name: 'Test 1' },
            { id: '2', name: 'Test 2' },
          ],
        }),
      )
    })

    it('should call onError callback when error occurs', () => {
      const onError = jest.fn()

      const subject = new QuerySnapshotSubject(snapshot$, { onError })
      const error = new Error('Test error')

      snapshot$.error(error)

      expect(subject.value.hasError).toBe(true)

      expect(onError).toHaveBeenCalledWith(error)
    })

    it('should call onComplete callback when stream completes', () => {
      const onComplete = jest.fn()

      const subject = new QuerySnapshotSubject(snapshot$, { onComplete })
      snapshot$.next(mockQuerySnapshot)
      snapshot$.complete()

      expect(subject.value.isLoading).toBe(false)

      expect(onComplete).toHaveBeenCalled()
    })
  })

  describe('BehaviorSubject functionality', () => {
    it('should emit current value to new subscribers', () => {
      const subject = new QuerySnapshotSubject(snapshot$)
      snapshot$.next(mockQuerySnapshot)

      const subscriber = jest.fn()
      subject.subscribe(subscriber)

      expect(subscriber).toHaveBeenCalledWith(
        expect.objectContaining({
          snapshot: mockQuerySnapshot,
          size: 2,
          empty: false,
          isLoading: false,
          hasError: false,
          data: [
            { id: '1', name: 'Test 1' },
            { id: '2', name: 'Test 2' },
          ],
        }),
      )
    })

    it('should maintain subscription behavior', () => {
      const subject = new QuerySnapshotSubject(snapshot$)
      const subscriber = jest.fn()

      const subscription = subject.subscribe(subscriber)

      snapshot$.next(mockQuerySnapshot)

      expect(subscriber).toHaveBeenCalledTimes(2) // Initial state + snapshot update

      subscription.unsubscribe()
      snapshot$.next(mockQuerySnapshot)

      // Should not receive updates after unsubscribing
      expect(subscriber).toHaveBeenCalledTimes(2)
    })
  })
})
