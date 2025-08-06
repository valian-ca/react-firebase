import { type QuerySnapshot } from '@firebase/firestore'
import { mock } from 'jest-mock-extended'
import { TestScheduler } from 'rxjs/testing'

import { QuerySnapshotInitialState } from '../../states/QuerySnapshotInitialState'
import { querySnapshotState, type QueryStateOptions } from '../querySnapshotState'

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
        s: QuerySnapshotInitialState,
        x: {
          snapshot: mockQuerySnapshot,
          size: 2,
          empty: false,
          isLoading: false,
          hasError: false,
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
        s: QuerySnapshotInitialState,
        x: {
          snapshot: emptySnapshot,
          size: 0,
          empty: true,
          isLoading: false,
          hasError: false,
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
        s: QuerySnapshotInitialState,
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
        s: QuerySnapshotInitialState,
        e: {
          size: 0,
          empty: true,
          isLoading: false,
          hasError: true,
          data: [],
        },
      })
    })
  })

  it('should call onSnapshot callback when provided', () => {
    testScheduler.run(({ expectObservable, cold, flush }) => {
      const onSnapshot = jest.fn()
      const options: QueryStateOptions = { onSnapshot }

      const mockDocs = [{ data: () => ({ id: '1', name: 'Test 1' }) }, { data: () => ({ id: '2', name: 'Test 2' }) }]

      const mockQuerySnapshot = mock<QuerySnapshot>({ size: 2, empty: false, docs: mockDocs })

      const source$ = cold('a', { a: mockQuerySnapshot })
      const result$ = source$.pipe(querySnapshotState(options))

      expectObservable(result$).toBe('(sx)', {
        s: QuerySnapshotInitialState,
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
      const onError = jest.fn()
      const options: QueryStateOptions = { onError }

      const error = new Error('Test error')
      const source$ = cold<QuerySnapshot>('#', {}, error)
      const result$ = source$.pipe(querySnapshotState(options))

      expectObservable(result$).toBe('(se|)', {
        s: QuerySnapshotInitialState,
        e: {
          size: 0,
          empty: true,
          isLoading: false,
          hasError: true,
          data: [],
        },
      })

      flush()

      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  it('should call onComplete callback when stream completes', () => {
    testScheduler.run(({ expectObservable, cold, flush }) => {
      const onComplete = jest.fn()
      const options: QueryStateOptions = { onComplete }

      const mockDocs = [{ data: () => ({ id: '1', name: 'Test 1' }) }, { data: () => ({ id: '2', name: 'Test 2' }) }]

      const mockQuerySnapshot = mock<QuerySnapshot>({ size: 2, empty: false, docs: mockDocs })

      const source$ = cold('a---|', { a: mockQuerySnapshot })
      const result$ = source$.pipe(querySnapshotState(options))

      expectObservable(result$).toBe('(sx)|', {
        s: QuerySnapshotInitialState,
        x: expect.objectContaining({
          snapshot: mockQuerySnapshot,
          isLoading: false,
          hasError: false,
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
        s: QuerySnapshotInitialState,
        x: {
          snapshot: typedSnapshot,
          size: 2,
          empty: false,
          isLoading: false,
          hasError: false,
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
        s: QuerySnapshotInitialState,
        x: {
          snapshot: firstSnapshot,
          size: 2,
          empty: false,
          isLoading: false,
          hasError: false,
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
          data: [{ id: '3', name: 'Test 3' }],
        },
      })
    })
  })

  it('should handle all callbacks together', () => {
    testScheduler.run(({ expectObservable, cold, flush }) => {
      const onSnapshot = jest.fn()
      const onError = jest.fn()
      const onComplete = jest.fn()
      const options: QueryStateOptions = { onSnapshot, onError, onComplete }

      const mockDocs = [{ data: () => ({ id: '1', name: 'Test 1' }) }, { data: () => ({ id: '2', name: 'Test 2' }) }]

      const mockQuerySnapshot = mock<QuerySnapshot>({ size: 2, empty: false, docs: mockDocs })

      const source$ = cold('a---|', { a: mockQuerySnapshot })
      const result$ = source$.pipe(querySnapshotState(options))

      expectObservable(result$).toBe('(sx)|', {
        s: QuerySnapshotInitialState,
        x: expect.objectContaining({
          snapshot: mockQuerySnapshot,
          isLoading: false,
          hasError: false,
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
