import { type QuerySnapshot } from '@firebase/firestore'
import { TestScheduler } from 'rxjs/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { type QuerySnapshotState } from '../../states'
import { querySnapshotState, type QuerySnapshotStateListener } from '../querySnapshotState'

const QuerySnapshotLoadingState = {
  empty: true,
  size: 0,
  isLoading: true,
  hasError: false,
  disabled: false,
  data: [],
} as const satisfies QuerySnapshotState

describe('querySnapshotState', () => {
  let testScheduler: TestScheduler

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected)
    })
  })

  it('should transform QuerySnapshot to QuerySnapshotState with data', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const mockDocs = [{ data: () => ({ id: '1', name: 'Test 1' }) }, { data: () => ({ id: '2', name: 'Test 2' }) }]

      const mockQuerySnapshot = mock<QuerySnapshot>({ size: 2, empty: false, docs: mockDocs })

      const source$ = cold('a', { a: mockQuerySnapshot })
      const result$ = source$.pipe(querySnapshotState())

      expectObservable(result$).toBe('(sx)', {
        s: QuerySnapshotLoadingState,
        x: {
          snapshot: mockQuerySnapshot,
          size: 2,
          empty: false,
          isLoading: false,
          hasError: false,
          disabled: false,
          data: [
            { id: '1', name: 'Test 1' },
            { id: '2', name: 'Test 2' },
          ],
        },
      })
    })
  })

  it('should handle empty QuerySnapshot', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const emptySnapshot = mock<QuerySnapshot>({ size: 0, empty: true, docs: [] })

      const source$ = cold('a', { a: emptySnapshot })
      const result$ = source$.pipe(querySnapshotState())

      expectObservable(result$).toBe('(sx)', {
        s: QuerySnapshotLoadingState,
        x: {
          snapshot: emptySnapshot,
          size: 0,
          empty: true,
          isLoading: false,
          hasError: false,
          disabled: false,
          data: [],
        },
      })
    })
  })

  it('should start with initial state', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const mockDocs = [{ data: () => ({ id: '1', name: 'Test 1' }) }, { data: () => ({ id: '2', name: 'Test 2' }) }]

      const mockQuerySnapshot = mock<QuerySnapshot>({ size: 2, empty: false, docs: mockDocs })

      const source$ = cold('a', { a: mockQuerySnapshot })
      const result$ = source$.pipe(querySnapshotState())

      expectObservable(result$).toBe('(sx)', {
        s: QuerySnapshotLoadingState,
        x: expect.objectContaining({
          snapshot: mockQuerySnapshot,
          isLoading: false,
          hasError: false,
        }),
      })
    })
  })

  it('should handle errors and return error state', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const error = new Error('Test error')
      const source$ = cold<QuerySnapshot>('#', {}, error)
      const result$ = source$.pipe(querySnapshotState())

      expectObservable(result$).toBe('(se|)', {
        s: QuerySnapshotLoadingState,
        e: {
          size: 0,
          empty: true,
          isLoading: false,
          hasError: true,
          disabled: false,
          data: [],
        },
      })
    })
  })

  it('should call onSnapshot callback when provided', () => {
    testScheduler.run(({ expectObservable, cold, flush }) => {
      const onSnapshot = vi.fn()
      const options: QuerySnapshotStateListener = { onSnapshot }

      const mockDocs = [{ data: () => ({ id: '1', name: 'Test 1' }) }, { data: () => ({ id: '2', name: 'Test 2' }) }]

      const mockQuerySnapshot = mock<QuerySnapshot>({ size: 2, empty: false, docs: mockDocs })

      const source$ = cold('a', { a: mockQuerySnapshot })
      const result$ = source$.pipe(querySnapshotState(options))

      expectObservable(result$).toBe('(sx)', {
        s: QuerySnapshotLoadingState,
        x: expect.objectContaining({
          snapshot: mockQuerySnapshot,
          isLoading: false,
          hasError: false,
        }),
      })

      flush()

      // Verify callback was called with the correct state
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
  })

  it('should call onError callback when error occurs', () => {
    testScheduler.run(({ expectObservable, cold, flush }) => {
      const onError = vi.fn()
      const options: QuerySnapshotStateListener = { onError }

      const error = new Error('Test error')
      const source$ = cold<QuerySnapshot>('#', {}, error)
      const result$ = source$.pipe(querySnapshotState(options))

      expectObservable(result$).toBe('(se|)', {
        s: QuerySnapshotLoadingState,
        e: {
          size: 0,
          empty: true,
          isLoading: false,
          hasError: true,
          disabled: false,
          data: [],
        },
      })

      flush()

      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  it('should call onComplete callback when stream completes', () => {
    testScheduler.run(({ expectObservable, cold, flush }) => {
      const onComplete = vi.fn()
      const options: QuerySnapshotStateListener = { onComplete }

      const mockDocs = [{ data: () => ({ id: '1', name: 'Test 1' }) }, { data: () => ({ id: '2', name: 'Test 2' }) }]

      const mockQuerySnapshot = mock<QuerySnapshot>({ size: 2, empty: false, docs: mockDocs })

      const source$ = cold('a---|', { a: mockQuerySnapshot })
      const result$ = source$.pipe(querySnapshotState(options))

      expectObservable(result$).toBe('(sx)|', {
        s: QuerySnapshotLoadingState,
        x: expect.objectContaining({
          snapshot: mockQuerySnapshot,
          isLoading: false,
          hasError: false,
          disabled: false,
        }),
      })

      flush()

      expect(onComplete).toHaveBeenCalled()
    })
  })

  it('should work with generic types', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      interface TestData {
        id: string
        name: string
      }

      const typedDocs = [
        { data: () => ({ id: '1', name: 'Test 1' }) as TestData },
        { data: () => ({ id: '2', name: 'Test 2' }) as TestData },
      ]

      const typedSnapshot = mock<QuerySnapshot<TestData, TestData>>({ size: 2, empty: false, docs: typedDocs })

      const source$ = cold('a', { a: typedSnapshot })
      const result$ = source$.pipe(querySnapshotState<TestData, TestData>())

      expectObservable(result$).toBe('(sx)', {
        s: QuerySnapshotLoadingState,
        x: {
          snapshot: typedSnapshot,
          size: 2,
          empty: false,
          isLoading: false,
          hasError: false,
          disabled: false,
          data: [
            { id: '1', name: 'Test 1' },
            { id: '2', name: 'Test 2' },
          ],
        },
      })
    })
  })

  it('should handle multiple emissions correctly', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const mockDocs1 = [{ data: () => ({ id: '1', name: 'Test 1' }) }, { data: () => ({ id: '2', name: 'Test 2' }) }]

      const mockDocs2 = [{ data: () => ({ id: '3', name: 'Test 3' }) }]

      const firstSnapshot = mock<QuerySnapshot>({ size: 2, empty: false, docs: mockDocs1 })
      const secondSnapshot = mock<QuerySnapshot>({ size: 1, empty: false, docs: mockDocs2 })

      const source$ = cold('a---b', { a: firstSnapshot, b: secondSnapshot })
      const result$ = source$.pipe(querySnapshotState())

      expectObservable(result$).toBe('(sx)y', {
        s: QuerySnapshotLoadingState,
        x: {
          snapshot: firstSnapshot,
          size: 2,
          empty: false,
          isLoading: false,
          hasError: false,
          disabled: false,
          data: [
            { id: '1', name: 'Test 1' },
            { id: '2', name: 'Test 2' },
          ],
        },
        y: {
          snapshot: secondSnapshot,
          size: 1,
          empty: false,
          isLoading: false,
          hasError: false,
          disabled: false,
          data: [{ id: '3', name: 'Test 3' }],
        },
      })
    })
  })

  it('should handle all callbacks together', () => {
    testScheduler.run(({ expectObservable, cold, flush }) => {
      const onSnapshot = vi.fn()
      const onError = vi.fn()
      const onComplete = vi.fn()
      const options: QuerySnapshotStateListener = { onSnapshot, onError, onComplete }

      const mockDocs = [{ data: () => ({ id: '1', name: 'Test 1' }) }, { data: () => ({ id: '2', name: 'Test 2' }) }]

      const mockQuerySnapshot = mock<QuerySnapshot>({ size: 2, empty: false, docs: mockDocs })

      const source$ = cold('a---|', { a: mockQuerySnapshot })
      const result$ = source$.pipe(querySnapshotState(options))

      expectObservable(result$).toBe('(sx)|', {
        s: QuerySnapshotLoadingState,
        x: expect.objectContaining({
          snapshot: mockQuerySnapshot,
          isLoading: false,
          hasError: false,
          disabled: false,
        }),
      })

      flush()

      expect(onSnapshot).toHaveBeenCalledWith(
        expect.objectContaining({
          snapshot: mockQuerySnapshot,
          size: 2,
          empty: false,
          isLoading: false,
          hasError: false,
        }),
      )
      expect(onComplete).toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    })
  })
})
