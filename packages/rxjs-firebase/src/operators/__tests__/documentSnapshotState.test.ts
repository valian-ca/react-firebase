import { type DocumentSnapshot } from '@firebase/firestore'
import { TestScheduler } from 'rxjs/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { documentSnapshotState, type DocumentSnapshotStateListener } from '../documentSnapshotState'

const testData = { id: '1', name: 'Test Document' }

describe('documentSnapshotState', () => {
  let testScheduler: TestScheduler

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected)
    })
  })

  it('should transform existing DocumentSnapshot to DocumentSnapshotState with data', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const mockDocumentSnapshot = mock<DocumentSnapshot>()
      mockDocumentSnapshot.exists.mockReturnValue(true)
      mockDocumentSnapshot.data.mockReturnValue(testData)

      const source$ = cold('a', { a: mockDocumentSnapshot })
      const result$ = source$.pipe(documentSnapshotState())

      expectObservable(result$).toBe('(sx)', {
        s: { isLoading: true, hasError: false, disabled: false },
        x: {
          snapshot: mockDocumentSnapshot,
          exists: true,
          isLoading: false,
          hasError: false,
          disabled: false,
          data: testData,
        },
      })
    })
  })

  it('should transform non-existing DocumentSnapshot to DocumentSnapshotState without data', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const mockDocumentSnapshot = mock<DocumentSnapshot>()
      mockDocumentSnapshot.exists.mockReturnValue(false)

      const source$ = cold('a', { a: mockDocumentSnapshot })
      const result$ = source$.pipe(documentSnapshotState())

      expectObservable(result$).toBe('(sx)', {
        s: { isLoading: true, hasError: false, disabled: false },
        x: {
          snapshot: mockDocumentSnapshot,
          exists: false,
          isLoading: false,
          hasError: false,
          disabled: false,
        },
      })
    })
  })

  it('should start with initial state', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const mockDocumentSnapshot = mock<DocumentSnapshot>()
      mockDocumentSnapshot.exists.mockReturnValue(true)
      mockDocumentSnapshot.data.mockReturnValue(testData)

      const source$ = cold('a', { a: mockDocumentSnapshot })
      const result$ = source$.pipe(documentSnapshotState())

      expectObservable(result$).toBe('(sx)', {
        s: { isLoading: true, hasError: false, disabled: false },
        x: {
          snapshot: mockDocumentSnapshot,
          exists: true,
          isLoading: false,
          hasError: false,
          disabled: false,
          data: testData,
        },
      })
    })
  })

  it('should handle errors and return error state', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const error = new Error('Test error')
      const source$ = cold<DocumentSnapshot>('#', {}, error)
      const result$ = source$.pipe(documentSnapshotState())

      expectObservable(result$).toBe('(se|)', {
        s: { isLoading: true, hasError: false, disabled: false },
        e: {
          isLoading: false,
          hasError: true,
          disabled: false,
        },
      })
    })
  })

  it('should call onSnapshot callback when provided', () => {
    testScheduler.run(({ expectObservable, cold, flush }) => {
      const onSnapshot = vi.fn()
      const mockDocumentSnapshot = mock<DocumentSnapshot>()
      mockDocumentSnapshot.exists.mockReturnValue(true)
      mockDocumentSnapshot.data.mockReturnValue(testData)

      const source$ = cold('a', { a: mockDocumentSnapshot })
      const result$ = source$.pipe(documentSnapshotState({ onSnapshot }))

      expectObservable(result$).toBe('(sx)', {
        s: { isLoading: true, hasError: false, disabled: false },
        x: {
          snapshot: mockDocumentSnapshot,
          exists: true,
          isLoading: false,
          hasError: false,
          disabled: false,
          data: testData,
        },
      })

      flush()

      expect(onSnapshot).toHaveBeenCalledWith(
        expect.objectContaining({
          snapshot: mockDocumentSnapshot,
          exists: true,
          isLoading: false,
          hasError: false,
          data: testData,
        }),
      )
    })
  })

  it('should call onError callback when error occurs', () => {
    testScheduler.run(({ expectObservable, cold, flush }) => {
      const onError = vi.fn()
      const options: DocumentSnapshotStateListener = { onError }

      const error = new Error('Test error')
      const source$ = cold<DocumentSnapshot>('#', {}, error)
      const result$ = source$.pipe(documentSnapshotState(options))

      expectObservable(result$).toBe('(se|)', {
        s: { isLoading: true, hasError: false, disabled: false },
        e: {
          isLoading: false,
          hasError: true,
          disabled: false,
        },
      })

      flush()

      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  it('should call onComplete callback when stream completes', () => {
    testScheduler.run(({ expectObservable, cold, flush }) => {
      const onComplete = vi.fn()
      const options: DocumentSnapshotStateListener = { onComplete }
      const mockDocumentSnapshot = mock<DocumentSnapshot>()
      mockDocumentSnapshot.exists.mockReturnValue(true)
      mockDocumentSnapshot.data.mockReturnValue(testData)

      const source$ = cold('a---|', { a: mockDocumentSnapshot })
      const result$ = source$.pipe(documentSnapshotState(options))

      expectObservable(result$).toBe('(sx)|', {
        s: { isLoading: true, hasError: false, disabled: false },
        x: {
          snapshot: mockDocumentSnapshot,
          exists: true,
          isLoading: false,
          hasError: false,
          disabled: false,
          data: testData,
        },
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

      const mockDocumentSnapshot = mock<DocumentSnapshot<TestData>>()
      mockDocumentSnapshot.exists.mockReturnValue(true)
      mockDocumentSnapshot.data.mockReturnValue(testData)

      const source$ = cold('a', { a: mockDocumentSnapshot })
      const result$ = source$.pipe(documentSnapshotState<TestData>())

      expectObservable(result$).toBe('(sx)', {
        s: { isLoading: true, hasError: false, disabled: false },
        x: {
          snapshot: mockDocumentSnapshot,
          exists: true,
          isLoading: false,
          hasError: false,
          disabled: false,
          data: testData,
        },
      })
    })
  })

  it('should handle multiple emissions correctly', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const firstData = { id: '1', name: 'First Document' }
      const secondData = { id: '2', name: 'Second Document' }

      const firstSnapshot = mock<DocumentSnapshot>()
      firstSnapshot.exists.mockReturnValue(true)
      firstSnapshot.data.mockReturnValue(firstData)

      const secondSnapshot = mock<DocumentSnapshot>()
      secondSnapshot.exists.mockReturnValue(true)
      secondSnapshot.data.mockReturnValue(secondData)

      const source$ = cold('a---b', { a: firstSnapshot, b: secondSnapshot })
      const result$ = source$.pipe(documentSnapshotState())

      expectObservable(result$).toBe('(sx)y', {
        s: { isLoading: true, hasError: false, disabled: false },
        x: {
          snapshot: firstSnapshot,
          exists: true,
          isLoading: false,
          hasError: false,
          disabled: false,
          data: firstData,
        },
        y: {
          snapshot: secondSnapshot,
          exists: true,
          isLoading: false,
          hasError: false,
          disabled: false,
          data: secondData,
        },
      })
    })
  })

  it('should handle transitions between existing and non-existing documents', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const existingData = { id: '1', name: 'Test Document' }

      const existingSnapshot = mock<DocumentSnapshot>()
      existingSnapshot.exists.mockReturnValue(true)
      existingSnapshot.data.mockReturnValue(existingData)

      const nonExistingSnapshot = mock<DocumentSnapshot>()
      nonExistingSnapshot.exists.mockReturnValue(false)

      const source$ = cold('a---b', { a: existingSnapshot, b: nonExistingSnapshot })
      const result$ = source$.pipe(documentSnapshotState())

      expectObservable(result$).toBe('(sx)y', {
        s: { isLoading: true, hasError: false, disabled: false },
        x: {
          snapshot: existingSnapshot,
          exists: true,
          isLoading: false,
          hasError: false,
          disabled: false,
          data: existingData,
        },
        y: {
          snapshot: nonExistingSnapshot,
          exists: false,
          isLoading: false,
          hasError: false,
          disabled: false,
        },
      })
    })
  })

  it('should handle all callbacks together', () => {
    testScheduler.run(({ expectObservable, cold, flush }) => {
      const onSnapshot = vi.fn()
      const onError = vi.fn()
      const onComplete = vi.fn()
      const options: DocumentSnapshotStateListener = { onSnapshot, onError, onComplete }
      const mockDocumentSnapshot = mock<DocumentSnapshot>()
      mockDocumentSnapshot.exists.mockReturnValue(true)
      mockDocumentSnapshot.data.mockReturnValue(testData)

      const source$ = cold('a---|', { a: mockDocumentSnapshot })
      const result$ = source$.pipe(documentSnapshotState(options))

      expectObservable(result$).toBe('(sx)|', {
        s: { isLoading: true, hasError: false, disabled: false },
        x: expect.objectContaining({
          snapshot: mockDocumentSnapshot,
          exists: true,
          isLoading: false,
          hasError: false,
          disabled: false,
          data: testData,
        }),
      })

      flush()

      expect(onSnapshot).toHaveBeenCalledWith(
        expect.objectContaining({
          snapshot: mockDocumentSnapshot,
          exists: true,
          isLoading: false,
          hasError: false,
          data: testData,
        }),
      )
      expect(onComplete).toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    })
  })
})
